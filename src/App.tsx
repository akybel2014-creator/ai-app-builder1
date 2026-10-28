import { useState, useEffect, useCallback } from 'react';
import EmergentHeader from '@/components/EmergentHeader';
import StudioHubView from '@/components/StudioHubView';
import EditorSplitView from '@/components/EditorSplitView';
import CreditsModal from '@/components/CreditsModal';
import AdvisorModal from '@/components/AdvisorModal';
import ToastContainer from '@/components/ToastContainer';

export interface AppProps {
  initialPathname?: string;
  baseUrl?: string;
}

export default function App(props: AppProps) {
  const { initialPathname } = props;

  const [activeTab, setActiveTab] = useState<'home' | 'project'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.includes('editor') || p.includes('project') || p.includes('workspace')) {
        return 'project';
      }
    }
    if (initialPathname && (initialPathname.includes('editor') || initialPathname.includes('project'))) {
      return 'project';
    }
    return 'home';
  });

  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [advisorModalOpen, setAdvisorModalOpen] = useState(false);

  // Sync title and SEO
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = activeTab === 'home'
        ? "Emergent — Crea app con agenti AI, Vetrina & Progetti"
        : "home-pro-landing · Emergent Editor & Anteprima Live";
    }
  }, [activeTab]);

  const handleSelectTab = useCallback((tab: 'home' | 'project') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const path = tab === 'home' ? '/' : '/project/home-pro-landing';
      window.history.pushState({}, '', path);
    }
  }, []);

  const handleOpenProject = useCallback(() => {
    setActiveTab('project');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/project/home-pro-landing');
    }
  }, []);

  const handleCreateWithPrompt = useCallback(() => {
    setActiveTab('project');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/project/home-pro-landing');
    }
  }, []);

  const handleNewProject = useCallback(() => {
    setActiveTab('project');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/project/new');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-500/20">
      {/* 1. Header (Screenshot 1 & 4 Top Bar) */}
      <EmergentHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenCreditsModal={() => setCreditsModalOpen(true)}
        onOpenAdvisorModal={() => setAdvisorModalOpen(true)}
        onNewProject={handleNewProject}
        onCloseProjectTab={() => setActiveTab('home')}
        onOpenSettings={() => setActiveTab('project')}
      />

      {/* 2. Main View Switcher */}
      {activeTab === 'home' ? (
        <StudioHubView
          onOpenProject={handleOpenProject}
          onCreateWithPrompt={handleCreateWithPrompt}
          onOpenConsultant={() => setAdvisorModalOpen(true)}
        />
      ) : (
        <EditorSplitView
          onBackToHome={() => handleSelectTab('home')}
          onOpenCreditsModal={() => setCreditsModalOpen(true)}
        />
      )}

      {/* 3. Global Modals */}
      <CreditsModal
        open={creditsModalOpen}
        onClose={() => setCreditsModalOpen(false)}
      />

      <AdvisorModal
        open={advisorModalOpen}
        onClose={() => setAdvisorModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}
