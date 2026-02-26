import { useMemo, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface Transaction {
    id: string;
    amount: number;
    category: string;
}

interface CategoryPieProps {
    transactions: Transaction[];
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#64748b'];

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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <PieIcon size={20} />
                </div>
                <h3 className="font-semibold text-slate-800">Top Categories</h3>
            </div>

            <div className="flex-1 w-full min-h-[300px] relative">
                {/* HTML Overlay for Total - centered absolutely */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-1">
                    <p className="text-sm text-slate-500 font-medium">Total</p>
                    <p className="text-2xl font-bold text-slate-900">${totalSpending.toFixed(0)}</p>
                </div>

                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="80%"
                                paddingAngle={5}
                                dataKey="value"
                                cursor="pointer"
                                // @ts-ignore - Recharts type definition missing activeIndex
                                activeIndex={activeIndex}
                                onMouseEnter={onPieEnter}
                            >
                                {chartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, 'Amount']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        No data available
                    </div>
                )}
            </div>

            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 px-4">
                {chartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs text-slate-600">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
