import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const Navbar = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2.5,
        px: { xs: 2, md: 4 },
        mb: 4,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
          }}
        >
          🎌
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Anime Recommendation Studio
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
            <Chip
              label="v2.0 Full Release"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 800,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              AniList GraphQL • 1080p HD Posters
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<GitHubIcon />}
          href="https://github.com/Rana0Codes/Anime-Recommendation-Generator"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#f8fafc',
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.82rem',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Star on GitHub
        </Button>
      </Box>
    </Box>
  );
};

export default Navbar;
