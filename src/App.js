import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import SearchOptions from './components/SearchOptions';

const theme = createTheme({
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  palette: {
    primary: {
      main: '#3D2C8D',
    },
    secondary: {
      main: '#00BBF9',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Anime Recommendation Generator
          </Typography>
          <SearchOptions />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
