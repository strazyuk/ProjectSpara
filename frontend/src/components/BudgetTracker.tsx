import React, { useState, useEffect } from 'react';
import { DollarSign, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BudgetTrackerProps {
  totalSubSpend: number;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function BudgetTracker({ totalSubSpend }: BudgetTrackerProps) {
  const { session } = useAuth();
  const [budget, setBudget] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBudget = async () => {
    if (!session?.access_token) return;
    try {
      const response = await fetch(`${API_URL}/preferences/`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      setBudget(data.monthly_budget);
      setEditValue(data.monthly_budget?.toString() || '');
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async () => {
    if (!session?.access_token) return;
    const value = parseFloat(editValue);
    if (isNaN(value)) return;

    try {
      const response = await fetch(`${API_URL}/preferences/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ monthly_budget: value }),
      });
      const data = await response.json();
      setBudget(data.monthly_budget);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [session]);

  const percentUsed = budget ? (totalSubSpend / budget) * 100 : 0;
  
  // Color logic
  let barColor = 'bg-green-500';
  if (percentUsed > 90) barColor = 'bg-red-500 animate-pulse';
  else if (percentUsed > 70) barColor = 'bg-yellow-500';

  if (loading) return null;

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-black tracking-tight">Subscription Budget</h2>
            {percentUsed > 100 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 uppercase tracking-widest px-2 py-0.5 rounded-full">
                <AlertCircle size={10} /> Over Budget
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            Monthly limit for recurring plans
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-black">${totalSubSpend.toFixed(0)}</span>
              <span className="text-sm font-medium text-gray-300">/</span>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-20 px-2 py-1 text-sm font-bold border-b-2 border-black focus:outline-none"
                    autoFocus
                  />
                  <button onClick={updateBudget} className="p-1 hover:text-green-500 transition-colors">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="p-1 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 group">
                  <span className="text-xl font-bold text-gray-400">
                    {budget ? `$${budget}` : 'Set Limit'}
                  </span>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-300 hover:text-black transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {budget && (
        <div className="mt-6 space-y-2">
          <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
            <div 
              className={`h-full transition-all duration-1000 ease-out rounded-full ${barColor}`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>{percentUsed.toFixed(1)}% Consumed</span>
            <span>${(budget - totalSubSpend).toFixed(0)} Remaining</span>
          </div>
        </div>
      )}
    </div>
  );
}
