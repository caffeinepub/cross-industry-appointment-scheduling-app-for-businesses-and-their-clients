import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import LandingSignInPage from './pages/LandingSignInPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import ServicesPage from './pages/dashboard/ServicesPage';
import ClientsPage from './pages/dashboard/ClientsPage';
import AvailabilityPage from './pages/dashboard/AvailabilityPage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import PublicBookingPage from './pages/PublicBookingPage';
import AppHeader from './components/AppHeader';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function AuthenticatedApp() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <LandingSignInPage />;
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <OnboardingPage />;
  }

  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AuthenticatedApp,
});

const dashboardRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/',
  component: DashboardLayout,
});

const servicesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: ServicesPage,
});

const clientsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/clients',
  component: ClientsPage,
});

const availabilityRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/availability',
  component: AvailabilityPage,
});

const appointmentsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/appointments',
  component: AppointmentsPage,
});

const publicBookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book/$businessId',
  component: PublicBookingPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([
    dashboardRoute.addChildren([
      servicesRoute,
      clientsRoute,
      availabilityRoute,
      appointmentsRoute,
    ]),
  ]),
  publicBookingRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
