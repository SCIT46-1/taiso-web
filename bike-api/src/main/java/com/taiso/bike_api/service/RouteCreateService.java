package com.taiso.bike_api.service;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.MathContext;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.locationtech.proj4j.CRSFactory;
import org.locationtech.proj4j.CoordinateReferenceSystem;
import org.locationtech.proj4j.CoordinateTransform;
import org.locationtech.proj4j.CoordinateTransformFactory;
import org.locationtech.proj4j.ProjCoordinate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import com.taiso.bike_api.domain.RouteEntity;
import com.taiso.bike_api.domain.RoutePointEntity;
import com.taiso.bike_api.domain.RouteTagCategoryEntity;
import com.taiso.bike_api.dto.RoutePostRequestDTO;
import com.taiso.bike_api.dto.RoutePostResponseDTO;
import com.taiso.bike_api.exception.InvalidFileExtensionException;
import com.taiso.bike_api.exception.StaticMapImageFetchException;
import com.taiso.bike_api.exception.UnsupportedEnumException;
import com.taiso.bike_api.repository.RoutePointRepository;
import com.taiso.bike_api.repository.RouteRepository;
import com.taiso.bike_api.repository.RouteTagCategoryRepository;

@Service
public class RouteCreateService {

    @Autowired
    private RouteRepository routeRepository;
    
    @Autowired
    private RouteTagCategoryRepository routeTagCategoryRepository;

    @Autowired
    private RoutePointRepository routePointRepository;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private UserService userService;

    @Value("${naver.api.key.id}")
    private String naverApiKeyId;
    @Value("${naver.api.key.key}")
    private String naverApiKey;
    
    // Douglas-Peucker 알고리즘에 사용할 기본 허용 오차 (위/경도 단위, 약 11m 정도)
    private static final double DEFAULT_SIMPLIFICATION_TOLERANCE = 0.0001;

