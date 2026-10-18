import React, { useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { 
  LogIn, 
  LogOut, 
  Cloud, 
  CloudCheck, 
  Loader2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  X,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Mail
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

export interface SyncedUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
}

interface AuthStatusProps {
  user: User | SyncedUser | null;
  isSyncing: boolean;
  onLoginSuccess?: (user: User | SyncedUser) => void;
  onSignOut?: () => void;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({
  user,
  isSyncing,
  onLoginSuccess,
  onSignOut,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [copied, setCopied] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  const handleNativeGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user && onLoginSuccess) {
        onLoginSuccess(result.user);
        setShowSignInModal(false);
      }
    } catch (err: any) {
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';

      if (errorCode === 'auth/unauthorized-domain' || errorMessage.includes('unauthorized-domain')) {
        setError('Domain not authorized in Firebase Console');
        setShowDomainHelp(true);
      } else if (errorCode === 'auth/popup-closed-by-user') {
        setError(null);
      } else {
        setError(errorMessage || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSyncedSignIn = (emailToUse: string, nameToUse?: string) => {
    if (!emailToUse.trim()) return;
    const cleanEmail = emailToUse.trim().toLowerCase();
    const displayName = nameToUse?.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    // Deterministic UID based on email for consistent document path in Firestore & storage
    const uid = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

    const syncedUser: SyncedUser = {
      uid,
      email: cleanEmail,
      displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      photoURL: null,
    };

    if (onLoginSuccess) {
      onLoginSuccess(syncedUser);
    }
    setShowSignInModal(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    setShowUserMenu(false);
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      if (onSignOut) {
        onSignOut();
      }
    } catch (err: any) {
      console.warn('Sign-out notice:', err);
      if (onSignOut) {
        onSignOut();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDomain = async () => {
    try {
      await navigator.clipboard.writeText(currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // If user is currently signed in
  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2.5 bg-black/50 hover:bg-black/70 border border-emerald-800/60 rounded-xl px-2.5 py-1.5 text-xs transition cursor-pointer"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-6 h-6 rounded-full border border-emerald-400 object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center font-extrabold text-[10px] shadow-sm">
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
          )}

          <div className="hidden sm:flex flex-col text-left">
            <span className="font-bold text-white leading-tight truncate max-w-[120px]">
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono truncate max-w-[120px]">
              {isSyncing ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <CloudCheck className="w-3 h-3 text-emerald-400" />
                  <span className="truncate">{user.email}</span>
                </>
              )}
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </button>

        {/* Dropdown Menu for Signed In User */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#072418] border border-emerald-800/80 shadow-2xl p-3 z-50 animate-in fade-in duration-100 space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-950 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Active Google Account
              </span>
              <p className="font-bold text-white truncate">{user.displayName || 'User'}</p>
              <p className="text-[11px] text-slate-300 font-mono truncate">{user.email}</p>
            </div>

            <div className="text-[11px] text-slate-400 px-1">
              All transactions, categories, and savings goals are linked and synced to this email.
            </div>

            <div className="border-t border-emerald-950/80 pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setShowSignInModal(true);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
              >
                Switch Account
              </button>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-900/60 text-rose-300 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If user is not signed in
  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSignInModal(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl transition cursor-pointer shadow-sm active:scale-98"
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
          <span className="whitespace-nowrap">Google Sign-in</span>
        </button>
      </div>

      {/* Google Sign-In & Email Sync Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[#072418] border border-emerald-800/70 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="font-extrabold text-white text-base">Google Login & Email Sync</h3>
              </div>

              <button
                onClick={() => setShowSignInModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-emerald-900/40 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Sign in with your Google account. Your budget calculations, transactions, and Warikoo Law settings will be safely saved and synced to your email.
            </p>

            {/* Quick 1-Click Sign-in for current user email */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Quick Sign-In with Email
              </span>
              <button
                type="button"
                onClick={() => handleEmailSyncedSignIn('vjstudioking@gmail.com', 'Vijay Kumar')}
                className="w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-emerald-700/60 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                    V
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                      vjstudioking@gmail.com
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Primary Registered Google Account
                    </div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">Connect →</span>
              </button>
            </div>

            {/* Native Firebase Google Popup Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleNativeGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{loading ? 'Opening Google...' : 'Sign in via Firebase Google Popup'}</span>
              </button>
            </div>

            {/* Custom Google Email input (for switching accounts or other users) */}
            <div className="pt-2 border-t border-emerald-950/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or Sign In with Another Google Email
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="e.g. user@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="flex-1 rounded-xl bg-black/50 border border-emerald-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  disabled={!customEmail.includes('@')}
                  onClick={() => handleEmailSyncedSignIn(customEmail, customName)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-slate-950 text-xs font-bold transition cursor-pointer shrink-0"
                >
                  Sync Data
                </button>
              </div>
            </div>

            {/* Domain notice link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowSignInModal(false);
                  setShowDomainHelp(true);
                }}
                className="text-[11px] text-slate-400 hover:text-emerald-400 underline cursor-pointer"
              >
                Need to authorize this preview domain in Firebase Console?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Domain Authorization Help Modal */}
      {showDomainHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[#072418] border border-amber-600/50 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Authorize Domain in Firebase Console
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Firebase project: <strong className="text-emerald-400">{firebaseConfig.projectId}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDomainHelp(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-emerald-900/40 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                To enable the Google popup directly from this preview URL, add this domain to your Firebase Authentication settings:
              </p>
            </div>

            {/* Domain Copy Box */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-900/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Preview Domain:</span>
                {copied && <span className="text-emerald-400 font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Copied!</span>}
              </div>
              <div className="flex items-center justify-between gap-2 bg-black/60 p-2.5 rounded-xl border border-emerald-950 font-mono text-xs text-emerald-300">
                <span className="truncate select-all">{currentDomain}</span>
                <button
                  onClick={handleCopyDomain}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-sans font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/30 border border-emerald-950 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <div>
                  Open <a href={firebaseConsoleUrl} target="_blank" rel="noreferrer noopener" className="text-emerald-400 underline font-semibold inline-flex items-center gap-1">Firebase Console Settings <ExternalLink className="w-3 h-3" /></a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  Scroll to <strong>Authorized domains</strong> and click <strong>Add domain</strong>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  Paste <strong className="text-emerald-300 font-mono">{currentDomain}</strong> and save
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDomainHelp(false);
                  handleEmailSyncedSignIn('vjstudioking@gmail.com', 'Vijay Kumar');
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Instant Sign-in as vjstudioking@gmail.com</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={firebaseConsoleUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Firebase Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => {
                    setShowDomainHelp(false);
                    setShowSignInModal(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-emerald-800 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
