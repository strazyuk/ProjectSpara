import {
    LayoutDashboard,
    CreditCard,
    PiggyBank,
    Settings,
    LogOut,
    Menu,
    CalendarDays
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
    userEmail?: string;
    onSignOut: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function Sidebar({ userEmail, onSignOut, activeTab, onTabChange }: SidebarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'calendar', label: 'Calendar', icon: CalendarDays },
        { id: 'transactions', label: 'Transactions', icon: CreditCard },
        { id: 'savings', label: 'Savings', icon: PiggyBank },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <Menu size={24} />
            </button>

            {/* Sidebar Container */}
            <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-brand-offwhite transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="p-8">
                        <h1 className="text-sm font-bold tracking-[0.2em] text-black uppercase">
                            Spara
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onTabChange(item.id);
                                    setIsMobileOpen(false);
                                }}
                                className={`
                  w-full flex items-center px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                  ${activeTab === item.id
                                        ? 'bg-black text-white shadow-lg shadow-black/5'
                                        : 'text-gray-400 hover:text-black'}
                `}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 mt-auto">
                        <div className="px-6 py-4 mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account</p>
                            <p className="text-sm font-medium text-black truncate mt-1" title={userEmail}>
                                {userEmail?.split('@')[0]}
                            </p>
                        </div>
                        <button
                            onClick={onSignOut}
                            className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
