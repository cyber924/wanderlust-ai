import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import type { InitialPageData } from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;
const initialData = (window as any).__INITIAL_PAGE__ as InitialPageData | undefined;
const application = <StrictMode><App initialData={initialData} /></StrictMode>;
// Keep the server-rendered DOM and attach events instead of replacing the first screen.
if (initialData && container.hasChildNodes()) {
  hydrateRoot(container, application);
} else {
  createRoot(container).render(application);
}
