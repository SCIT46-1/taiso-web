import React, { useEffect, useRef } from "react";

interface RoutePoint {
  route_point_id: string;
  sequence: number;
  latitude: number;
  longitude: number;
  elevation: number;
}

interface KakaoMapRouteProps {
  routePoints: RoutePoint[];
  selectedPoint?: RoutePoint | null;
  isLoading: boolean;
}

const KakaoMapRoute: React.FC<KakaoMapRouteProps> = ({
  routePoints,
  selectedPoint = null,
  isLoading,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  useEffect(() => {
    // Kakao 지도 API 스크립트 로드 (이미 로드되었는지 확인)
    const existingScript = document.getElementById("kakao-map-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "kakao-map-script";
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
        import.meta.env.VITE_KAKAO_APP_KEY
      }&autoload=false`;
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        loadMap();
      };
    } else {
      loadMap();
    }
  }, [routePoints]);

  const loadMap = () => {
    const kakao = (window as any).kakao;
    if (!kakao || !kakao.maps) return;

    kakao.maps.load(() => {
      if (mapRef.current && routePoints.length > 0) {
        // sequence 순으로 정렬 후, 첫 포인트를 중심으로 지도 생성
        const sortedPoints = [...routePoints].sort(
          (a, b) => a.sequence - b.sequence
        );
        const center = new kakao.maps.LatLng(
          sortedPoints[0].latitude,
          sortedPoints[0].longitude
        );
        const options = { center, level: 5 };

        mapInstance.current = new kakao.maps.Map(mapRef.current, options);

        // 경로 그리기
        const path = sortedPoints.map(
          (point) => new kakao.maps.LatLng(point.latitude, point.longitude)
        );
        new kakao.maps.Polyline({
          map: mapInstance.current,
          path,
          strokeWeight: 5,
          strokeColor: "#FF0000",
          strokeOpacity: 0.7,
          strokeStyle: "solid",
        });

        // 전체 경로가 보이도록 범위 설정
        const bounds = new kakao.maps.LatLngBounds();
        path.forEach((latlng) => bounds.extend(latlng));
        mapInstance.current.setBounds(bounds);

        const zoomControl = new kakao.maps.ZoomControl();
        mapInstance.current.addControl(
          zoomControl,
          kakao.maps.ControlPosition.RIGHT
        );
      }
    });
  };

  // 선택(hover)된 포인트가 변경될 때마다 마커 업데이트
  useEffect(() => {
    const kakao = (window as any).kakao;
    if (!kakao || !kakao.maps || !mapInstance.current) return;

    // 선택된 포인트가 없으면 기존 마커 제거
    if (!selectedPoint) {
      if (markerInstance.current) {
        markerInstance.current.setMap(null);
        markerInstance.current = null;
      }
      return;
    }

    const position = new kakao.maps.LatLng(
      selectedPoint.latitude,
      selectedPoint.longitude
    );

    // 커스텀 SVG를 사용한 미니멀 원형 마커
    const markerImageUrl =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
           <circle cx="10" cy="10" r="8" fill="#FF0000" stroke="white" stroke-width="2"/>
         </svg>`
      );
    const markerImageSize = new kakao.maps.Size(20, 20);
    const markerImageOption = { offset: new kakao.maps.Point(10, 10) };
    const markerImage = new kakao.maps.MarkerImage(
      markerImageUrl,
      markerImageSize,
      markerImageOption
    );

    if (markerInstance.current) {
      markerInstance.current.setPosition(position);
      markerInstance.current.setImage(markerImage);
    } else {
      markerInstance.current = new kakao.maps.Marker({
        map: mapInstance.current,
        position,
        image: markerImage,
        title: "호버한 위치",
      });
    }
  }, [selectedPoint]);

  return (
    <div className="map-container">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      ) : (
        <div
          ref={mapRef}
          className="rounded-2xl shadow-lg"
          style={{ width: "100%", height: "400px" }}
        />
      )}
    </div>
  );
};

export default KakaoMapRoute;
