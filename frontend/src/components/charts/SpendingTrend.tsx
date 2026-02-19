import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Calendar } from 'lucide-react';
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
    // Internal state removed, using props

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
    }, [transactions]); // removed timeRange dependency as filtering happens in parent now

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Calendar size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800">Spending Trend</h3>
                </div>

                <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-medium">
                    {(['6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => onTimeRangeChange(range)}
                            className={`px-3 py-1.5 rounded-md transition-all ${timeRange === range
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {range === '6M' ? '6 Months' : range === '1Y' ? '1 Year' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']}
                            />
                            <Bar
                                dataKey="amount"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={60}
                                activeBar={{ fill: '#4f46e5' }}
                            >
                                {chartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#6366f1" fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        No transaction data available for this period
                    </div>
                )}
            </div>
        </div>
    );
}
