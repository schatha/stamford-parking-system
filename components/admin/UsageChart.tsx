'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface UsageDataPoint {
  day: string;
  activeSessions: number;
  newSessions: number;
  completedSessions: number;
  avgDuration: number;
}

export function UsageChart() {
  const data: UsageDataPoint[] = [
    {
      day: 'Mon',
      activeSessions: 45,
      newSessions: 67,
      completedSessions: 58,
      avgDuration: 2.3
    },
    {
      day: 'Tue',
      activeSessions: 52,
      newSessions: 78,
      completedSessions: 71,
      avgDuration: 2.1
    },
    {
      day: 'Wed',
      activeSessions: 48,
      newSessions: 82,
      completedSessions: 76,
      avgDuration: 2.4
    },
    {
      day: 'Thu',
      activeSessions: 61,
      newSessions: 95,
      completedSessions: 89,
      avgDuration: 2.6
    },
    {
      day: 'Fri',
      activeSessions: 73,
      newSessions: 112,
      completedSessions: 98,
      avgDuration: 2.8
    },
    {
      day: 'Sat',
      activeSessions: 87,
      newSessions: 134,
      completedSessions: 121,
      avgDuration: 3.2
    },
    {
      day: 'Sun',
      activeSessions: 65,
      newSessions: 98,
      completedSessions: 87,
      avgDuration: 2.9
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.dataKey === 'avgDuration' ? 'h' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="day"
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="newSessions"
            fill="#3b82f6"
            name="New Sessions"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="completedSessions"
            fill="#10b981"
            name="Completed Sessions"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="activeSessions"
            fill="#f59e0b"
            name="Active Sessions"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}