import { BrowserRouter } from 'react-router-dom';
import { WeeklyBoard } from './components/weekly-board/WeeklyBoard';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WeeklyBoard />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;