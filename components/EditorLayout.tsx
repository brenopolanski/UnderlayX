'use client';

import { useEditor } from '@/hooks/useEditor';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Upload, Save, LogIn, Loader2, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Canvas } from '@/components/Canvas';
import { useIsMobile } from '@/hooks/useIsMobile'; // Add this hook
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/AuthDialog';
import { useState, useRef, useEffect } from 'react';
import { useEditorPanel } from '@/contexts/EditorPanelContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { isSubscriptionActive } from '@/lib/utils';
import { FREE_GENERATIONS_LIMIT } from '@/lib/supabase-utils';  // Add this import

interface EditorLayoutProps {
  SideNavComponent: React.ComponentType<{ mobile?: boolean }>;
}

interface UserInfo {
  expires_at: string | null;
  free_generations_used: number;
}

export function EditorLayout({ SideNavComponent }: EditorLayoutProps) {
  const { 
    resetEditor, 
    downloadImage, 
    isDownloading, 
    image,
    isProcessing,
    isConverting 
  } = useEditor();
  const isMobile = useIsMobile();
  const { user, isLoading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isPanelOpen } = useEditorPanel();
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchUserInfo() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('expires_at, free_generations_used')
            .eq('id', user.id)
            .single();

          if (data) {
            setUserInfo(data);
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    }

    fetchUserInfo();
  }, [user]); // Remove showUserMenu dependency, only fetch when user changes

  // Unified state check for all button actions
  const isActionDisabled = isProcessing || isConverting || isDownloading;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-white/10">
        <div className="px-4 h-16 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
              <span className="text-xl font-semibold hidden sm:inline">UnderlayX AI</span>
              <div className="flex items-center flex-col">
                <Home className="sm:hidden w-5 h-5" />
                <span className="sm:hidden text-xs mt-0.5 text-gray-600 dark:text-gray-400">Home</span>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-4 sm:gap-6"> {/* Increased gap spacing */}
            {image.original && (
              <>
                <button
                  onClick={() => resetEditor(true)}
                  disabled={isActionDisabled}
                  className={cn(
                    "flex flex-col items-center px-2", // Added horizontal padding
                    isActionDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  aria-disabled={isActionDisabled}
                >
                  <Upload className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-xs mt-0.5 text-gray-600 dark:text-gray-400">Upload</span>
                </button>
                <button
                  onClick={() => downloadImage()}
                  disabled={isActionDisabled}
                  className={cn(
                    "flex flex-col items-center px-2",
                    isActionDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  aria-disabled={isActionDisabled}
                >
                  <Save className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-xs mt-0.5 text-gray-600 dark:text-gray-400">
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </span>
                </button>
              </>
            )}
            <div className="flex items-center gap-4 sm:gap-6"> {/* Increased gap between theme toggle and avatar */}
              <ThemeToggle />
              {isLoading ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              ) : user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="relative flex items-center"
                  >
                    <div className="relative">
                      {userInfo?.expires_at && isSubscriptionActive(userInfo.expires_at) && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none">
                          Pro
                        </div>
                      )}
                      <div className="w-8 h-8 relative rounded-full overflow-hidden">
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="User avatar"
                          sizes="32px"
                          className="cursor-pointer hover:opacity-80 transition-opacity object-cover"
                        />
                      </div>
                    </div>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-60 py-2 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-white/10">
                      <div className="px-4 py-2 text-sm border-b border-gray-200 dark:border-white/10">
                        <div className="text-gray-700 dark:text-gray-300 truncate">
                          {user.email}
                        </div>
                        {userInfo && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            {userInfo.expires_at && isSubscriptionActive(userInfo.expires_at) ? (
                              <>
                                <div className="text-purple-600 font-medium">Pro Plan Active</div>
                                <div>Expires: {new Date(userInfo.expires_at).toLocaleDateString()}</div>
                              </>
                            ) : (
                              <>
                                <div>Free Plan</div>
                                <div>
                                  Free generations left: {Math.max(0, FREE_GENERATIONS_LIMIT - userInfo.free_generations_used)}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 flex flex-col h-screen">
        {/* Changed lg to xl for larger screens only */}
        <div className="hidden xl:block fixed top-16 bottom-0 w-[320px] border-r border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-950 z-10">
          <SideNavComponent mobile={false} />
        </div>

        <main className={cn(
          "flex-1 relative transition-all duration-300 ease-in-out",
          "px-0 sm:px-4", // Changed padding to horizontal only
          "xl:ml-[320px]",
          "pt-4", // Add top padding
          isMobile ?
            isPanelOpen ? 
              'pb-[32vh]' :     // Reduced padding when panel is open
              'pb-16'           // Minimal padding when panel is closed
            :
            isPanelOpen ? 
              'pb-[calc(32vh+120px)]' : 
              'pb-24 xl:pb-12'
        )}>
          {/* Bottom Navigation for mobile, tablet and small desktop */}
          <div className="fixed bottom-0 left-0 right-0 xl:hidden bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-white/10 z-20">
            <div className="p-2">
              <SideNavComponent mobile={true} />
            </div>
          </div>

          <div className={cn(
            "flex items-center justify-center transition-all duration-300",
            "w-full mx-auto", // Added width constraint
            "overflow-hidden", // Prevent horizontal scroll
            isMobile ?
              isPanelOpen ?
                'h-[42vh]' :    // Reduced height when panel is open
                'h-[60vh]'      // Reduced height when panel is closed
              :
              isPanelOpen ?
                'h-[calc(68vh-9rem)]' : 
                'h-[calc(100vh-11rem)]',
            "xl:h-[calc(100vh-8rem)]"
          )}>
            <div className={cn(
              "relative w-full h-full",
              "max-w-[min(900px,calc(100vw-2rem))]", // Slightly larger max width
              "flex items-center justify-center"
            )}>
              <div className="w-full h-full">
                <Canvas />
              </div>
            </div>
          </div>
        </main>
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        returnUrl={typeof window !== 'undefined' ? window.location.pathname : ''}
      />
    </div>
  );
}