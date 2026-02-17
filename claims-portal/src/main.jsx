import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme/bloom-theme.css'
import App from './App.jsx'

// Apply Bloom theme class to body
document.body.classList.add('bloom-theme');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
// Version 3.0.0 - Fixed ALL DxcContainer unsupported props
