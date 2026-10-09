import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Container, Typography, Link } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import Navbar from './components/Navbar';
import SearchOptions from './components/SearchOptions';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#07090e',
      paper: '#0f1422',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 50% 0%, #171b30 0%, #07090e 65%)',
          pb: 8,
        }}
      >
        <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 3 } }}>
          <Navbar />
          <SearchOptions />

          {/* Footer */}
          <Box
            sx={{
              mt: 10,
              pt: 3,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              🎌 Anime Recommendation Studio • Powered by{' '}
              <Link href="https://anilist.co" target="_blank" rel="noopener" color="inherit" underline="hover">
                AniList API
              </Link>{' '}
              &{' '}
              <Link href="https://github.com/niklasvh/html2canvas" target="_blank" rel="noopener" color="inherit" underline="hover">
                html2canvas
              </Link>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
              Created by{' '}
              <Link href="https://github.com/Rana0Codes" target="_blank" rel="noopener" sx={{ color: 'primary.light', fontWeight: 600 }}>
                @Rana0Codes
              </Link>
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
