import React, { useEffect, useRef } from "react";

interface KakaoMapProps {
  lat: number | undefined;
  lng: number | undefined;
}

const KakaolocationMap: React.FC<KakaoMapProps> = ({ lat, lng }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 카카오 맵 API가 로드되었는지 확인합니다.
    if (!window.kakao) {
      console.error("Kakao Map API가 로드되지 않았습니다.");
      return;
    }

    const container = mapRef.current;
    if (!container) return;

    // 지도 옵션 설정: center를 입력받은 좌표로 지정
    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 3, // 지도의 확대 레벨 (숫자가 작을수록 확대)
    };

    // 지도 생성
    const map = new window.kakao.maps.Map(container, options);

    // 마커 생성 및 지도에 표시
    const markerPosition = new window.kakao.maps.LatLng(lat, lng);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
    });
    marker.setMap(map);
  }, [lat, lng]);

  return <div ref={mapRef} style={{ width: "300px", height: "250px" }} />;
};

export default KakaolocationMap;
