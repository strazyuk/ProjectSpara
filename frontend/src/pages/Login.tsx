import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export function Login() {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 font-sans">
            <div className="p-8 bg-white rounded-2xl shadow-xl flex flex-col items-center gap-6 border border-slate-100 max-w-sm w-full">
                <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                    <Activity size={48} />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Sign in to access your dashboard
                    </p>
                </div>

                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}
