import '@styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from './app/Providers'

const root = document.getElementById('root')
if (!root) throw new Error('[main] #root element not found')

createRoot(root).render(
  <StrictMode>
    <Providers />
  </StrictMode>,
)
