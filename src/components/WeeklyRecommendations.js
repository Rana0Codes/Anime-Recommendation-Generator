import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarIcon from '@mui/icons-material/Star';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import PaletteIcon from '@mui/icons-material/Palette';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ApiSearch from './ApiSearch';
import ManualInput from './ManualInput';
import ProjectWatermark from './ProjectWatermark';
import CreatorLogoControl from './CreatorLogoControl';
import { fetchTopWeeklyAnime } from '../services/aniListApi';
import { convertUrlToBase64, createBlurredImageBase64 } from '../services/imageUtils';
import { downloadNodeAsPng, copyNodeToClipboard } from '../services/exportService';
import { getCreatorSettings, saveCreatorHandle } from '../services/creatorStorage';

const SLOT_CONFIGS = [
  {
    rank: '#1',
    category: 'MUST WATCH',
    icon: '👑',
    accentColor: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    badgeBorder: 'rgba(245, 158, 11, 0.4)',
    badgeBg: 'rgba(245, 158, 11, 0.16)',
  },
  {
    rank: '#2',
    category: 'BINGE WORTHY',
    icon: '🔥',
    accentColor: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    badgeBorder: 'rgba(244, 63, 94, 0.4)',
    badgeBg: 'rgba(244, 63, 94, 0.16)',
  },
  {
    rank: '#3',
    category: 'HIDDEN GEM',
    icon: '✨',
    accentColor: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
    badgeBorder: 'rgba(6, 182, 212, 0.4)',
    badgeBg: 'rgba(6, 182, 212, 0.16)',
  },
];

const WEEKLY_THEMES = {
  midnight: {
    name: 'Midnight Neon',
    baseBg: '#070914',
    cardGradient: 'linear-gradient(160deg, rgba(18, 24, 52, 0.78) 0%, rgba(9, 12, 28, 0.90) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.35)',
    cardBorder: '1px solid rgba(255, 255, 255, 0.12)',
    accent: '#6366f1',
    glow: '0 0 50px rgba(99, 102, 241, 0.22)',
  },
  crimson: {
    name: 'Crimson Abyss',
    baseBg: '#120609',
    cardGradient: 'linear-gradient(160deg, rgba(35, 12, 24, 0.78) 0%, rgba(16, 5, 12, 0.90) 100%)',
    border: '1px solid rgba(244, 63, 94, 0.35)',
    cardBorder: '1px solid rgba(255, 255, 255, 0.12)',
    accent: '#f43f5e',
    glow: '0 0 50px rgba(244, 63, 94, 0.22)',
  },
  cyber: {
    name: 'Cyberpunk Teal',
    baseBg: '#041218',
    cardGradient: 'linear-gradient(160deg, rgba(10, 32, 44, 0.78) 0%, rgba(5, 16, 22, 0.90) 100%)',
    border: '1px solid rgba(6, 182, 212, 0.35)',
    cardBorder: '1px solid rgba(255, 255, 255, 0.12)',
    accent: '#06b6d4',
    glow: '0 0 50px rgba(6, 182, 212, 0.22)',
  }
};

/**
 * Deterministic sentence-aware synopsis formatter for weekly recommendations.
 * Ensures descriptions fit within 3 lines without clipping or sliced descenders.
 */
const formatWeeklyDescription = (rawText, maxChars = 135) => {
  if (!rawText) return 'A top-tier anime recommendation with standout animation and compelling storytelling.';
  const clean = rawText
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length <= maxChars) return clean;

  // Attempt to find a sentence break (. ! ?) between 75 and maxChars
  const sentenceEndRegex = /[.!?](?=\s|$)/g;
  let lastSentenceIdx = -1;
  let match;
  while ((match = sentenceEndRegex.exec(clean)) !== null) {
    if (match.index + 1 <= maxChars && match.index + 1 >= 75) {
      lastSentenceIdx = match.index + 1;
    } else if (match.index + 1 > maxChars) {
      break;
    }
  }

  if (lastSentenceIdx !== -1) {
    return clean.slice(0, lastSentenceIdx).trim();
  }

  // Fallback to word boundary
  const sub = clean.slice(0, maxChars);
  const lastSpace = sub.lastIndexOf(' ');
  return (lastSpace > 0 ? sub.slice(0, lastSpace) : sub).trim() + '...';
};

