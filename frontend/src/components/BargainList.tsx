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

    const fetchBargains = async (forceRefresh = false) => {
        if (!session?.access_token) return;

        setLoading(true);
        try {
            // Add ?refresh=true query param if forcing refresh
            const url = forceRefresh
                ? `${API_URL}/api/bargains/?refresh=true`
                : `${API_URL}/api/bargains/`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setBargains(result.data || []);
                if (result.source === 'cache_fresh_hit') {
                    console.log("Data was fresh, API call saved.");
                }
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
            fetchBargains(false); // Load cache only
        }
    }, [session]);

    if (!session) return null;

    return (
        <div className="bg-white p-10 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 mb-10">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-2xl font-bold text-black tracking-tight">Intelligence</h2>
                    <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest text-wrap">AI-powered savings recommendations</p>
                </div>

                <button
                    onClick={() => fetchBargains(true)}
                    disabled={loading}
                    className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    {searched ? 'Analyze again' : 'Find Savings'}
                </button>
            </div>

            {loading && (
                <div className="text-center py-12 text-gray-400">
                    <Loader2 className="animate-spin h-10 w-10 mx-auto mb-4 text-gray-200" />
                    <p className="text-sm font-medium tracking-wide">Analyzing market rates...</p>
                </div>
            )}

            {!loading && searched && bargains.length === 0 && (
                <div className="text-center py-10 text-gray-400 bg-gray-50/50 rounded-[32px] border border-gray-100 border-dashed">
                    <p className="text-sm font-medium">No better deals found right now. You're getting good value!</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {bargains.map((bargain, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-orange-50 text-orange-900 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <TrendingDown size={12} />
                                Save ${bargain.monthly_savings}/mo
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end gap-4">
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Original</p>
                                    <p className="text-black font-semibold truncate">{bargain.original}</p>
                                </div>
                                <div className="text-gray-300">→</div>
                                <div className="flex-1 text-right">
                                    <p className="text-[10px] text-black uppercase font-bold tracking-widest mb-2">Switch to</p>
                                    <p className="text-black font-extrabold truncate">{bargain.alternative}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-xs text-gray-500 font-medium leading-relaxed italic">"{bargain.reason}"</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
