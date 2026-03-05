import { useMemo, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface Transaction {
    id: string;
    amount: number;
    category: string;
}

interface CategoryPieProps {
    transactions: Transaction[];
}

const COLORS = ['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'];

export default function CategoryPie({ transactions }: CategoryPieProps) {
    const chartData = useMemo(() => {
        if (!transactions.length) return [];

        const grouped = transactions.reduce((acc, curr) => {
            const category = curr.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += curr.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const totalSpending = useMemo(() => {
        return transactions.reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    return (
        <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-black tracking-tight">Categories</h3>
                <p className="text-xs font-medium text-gray-400 mt-0.5 uppercase tracking-widest">Share of Assets</p>
            </div>

            <div className="flex-1 w-full min-h-[250px] relative">
                {/* HTML Overlay for Total - centered absolutely */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</p>
                    <p className="text-3xl font-bold text-black tracking-tight">${totalSpending.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>

                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius="70%"
                                outerRadius="90%"
                                paddingAngle={2}
                                dataKey="value"
                                cursor="pointer"
                                // @ts-ignore - Recharts type definition missing activeIndex
                                activeIndex={activeIndex}
                                onMouseEnter={onPieEnter}
                                stroke="none"
                            >
                                {chartData.map((_entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        className="outline-none transition-all duration-300"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    padding: '12px 16px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                                itemStyle={{ color: '#000' }}
                                formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, 'Amount']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium italic">
                        No data
                    </div>
                )}
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6">
                {chartData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate max-w-[80px]">{entry.name}</span>
                        </div>
                        <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                            {((entry.value / totalSpending) * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
