import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RoutePoint {
  route_point_id: string;
  sequence: number;
  latitude: number;
  longitude: number;
  elevation: number;
}

interface AltitudeChartProps {
  routePoints: RoutePoint[];
  onPointHover: (point: RoutePoint | null) => void;
}

// 도(degree)를 라디안(radian)으로 변환
const toRad = (value: number) => (value * Math.PI) / 180;

// 하버사인 공식을 이용해 두 좌표 간 거리를 미터 단위로 계산
const computeDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const AltitudeChart: React.FC<AltitudeChartProps> = ({
  routePoints,
  onPointHover,
}) => {
  // sequence 순서대로 정렬
  const sortedPoints = [...routePoints].sort((a, b) => a.sequence - b.sequence);

  // 누적 거리를 계산하여 킬로미터 단위(소수점 2자리)로 변환해 distance 프로퍼티 추가
  let cumulativeDistance = 0;
  const processedPoints = sortedPoints.map((point, index) => {
    if (index > 0) {
      const prev = sortedPoints[index - 1];
      cumulativeDistance += computeDistance(
        prev.latitude,
        prev.longitude,
        point.latitude,
        point.longitude
      );
    }
    const kmDistance = +(cumulativeDistance / 1000).toFixed(2);
    return { ...point, distance: kmDistance };
  });

  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-2 flex ml-4">
        고도표</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={processedPoints}
          margin={{ top: 5, right: 5, left: 0, bottom: 12 }}
          onMouseMove={(e: any) => {
            if (e && e.activePayload && e.activePayload[0]) {
              onPointHover(e.activePayload[0].payload);
            } else {
              onPointHover(null);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis
            dataKey="distance"
            label={{
              value: "거리(km)",
              position: "insideBottom",
              offset: -10,
            }}
            tickLine={false}
            tick={{ fontSize: 14, fill: "#666" }}
          />
          <YAxis
            label={{
              value: "고도(m)",
              angle: -90,
              offset: 20,
              position: "insideLeft",
            }}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#666" }}
          />
          <Tooltip
            wrapperStyle={{ fontSize: "16px", backgroundColor: "#fff" }}
            labelStyle={{ fontWeight: "bold", color: "#333" }}
            itemStyle={{ color: "black" }}
            formatter={(value) => [
              <>
                <span style={{ fontSize: "14px"}}>
                  고도 {value} m
                </span>
              </>
            ]}

          />
          <Area
            type="monotone"
            dataKey="elevation"
            stroke="red"
            strokeWidth={1}
            fill="#D3D3D3"
            fillOpacity={0.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AltitudeChart;
