import React, { useEffect, useRef } from "react";

interface KakaoMapProps {
  lat: number | undefined;
  lng: number | undefined;
  width?: string; // 선택적 props
  height?: string; // 선택적 props
  isLoadingLocation: boolean;
}

const KakaolocationMap: React.FC<KakaoMapProps> = ({
  lat,
  lng,
  width,
  height,
  isLoadingLocation,
}) => {
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

  return (
    <div
      ref={mapRef}
      style={{
        width: width || "300px", // width가 전달되지 않으면 기본값 적용
        height: height || "250px", // height가 전달되지 않으면 기본값 적용
      }}
    >
      {isLoadingLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      )}
    </div>
  );
};

export default KakaolocationMap;
