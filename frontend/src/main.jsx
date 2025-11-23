import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import Root from './App.jsx';
import { store } from './redux/store.js';
import vi_VI from 'antd/locale/vi_VN';
import './index.css';
import { ConfigProvider } from 'antd';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <ConfigProvider locale={vi_VI}>
    <Provider store={store}>
      <Root />
    </Provider>
  </ConfigProvider>
);
