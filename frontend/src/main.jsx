import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import vi_VI from 'antd/locale/vi_VN';
import { createRoot } from 'react-dom/client';
import Root from './App.jsx';
import './index.css';
import './i18n'; // Initialize i18n
import { ConfigProvider } from 'antd';

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <QueryClientProvider client={queryClient}>
    <ConfigProvider locale={vi_VI}>
      <Root />
    </ConfigProvider>
  </QueryClientProvider>
);
