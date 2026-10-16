import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SmoothScrollProvider } from './providers/SmoothScroll';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

// We handle scroll position ourselves between animated route transitions.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* reducedMotion="user": Framer drops transform animations for users who ask, keeping fades. */}
        <MotionConfig reducedMotion="user">
          <SmoothScrollProvider>
            <App />
          </SmoothScrollProvider>
        </MotionConfig>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