const WeeklyRecommendations = () => {
  const initialSettings = getCreatorSettings();
  const [selectedAnimeList, setSelectedAnimeList] = useState([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [weekTitle, setWeekTitle] = useState('Top 3 Anime of the Week');
  const [curator, setCurator] = useState(initialSettings.handle || '@Rana0Codes');
  const [creatorLogo, setCreatorLogo] = useState(initialSettings.logo);
  const [themeKey, setThemeKey] = useState('midnight');
  const [isExporting, setIsExporting] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [weeklyBannerBase64, setWeeklyBannerBase64] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [slotSourceTab, setSlotSourceTab] = useState(0);
  const [zoomLevel, setZoomLevel] = useState('fit');
  const [exportQuality, setExportQuality] = useState('ultra');
  const weeklyStageContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  const weeklyPosterRef = useRef(null);
  const activeTheme = WEEKLY_THEMES[themeKey];

  // Measure stage container width for responsive auto-fit zoom
  useEffect(() => {
    const updateWidth = () => {
      if (weeklyStageContainerRef.current) {
        const w = weeklyStageContainerRef.current.clientWidth - 48;
        if (w > 100) setContainerWidth(w);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const effectiveScale = isExporting
    ? 1
    : zoomLevel === 'fit'
    ? Math.min(1, Math.max(0.25, containerWidth / 1200))
    : Number(zoomLevel);

  const handleZoomIn = () => {
    const current = typeof effectiveScale === 'number' ? effectiveScale : 1;
    setZoomLevel(Math.min(1.5, Math.round((current + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    const current = typeof effectiveScale === 'number' ? effectiveScale : 1;
    setZoomLevel(Math.max(0.3, Math.round((current - 0.15) * 100) / 100));
  };

  // Listen for creator logo / handle updates from single or weekly controls
  useEffect(() => {
    const handleSync = () => {
      const s = getCreatorSettings();
      setCreatorLogo(s.logo);
      if (s.handle) setCurator(s.handle);
    };
    window.addEventListener('arg_creator_settings_updated', handleSync);
    return () => {
      window.removeEventListener('arg_creator_settings_updated', handleSync);
    };
  }, []);

  // Pre-blur backdrop banner whenever selectedAnimeList changes (reduced blur for cinematic clarity)
  useEffect(() => {
    let isMounted = true;
    const generateBackdrop = async () => {
      const leadAnime = selectedAnimeList[0];
      if (leadAnime) {
        const rawBanner = leadAnime.bannerImage || leadAnime.coverImage?.extraLarge || leadAnime.coverImage?.large || leadAnime.coverImage;
        if (rawBanner) {
          try {
            const blurred = await createBlurredImageBase64(rawBanner, 8, 1200, 675);
            if (isMounted) setWeeklyBannerBase64(blurred);
          } catch {
            if (isMounted) setWeeklyBannerBase64('');
          }
          return;
        }
      }
      if (isMounted) setWeeklyBannerBase64('');
    };
    generateBackdrop();
    return () => { isMounted = false; };
  }, [selectedAnimeList]);

  const processAnimeWithBase64 = async (anime) => {
    const rawImage = anime.coverImage?.large || anime.coverImage?.extraLarge || anime.coverImage || anime.image_url;
    try {
      const base64Image = await convertUrlToBase64(rawImage);
      return {
        ...anime,
        base64Image: base64Image || rawImage,
      };
    } catch {
      return { ...anime, base64Image: rawImage };
    }
  };

  const handleSelectAnime = async (anime) => {
    setShowSearchModal(false);
    const processed = await processAnimeWithBase64(anime);
    const updated = [...selectedAnimeList];
    updated[activeSlotIndex] = processed;
    setSelectedAnimeList(updated);
  };

  const handleRemoveAnime = (index) => {
    const updated = selectedAnimeList.filter((_, i) => i !== index);
    setSelectedAnimeList(updated);
  };

  const handleOpenSearchForSlot = (index) => {
    setActiveSlotIndex(index);
    setShowSearchModal(true);
  };

  const handleAutoGenerateWeekly = async () => {
    setIsAutoGenerating(true);
    try {
      const topAnime = await fetchTopWeeklyAnime();
      if (!topAnime || topAnime.length === 0) {
        throw new Error('No trending anime returned');
      }

      const processedList = await Promise.all(
        topAnime.slice(0, 3).map((item) => processAnimeWithBase64(item))
      );

      setSelectedAnimeList(processedList);
      setNotification({
        open: true,
        message: 'Auto-generated this week’s Top 3 anime with full artwork!',
        severity: 'success',
      });

      setTimeout(() => {
        if (weeklyPosterRef.current) {
          weeklyPosterRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } catch (err) {
      console.error('Auto-generate error:', err);
      setNotification({
        open: true,
        message: 'Failed to auto-fetch top anime. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleExportPoster = async () => {
    if (!weeklyPosterRef.current) return;
    setIsExporting(true);

    try {
      // Allow DOM to unscale before capturing
      await new Promise((resolve) => setTimeout(resolve, 80));
      await downloadNodeAsPng(
        weeklyPosterRef.current,
        `weekly-anime-showcase-${Date.now()}.png`,
        { width: 1200, height: 675, exportQuality }
      );

      setNotification({
        open: true,
        message: `Weekly Showcase poster exported in high-resolution ${exportQuality === 'ultra' ? '4K Ultra HD' : 'HD'}!`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Export error:', err);
      setNotification({
        open: true,
        message: 'Failed to export weekly poster. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyPoster = async () => {
    if (!weeklyPosterRef.current) return;
    setIsExporting(true);

    try {
      // Allow DOM to unscale before capturing
      await new Promise((resolve) => setTimeout(resolve, 80));
      const result = await copyNodeToClipboard(
        weeklyPosterRef.current,
        { width: 1200, height: 675, exportQuality }
      );

      setNotification({
        open: true,
        message: result.method === 'clipboard' ? 'Weekly Showcase copied to clipboard!' : 'Weekly Showcase downloaded (clipboard permission not granted)',
        severity: result.method === 'clipboard' ? 'success' : 'info',
      });
    } catch (err) {
      console.error('Copy error:', err);
      setNotification({
        open: true,
        message: 'Failed to copy weekly poster.',
        severity: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1250, mx: 'auto', p: { xs: 1, md: 2 } }}>
      {/* Top Banner / Headline */}
      <Box
        sx={{
          mb: 4.5,
          p: { xs: 3, md: 5 },
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(20, 26, 50, 0.8) 0%, rgba(12, 16, 32, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Chip
            icon={<FlashOnIcon sx={{ fontSize: '14px !important', color: '#fbbf24 !important' }} />}
            label="EDITORIAL BROADCAST STUDIO"
            size="small"
            sx={{
              backgroundColor: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fde68a',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              borderRadius: '4px',
            }}
          />
          <Chip
            label="16:9 4K READY"
            size="small"
            sx={{
              backgroundColor: 'rgba(99, 102, 241, 0.18)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#c7d2fe',
              fontSize: '0.72rem',
              fontWeight: 800,
              borderRadius: '4px',
            }}
          />
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            mb: 1.2,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.6rem' },
            letterSpacing: '-0.025em',
            background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Weekly Top 3 Anime Showcase
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#94a3b8',
            maxWidth: 720,
            mx: 'auto',
            mb: 3.5,
            lineHeight: 1.6,
            fontSize: { xs: '0.92rem', md: '1.02rem' },
          }}
        >
          Auto-generate the official top 3 trending anime airing this week with full background artwork, or hand-pick your curated podium.
        </Typography>

        {/* 1-CLICK AUTO-GENERATE BUTTON */}
        <Button
          variant="contained"
          size="large"
          startIcon={isAutoGenerating ? <CircularProgress size={20} color="inherit" /> : <FlashOnIcon />}
          onClick={handleAutoGenerateWeekly}
          disabled={isAutoGenerating}
          className="btn-shimmer"
          sx={{
            background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '1.05rem',
            px: { xs: 3, sm: 4.5 },
            py: 1.5,
            borderRadius: '6px',
            boxShadow: '0 8px 30px rgba(236, 72, 153, 0.45)',
            textTransform: 'none',
            letterSpacing: '-0.01em',
            '&:hover': {
              boxShadow: '0 10px 35px rgba(236, 72, 153, 0.65)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {isAutoGenerating ? 'Auto-Fetching This Week’s Top Anime...' : '⚡ Auto-Generate This Week\'s Top 3 Anime'}
        </Button>
      </Box>

      {/* Studio Controls Header / Customization Dock */}
      <Box
        className="glass-panel"
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 4,
          borderRadius: '10px',
          backgroundColor: 'rgba(15, 20, 38, 0.78)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 800, mb: 0.8, display: 'block', fontSize: '0.74rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Weekly Headline
            </Typography>
            <TextField
              size="small"
              fullWidth
              value={weekTitle}
              onChange={(e) => setWeekTitle(e.target.value)}
              placeholder="e.g. Weekly Recommendations • Issue #1"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  color: '#f8fafc',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                  '&:hover fieldset': { borderColor: '#818cf8' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 800, mb: 0.8, display: 'block', fontSize: '0.74rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Curator Handle
            </Typography>
            <TextField
              size="small"
              fullWidth
              value={curator}
              onChange={(e) => {
                setCurator(e.target.value);
                saveCreatorHandle(e.target.value);
              }}
              placeholder="@YourHandle"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  color: '#f8fafc',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                  '&:hover fieldset': { borderColor: '#818cf8' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 800, mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.6, fontSize: '0.74rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              <PaletteIcon sx={{ fontSize: 16, color: '#ec4899' }} /> Poster Theme
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={themeKey}
                onChange={(e) => setThemeKey(e.target.value)}
                displayEmpty
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '&:hover': { border: '1px solid rgba(99, 102, 241, 0.5)' },
                  '&.Mui-focused': { border: '1px solid #6366f1', boxShadow: '0 0 14px rgba(99, 102, 241, 0.35)' },
                  '& .MuiSelect-select': { py: 1.05, px: 1.8, display: 'flex', alignItems: 'center', gap: 1.2 },
                  '& .MuiSelect-icon': { color: '#94a3b8' },
                }}
              >
                {Object.entries(WEEKLY_THEMES).map(([k, t]) => (
                  <MenuItem key={k} value={k} sx={{ py: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: t.accent,
                        boxShadow: `0 0 6px ${t.accent}`,
                      }}
                    />
                    <span>{t.name}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Creator Profile / Logo Customization */}
          <Grid item xs={12} sx={{ pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <CreatorLogoControl
              creatorLogo={creatorLogo}
              onLogoChange={setCreatorLogo}
              size={36}
              label="Curator Avatar / Logo"
            />
          </Grid>
        </Grid>
      </Box>

      {/* 3 Slots Selection Area in Editor */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[0, 1, 2].map((index) => {
          const anime = selectedAnimeList[index];
          const slotConfig = SLOT_CONFIGS[index];

          return (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: '8px',
                  backgroundColor: anime ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                  border: anime ? `1px solid ${activeTheme.accent}` : '1px dashed rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Clean Slot Header in Editor */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      background: slotConfig.gradient,
                      color: index === 0 ? '#000000' : '#ffffff',
                      fontWeight: 900,
                      fontSize: '11px',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: '4px',
                    }}
                  >
                    <span>{slotConfig.icon}</span>
                    <span>{slotConfig.rank}</span>
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      color: slotConfig.accentColor,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {slotConfig.category}
                  </Typography>
                </Box>

                {anime ? (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ position: 'relative', height: 260, borderRadius: '6px', overflow: 'hidden', mb: 1.5, backgroundColor: '#0a0d18' }}>
                      <img
                        src={anime.base64Image || anime.coverImage?.large || anime.coverImage || anime.image_url}
                        alt={anime.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveAnime(index)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#f43f5e',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.02rem', mb: 0.5, lineHeight: 1.35, minHeight: '2.7em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {anime.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1,
                          py: 0.3,
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        <StarIcon sx={{ fontSize: '13px', color: '#fbbf24' }} />
                        {anime.averageScore ? `${anime.averageScore}%` : 'Recommended'}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {anime.episodes ? `${anime.episodes} Ep` : 'Ongoing'} • {anime.format || 'TV'}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenSearchForSlot(index)}
                      sx={{ mt: 'auto', textTransform: 'none', borderRadius: '6px' }}
                    >
                      Swap Anime
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 280,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                    }}
                    onClick={() => handleOpenSearchForSlot(index)}
                  >
                    <AddCircleOutlineIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Add Slot {index + 1}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Search or click Auto-Generate above
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Modal / Search drawer for slot */}
      {showSearchModal && (
        <Paper
          elevation={5}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '8px',
            backgroundColor: 'rgba(20, 24, 38, 0.95)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Set Anime for Slot #{activeSlotIndex + 1} ({SLOT_CONFIGS[activeSlotIndex]?.category})
            </Typography>
            <Button size="small" variant="outlined" onClick={() => setShowSearchModal(false)}>
              Close
            </Button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
            <Tabs
              value={slotSourceTab}
              onChange={(_, v) => setSlotSourceTab(v)}
              textColor="secondary"
              indicatorColor="secondary"
            >
              <Tab label="AniList API Search" sx={{ textTransform: 'none', fontWeight: 700 }} />
              <Tab label="Custom / Manual Entry" sx={{ textTransform: 'none', fontWeight: 700 }} />
            </Tabs>
          </Box>

          {slotSourceTab === 0 ? (
            <ApiSearch onAnimeSelect={handleSelectAnime} isWeekly={false} />
          ) : (
            <ManualInput
              onAnimeSelect={handleSelectAnime}
              submitLabel={`Set as Slot #${activeSlotIndex + 1} Anime`}
              onCancel={() => setShowSearchModal(false)}
            />
          )}
        </Paper>
      )}

      {/* Export Section & Studio Canvas Stage */}
      {selectedAnimeList.filter(Boolean).length >= 1 && (
        <Box sx={{ mt: 5 }}>
          {/* Studio Canvas Stage */}
          <Box
            className="glass-panel"
            sx={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(10, 14, 26, 0.72)',
              boxShadow: '0 16px 48px -12px rgba(0, 0, 0, 0.65)',
              mb: 4,
            }}
          >
            {/* Stage Header Bar */}
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 1.5,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
              }}
            >
              {/* Left: Status & Dimensions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                  }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#f8fafc', letterSpacing: '0.04em' }}>
                  LIVE WEEKLY SHOWCASE PREVIEW
                </Typography>
                <Chip
                  label="1200 × 675px • 3 Anime Spotlight"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    border: '1px solid rgba(99, 102, 241, 0.28)',
                    height: 22,
                    borderRadius: '4px',
                  }}
                />
              </Box>

              {/* Right: Zoom Controls, Quality Selector & Export Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                {/* Zoom Controls Segment */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    p: 0.3,
                    gap: 0.3,
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => setZoomLevel('fit')}
                    variant={zoomLevel === 'fit' ? 'contained' : 'text'}
                    sx={{
                      minWidth: 'auto',
                      px: 1.2,
                      py: 0.35,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      borderRadius: '4px',
                      textTransform: 'none',
                      backgroundColor: zoomLevel === 'fit' ? 'rgba(99, 102, 241, 0.85)' : 'transparent',
                      color: zoomLevel === 'fit' ? '#ffffff' : '#94a3b8',
                      '&:hover': {
                        backgroundColor: zoomLevel === 'fit' ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                      },
                    }}
                  >
                    Fit
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setZoomLevel(0.75)}
                    variant={zoomLevel === 0.75 ? 'contained' : 'text'}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      py: 0.35,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      borderRadius: '4px',
                      textTransform: 'none',
                      backgroundColor: zoomLevel === 0.75 ? 'rgba(99, 102, 241, 0.85)' : 'transparent',
                      color: zoomLevel === 0.75 ? '#ffffff' : '#94a3b8',
                      '&:hover': {
                        backgroundColor: zoomLevel === 0.75 ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                      },
                    }}
                  >
                    75%
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setZoomLevel(1.0)}
                    variant={zoomLevel === 1.0 ? 'contained' : 'text'}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      py: 0.35,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      borderRadius: '4px',
                      textTransform: 'none',
                      backgroundColor: zoomLevel === 1.0 ? 'rgba(99, 102, 241, 0.85)' : 'transparent',
                      color: zoomLevel === 1.0 ? '#ffffff' : '#94a3b8',
                      '&:hover': {
                        backgroundColor: zoomLevel === 1.0 ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                      },
                    }}
                  >
                    100%
                  </Button>
                  <Box sx={{ width: '1px', height: 16, backgroundColor: 'rgba(255, 255, 255, 0.15)', mx: 0.3 }} />
                  <Button
                    size="small"
                    onClick={handleZoomOut}
                    disabled={effectiveScale <= 0.3}
                    sx={{ minWidth: 26, width: 26, height: 26, p: 0, color: '#94a3b8', borderRadius: '4px' }}
                    title="Zoom Out"
                  >
                    <ZoomOutIcon sx={{ fontSize: 16 }} />
                  </Button>
                  <Typography sx={{ fontSize: '0.70rem', fontWeight: 800, color: '#a5b4fc', minWidth: 32, textAlign: 'center' }}>
                    {Math.round(effectiveScale * 100)}%
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleZoomIn}
                    disabled={effectiveScale >= 1.5}
                    sx={{ minWidth: 26, width: 26, height: 26, p: 0, color: '#94a3b8', borderRadius: '4px' }}
                    title="Zoom In"
                  >
                    <ZoomInIcon sx={{ fontSize: 16 }} />
                  </Button>
                </Box>

                {/* Quality Selector */}
                <FormControl size="small">
                  <Select
                    value={exportQuality}
                    onChange={(e) => setExportQuality(e.target.value)}
                    sx={{
                      height: 32,
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { py: 0.4, px: 1.2, display: 'flex', alignItems: 'center', gap: 0.6 },
                      '& .MuiSelect-icon': { color: '#94a3b8' },
                    }}
                  >
                    <MenuItem value="ultra" sx={{ fontSize: '0.80rem', fontWeight: 700, py: 1 }}>
                      <span>✦ 4K Ultra HD</span>
                    </MenuItem>
                    <MenuItem value="hd" sx={{ fontSize: '0.80rem', fontWeight: 700, py: 1 }}>
                      <span>HD 1080p</span>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Copy Button */}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ContentCopyIcon sx={{ fontSize: 15 }} />}
                  onClick={handleCopyPoster}
                  disabled={isExporting}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.18)',
                    color: '#f8fafc',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: '6px',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#818cf8',
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    },
                  }}
                >
                  Copy
                </Button>

                {/* Export Button */}
                <Button
                  variant="contained"
                  size="small"
                  startIcon={isExporting ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon sx={{ fontSize: 16 }} />}
                  onClick={handleExportPoster}
                  disabled={isExporting}
                  sx={{
                    background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 100%)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    py: 0.5,
                    px: 2,
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)',
                    textTransform: 'none',
                  }}
                >
                  {isExporting ? 'Generating...' : 'Download (.png)'}
                </Button>
              </Box>
            </Box>

            {/* Stage Viewport */}
            <Box
              ref={weeklyStageContainerRef}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflowX: 'auto',
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                backgroundColor: '#070a14',
                minHeight: { xs: 350, md: 480 },
              }}
            >
              {/* Scaled Preview Wrapper */}
              <Box
                sx={{
                  width: `${1200 * effectiveScale}px`,
                  height: `${675 * effectiveScale}px`,
                  position: 'relative',
                  flexShrink: 0,
                  transition: isExporting ? 'none' : 'width 0.18s ease, height 0.18s ease',
                }}
              >
                {/* The 1200x675 export element */}
                <Box
                  id="weekly-anime-poster"
                  ref={weeklyPosterRef}
                  sx={{
                    width: '1200px',
                    minWidth: '1200px',
                    maxWidth: '1200px',
                    flexShrink: 0,
                    height: '675px',
                    minHeight: '675px',
                    maxHeight: '675px',
                    transform: effectiveScale === 1 ? 'none' : `scale(${effectiveScale})`,
                    transformOrigin: 'top left',
                    backgroundColor: activeTheme.baseBg,
                    backgroundImage: 'linear-gradient(145deg, #070914 0%, #0d1228 50%, #060814 100%)',
                    color: '#ffffff',
                    borderRadius: isExporting ? '0px' : '8px',
                    border: activeTheme.border,
                    boxShadow: isExporting ? 'none' : '0 20px 50px rgba(0, 0, 0, 0.8)',
                    position: 'relative',
                    overflow: 'hidden',
                    p: 4.5,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  }}
                >
              {/* Optional Cinematic Backdrop Banner Layer */}
              {weeklyBannerBase64 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `linear-gradient(145deg, rgba(6, 8, 20, 0.42) 0%, rgba(10, 14, 32, 0.54) 50%, rgba(6, 8, 20, 0.70) 100%), url(${weeklyBannerBase64})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.95,
                    filter: 'contrast(1.08) saturate(1.15)',
                    zIndex: 0,
                  }}
                />
              )}

              {/* Header */}
              <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.6,
                        background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                        px: 1.6,
                        py: 0.5,
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)',
                        boxSizing: 'border-box',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>✦</span>
                      <span>WEEKLY SPOTLIGHT</span>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      Official Community Watchlist
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.15, fontSize: '2.4rem' }}>
                    {weekTitle}
                  </Typography>
                </Box>

                {/* Curator Attribution */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    p: 0.8,
                    px: 1.8,
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      fontSize: '0.95rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      flexShrink: 0,
                    }}
                  >
                    {creatorLogo ? (
                      <img
                        src={creatorLogo}
                        alt={curator}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>🎌</span>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      Curated By
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.92rem' }}>
                      {curator}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 3 Editorial Columns */}
              <Box sx={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, my: 'auto' }}>
                {[0, 1, 2].map((slotIdx) => {
                  const item = selectedAnimeList[slotIdx];
                  const slotConfig = SLOT_CONFIGS[slotIdx];
                  const imgSrc = item?.base64Image || item?.coverImage?.large || item?.coverImage || item?.image_url;
                  const itemDesc = item ? (item.description || '').replace(/<[^>]*>/g, '').trim() : '';
                  const cleanDesc = formatWeeklyDescription(itemDesc, 130);

                  return (
                    <Box
                      key={slotIdx}
                      sx={{
                        background: activeTheme.cardGradient,
                        borderRadius: '10px',
                        border: activeTheme.cardBorder,
                        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2.2,
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Priority 1C: Dedicated Header Row for Ranking & Slot Badges (Above Poster Art) */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1.4,
                          minHeight: '28px',
                        }}
                      >
                        {/* Rank Pill (#1, #2, #3) */}
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.6,
                            background: slotConfig.gradient,
                            color: slotIdx === 0 ? '#000000' : '#ffffff',
                            fontWeight: 900,
                            fontSize: '11px',
                            letterSpacing: '0.06em',
                            px: 1.3,
                            py: 0.45,
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span>{slotConfig.icon}</span>
                          <span>{slotConfig.rank}</span>
                        </Box>

                        {/* Editorial Recommendation Category Badge */}
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: slotConfig.badgeBg,
                            border: `1px solid ${slotConfig.badgeBorder}`,
                            color: slotConfig.accentColor,
                            fontWeight: 800,
                            fontSize: '10px',
                            letterSpacing: '0.08em',
                            px: 1.2,
                            py: 0.4,
                            borderRadius: '4px',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                          }}
                        >
                          {slotConfig.category}
                        </Box>
                      </Box>

                      {/* Poster Visual: 100% Unobstructed Art without overlay labels */}
                      <Box
                        sx={{
                          position: 'relative',
                          height: 195,
                          borderRadius: '6px',
                          overflow: 'hidden',
                          mb: 1.5,
                          backgroundColor: '#070a14',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.55)',
                        }}
                      >
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Slot Empty</Typography>
                          </Box>
                        )}
                      </Box>

                      {item ? (
                        <>
                          {/* Anime Title: 2-line clamp with uniform line-height */}
                          <Box sx={{ minHeight: '40px', maxHeight: '40px', mb: 0.8, overflow: 'hidden' }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                lineHeight: 1.25,
                                fontSize: item.title && item.title.length > 28 ? '0.94rem' : '1.02rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                color: '#ffffff',
                                m: 0,
                                textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                              }}
                            >
                              {item.title}
                            </Typography>
                          </Box>

                          {/* Metadata Row: Rating, Episodes, Genre, Studio */}
                          <Box sx={{ display: 'flex', gap: 0.7, mb: 1.2, alignItems: 'center', minHeight: '26px', flexWrap: 'nowrap', overflow: 'hidden' }}>
                            {/* Score */}
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.4,
                                px: 0.9,
                                py: 0.35,
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#ffffff',
                                flexShrink: 0,
                                lineHeight: 1,
                              }}
                            >
                              <StarIcon sx={{ fontSize: '12px', color: '#fbbf24' }} />
                              {item.averageScore ? `${item.averageScore}%` : 'Rec.'}
                            </Box>

                            {/* Episodes */}
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 0.8,
                                py: 0.35,
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                                color: '#94a3b8',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                flexShrink: 0,
                                lineHeight: 1,
                              }}
                            >
                              {item.episodes ? `${item.episodes} Ep` : 'Ongoing'}
                            </Box>

                            {/* Primary Genre */}
                            {item.genres && item.genres[0] && (
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  px: 0.8,
                                  py: 0.35,
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  color: '#cbd5e1',
                                  fontSize: '0.70rem',
                                  fontWeight: 700,
                                  lineHeight: 1,
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}
                              >
                                #{item.genres[0]}
                              </Box>
                            )}

                            {/* Studio */}
                            {item.studios && item.studios[0] && (
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  px: 0.8,
                                  py: 0.35,
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(99, 102, 241, 0.18)',
                                  color: '#a5b4fc',
                                  fontSize: '0.70rem',
                                  fontWeight: 700,
                                  lineHeight: 1,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {item.studios[0]}
                              </Box>
                            )}
                          </Box>

                          {/* Priority 1D: Content-aware Synopsis without descender slicing */}
                          <Typography
                            sx={{
                              color: '#cbd5e1',
                              fontSize: '0.80rem',
                              lineHeight: 1.45,
                              minHeight: '56px',
                              maxHeight: '56px',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {cleanDesc}
                          </Typography>
                        </>
                      ) : (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Select an anime</Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Priority 1A & 1B: Clean Editorial Footer with Brand Logo & Zero Technical Noise */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 2.2,
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {/* Subtle Official Project Watermark (Bottom-Left Corner) */}
                <ProjectWatermark
                  size={26}
                  opacity={0.75}
                  style={{ position: 'static' }}
                />

                {/* Editorial Subtitle */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{
                      color: '#94a3b8',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Weekly Recommendation Spotlight
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
    )}

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notification.severity} sx={{ width: '100%', borderRadius: '6px' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WeeklyRecommendations;
