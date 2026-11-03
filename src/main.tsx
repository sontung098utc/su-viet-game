import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

try {
  const realFetch = window.fetch;
  let currentFetch = typeof realFetch === 'function' ? realFetch.bind(window) : realFetch;
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    get: () => currentFetch,
    set: (fn) => {
      currentFetch = fn;
    },
  });
} catch {
  // Ignore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
