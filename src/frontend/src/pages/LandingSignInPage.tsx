import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

export default function LandingSignInPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">
                Simplify Your Scheduling
              </h1>
              <p className="text-xl text-muted-foreground">
                Professional appointment management for businesses of all sizes. 
                Manage services, clients, and bookings in one beautiful platform.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 mt-1">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Easy Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your availability and let clients book appointments that work for both of you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 mt-1">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Client Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep track of all your clients and their appointment history in one place.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 mt-1">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Time Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Prevent double-bookings and maximize your schedule efficiency automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 mt-1">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Public Booking Page</h3>
                  <p className="text-sm text-muted-foreground">
                    Share a link with clients so they can book appointments 24/7.
                  </p>
                </div>
              </div>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Sign in securely with Internet Identity to create your business profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  size="lg"
                  className="w-full"
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <img
              src="/assets/generated/hero-illustration.dim_1600x900.png"
              alt="Appointment scheduling illustration"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} BookEase. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
