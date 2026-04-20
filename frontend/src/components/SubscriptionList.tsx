import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface Subscription {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    category: string;
    merchant_name: string;
    next_billing_date?: string;
}

interface SubscriptionListProps {
    subscriptions: Subscription[];
    loading: boolean;
    onRefresh: () => void;
}

export default function SubscriptionList({ subscriptions, loading, onRefresh }: SubscriptionListProps) {
    const { session } = useAuth();
    const [detecting, setDetecting] = useState(false);


    const handleDetect = async () => {
        if (!session?.access_token) return;
        setDetecting(true);
        try {
            const response = await fetch(`${API_URL}/subscriptions/detect`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });
            const result = await response.json();
            console.log('Detection result:', result);
            onRefresh(); // Refresh parent list
        } catch (error) {
            console.error('Error detecting subscriptions:', error);
        } finally {
            setDetecting(false);
        }
    };


    return (
        <div className="bg-white p-10 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 h-full flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-2xl font-bold text-black tracking-tight">Active Plan</h2>
                    <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">AI-detected recurring payments</p>
                </div>
                <button
                    onClick={handleDetect}
                    disabled={detecting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-black rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 font-bold text-[10px] uppercase tracking-widest border border-gray-100"
                >
                    {detecting ? (
                        <RefreshCw className="animate-spin" size={12} />
                    ) : (
                        <Zap size={12} />
                    )}
                    {detecting ? 'Analyzing...' : 'Refresh Detection'}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                        <tr>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Billing</th>
                            <th className="px-6 py-4 text-right">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                                    Syncing subscriptions...
                                </td>
                            </tr>
                        ) : subscriptions.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                                    No subscriptions detected yet.
                                </td>
                            </tr>
                        ) : (
                            subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="font-bold text-black">{sub.name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                            {sub.merchant_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="inline-flex items-center px-4 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 uppercase tracking-widest border border-gray-100">
                                            {sub.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                        {sub.frequency}
                                    </td>
                                    <td className="px-6 py-6 text-right font-bold text-black">
                                        ${sub.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {subscriptions.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center px-6">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Monthly Exposure</span>
                    <span className="text-xl font-bold text-black tracking-tight">${subscriptions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</span>
                </div>
            )}
        </div>
    );
}
