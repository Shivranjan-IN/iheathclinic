import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from './common/components/ErrorBoundary'
import './index.css'


try {
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </BrowserRouter>
      </React.StrictMode>,
    )
  } else {
    console.error("❌ main.tsx: Root element NOT found!");
  }
} catch (err) {
  console.error("❌ main.tsx: Render error:", err);
}
