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
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar
        userEmail={user?.email}
        onSignOut={signOut}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Spara
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {activeTab === 'dashboard' ? 'Dashboard Overview' : 'All Transactions'}
                </h1>
                <p className="text-slate-500">
                  {activeTab === 'dashboard' ? "Welcome back, here's your financial summary." : 'Full history from connected accounts.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <TellerConnect onSuccess={handleTellerSuccess} />
                <button
                  onClick={fetchTransactions}
                  disabled={loading}
                  className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-blue-600 hover:border-blue-200 transition-all disabled:animate-spin shadow-sm"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Spend (All Time)</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalSpend.toFixed(2)}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={24} /></div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Transactions</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">{transactions.length}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Activity size={24} /></div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Est. Monthly Avg</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">${monthlyAverage.toFixed(0)}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={24} /></div>
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
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">All Transactions</h2>
                    <p className="text-sm text-slate-500">Full history from connected accounts</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200">
                    {transactions.length} Records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-3 text-left tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left tracking-wider">Category</th>
                        <th className="px-6 py-3 text-right tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-sm">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                            No transactions found. Connect a bank account to get started.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                              {new Date(t.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{t.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {t.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-900 text-right font-mono font-medium">
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
