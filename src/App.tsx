
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WeeklyBoard } from './components/weekly-board/WeeklyBoard';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WorkoutGears from './pages/WorkoutGears';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Products from './pages/admin/Products';
import Banners from './pages/admin/Banners';
import Settings from './pages/admin/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WeeklyBoard />} />
          <Route path="/workout-gears" element={<WorkoutGears />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/banners" element={<Banners />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
