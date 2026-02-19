import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Activity, LogOut, RefreshCw } from 'lucide-react';

import TellerConnect from './components/TellerConnect';
import SubscriptionList from './components/SubscriptionList';
import BargainList from './components/BargainList';
import InsightsDashboard from './components/InsightsDashboard';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

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
      console.log("Syncing Teller transactions...");
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

      // Refresh transactions list
      fetchTransactions();

    } catch (error) {
      console.error('Error syncing Teller transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <Activity size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Dashboard
              </h1>
              <p className="text-slate-500">
                Welcome, {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Bank Accounts</h2>
            <TellerConnect onSuccess={handleTellerSuccess} />
          </div>
          <p className="text-sm text-slate-500">
            Connect your bank account to sync transactions via Teller.
          </p>
        </div>

        <div className="mb-8">
          <InsightsDashboard transactions={transactions} />
        </div>

        <div className="mb-8">
          <BargainList />
          <SubscriptionList />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Transactions</h2>
            <button
              onClick={fetchTransactions}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-blue-600 transition-colors disabled:animate-spin"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                      No transactions found. Connect a bank account to get started.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{t.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-mono">
                        ${t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
