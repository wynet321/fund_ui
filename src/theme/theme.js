import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B325F',
      light: '#3A89C9',
      dark: '#0A1A3A',
      contrastText: '#FFF'
    },
    secondary: {
      main: '#9CC4E4',
      light: '#E9F2F9',
      dark: '#6A8EB8',
      contrastText: '#1B325F'
    },
    accent: {
      main: '#F26C4F',
      light: '#FF9D87',
      dark: '#B84B33',
      contrastText: '#FFF'
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: { fontWeight: 700, color: '#1B325F' },
    h2: { fontWeight: 600, color: '#1B325F' },
    h3: { fontWeight: 600, color: '#1B325F' },
    h4: { fontWeight: 600, color: '#1B325F' },
    button: {
      textTransform: 'none',
      fontWeight: 500
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          fontWeight: 500
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(27, 50, 95, 0.2)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(27, 50, 95, 0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(27, 50, 95, 0.15)'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
          color: '#1B325F',
          boxShadow: '0 2px 10px rgba(27, 50, 95, 0.1)'
        }
      }
    }
  }
});

export default theme;
