import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Activity, RefreshCw, DollarSign, TrendingUp } from 'lucide-react';

import TellerConnect from './components/TellerConnect';
import SubscriptionList from './components/SubscriptionList';
import BargainList from './components/BargainList';
import Sidebar from './components/Sidebar';
import SpendingTrend from './components/charts/SpendingTrend';
import CategoryPie from './components/charts/CategoryPie';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from './lib/supabase';
import type { TimeRange } from './types';

const API_URL = import.meta.env.VITE_API_URL;

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
}

function Dashboard() {
  const { user, session, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) console.error('Error fetching transactions:', error);
    else setTransactions(data || []);
    setLoading(false);
  };

  const handleTellerSuccess = async (accessToken: string) => {
    if (!session?.access_token) return;
    try {
      const response = await fetch(`${API_URL}/api/teller/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ access_token: accessToken }),
      });
      const data = await response.json();
      console.log('Sync result:', data);
      fetchTransactions();
    } catch (error) {
      console.error('Error syncing Teller transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    const now = new Date();
    let cutoff = new Date(0);
    if (timeRange === '6M') cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    else if (timeRange === '1Y') cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    return transactions.filter(t => new Date(t.date) >= cutoff);
  }, [transactions, timeRange]);

  const totalSpend = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const monthlyAverage = totalSpend / (transactions.length > 0 ? 6 : 1);

  return (
    <div className="flex h-screen bg-brand-offwhite text-black font-sans overflow-hidden">
      <Sidebar
        userEmail={user?.email}
        onSignOut={signOut}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <h1 className="text-sm font-bold tracking-widest uppercase">
            Spara
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-10">

            {/* Page Header */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Good morning, {user?.email?.split('@')[0]}
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-black">
                  {activeTab === 'dashboard' ? 'My balance' : 'Transactions'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <TellerConnect onSuccess={handleTellerSuccess} />
                <button
                  onClick={fetchTransactions}
                  disabled={loading}
                  className="p-2.5 bg-white text-gray-400 rounded-full hover:text-black hover:bg-gray-50 transition-all disabled:animate-spin shadow-sm border border-gray-100"
                  title="Refresh Data"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>

            {/* ===================== DASHBOARD TAB ===================== */}
            {activeTab === 'dashboard' && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 flex flex-col justify-between h-40">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Spend</p>
                      <h3 className="text-3xl font-bold text-black mt-2 tracking-tight">${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <TrendingUp size={10} /> +12.5%
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 flex flex-col justify-between h-40">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Activity</p>
                      <h3 className="text-3xl font-bold text-black mt-2 tracking-tight">{transactions.length} <span className="text-sm font-medium text-gray-400">txns</span></h3>
                    </div>
                    <div className="p-2 bg-gray-50 text-gray-400 rounded-lg w-fit"><Activity size={18} /></div>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 flex flex-col justify-between h-40">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Avg</p>
                      <h3 className="text-3xl font-bold text-black mt-2 tracking-tight">${monthlyAverage.toFixed(0)}</h3>
                    </div>
                    <div className="p-2 bg-gray-50 text-gray-400 rounded-lg w-fit"><DollarSign size={18} /></div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-12 gap-6 h-[500px]">
                  <div className="col-span-12 lg:col-span-8 h-full">
                    <SpendingTrend
                      transactions={filteredTransactions}
                      timeRange={timeRange}
                      onTimeRangeChange={setTimeRange}
                    />
                  </div>
                  <div className="col-span-12 lg:col-span-4 h-full">
                    <CategoryPie transactions={filteredTransactions} />
                  </div>
                </div>

                {/* Lists Row */}
                <div className="flex flex-col gap-6">
                  <BargainList />
                  <SubscriptionList />
                </div>
              </>
            )}

            {/* ===================== TRANSACTIONS TAB ===================== */}
            {activeTab === 'transactions' && (
              <div className="bg-white p-10 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-2xl font-bold text-black tracking-tight">Financial History</h2>
                    <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Full history from connected accounts</p>
                  </div>
                  <span className="bg-black text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {transactions.length} Records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                            No transactions found. Connect a bank account to get started.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest tabular-nums">
                              {new Date(t.date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-6 font-bold text-black">{t.name}</td>
                            <td className="px-6 py-6">
                              <span className="inline-flex items-center px-4 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 uppercase tracking-widest border border-gray-100">
                                {t.category}
                              </span>
                            </td>
                            <td className="px-6 py-6 text-right font-bold text-black tabular-nums">
                              ${t.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin text-blue-600">
          <Activity size={32} />
        </div>
      </div>
    );
  }
  return user ? <Dashboard /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