    /**
     * 전체 루트 생성 로직: 파일 파싱, DB 저장, S3 업로드를 하나의 트랜잭션 내에서 처리합니다.
     */
    @Transactional
public RoutePostResponseDTO createRoute(RoutePostRequestDTO dto, MultipartFile file, Authentication authentication) {
    long overallStart = System.nanoTime();
    Long userId = userService.getUserIdByEmail(authentication.getName());
    
    // Step 1: 파일 확장자 검증
    long step1Start = System.nanoTime();
    validateFileExtension(file);
    long step1Time = System.nanoTime() - step1Start;
    System.out.println("Step 1 (validateFileExtension): " + step1Time / 1_000_000.0 + " ms");

    // Step 2: GPX 파일 파싱 및 Douglas-Peucker 알고리즘 적용
    long step2Start = System.nanoTime();
    GPXData gpxData;
    try {
        gpxData = parseGPXFile(file);
    } catch(Exception e) {
        throw new InvalidFileExtensionException("파일 파싱 중 오류가 발생하였습니다. 파일이 손상되었거나 올바른 형식이 아닙니다");
    }
    long step2Time = System.nanoTime() - step2Start;
    System.out.println("Step 2 (parseGPXFile): " + step2Time / 1_000_000.0 + " ms");

    // Step 3: 네이버 정적 지도 API 호출 및 이미지 합성
    long step3Start = System.nanoTime();
    byte[] staticMapImageBytes = generateStaticMapImageBytes( gpxData);
    long step3Time = System.nanoTime() - step3Start;
    System.out.println("Step 3 (generateStaticMapImageBytes): " + step3Time / 1_000_000.0 + " ms");

    // Step 4: 태그 처리 (기존 태그 사용 또는 신규 생성)
    long step4Start = System.nanoTime();
    Set<RouteTagCategoryEntity> tags = dto.getTag().stream()
            .map(tagName -> routeTagCategoryRepository.findByName(tagName)
                    .orElseGet(() -> routeTagCategoryRepository.save(
                            RouteTagCategoryEntity.builder().name(tagName).build())))
            .collect(Collectors.toSet());
    long step4Time = System.nanoTime() - step4Start;
    System.out.println("Step 4 (tag processing): " + step4Time / 1_000_000.0 + " ms");

    // Step 5: DB에 루트 엔티티 저장 및 경로 포인트 저장
    long step5Start = System.nanoTime();
    RouteEntity route = RouteEntity.builder()
            .routeName(dto.getRouteName())
            .description(dto.getDescription())
            .userId(userId)
            .region(convertRegion(dto.getRegion()))
            .distance(gpxData.getDistance())
            .altitude(gpxData.getAltitude())
            .distanceType(convertDistanceType(dto.getDistanceType()))
            .altitudeType(convertAltitudeType(dto.getAltitudeType()))
            .roadType(convertRoadType(dto.getRoadType()))
            .tags(tags)
            .likeCount(0L)
            .build();
    RouteEntity savedRoute = routeRepository.save(route);
    saveRoutePoints(savedRoute, gpxData.getRoutePoints());
    long step5Time = System.nanoTime() - step5Start;
    System.out.println("Step 5 (save route and points): " + step5Time / 1_000_000.0 + " ms");

    // Step 6: S3 업로드 (GPX 파일, 정적 지도 이미지) 및 DB 업데이트
    long step6Start = System.nanoTime();
    try {
        // GPX 파일 업로드
        String gpxFileKey = s3Service.uploadFile(file, userId);
        String gpxFileUrl = s3Service.generatePresignedUrl(gpxFileKey, Duration.ofMinutes(10));
        System.out.println("GPX 파일 S3 업로드 완료, Key: " + gpxFileKey);
        System.out.println("GPX 파일 프리사인 URL: " + gpxFileUrl);

        // 정적 지도 이미지 업로드
        String compositeKey = "static-maps/composite_" + System.currentTimeMillis() + ".png";
        s3Service.uploadFile(staticMapImageBytes, compositeKey, "image/png");
        String staticMapUrl = s3Service.generatePresignedUrl(compositeKey, Duration.ofMinutes(10));
        System.out.println("정적 지도 이미지 S3 업로드 완료, Key: " + compositeKey);
        System.out.println("정적 지도 프리사인 URL: " + staticMapUrl);

        // 업로드된 이미지 URL DB 반영
        savedRoute.setRouteImgId(staticMapUrl);
        routeRepository.save(savedRoute);
    } catch (Exception e) {
        routeRepository.delete(savedRoute);
        throw new StaticMapImageFetchException("S3 업로드 중 오류");
    }
    long step6Time = System.nanoTime() - step6Start;
    System.out.println("Step 6 (S3 upload): " + step6Time / 1_000_000.0 + " ms");

    long overallTime = System.nanoTime() - overallStart;
    System.out.println("Total createRoute execution time: " + overallTime / 1_000_000.0 + " ms");

    RoutePostResponseDTO response = new RoutePostResponseDTO();
    response.setRouteId(savedRoute.getRouteId());
    return response;
}
    /**
     * 파일 확장자 검증 (GPX 또는 TCX)
     */
    private void validateFileExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || 
            (!originalFilename.toLowerCase().endsWith(".gpx") && !originalFilename.toLowerCase().endsWith(".tcx"))) {
            throw new InvalidFileExtensionException("지원하지 않는 파일 타입");
        }
    }
    
    /**
     * 네이버 정적 지도 API를 호출하여 기본 지도 이미지에 GPX 경로를 합성한 후,
     * 이미지 바이트 배열을 반환합니다.
     */
    private byte[] generateStaticMapImageBytes(GPXData gpxData) {
    try {
        int baseWidth = 800;
        int baseHeight = 600;
        int scaleFactor = 2;

        List<GPXRoutePoint> points = gpxData.getRoutePoints();
        if (points.isEmpty()) {
            throw new InvalidFileExtensionException("파일에 경로 포인트가 없습니다.");
        }
        // 좌표 범위 계산
        double minLat = points.stream().mapToDouble(p -> p.getLatitude().doubleValue()).min().orElse(0);
        double maxLat = points.stream().mapToDouble(p -> p.getLatitude().doubleValue()).max().orElse(0);
        double minLng = points.stream().mapToDouble(p -> p.getLongitude().doubleValue()).min().orElse(0);
        double maxLng = points.stream().mapToDouble(p -> p.getLongitude().doubleValue()).max().orElse(0);
        double centerLat = (minLat + maxLat) / 2.0;
        double centerLng = (minLng + maxLng) / 2.0;
        int zoom = computeZoom(minLat, minLng, maxLat, maxLng, baseWidth, baseHeight) - 1;

        String url = "https://naveropenapi.apigw.ntruss.com/map-static/v2/raster" +
                     "?w=" + baseWidth +
                     "&h=" + baseHeight +
                     "&center=" + centerLng + "," + centerLat +
                     "&level=" + zoom +
                     "&maptype=basic" +
                     "&format=png" +
                     "&scale=" + scaleFactor;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-ncp-apigw-api-key-id", naverApiKeyId);
        headers.set("x-ncp-apigw-api-key", naverApiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, byte[].class);
        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new StaticMapImageFetchException("정적 지도 이미지를 가져오지 못했습니다.");
        }
        byte[] imageBytes = response.getBody();
        BufferedImage baseMapImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
        int actualWidth = baseMapImage.getWidth();
        int actualHeight = baseMapImage.getHeight();
        int centerX = actualWidth / 2;
        int centerY = actualHeight / 2;

        // 좌표 변환 설정 (Proj4j)
        CRSFactory crsFactory = new CRSFactory();
        CoordinateReferenceSystem crsWGS84 = crsFactory.createFromName("EPSG:4326");
        CoordinateReferenceSystem crs3857 = crsFactory.createFromName("EPSG:3857");
        CoordinateTransformFactory ctFactory = new CoordinateTransformFactory();
        CoordinateTransform transform = ctFactory.createTransform(crsWGS84, crs3857);
        ProjCoordinate centerSrc = new ProjCoordinate(centerLng, centerLat);
        ProjCoordinate dstCenter = new ProjCoordinate();
        transform.transform(centerSrc, dstCenter);

        double alpha = 2; // 확대 비율

        // === 성능 개선된 좌표 변환 루프 ===
        // 1. resolution 계산을 루프 밖에서 한 번 수행
        double resolution = (156543.03392804062 / Math.pow(2, zoom)) / scaleFactor;
        int n = points.size();
        int[] xPoints = new int[n];
        int[] yPoints = new int[n];

        // 2. 반복문마다 새 객체를 생성하는 대신, 재사용 가능한 객체를 미리 생성
        ProjCoordinate srcCoord = new ProjCoordinate();
        ProjCoordinate dstCoord = new ProjCoordinate();

        for (int i = 0; i < n; i++) {
            GPXRoutePoint pt = points.get(i);
            // 좌표 값을 재사용 가능한 객체에 설정
            srcCoord.x = pt.getLongitude().doubleValue();
            srcCoord.y = pt.getLatitude().doubleValue();
            // 좌표 변환 (내부에서 객체 생성 없이 재사용)
            transform.transform(srcCoord, dstCoord);

            // 이미지상의 픽셀 좌표 계산
            int pixelX = (int) Math.round(actualWidth / 2.0 + (dstCoord.x - dstCenter.x) / resolution);
            int pixelY = (int) Math.round(actualHeight / 2.0 - (dstCoord.y - dstCenter.y) / resolution);

            // 확대 비율(alpha) 적용
            int adjustedX = centerX + (int) Math.round((pixelX - centerX) * alpha);
            int adjustedY = centerY + (int) Math.round((pixelY - centerY) * alpha);

            xPoints[i] = adjustedX;
            yPoints[i] = adjustedY;
        }
        // =====================================

        // 경로를 지도 이미지에 합성 (폴리라인 그리기)
        Graphics2D g2d = baseMapImage.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setStroke(new BasicStroke(5));
        g2d.setColor(Color.RED);
        g2d.drawPolyline(xPoints, yPoints, n);
        g2d.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(baseMapImage, "png", baos);
        return baos.toByteArray();
    } catch (IOException | RestClientException e) {
        throw new StaticMapImageFetchException("정적 지도 이미지 생성 중 오류");
    }
}
    
    /**
     * Web Mercator 방식을 사용하여 적절한 zoom 레벨을 계산합니다.
     */
    private int computeZoom(double minLat, double minLng, double maxLat, double maxLng, int imageWidth, int imageHeight) {
        double tileSize = 256;
        double lngDelta = Math.abs(maxLng - minLng);
        if (lngDelta > 180) {
            lngDelta = 360 - lngDelta;
        }
        double diffX = lngDelta / 360.0;

        double latRadMin = Math.toRadians(minLat);
        double latRadMax = Math.toRadians(maxLat);
        double minY = (1 - Math.log(Math.tan(latRadMin) + 1 / Math.cos(latRadMin)) / Math.PI) / 2;
        double maxY = (1 - Math.log(Math.tan(latRadMax) + 1 / Math.cos(latRadMax)) / Math.PI) / 2;
        double diffY = Math.abs(maxY - minY);

        if (diffX == 0 || diffY == 0) {
            return 16;
        }
        double zoomX = Math.log(imageWidth / (tileSize * diffX)) / Math.log(2);
        double zoomY = Math.log(imageHeight / (tileSize * diffY)) / Math.log(2);
        int zoom = (int) Math.floor(Math.min(zoomX, zoomY));
        return Math.max(0, Math.min(zoom, 19));
    }


    
    /**
     * GPX 파일을 SAX 기반 스트리밍 파서를 사용하여 파싱합니다.
     * 총 거리 및 고도 상승량을 계산하고, Douglas-Peucker 알고리즘을 적용합니다.
     */
    private GPXData parseGPXFile(MultipartFile file) throws Exception {
        String originalFilename = file.getOriginalFilename();
        boolean isGPX = originalFilename != null && originalFilename.toLowerCase().endsWith(".gpx");
        boolean isTCX = originalFilename != null && originalFilename.toLowerCase().endsWith(".tcx");

        if (isTCX) {
            throw new InvalidFileExtensionException("TCX 파일 파싱은 구현되지 않았습니다.");
        }
        if (!isGPX) {
            throw new InvalidFileExtensionException("지원하지 않는 파일 형식");
        }

        SAXParserFactory factory = SAXParserFactory.newInstance();
        // XXE 공격 방지 설정
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);

        SAXParser saxParser = factory.newSAXParser();
        GPXHandler handler = new GPXHandler();
        saxParser.parse(file.getInputStream(), handler);

        List<GPXRoutePoint> points = handler.getPoints();
        if (points.isEmpty()) {
            throw new InvalidFileExtensionException("GPX 파일에서 트랙 포인트를 찾을 수 없습니다.");
        }
        
        // 총 거리와 고도 상승량 계산
        BigDecimal totalDistance = BigDecimal.ZERO;
        BigDecimal totalAltitude = BigDecimal.ZERO;
        GPXRoutePoint prev = null;
        for (GPXRoutePoint point : points) {
            if (prev != null) {
                totalDistance = totalDistance.add(calculateHaversineDistance(prev, point));
                BigDecimal elevationDiff = point.getElevation().subtract(prev.getElevation());
                if (elevationDiff.compareTo(BigDecimal.ZERO) > 0) {
                    totalAltitude = totalAltitude.add(elevationDiff);
                }
            }
            prev = point;
        }
        // 개선된 Douglas-Peucker 알고리즘 적용 (인덱스 기반 재귀 호출)
        List<GPXRoutePoint> simplifiedPoints = simplifyPoints(points, DEFAULT_SIMPLIFICATION_TOLERANCE);
        return new GPXData(totalDistance, totalAltitude, simplifiedPoints);
    }

    /**
     * 두 지점 간의 하버사인 거리(킬로미터 단위)를 계산합니다.
     */
    private BigDecimal calculateHaversineDistance(GPXRoutePoint p1, GPXRoutePoint p2) {
        double lat1 = p1.getLatitude().doubleValue();
        double lon1 = p1.getLongitude().doubleValue();
        double lat2 = p2.getLatitude().doubleValue();
        double lon2 = p2.getLongitude().doubleValue();
        double earthRadius = 6371e3; // 미터 단위
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distanceMeters = earthRadius * c;
        return new BigDecimal(distanceMeters).divide(new BigDecimal(1000), MathContext.DECIMAL128);
    }
    
    /**
     * Douglas-Peucker 알고리즘을 이용해 경로 포인트를 단순화합니다.
     */
    private List<GPXRoutePoint> simplifyPoints(List<GPXRoutePoint> points, double tolerance) {
        if (points == null || points.size() < 3) {
            return points;
        }
        return douglasPeucker(points, tolerance);
    }
    
    /**
     * 인덱스 기반 Douglas-Peucker 알고리즘 재귀 호출 래퍼.
     */
    private List<GPXRoutePoint> douglasPeucker(List<GPXRoutePoint> points, double tolerance) {
        return douglasPeuckerRec(points, 0, points.size() - 1, tolerance);
    }
    
    /**
     * [start, end] 구간에 대해 Douglas-Peucker 알고리즘을 재귀적으로 적용합니다.
     */
    private List<GPXRoutePoint> douglasPeuckerRec(List<GPXRoutePoint> points, int start, int end, double tolerance) {
        double maxDistance = 0;
        int index = start;
        // 시작점과 끝점 사이의 수직 거리가 가장 큰 점 찾기
        for (int i = start + 1; i < end; i++) {
            double distance = perpendicularDistance(points.get(i), points.get(start), points.get(end));
            if (distance > maxDistance) {
                maxDistance = distance;
                index = i;
            }
        }
        List<GPXRoutePoint> result = new ArrayList<>();
        if (maxDistance > tolerance) {
            List<GPXRoutePoint> recResults1 = douglasPeuckerRec(points, start, index, tolerance);
            List<GPXRoutePoint> recResults2 = douglasPeuckerRec(points, index, end, tolerance);
            // 중복된 경계점 제거
            result.addAll(recResults1);
            result.remove(result.size() - 1);
            result.addAll(recResults2);
        } else {
            result.add(points.get(start));
            result.add(points.get(end));
        }
        return result;
    }
    
    /**
     * 시작점과 끝점을 잇는 직선에 대해 p의 수직 거리를 계산합니다.
     */
    private double perpendicularDistance(GPXRoutePoint p, GPXRoutePoint p1, GPXRoutePoint p2) {
        double x0 = p.getLongitude().doubleValue();
        double y0 = p.getLatitude().doubleValue();
        double x1 = p1.getLongitude().doubleValue();
        double y1 = p1.getLatitude().doubleValue();
        double x2 = p2.getLongitude().doubleValue();
        double y2 = p2.getLatitude().doubleValue();
        double numerator = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
        double denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
        return denominator == 0 ? Math.hypot(x0 - x1, y0 - y1) : numerator / denominator;
    }
    
    /**
     * GPX 경로 포인트들을 배치 저장합니다.
     */
    private void saveRoutePoints(RouteEntity route, List<GPXRoutePoint> points) {
        List<RoutePointEntity> entities = new ArrayList<>();
        for (int i = 0; i < points.size(); i++) {
            GPXRoutePoint point = points.get(i);
            RoutePointEntity routePoint = RoutePointEntity.builder()
                    .route(route)
                    .latitude(point.getLatitude())
                    .longitude(point.getLongitude())
                    .elevation(point.getElevation())
                    .sequence(i)
                    .build();
            entities.add(routePoint);
        }
        routePointRepository.saveAll(entities);
    }
    
    // Enum 변환 도우미 메서드들
    private RouteEntity.Region convertRegion(String region) {
        try {
            return RouteEntity.Region.valueOf(region);
        } catch (IllegalArgumentException e) {
            throw new UnsupportedEnumException("지원하지 않는 지역 유형");
        }
    }
    
    private RouteEntity.DistanceType convertDistanceType(String type) {
        return switch (type) {
            case "단거리" -> RouteEntity.DistanceType.단거리;
            case "중거리" -> RouteEntity.DistanceType.중거리;
            case "장거리" -> RouteEntity.DistanceType.장거리;
            default -> throw new UnsupportedEnumException("지원하지 않는 거리 유형");
        };
    }
    
    private RouteEntity.AltitudeType convertAltitudeType(String type) {
        return switch (type) {
            case "낮음" -> RouteEntity.AltitudeType.낮음;
            case "중간" -> RouteEntity.AltitudeType.중간;
            case "높음" -> RouteEntity.AltitudeType.높음;
            default -> throw new UnsupportedEnumException("지원하지 않는 고도 유형");
        };
    }
    
    private RouteEntity.RoadType convertRoadType(String type) {
        return switch (type) {
            case "자전거 도로" -> RouteEntity.RoadType.평지;
            case "산길" -> RouteEntity.RoadType.산길;
            case "고속도로" -> RouteEntity.RoadType.고속도로;
            default -> throw new UnsupportedEnumException("지원하지 않는 도로 유형");
        };
    }
    
    /**
     * 내부 클래스: 파싱된 GPX 데이터를 저장하는 클래스
     */
    private static class GPXData {
        private final BigDecimal distance;
        private final BigDecimal altitude;
        private final List<GPXRoutePoint> routePoints;

        public GPXData(BigDecimal distance, BigDecimal altitude, List<GPXRoutePoint> routePoints) {
            this.distance = distance;
            this.altitude = altitude;
            this.routePoints = routePoints;
        }

        public BigDecimal getDistance() {
            return distance;
        }

        public BigDecimal getAltitude() {
            return altitude;
        }

        public List<GPXRoutePoint> getRoutePoints() {
            return routePoints;
        }
    }

    /**
     * 내부 클래스: 개별 GPX 경로 포인트 표현  
     * SAX 파싱 과정에서 setter를 통해 값이 설정됩니다.
     */
    private static class GPXRoutePoint {
        private final BigDecimal latitude;
        private final BigDecimal longitude;
        private BigDecimal elevation;

        public GPXRoutePoint(BigDecimal latitude, BigDecimal longitude, BigDecimal elevation) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.elevation = elevation;
        }

        public BigDecimal getLatitude() {
            return latitude;
        }

        public BigDecimal getLongitude() {
            return longitude;
        }

        public BigDecimal getElevation() {
            return elevation;
        }

        public void setElevation(BigDecimal elevation) {
            this.elevation = elevation;
        }
    }
    
    /**
     * SAX 기반 GPX 파서 핸들러 클래스.
     * <trkpt> 요소를 만나면 좌표, 고도, 시간 정보를 읽어 GPXRoutePoint 객체로 저장합니다.
     */
    private static class GPXHandler extends DefaultHandler {
        private final List<GPXRoutePoint> points = new ArrayList<>();
        private GPXRoutePoint currentPoint = null;
        private final StringBuilder content = new StringBuilder();

        public List<GPXRoutePoint> getPoints() {
            return points;
        }

        @Override
        public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
            content.setLength(0);
            if ("trkpt".equalsIgnoreCase(qName)) {
                String latStr = attributes.getValue("lat");
                String lonStr = attributes.getValue("lon");
                BigDecimal lat = new BigDecimal(latStr);
                BigDecimal lon = new BigDecimal(lonStr);
                currentPoint = new GPXRoutePoint(lat, lon, BigDecimal.ZERO);
            }
        }

        @Override
        public void characters(char[] ch, int start, int length) throws SAXException {
            content.append(ch, start, length);
        }

        @Override
        public void endElement(String uri, String localName, String qName) throws SAXException {
            if (currentPoint != null) {
                if ("ele".equalsIgnoreCase(qName)) {
                    try {
                        currentPoint.setElevation(new BigDecimal(content.toString().trim()));
                    } catch (NumberFormatException e) {
                        currentPoint.setElevation(BigDecimal.ZERO);
                    }
 
                } else if ("trkpt".equalsIgnoreCase(qName)) {
                    points.add(currentPoint);
                    currentPoint = null;
                }
            }
        }
    }
}