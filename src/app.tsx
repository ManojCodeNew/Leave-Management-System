import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { queryClient } from './config/query-client';
import AppNavigator from './navigators/app-navigator';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppNavigator />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
