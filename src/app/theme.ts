import { createTheme } from '@mantine/core';

const fontFamily =
  "Outfit, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const theme = createTheme({
  fontFamily,
  headings: { fontFamily },
  primaryColor: 'blue',
  primaryShade: 6,
  defaultRadius: 'md'
});
