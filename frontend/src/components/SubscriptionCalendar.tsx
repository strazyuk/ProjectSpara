import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  category: string;
  merchant_name: string;
  next_billing_date: string;
}

interface SubscriptionCalendarProps {
  subscriptions: Subscription[];
  loading: boolean;
}

export default function SubscriptionCalendar({ subscriptions, loading }: SubscriptionCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const calendarDays = useMemo(() => {
    const days = [];
    const totalDays = daysInMonth(currentYear, currentMonth);
    const startDay = firstDayOfMonth(currentYear, currentMonth);

    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Actual days
    for (let i = 1; i <= totalDays; i++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const daySubs = subscriptions.filter(s => s.next_billing_date === dateStr);
        days.push({ day: i, dateStr, subs: daySubs });
    }
    return days;
  }, [currentYear, currentMonth, subscriptions]);

  const navigateMonth = (direction: number) => {
    setViewDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  };

  const upcomingCharges = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return [...subscriptions]
      .filter(s => s.next_billing_date >= today)
      .sort((a, b) => a.next_billing_date.localeCompare(b.next_billing_date))
      .slice(0, 5);
  }, [subscriptions]);

  if (loading) return (
    <div className="h-[600px] flex items-center justify-center bg-white rounded-[40px] border border-gray-100">
        <div className="animate-pulse flex flex-col items-center gap-4 text-gray-300">
            <CalendarIcon size={48} />
            <p className="text-sm font-bold uppercase tracking-widest">Building Calendar...</p>
        </div>
    </div>
  );

  return (
    <div className="grid grid-cols-12 gap-8 h-full">
      {/* Calendar Grid */}
      <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-black tracking-tight">{monthName} {currentYear}</h2>
            <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Monthly Billing Schedule</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigateMonth(-1)}
              className="p-2.5 hover:bg-gray-50 rounded-full border border-gray-100 text-gray-400 hover:text-black transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => navigateMonth(1)}
              className="p-2.5 hover:bg-gray-50 rounded-full border border-gray-100 text-gray-400 hover:text-black transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50/50 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
          {calendarDays.map((dayObj, idx) => (
            <div 
              key={idx} 
              className={`min-h-[100px] p-2 bg-white relative group transition-colors hover:bg-gray-50/30 ${!dayObj ? 'bg-gray-50/30' : ''}`}
            >
              {dayObj && (
                <>
                  <span className={`
                    text-[10px] font-bold transition-all w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday(dayObj.day) ? 'bg-black text-white' : 'text-gray-400 group-hover:text-black'}
                  `}>
                    {dayObj.day}
                  </span>
                  <div className="mt-2 space-y-1">
                    {dayObj.subs.map(sub => (
                      <div 
                        key={sub.id} 
                        className="bg-brand-offwhite border border-gray-100/50 rounded-lg p-1.5 shadow-sm overflow-hidden"
                        title={`${sub.name}: $${sub.amount}`}
                      >
                        <p className="text-[9px] font-extrabold text-black truncate leading-tight uppercase tracking-tighter">
                          {sub.name}
                        </p>
                        <p className="text-[8px] font-bold text-gray-400 tracking-tighter">
                          ${sub.amount.toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar List */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-black text-white p-10 rounded-[40px] shadow-xl shadow-black/5 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Clock size={120} />
            </div>
            <div className="relative z-10">
                <h3 className="text-xl font-bold tracking-tight mb-2">Upcoming Charges</h3>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-8">Next 30 Days Forecast</p>
                
                <div className="space-y-6">
                    {upcomingCharges.length === 0 ? (
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest py-4 border-t border-white/10">No upcoming charges</p>
                    ) : upcomingCharges.map(sub => {
                        const daysLeft = Math.ceil((new Date(sub.next_billing_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                        return (
                            <div key={sub.id} className="flex justify-between items-center group">
                                <div>
                                    <p className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">{sub.name}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">${sub.amount.toFixed(2)}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                        {new Date(sub.next_billing_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Projected</p>
            <h4 className="text-3xl font-bold text-black tracking-tight">
                ${subscriptions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                <span className="text-sm font-medium text-gray-400 ml-2">/mo</span>
            </h4>
        </div>
      </div>
    </div>
  );
}
