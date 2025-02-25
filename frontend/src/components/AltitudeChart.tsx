import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
}

const AltitudeChart: React.FC<AltitudeChartProps> = ({ routePoints }) => {
  // 안전하게 정렬하여 사용 (props를 직접 수정하지 않도록 복사)
  const sortedPoints = [...routePoints].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-2">Altitude Chart</h3>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart
          data={sortedPoints}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="sequence"
            label={{ value: "Sequence", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{ value: "Elevation", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="elevation"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AltitudeChart;
