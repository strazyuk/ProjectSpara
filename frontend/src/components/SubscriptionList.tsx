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

export default function SubscriptionList() {
    const { session } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);

    const fetchSubscriptions = async () => {
        if (!session?.access_token) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/subscriptions/`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });
            const data = await response.json();
            setSubscriptions(data || []);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDetect = async () => {
        if (!session?.access_token) return;
        setDetecting(true);
        try {
            const response = await fetch(`${API_URL}/api/subscriptions/detect`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });
            const result = await response.json();
            console.log('Detection result:', result);
            await fetchSubscriptions(); // Refresh list
        } catch (error) {
            console.error('Error detecting subscriptions:', error);
        } finally {
            setDetecting(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [session]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Active Subscriptions</h2>
                    <p className="text-sm text-slate-500">AI-detected recurring payments</p>
                </div>
                <button
                    onClick={handleDetect}
                    disabled={detecting}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 font-medium text-sm"
                >
                    {detecting ? (
                        <RefreshCw className="animate-spin" size={16} />
                    ) : (
                        <Zap size={16} />
                    )}
                    {detecting ? 'Analyzing...' : 'Run AI Detection'}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Billing</th>
                            <th className="px-6 py-4 text-right">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                    Loading subscriptions...
                                </td>
                            </tr>
                        ) : subscriptions.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                                    No subscriptions detected yet. Try running the AI detection.
                                </td>
                            </tr>
                        ) : (
                            subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {sub.name}
                                        <div className="text-xs text-slate-400 font-normal mt-0.5">
                                            via {sub.merchant_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                            {sub.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 capitalize">
                                        {sub.frequency}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-medium text-slate-900">
                                        ${sub.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {subscriptions.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-right text-sm text-slate-500">
                    Total Monthly: <span className="font-semibold text-slate-900">${subscriptions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</span>
                </div>
            )}
        </div>
    );
}
