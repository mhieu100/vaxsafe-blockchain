import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import Root from './App.jsx';
import './i18n'; // Initialize i18n
import './index.css';

// Suppress findDOMNode warning in development (known issue with antd pro-components)
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
      return;
    }
    originalError.apply(console, args);
  };
}

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

// Wrapper component to handle locale changes
const AppWithLocale = () => {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState(i18n.language === 'en' ? enUS : viVN);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setLocale(lng === 'en' ? enUS : viVN);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        token: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
      }}
    >
      <App>
        <Root />
      </App>
    </ConfigProvider>
  );
};

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <QueryClientProvider client={queryClient}>
    <AppWithLocale />
  </QueryClientProvider>
);
