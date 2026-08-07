import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#060773',
      dark: '#04044f',
      light: '#0d0fa8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7b817f',
    },
    background: {
      default: '#f0f0f0',
      paper: '#ffffff',
    },
    text: {
      primary: '#171717',
      secondary: '#7b817f',
    },
    success: {
      main: '#1b8a5a',
      light: '#e2f5ec',
    },
    warning: {
      main: '#c77700',
      light: '#fdf0dc',
    },
    error: {
      main: '#c4342b',
      light: '#fceae8',
    },
    divider: '#dcdcdc',
  },
  typography: {
    fontFamily: "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    button: { fontWeight: 700 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 700 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 14 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
  },
})
