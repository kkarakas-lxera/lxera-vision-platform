import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('LXERA: Starting application...');
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('LXERA: Root element not found!');
} else {
  console.log('LXERA: Rendering app...');
  createRoot(rootElement).render(<App />);
}
