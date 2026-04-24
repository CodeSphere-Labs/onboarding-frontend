import { MantineProvider } from '@mantine/core';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.tsx';

import '@mantine/core/styles.css';

createRoot(document.getElementById('root')!).render(
  <MantineProvider>
    <App />
  </MantineProvider>
);
