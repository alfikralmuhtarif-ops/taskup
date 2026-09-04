import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* The panel is served from a sub-path (/panel/) under the API's certificate,
        because admin.taskupapp.net has no DNS record yet. Vite's BASE_URL carries
        whatever --base the build used, so this stays correct if it later moves to
        its own subdomain built with --base=/. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
