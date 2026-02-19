import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, TrendingDown, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface BargainOpportunity {
    subscription_id: string;
    original: string;
    alternative: string;
    monthly_savings: number;
    reason: string;
}

export default function BargainList() {
    const { session } = useAuth();
    const [bargains, setBargains] = useState<BargainOpportunity[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const fetchBargains = async () => {
        if (!session?.access_token) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/bargains/`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setBargains(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching bargains:", error);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    useEffect(() => {
        if (session) {
            fetchBargains();
        }
    }, [session]);

    if (!session) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Bargain Intelligence</h2>
                        <p className="text-sm text-slate-600">AI-powered savings recommendations</p>
                    </div>
                </div>

                <button
                    onClick={fetchBargains}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    {searched ? 'Refresh Analysis' : 'Find Savings'}
                </button>
            </div>

            {loading && (
                <div className="text-center py-8 text-slate-500">
                    <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-indigo-400" />
                    <p>Analyzing market rates...</p>
                </div>
            )}

            {!loading && searched && bargains.length === 0 && (
                <div className="text-center py-6 text-slate-500 bg-white/50 rounded-lg border border-indigo-50">
                    <p>No better deals found right now. You're getting good value!</p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {bargains.map((bargain, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <TrendingDown size={14} />
                                Save ${bargain.monthly_savings}/mo
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Current Plan</p>
                                <p className="text-slate-700 font-medium">{bargain.original}</p>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <p className="text-xs text-indigo-600 uppercase font-semibold">Recommended Switch</p>
                                <p className="text-slate-900 font-bold text-lg">{bargain.alternative}</p>
                            </div>

                            <div className="pt-2">
                                <p className="text-sm text-slate-600 italic">"{bargain.reason}"</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
