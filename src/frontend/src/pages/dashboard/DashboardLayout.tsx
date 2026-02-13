import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Settings } from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navItems = [
    { path: '/', label: 'Services', icon: Settings },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/availability', label: 'Availability', icon: Clock },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your business appointments and clients</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => navigate({ to: item.path })}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
