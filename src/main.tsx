import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppProviders } from './providers/AppProviders';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(

  <AppProviders>
    <App />
  </AppProviders>

);