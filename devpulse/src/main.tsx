import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from './hooks/useConfig'
import './index.css'
import App from './App'
import { SetupPage } from './pages'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/setup" element={<SetupPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)
