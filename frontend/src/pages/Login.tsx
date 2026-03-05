import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export function Login() {
    const { signInWithGoogle, signInWithPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDevLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithPassword(email, password);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-offwhite text-black font-sans px-4">
            <div className="p-12 bg-white rounded-[48px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] flex flex-col items-center gap-10 border border-gray-100/50 max-w-sm w-full">
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-sm font-bold tracking-[0.3em] text-black uppercase">
                        Spara
                    </h1>
                    <div className="h-px w-8 bg-black/10"></div>
                </div>

                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-black">
                        Welcome
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm font-medium">
                        Your personal financial intelligence
                    </p>
                </div>

                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-4 px-8 py-4 bg-black text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/5"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5 brightness-0 invert"
                    />
                    Continue with Google
                </button>

                {/* 🔑 DEV ONLY: Email/Password bypass — never shown in production builds */}
                {import.meta.env.DEV && (
                    <form onSubmit={handleDevLogin} className="w-full border-t border-dashed border-gray-100 pt-8 flex flex-col gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
                            Dev Login
                        </p>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10"
                        />
                        {error && <p className="text-[11px] text-red-500 font-medium text-center">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gray-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-700 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
