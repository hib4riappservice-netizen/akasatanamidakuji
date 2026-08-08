import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted rather than loaded from Google's CDN: serving fonts ourselves keeps visitors'
// IP addresses from being sent to a third party (an issue under EU privacy law) and keeps the
// app rendering correctly in regions where Google Fonts is unreachable. Generated from the
// @fontsource packages by scripts/build-font-css.mjs; split by unicode-range, so a browser
// only downloads the subsets its text actually needs.
import './fonts.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
