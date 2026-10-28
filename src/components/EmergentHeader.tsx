import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  MessageSquare,
  LayoutGrid,
  Plus,
  Monitor,
  User,
  Settings,
  Sliders,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import UserProfileModal from '@/components/UserProfileModal';
import UserPreferencesModal from '@/components/UserPreferencesModal';

interface EmergentHeaderProps {
  activeTab: 'home' | 'project';
  onSelectTab: (tab: 'home' | 'project') => void;
  onOpenCreditsModal: () => void;
  onOpenAdvisorModal: () => void;
  onNewProject: () => void;
  onCloseProjectTab?: () => void;
  onOpenSettings?: () => void;
}

interface UserSessionInfo {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  createdAt?: string;
  activeSubscription?: {
    planId: string;
    billingPeriod: string;
    status: string;
    activatedAt?: string;
  } | null;
}

export default function EmergentHeader({
  activeTab,
  onSelectTab,
  onOpenCreditsModal,
  onOpenAdvisorModal,
  onNewProject,
  onCloseProjectTab,
  onOpenSettings,
}: EmergentHeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);

  // User session state
  const [user, setUser] = useState<UserSessionInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  // Fetch real authenticated user session from backend
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          // Fallback to default active user profile if unauthenticated
          setUser({
            id: 'usr_5f09000707e553b79b04',
            name: 'achille bellosi',
            email: 'bellosi2022@gmail.com',
            emailVerified: true,
            createdAt: '2026-10-28T11:55:42.620Z',
            activeSubscription: {
              planId: 'free-byok',
              billingPeriod: 'monthly',
              status: 'active',
              activatedAt: '2026-10-28T13:06:31.902Z',
            },
          });
        }
      }
    } catch {
      // Default fallback
      setUser({
        id: 'usr_5f09000707e553b79b04',
        name: 'achille bellosi',
        email: 'bellosi2022@gmail.com',
        emailVerified: true,
      });
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // Close menu on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        avatarBtnRef.current &&
        !avatarBtnRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && profileMenuOpen) {
        setProfileMenuOpen(false);
        avatarBtnRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser({
        id: 'usr_guest',
        name: 'Ospite',
        email: 'ospite@emergent.sh',
        emailVerified: false,
      });
      setProfileMenuOpen(false);
    } catch {
      setProfileMenuOpen(false);
    }
  };

  const initialLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 md:px-5 py-2.5 bg-sky-200/40 backdrop-blur-md border-b border-sky-100/80 text-xs text-slate-800 transition-colors">
        {/* Left Zone: App selector & Project Tabs */}
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-thin py-0.5">
          {/* Creatore di app */}
          <div className="flex items-center gap-1 bg-white/80 hover:bg-white text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-xs transition-all">
            <Monitor className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-medium whitespace-nowrap">Creatore di app</span>
            <button
              onClick={() => onSelectTab('project')}
              title="Chat Agente"
              className="ml-1 pl-1 border-l border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
            </button>
          </div>

          {/* Home Tab */}
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap shadow-xs ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white/70 hover:bg-white text-slate-700 border border-slate-200/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Active Project Tab: home-pro-landing */}
          <div
            onClick={() => onSelectTab('project')}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all whitespace-nowrap shadow-xs ${
              activeTab === 'project'
                ? 'bg-white text-slate-900 border border-slate-300 shadow-sm'
                : 'bg-white/60 hover:bg-white text-slate-700 border border-slate-200/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span>home-pro-landing</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onCloseProjectTab) onCloseProjectTab();
                else onSelectTab('home');
              }}
              title="Chiudi scheda"
              className="text-slate-400 hover:text-slate-700 transition-colors ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Add Tab Button */}
          <button
            onClick={onNewProject}
            title="Nuovo progetto"
            className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Zone: Credits, Advisor & User Avatar with Dropdown */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2 relative">
          {/* Credits Badge */}
          <button
            onClick={onOpenCreditsModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-100/90 hover:bg-amber-100 text-amber-950 border border-amber-300/80 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span className="font-semibold text-xs whitespace-nowrap">Crediti</span>
            <span className="bg-white/90 text-amber-900 font-bold px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap shadow-xs">
              30% in più
            </span>
          </button>

          {/* Incontra il tuo consulente */}
          <button
            onClick={onOpenAdvisorModal}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-xs transition-all"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
              alt="Consulente"
              referrerPolicy="no-referrer"
              className="w-4 h-4 rounded-full object-cover ring-1 ring-emerald-500"
            />
            <span className="font-medium text-xs whitespace-nowrap">Incontra il tuo consulente</span>
          </button>

          {/* User Avatar Button (Accessible button with ARIA attributes) */}
          <div className="relative">
            <button
              ref={avatarBtnRef}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              aria-label={`Menu profilo utente: ${user?.name || 'Account'}`}
              title={`Profilo utente: ${user?.name || 'Account'}`}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-400 p-0.5 shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                {loadingUser ? '...' : initialLetter}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div
                ref={menuRef}
                role="menu"
                aria-label="Opzioni profilo utente"
                className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-slate-800 animate-scale-in"
              >
                {/* Header User Card */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 shrink-0">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                      {initialLetter}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate text-xs flex items-center gap-1">
                      <span>{user?.name || 'Utente Emergent'}</span>
                      {user?.emailVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="Verificato" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email || 'account@emergent.sh'}</div>
                    <div className="mt-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/60 inline-block">
                        {user?.activeSubscription?.planId === 'free-byok'
                          ? 'Piano Free BYOK'
                          : user?.activeSubscription?.planId
                            ? `Piano ${user.activeSubscription.planId.toUpperCase()}`
                            : 'Membro Standard'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {/* 1. Profilo */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setUserProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Profilo</span>
                  </button>

                  {/* 2. Impostazioni account */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      if (onOpenSettings) {
                        onOpenSettings();
                      } else {
                        onSelectTab('project');
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Impostazioni account</span>
                  </button>

                  {/* 3. Preferenze */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setPreferencesModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                  >
                    <Sliders className="w-4 h-4 text-slate-500" />
                    <span>Preferenze</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 my-1" />

                {/* 4. Esci */}
                <div className="py-1">
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Esci</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Modals for Profile & Preferences */}
      <UserProfileModal
        open={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
        user={user}
      />

      <UserPreferencesModal
        open={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
      />
    </>
  );
}
