
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WeeklyBoard } from './components/weekly-board/WeeklyBoard';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import WorkoutGears from './pages/WorkoutGears';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Products from './pages/admin/Products';
import Blogs from './pages/admin/Blogs';
import Banners from './pages/admin/Banners';
import AdminSettings from './pages/admin/Settings';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import Auth from './pages/auth/Auth';
import Settings from './pages/settings/Settings';
import ProfileSettings from './pages/settings/Profile';
import AccountSettings from './pages/settings/Account';
import PlanSettings from './pages/settings/Plan';
import HomePage from './pages/HomePage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/weekly-board" element={<WeeklyBoard />} />
              <Route path="/workout-gears" element={<WorkoutGears />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              
              {/* Auth routes */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Settings routes */}
              <Route path="/settings" element={<Settings />}>
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="account" element={<AccountSettings />} />
                <Route path="plan" element={<PlanSettings />} />
              </Route>
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/blogs" element={<Blogs />} />
              <Route path="/admin/banners" element={<Banners />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
