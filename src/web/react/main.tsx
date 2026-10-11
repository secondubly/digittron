/**
 * OBS Browser Source URL example:
 *   http://localhost:{WEB_PORT}/?channel=yourchannel&ttl=30&max=12&size=22
 * All query params are documented in config.ts.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { size } from './config';
import '@fontsource/atkinson-hyperlegible';
import { bg } from './config';

if (bg) document.body.style.background = bg
document.documentElement.style.setProperty('--size', `${size}px`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
