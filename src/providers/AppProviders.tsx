import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../store/store';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { NotifyProvider } from './NotifyProvider';
import { NotificationProvider } from './NotificationProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotifyProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </NotifyProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};
