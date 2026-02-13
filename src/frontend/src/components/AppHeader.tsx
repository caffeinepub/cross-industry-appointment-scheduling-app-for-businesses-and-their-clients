import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Calendar, LogOut, User } from 'lucide-react';

export default function AppHeader() {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();

  const isAuthenticated = !!identity;
  const isPublicBookingPage = routerState.location.pathname.startsWith('/book/');

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  if (isPublicBookingPage) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/app-logo.dim_512x512.png" alt="Logo" className="h-10 w-10" />
            <span className="font-semibold text-xl">BookEase</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/generated/app-logo.dim_512x512.png" alt="Logo" className="h-10 w-10" />
          <span className="font-semibold text-xl">BookEase</span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && userProfile && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{userProfile.name}</span>
            </div>
          )}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loginStatus === 'logging-in'}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
