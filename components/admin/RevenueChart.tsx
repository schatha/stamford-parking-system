'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency } from '@/lib/utils/formatting';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  sessions: number;
}

export function RevenueChart() {
  const data: RevenueDataPoint[] = [
    { date: '12/29', revenue: 1245.50, sessions: 42 },
    { date: '12/30', revenue: 1389.25, sessions: 48 },
    { date: '12/31', revenue: 1156.75, sessions: 39 },
    { date: '01/01', revenue: 892.00, sessions: 31 },
    { date: '01/02', revenue: 1534.25, sessions: 56 },
    { date: '01/03', revenue: 1678.50, sessions: 62 },
    { date: '01/04', revenue: 1445.75, sessions: 51 },
    { date: '01/05', revenue: 1723.25, sessions: 64 },
    { date: '01/06', revenue: 1892.50, sessions: 71 },
    { date: '01/07', revenue: 1654.00, sessions: 58 },
    { date: '01/08', revenue: 1987.75, sessions: 76 },
    { date: '01/09', revenue: 2134.50, sessions: 82 },
    { date: '01/10', revenue: 1876.25, sessions: 69 },
    { date: '01/11', revenue: 2245.75, sessions: 87 },
    { date: '01/12', revenue: 2089.50, sessions: 79 },
    { date: '01/13', revenue: 2356.25, sessions: 92 },
    { date: '01/14', revenue: 2167.75, sessions: 83 },
    { date: '01/15', revenue: 2445.50, sessions: 96 },
    { date: '01/16', revenue: 2298.25, sessions: 88 },
    { date: '01/17', revenue: 2567.75, sessions: 101 },
    { date: '01/18', revenue: 2389.50, sessions: 91 },
    { date: '01/19', revenue: 2678.25, sessions: 107 },
    { date: '01/20', revenue: 2534.75, sessions: 98 },
    { date: '01/21', revenue: 2789.50, sessions: 112 },
    { date: '01/22', revenue: 2645.25, sessions: 104 },
    { date: '01/23', revenue: 2867.75, sessions: 118 },
    { date: '01/24', revenue: 2734.50, sessions: 109 },
    { date: '01/25', revenue: 2945.25, sessions: 123 },
    { date: '01/26', revenue: 2823.75, sessions: 115 },
    { date: '01/27', revenue: 3078.50, sessions: 128 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`Date: ${label}`}</p>
          <p className="text-sm text-blue-600">
            {`Revenue: ${formatCurrency(payload[0].value)}`}
          </p>
          <p className="text-sm text-green-600">
            {`Sessions: ${payload[1].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis
            yAxisId="revenue"
            orientation="left"
            stroke="#3b82f6"
            fontSize={12}
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
          />
          <YAxis
            yAxisId="sessions"
            orientation="right"
            stroke="#10b981"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="Revenue ($)"
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          <Line
            yAxisId="sessions"
            type="monotone"
            dataKey="sessions"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            name="Sessions"
            activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}