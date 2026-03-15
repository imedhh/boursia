import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockPerformanceData } from '../../stores/mockData';

export default function PortfolioChart() {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-medium text-text-secondary mb-4">Performance du portefeuille</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={mockPerformanceData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d314830" />
          <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1d29',
              border: '1px solid #2d3148',
              borderRadius: '8px',
              color: '#e5e7eb',
              fontSize: '13px',
            }}
            formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} EUR`, 'Valeur']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
