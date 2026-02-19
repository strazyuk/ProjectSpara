import {
    LayoutDashboard,
    CreditCard,
    PiggyBank,
    Settings,
    LogOut,
    Menu
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
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="p-6 border-b border-slate-100">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Spara
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">Financial Intelligence</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onTabChange(item.id);
                                    setIsMobileOpen(false);
                                }}
                                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === item.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-slate-100">
                        <div className="px-4 py-3 mb-2">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Signed in as</p>
                            <p className="text-sm font-semibold text-slate-900 truncate" title={userEmail}>
                                {userEmail}
                            </p>
                        </div>
                        <button
                            onClick={onSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
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
