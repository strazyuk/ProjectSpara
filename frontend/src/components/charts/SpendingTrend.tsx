import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import type { TimeRange } from '../../types';

interface Transaction {
    id: string;
    amount: number;
    date: string;
    name: string;
}

interface SpendingTrendProps {
    transactions: Transaction[];
    timeRange: TimeRange;
    onTimeRangeChange: (range: TimeRange) => void;
}

export default function SpendingTrend({ transactions, timeRange, onTimeRangeChange }: SpendingTrendProps) {
    const chartData = useMemo(() => {
        if (!transactions.length) return [];

        // Group by Month (YYYY-MM)
        const grouped = transactions.reduce((acc, curr) => {
            const date = new Date(curr.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!acc[key]) {
                acc[key] = { date: key, amount: 0, label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) };
            }
            acc[key].amount += curr.amount;
            return acc;
        }, {} as Record<string, { date: string; amount: number; label: string }>);

        return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    }, [transactions]);

    return (
        <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-black tracking-tight">Dynamics</h3>
                    <p className="text-xs font-medium text-gray-400 mt-0.5 uppercase tracking-widest">Spending Trend</p>
                </div>

                <div className="flex bg-gray-50 rounded-full p-1 text-[10px] font-bold uppercase tracking-wider">
                    {(['6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => onTimeRangeChange(range)}
                            className={`px-4 py-1.5 rounded-full transition-all ${timeRange === range
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f9fafb', radius: 4 }}
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    padding: '12px 16px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                                itemStyle={{ color: '#000' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }}
                                formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, 'Spending']}
                            />
                            <Bar
                                dataKey="amount"
                                radius={[4, 4, 4, 4]}
                                maxBarSize={8}
                                activeBar={{ fill: '#000' }}
                            >
                                {chartData.map((_entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === chartData.length - 1 ? "#000" : "#e5e7eb"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium italic">
                        No transaction data available
                    </div>
                )}
            </div>
        </div>
    );
}
