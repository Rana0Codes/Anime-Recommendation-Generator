import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import Navbar from './components/Navbar';
import RecommendationType from './components/RecommendationType';
import Footer from './components/Footer';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
      contrastText: '#ffffff',
    },
    background: {
      default: '#080c16',
      paper: '#0f1426',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    h4: {
      fontWeight: 900,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 700,
          textTransform: 'none',
          letterSpacing: '-0.01em',
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '8px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 700,
        },
      },
    },
  },
});

function App() {
  const [activeMode, setActiveMode] = useState('single');

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box className="studio-background" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Ambient Decorative Lighting */}
        <div className="ambient-glow-orb-1" aria-hidden="true" />
        <div className="ambient-glow-orb-2" aria-hidden="true" />

        <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 3 }, pb: 6, position: 'relative', zIndex: 1, flex: '1 0 auto', width: '100%' }}>
          {/* Studio Top Navigation Bar */}
          <Navbar activeMode={activeMode} onModeChange={setActiveMode} />

          {/* Main Studio Viewport */}
          <Box component="main" sx={{ p: 0, maxWidth: '100%' }}>
            <RecommendationType mode={activeMode} />
          </Box>
        </Container>

        {/* Full-Width Editorial SaaS Footer */}
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
