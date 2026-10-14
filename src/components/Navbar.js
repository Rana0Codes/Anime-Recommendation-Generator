import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TuneIcon from '@mui/icons-material/Tune';
import BrandLogo from './BrandLogo';
import CreatorProfileDialog from './CreatorProfileDialog';
import { BRAND } from '../constants/brand';
import { getCreatorSettings } from '../services/creatorStorage';

const Navbar = ({ activeMode = 'single', onModeChange }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [creator, setCreator] = useState({ handle: '@Rana0Codes', logo: null });

  useEffect(() => {
    const sync = () => {
      const s = getCreatorSettings();
      setCreator({ handle: s.handle || '@Rana0Codes', logo: s.logo });
    };
    sync();
    window.addEventListener('arg_creator_settings_updated', sync);
    return () => window.removeEventListener('arg_creator_settings_updated', sync);
  }, []);

  return (
    <>
      <Box
        component="header"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          py: 1.8,
          px: { xs: 2, md: 3.5 },
          mb: 4,
          borderRadius: '10px',
          backgroundColor: 'rgba(15, 20, 38, 0.78)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 12px 36px -10px rgba(0, 0, 0, 0.55), 0 0 20px -8px rgba(99, 102, 241, 0.25)',
        }}
      >
        {/* Brand Lockup */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05) rotate(4deg)',
              },
            }}
          >
            <BrandLogo size={44} variant="icon-only" />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 60%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.05rem', sm: '1.25rem' },
                }}
              >
                {BRAND.name}
              </Typography>
              <Chip
                label={BRAND.shortName}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  backgroundColor: 'rgba(99, 102, 241, 0.25)',
                  color: '#c7d2fe',
                  border: '1px solid rgba(99, 102, 241, 0.45)',
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mt: 0.3 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
                <span className="live-radar-dot" title="AniList API Active" />
                <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.70rem', fontWeight: 700 }}>
                  Live API
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)' }}>•</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                AniList GraphQL • 1080p Editorial Studio
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center: SaaS Mode Navigation Tabs */}
        {onModeChange && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.42)',
              borderRadius: '6px',
              p: 0.5,
              border: '1px solid rgba(255, 255, 255, 0.09)',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
              mx: { xs: 0, md: 'auto' },
            }}
          >
            <Tabs
              value={activeMode}
              onChange={(_, val) => onModeChange(val)}
              textColor="inherit"
              TabIndicatorProps={{
                style: {
                  background: activeMode === 'single'
                    ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                    : 'linear-gradient(90deg, #ec4899, #f43f5e)',
                  height: '100%',
                  borderRadius: '4px',
                  zIndex: 0,
                  boxShadow: activeMode === 'single'
                    ? '0 4px 16px rgba(99, 102, 241, 0.5)'
                    : '0 4px 16px rgba(236, 72, 153, 0.5)',
                },
              }}
              sx={{
                minHeight: { xs: 38, sm: 42 },
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'center',
                },
                '& .MuiTab-root': {
                  minHeight: { xs: 38, sm: 42 },
                  zIndex: 1,
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: { xs: '0.74rem', sm: '0.88rem' },
                  color: '#94a3b8',
                  px: { xs: 1.2, sm: 2.5 },
                  py: { xs: 0.5, sm: 0.8 },
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease, transform 0.15s ease',
                  '&:hover': {
                    color: '#ffffff',
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-selected': {
                    color: '#ffffff',
                  },
                },
              }}
            >
              <Tab
                value="single"
                icon={<MovieFilterIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />}
                iconPosition="start"
                label="Single Poster Studio"
              />
              <Tab
                value="weekly"
                icon={<CalendarMonthIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />}
                iconPosition="start"
                label="Weekly Top 3 Showcase"
              />
            </Tabs>
          </Box>
        )}

        {/* Right Actions: Creator Profile Chip + GitHub */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', md: 'flex-end' }, gap: 1.5 }}>
          {/* Creator Profile Chip (Interactive) */}
          <Button
            size="small"
            variant="outlined"
            onClick={() => setProfileOpen(true)}
            startIcon={
              <Avatar
                src={creator.logo || ''}
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: '0.75rem',
                  background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                🎌
              </Avatar>
            }
            endIcon={<TuneIcon sx={{ fontSize: 14, opacity: 0.6 }} />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.14)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              color: '#f8fafc',
              borderRadius: '6px',
              textTransform: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              py: 0.7,
              px: 1.5,
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 18px -4px rgba(99, 102, 241, 0.4)',
              },
            }}
          >
            {creator.handle}
          </Button>

          {/* GitHub Star Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<GitHubIcon />}
            href="https://github.com/Rana0Codes/Anime-Recommendation-Generator"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.14)',
              color: '#94a3b8',
              borderRadius: '6px',
              textTransform: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              py: 0.7,
              px: 1.5,
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.35)',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            GitHub
          </Button>
        </Box>
      </Box>

      {/* Creator Profile Modal Dialog */}
      <CreatorProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default Navbar;
