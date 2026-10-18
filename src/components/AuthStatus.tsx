import React, { useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { LogIn, LogOut, Cloud, CloudCheck, Loader2 } from 'lucide-react';

interface AuthStatusProps {
  user: User | null;
  isSyncing: boolean;
  onLoginSuccess?: (user: User) => void;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({
  user,
  isSyncing,
  onLoginSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user && onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2.5 bg-black/40 border border-emerald-800/40 rounded-xl px-2.5 py-1.5 text-xs">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-6 h-6 rounded-full border border-emerald-500/50 object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
            {user.displayName?.[0] || 'U'}
          </div>
        )}

        <div className="hidden sm:flex flex-col text-left">
          <span className="font-semibold text-white leading-tight truncate max-w-[110px]">
            {user.displayName?.split(' ')[0] || 'Account'}
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            {isSyncing ? (
              <>
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                <span>Syncing</span>
              </>
            ) : (
              <>
                <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                <span>Firestore</span>
              </>
            )}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          disabled={loading}
          title="Sign out"
          className="p-1 text-slate-400 hover:text-rose-400 transition ml-1"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/60 rounded-xl transition cursor-pointer shadow-sm active:scale-98"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
        ) : (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="whitespace-nowrap">Sign In</span>
      </button>

      {error && (
        <span className="text-[10px] text-rose-400 hidden lg:inline max-w-[120px] truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  );
};
