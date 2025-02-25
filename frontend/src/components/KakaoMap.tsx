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
}

const KakaoMapRoute: React.FC<KakaoMapRouteProps> = ({ routePoints }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Kakao 지도 API 스크립트가 이미 로드되었는지 확인
    const existingScript = document.getElementById("kakao-map-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "kakao-map-script";
      // 반드시 YOUR_API_KEY를 실제 발급받은 API 키로 변경하세요.
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

    // 지도 API의 autoload를 수동으로 실행합니다.
    kakao.maps.load(() => {
      if (mapRef.current && routePoints.length > 0) {
        // 경로 데이터의 sequence 순서대로 정렬
        const sortedPoints = [...routePoints].sort(
          (a, b) => a.sequence - b.sequence
        );
        // 첫번째 포인트를 중심으로 지도 생성
        const center = new kakao.maps.LatLng(
          sortedPoints[0].latitude,
          sortedPoints[0].longitude
        );
        const options = {
          center,
          level: 5,
        };

        const map = new kakao.maps.Map(mapRef.current, options);

        // routePoints를 LatLng 객체 배열로 변환
        const path = sortedPoints.map(
          (point) => new kakao.maps.LatLng(point.latitude, point.longitude)
        );

        // 폴리라인을 생성하여 지도에 표시
        new kakao.maps.Polyline({
          map,
          path,
          strokeWeight: 5,
          strokeColor: "#FF0000",
          strokeOpacity: 0.7,
          strokeStyle: "solid",
        });

        // 경로 전체가 보이도록 지도 범위 조정
        const bounds = new kakao.maps.LatLngBounds();
        path.forEach((latlng) => bounds.extend(latlng));
        map.setBounds(bounds);

        // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
        var zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        // 자전거 도로 코스 표시
        // map.addOverlayMapTypeId(kakao.maps.MapTypeId.BICYCLE);
      }
    });
  };

  return (
    <div
      ref={mapRef}
      className="rounded-2xl shadow-lg"
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default KakaoMapRoute;
