import { useState, useMemo } from 'react';
import SpendingTrend from './charts/SpendingTrend';
import CategoryPie from './charts/CategoryPie';
import type { TimeRange } from '../types';

interface Transaction {
    id: string;
    amount: number;
    date: string;
    name: string;
    category: string;
}

interface InsightsDashboardProps {
    transactions: Transaction[];
}

export default function InsightsDashboard({ transactions }: InsightsDashboardProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('6M');

    // Filter transactions based on Time Range
    const filteredTransactions = useMemo(() => {
        if (!transactions.length) return [];

        const now = new Date();
        let cutoff = new Date(0); // Default to beginning of time

        if (timeRange === '6M') {
            cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        } else if (timeRange === '1Y') {
            cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        }

        return transactions.filter(t => new Date(t.date) >= cutoff);
    }, [transactions, timeRange]);

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Financial Insights</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spending Trend - Takes up 2 columns on large screens */}
                <div className="lg:col-span-2 h-[450px]">
                    <SpendingTrend
                        transactions={filteredTransactions}
                        timeRange={timeRange}
                        onTimeRangeChange={setTimeRange}
                    />
                </div>

                {/* Category Breakdown - Takes up 1 column */}
                <div className="lg:col-span-1 h-[450px]">
                    <CategoryPie transactions={filteredTransactions} />
                </div>
            </div>
        </div>
    );
}
