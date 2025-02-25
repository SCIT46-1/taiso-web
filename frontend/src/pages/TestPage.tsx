import React, { useEffect, useRef, useState } from "react";

// TS 인터페이스 정의
interface RoutePoint {
  route_point_id: string;
  sequence: number;
  latitude: number;
  longitude: number;
  elevation: number;
}

interface RouteData {
  altitude: number;
  altitudeType: string;
  createdAt: string;
  description: string;
  distance: number;
  distanceType: string;
  fileName: string | null;
  fileType: string | null;
  likeCount: number;
  roadType: string;
  routeId: number;
  routeImgId: number;
  routeName: string;
  routePoint: RoutePoint[];
  tag: string[];
  userId: number;
}

const TestPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const naverClientId = import.meta.env.VITE_NAVER_CLIENT_ID;

  // 네이버 맵 API 스크립트 동적 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverClientId}`; // 실제 클라이언트 ID로 변경
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // API 데이터 패치
  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/routes/1");
        const data: RouteData = await response.json();
        setRouteData(data);
      } catch (error) {
        console.error("Error fetching route data:", error);
      }
    };

    fetchRouteData();
  }, []);

  // 맵 초기화 및 경로 표시
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // 초기 맵 생성 (한 번만 실행)
    if (!mapInstance.current) {
      const initialPosition = routeData?.routePoint?.[0]
        ? new naver.maps.LatLng(
            routeData.routePoint[0].latitude,
            routeData.routePoint[0].longitude
          )
        : new naver.maps.LatLng(37.5665, 126.978);

      mapInstance.current = new naver.maps.Map(mapRef.current, {
        center: initialPosition,
        zoom: 14,
      });
    }

    // 경로 데이터가 있을 경우 폴리라인 생성
    if (routeData?.routePoint?.length) {
      const path = routeData.routePoint.map(
        (point) => new naver.maps.LatLng(point.latitude, point.longitude)
      );

      new naver.maps.Polyline({
        map: mapInstance.current,
        path: path,
        strokeColor: "#ff2a2a",
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });

      const bounds = path.reduce((bounds, latLng) => {
        return bounds.extend(latLng);
      }, new naver.maps.LatLngBounds());

      mapInstance.current.fitBounds(bounds);
    }
  }, [mapLoaded, routeData]);

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
};

export default TestPage;
