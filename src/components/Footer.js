import React from 'react';
import { Box, Container, Typography, Link, Chip, Grid, Divider } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GitHubIcon from '@mui/icons-material/GitHub';
import SecurityIcon from '@mui/icons-material/Security';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BrandLogo from './BrandLogo';
import { BRAND } from '../constants/brand';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        mt: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(180deg, rgba(8, 12, 22, 0.7) 0%, rgba(4, 7, 14, 0.98) 100%)',
        backdropFilter: 'blur(24px)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: { xs: 5, md: 7 }, pb: 4 }}>
        <Grid container spacing={{ xs: 4, md: 5 }} sx={{ mb: 5 }}>
          {/* Column 1: Brand & Overview */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <BrandLogo size={38} variant="icon-only" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.2rem', lineHeight: 1.2, color: '#f8fafc' }}>
                  {BRAND.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 700, fontSize: '0.74rem', letterSpacing: '0.04em' }}>
                  1080p Editorial Studio • v2.0 PRO
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: '#94a3b8',
                lineHeight: 1.7,
                fontSize: '0.85rem',
                mb: 2.8,
                pr: { md: 3 },
              }}
            >
              The premier anime recommendation design studio. Curate, style, and export studio-grade 1080p promotional cards in 16:9 Landscape, 1:1 Square, and 9:16 Vertical formats with lossless zero-CORS canvas processing.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />}
                label="AniList GraphQL Live"
                size="small"
                sx={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.28)',
                  color: '#6ee7b7',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  height: 24,
                }}
              />
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: '13px !important', color: '#818cf8 !important' }} />}
                label="100% Client-Side Engine"
                size="small"
                sx={{
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.28)',
                  color: '#c7d2fe',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  height: 24,
                }}
              />
            </Box>
          </Grid>

          {/* Column 2: Supported Formats */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AspectRatioIcon sx={{ fontSize: 18, color: '#818cf8' }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: '0.78rem',
                }}
              >
                Export Formats
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
              <Box>
                <Typography sx={{ color: '#f1f5f9', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.3 }}>
                  16:9 Landscape Banner
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  1920 × 1080 • YouTube & Twitter
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: '#f1f5f9', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.3 }}>
                  1:1 Square Feed Post
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  1080 × 1080 • Instagram & Threads
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: '#f1f5f9', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.3 }}>
                  9:16 Vertical Story
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  1080 × 1920 • TikTok & Shorts
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: '#f1f5f9', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.3 }}>
                  Weekly 3-Anime Showcase
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  1200 × 675 • Editorial Trio Grid
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: '#f1f5f9', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.3 }}>
                  4 Studio Themes
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  Cyberpunk, Onyx, Sakura, Sunset
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Column 3: Platform & Engine */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CloudQueueIcon sx={{ fontSize: 18, color: '#06b6d4' }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: '0.78rem',
                }}
              >
                Studio Engine
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
              <Box>
                <Link
                  href="https://anilist.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#f1f5f9',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': { color: '#38bdf8' },
                  }}
                >
                  AniList GraphQL v2 API
                </Link>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  15,000+ Anime Database
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: '#f1f5f9', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.3 }}>
                  Optical Depth-of-Field
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  Dynamic Gaussian Canvas Blur
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: '#f1f5f9', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.3 }}>
                  Lossless Canvas Composing
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  Ultra-Crisp 1080p PNG Exports
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: '#f1f5f9', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.3 }}>
                  Creator Identity Branding
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  Custom Avatar & Handle Storage
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: '#f1f5f9', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.3 }}>
                  Automated Weekly Trending
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  Live Seasonal Discovery Engine
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Column 4: Privacy & Fair Use */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SecurityIcon sx={{ fontSize: 18, color: '#10b981' }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: '0.78rem',
                }}
              >
                Privacy & Fair Use
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2.2,
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                mb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#10b981' }} />
                <Typography sx={{ color: '#e2e8f0', fontWeight: 800, fontSize: '0.82rem' }}>
                  100% Client-Side Privacy
                </Typography>
              </Box>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.6 }}>
                All card generation, image compositing, and exports execute locally in your browser. No personal graphics, handles, or notes are stored on external servers.
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.55 }}>
              Anime cover artwork and metadata remain property of their respective creators and production studios. Powered by AniList GraphQL API under community fair use.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />

        {/* Bottom Copyright & Links */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.8,
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} Anime Recommendation Generator (ARG) • Built with React 18 & Material UI
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.2 }}>
            <Link
              href="https://github.com/Rana0Codes/Anime-Recommendation-Generator"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                color: '#94a3b8',
                fontSize: '0.82rem',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.2s',
                '&:hover': { color: '#ffffff' },
              }}
            >
              <GitHubIcon sx={{ fontSize: 16 }} /> GitHub Repository
            </Link>

            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</Typography>

            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>
              Created by{' '}
              <Link
                href="https://github.com/Rana0Codes"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#f472b6',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#fb7185', textDecoration: 'underline' },
                }}
              >
                @Rana0Codes
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
