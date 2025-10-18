import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AOS from "aos";
import "aos/dist/aos.css";
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import Router from './router/Router';

// init aos
AOS.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='dark'>
      <Router />
      <Toaster richColors />
    </ThemeProvider>
  </StrictMode>,
)