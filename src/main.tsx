import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { GoogleDriveProvider } from './context/GoogleDriveContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <GoogleDriveProvider>
          <App />
        </GoogleDriveProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
