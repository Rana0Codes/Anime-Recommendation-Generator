import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Rating,
  Chip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PaletteIcon from '@mui/icons-material/Palette';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Crop169Icon from '@mui/icons-material/Crop169';
import StayCurrentPortraitIcon from '@mui/icons-material/StayCurrentPortrait';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { convertUrlToBase64, createBlurredImageBase64 } from '../services/imageUtils';
import { downloadNodeAsPng, copyNodeToClipboard } from '../services/exportService';
import ProjectWatermark from './ProjectWatermark';
import CreatorLogoControl from './CreatorLogoControl';
import { getCreatorSettings, saveCreatorHandle } from '../services/creatorStorage';

const THEMES = {
  cyberpunk: {
    name: 'Cyberpunk Neon',
    baseBg: '#060814',
    cardGradient: 'linear-gradient(145deg, rgba(16, 22, 50, 0.78) 0%, rgba(8, 12, 28, 0.88) 100%)',
    border: '1px solid rgba(0, 242, 254, 0.35)',
    accentGradient: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
    badgeBg: 'rgba(0, 242, 254, 0.20)',
    badgeBorder: 'rgba(0, 242, 254, 0.45)',
    primaryColor: '#00f2fe',
    textColor: '#ffffff',
    subtextColor: '#94a3b8',
    glow: '0 20px 50px rgba(0, 0, 0, 0.8)',
  },
  dark_minimal: {
    name: 'Dark Onyx',
    baseBg: '#080910',
    cardGradient: 'linear-gradient(145deg, rgba(22, 26, 42, 0.78) 0%, rgba(10, 13, 24, 0.88) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    accentGradient: 'linear-gradient(90deg, #66fcf1 0%, #45a29e 100%)',
    badgeBg: 'rgba(102, 252, 241, 0.20)',
    badgeBorder: 'rgba(102, 252, 241, 0.45)',
    primaryColor: '#66fcf1',
    textColor: '#ffffff',
    subtextColor: '#cbd5e1',
    glow: '0 20px 50px rgba(0, 0, 0, 0.8)',
  },
  sakura: {
    name: 'Sakura Night',
    baseBg: '#100714',
    cardGradient: 'linear-gradient(145deg, rgba(38, 16, 42, 0.78) 0%, rgba(18, 8, 22, 0.88) 100%)',
    border: '1px solid rgba(255, 117, 140, 0.35)',
    accentGradient: 'linear-gradient(90deg, #ff758c 0%, #ff7eb3 100%)',
    badgeBg: 'rgba(255, 117, 140, 0.22)',
    badgeBorder: 'rgba(255, 117, 140, 0.45)',
    primaryColor: '#ff758c',
    textColor: '#ffffff',
    subtextColor: '#e2e8f0',
    glow: '0 20px 50px rgba(0, 0, 0, 0.8)',
  },
  sunset: {
    name: 'Sunset Synthwave',
    baseBg: '#0e0518',
    cardGradient: 'linear-gradient(145deg, rgba(38, 14, 52, 0.78) 0%, rgba(18, 6, 28, 0.88) 100%)',
    border: '1px solid rgba(249, 115, 22, 0.35)',
    accentGradient: 'linear-gradient(90deg, #f97316 0%, #e11d48 100%)',
    badgeBg: 'rgba(249, 115, 22, 0.22)',
    badgeBorder: 'rgba(249, 115, 22, 0.45)',
    primaryColor: '#f97316',
    textColor: '#ffffff',
    subtextColor: '#cbd5e1',
    glow: '0 20px 50px rgba(0, 0, 0, 0.8)',
  }
};

const TemplateCard = ({ anime, onBack }) => {
  const initialCreator = getCreatorSettings();
  const [themeKey, setThemeKey] = useState('cyberpunk');
  const [aspectRatio, setAspectRatio] = useState('16-9');
  const [userNote, setUserNote] = useState('A phenomenal anime with breathtaking animation and an unforgettable storyline!');
  const [recommendedBy, setRecommendedBy] = useState(initialCreator.handle || '@Rana0Codes');
  const [creatorLogo, setCreatorLogo] = useState(initialCreator.logo || '');
  const [customRating, setCustomRating] = useState(anime.averageScore ? (anime.averageScore / 20) : 4.5);
  const [isExporting, setIsExporting] = useState(false);
  const [isConvertingImage, setIsConvertingImage] = useState(true);
  const [base64Cover, setBase64Cover] = useState('');
  const [base64Banner, setBase64Banner] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [zoomLevel, setZoomLevel] = useState('fit');
  const [exportQuality, setExportQuality] = useState('ultra');
  const stageContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  const posterRef = useRef(null);
  const activeTheme = THEMES[themeKey];

  const getContainerDimensions = () => {
    if (aspectRatio === '16-9') return { width: 1200, height: 675 };
    if (aspectRatio === '9-16') return { width: 675, height: 1200 };
    return { width: 900, height: 900 };
  };

  const dims = getContainerDimensions();

  // Measure stage container width for responsive auto-fit zoom
  useEffect(() => {
    const updateWidth = () => {
      if (stageContainerRef.current) {
        const w = stageContainerRef.current.clientWidth - 48;
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
    ? Math.min(1, Math.max(0.25, containerWidth / dims.width))
    : Number(zoomLevel);

  const handleZoomIn = () => {
    const current = typeof effectiveScale === 'number' ? effectiveScale : 1;
    setZoomLevel(Math.min(1.5, Math.round((current + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    const current = typeof effectiveScale === 'number' ? effectiveScale : 1;
    setZoomLevel(Math.max(0.3, Math.round((current - 0.15) * 100) / 100));
  };

  // Sync creator settings if updated from another component/tab
  useEffect(() => {
    const handleSettingsSync = () => {
      const settings = getCreatorSettings();
      setRecommendedBy(settings.handle || '@Rana0Codes');
      setCreatorLogo(settings.logo || '');
    };
    window.addEventListener('arg_creator_settings_updated', handleSettingsSync);
    return () => window.removeEventListener('arg_creator_settings_updated', handleSettingsSync);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const convertImages = async () => {
      setIsConvertingImage(true);
      const rawCover = anime.coverImage?.extraLarge || anime.coverImage?.large || anime.coverImage || anime.image_url;
      const rawBanner = anime.bannerImage || anime.background_image || rawCover;

      try {
        const [convertedCover, convertedBanner] = await Promise.all([
          convertUrlToBase64(rawCover),
          createBlurredImageBase64(rawBanner, 8, dims.width, dims.height)
        ]);
        if (isMounted) {
          setBase64Cover(convertedCover || rawCover);
          setBase64Banner(convertedBanner || rawBanner);
          setIsConvertingImage(false);
        }
      } catch (err) {
        console.warn('Image preload error:', err);
        if (isMounted) {
          setBase64Cover(rawCover);
          setBase64Banner(rawBanner);
          setIsConvertingImage(false);
        }
      }
    };

    convertImages();
    return () => { isMounted = false; };
  }, [anime, aspectRatio, dims.width, dims.height]);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      // Allow DOM to unscale before capturing
      await new Promise((resolve) => setTimeout(resolve, 80));
      const safeTitle = (anime.title || 'anime').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/-+$/, '') || 'anime';
      await downloadNodeAsPng(
        posterRef.current,
        `${safeTitle}-recommendation-${aspectRatio}.png`,
        { width: dims.width, height: dims.height, exportQuality }
      );

      setNotification({
        open: true,
        message: `High-resolution ${exportQuality === 'ultra' ? '4K Ultra HD' : 'HD'} poster downloaded with artwork included!`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Export error:', err);
      setNotification({
        open: true,
        message: 'Failed to export image. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      // Allow DOM to unscale before capturing
      await new Promise((resolve) => setTimeout(resolve, 80));
      const result = await copyNodeToClipboard(
        posterRef.current,
        { width: dims.width, height: dims.height, exportQuality }
      );
      setNotification({
        open: true,
        message: result.method === 'clipboard' ? 'Image copied to clipboard!' : 'Image downloaded (clipboard permission not granted)',
        severity: result.method === 'clipboard' ? 'success' : 'info',
      });
    } catch (err) {
      console.error('Copy error:', err);
      setNotification({
        open: true,
        message: 'Failed to copy image.',
        severity: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const titleText = anime.title || 'Untitled Anime';
  const rawDescription = (anime.description || 'An extraordinary journey with incredible characters and a deeply moving storyline.')
    .replace(/<[^>]*>/g, '').trim();

  // Smart sentence-aware synopsis formatter
  const formatSynopsis = (text, maxLength = 320) => {
    if (!text) return 'An extraordinary story with unforgettable characters and breathtaking animation.';
    const clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLength) return clean;

    // Try to find a sentence ending before maxLength (at least 140 chars)
    const sentenceEndRegex = /[.!?](?=\s|$)/g;
    let lastValidSentenceIndex = -1;
    let match;
    while ((match = sentenceEndRegex.exec(clean)) !== null) {
      if (match.index + 1 <= maxLength && match.index + 1 >= 140) {
        lastValidSentenceIndex = match.index + 1;
      } else if (match.index + 1 > maxLength) {
        break;
      }
    }

    if (lastValidSentenceIndex !== -1) {
      return clean.slice(0, lastValidSentenceIndex).trim();
    }

    // Fallback to word boundary
    const sub = clean.slice(0, maxLength);
    const lastSpace = sub.lastIndexOf(' ');
    return (lastSpace > 0 ? sub.slice(0, lastSpace) : sub).trim() + '...';
  };

  const cleanDescription = formatSynopsis(rawDescription, aspectRatio === '16-9' ? 320 : 190);

  // Metadata strings
  const releaseYearStr = anime.seasonYear ? `${anime.season || ''} ${anime.seasonYear}`.trim() : (anime.year ? `${anime.year}` : '2021');
  const formatStr = (anime.format || anime.type || 'TV SERIES').toUpperCase();
  const studioStr = (anime.studios && anime.studios[0]) ? anime.studios[0] : (anime.studio || 'ANIMATION STUDIO');
  const episodesStr = anime.episodes ? `${anime.episodes} Ep` : 'TBA';
  const statusStr = anime.status || 'Finished';

  return (
    <Box sx={{ width: '100%', maxWidth: 1250, mx: 'auto', p: { xs: 1, md: 3 } }}>
      {/* Top Action Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: { xs: 1.6, sm: 2 },
          borderRadius: '8px',
          backgroundColor: 'rgba(15, 20, 38, 0.78)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, minWidth: 0, flex: 1 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
            onClick={onBack}
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.84rem',
              borderColor: 'rgba(255, 255, 255, 0.18)',
              color: '#cbd5e1',
              px: 2,
              py: 0.85,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              '&:hover': {
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: '#ffffff',
                transform: 'translateX(-2px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Back to Search
          </Button>

          <Box sx={{ minWidth: 0, overflow: 'hidden', pr: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: '#f8fafc',
                lineHeight: 1.25,
                fontSize: { xs: '0.88rem', sm: '1.02rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={titleText}
            >
              {titleText}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                fontSize: '0.74rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {formatStr} • {releaseYearStr} • {episodesStr} • {studioStr}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.2} sx={{ flexShrink: 0, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={isExporting ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon sx={{ fontSize: 18 }} />}
            onClick={handleDownload}
            disabled={isExporting || isConvertingImage}
            className="btn-shimmer"
            sx={{
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              fontWeight: 800,
              fontSize: '0.88rem',
              textTransform: 'none',
              borderRadius: '6px',
              px: { xs: 2, sm: 3 },
              py: 0.85,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
                transform: 'translateY(-1.5px)',
              },
            }}
          >
            {isExporting ? 'Generating HD Image...' : isConvertingImage ? 'Loading Art...' : 'Download Template (.png)'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon sx={{ fontSize: 17 }} />}
            onClick={handleCopy}
            disabled={isExporting || isConvertingImage}
            sx={{
              textTransform: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.86rem',
              borderColor: 'rgba(255, 255, 255, 0.18)',
              color: '#cbd5e1',
              px: 2,
              py: 0.85,
              whiteSpace: 'nowrap',
              display: { xs: 'none', sm: 'inline-flex' },
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.35)',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                transform: 'translateY(-1.5px)',
              },
            }}
          >
            Copy Image
          </Button>
        </Stack>
      </Box>

      {/* Studio Customization Dock: High-End Editorial Control Center */}
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
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {/* Tier 1: Canvas Aspect Ratio & Studio Theme (Spacious, Un-Cramped) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.45fr 1fr' },
            gap: 2.5,
            alignItems: 'center',
          }}
        >
          {/* Format / Ratio Pill Selector - Dedicated Wide Space */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                mb: 1,
                color: '#cbd5e1',
                fontWeight: 800,
                fontSize: '0.74rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <AspectRatioIcon sx={{ fontSize: 16, color: '#818cf8' }} />
              Canvas Format & Ratio
            </Typography>

            <ToggleButtonGroup
              value={aspectRatio}
              exclusive
              onChange={(_, val) => val && setAspectRatio(val)}
              size="medium"
              fullWidth
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                borderRadius: '6px',
                p: 0.5,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '4px !important',
                  fontWeight: 800,
                  fontSize: { xs: '0.76rem', sm: '0.84rem' },
                  color: '#94a3b8',
                  py: 1,
                  px: { xs: 1, sm: 2 },
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  letterSpacing: '0.01em',
                  transition: 'all 0.22s ease',
                  '&.Mui-selected': {
                    background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
                  },
                  '&:hover:not(.Mui-selected)': {
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: '#f8fafc',
                  },
                },
              }}
            >
              <ToggleButton value="16-9">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Crop169Icon sx={{ fontSize: 18 }} />
                  <span>16:9 Landscape</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="9-16">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <StayCurrentPortraitIcon sx={{ fontSize: 17 }} />
                  <span>9:16 Story</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="1-1">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CropSquareIcon sx={{ fontSize: 18 }} />
                  <span>1:1 Square</span>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Theme Dropdown with Color Swatches - Clean Flat Select */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                mb: 1,
                color: '#cbd5e1',
                fontWeight: 800,
                fontSize: '0.74rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <PaletteIcon sx={{ fontSize: 16, color: '#ec4899' }} />
              Studio Color Theme
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
                  fontSize: '0.88rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&:hover': {
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                  },
                  '&.Mui-focused': {
                    border: '1px solid #6366f1',
                    boxShadow: '0 0 14px rgba(99, 102, 241, 0.35)',
                  },
                  '& .MuiSelect-select': {
                    py: 1.15,
                    px: 1.8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                  },
                  '& .MuiSelect-icon': {
                    color: '#94a3b8',
                  },
                }}
              >
                {Object.entries(THEMES).map(([key, t]) => (
                  <MenuItem
                    key={key}
                    value={key}
                    sx={{
                      py: 1.2,
                      px: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      fontWeight: 700,
                      fontSize: '0.86rem',
                    }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: t.primaryColor,
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: `0 0 8px ${t.primaryColor}`,
                        flexShrink: 0,
                      }}
                    />
                    <span>{t.name}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Tier 2: Curator Identity, Editorial Score & Note */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.25fr 0.95fr 1.5fr' },
            gap: 2.2,
            pt: 2.2,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            alignItems: 'stretch',
          }}
        >
          {/* Card 1: Curator Identity & Logo */}
          <Box
            sx={{
              p: 1.8,
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <CreatorLogoControl
              creatorLogo={creatorLogo}
              onLogoChange={setCreatorLogo}
              size={36}
              label="Curator Avatar / Logo"
            />

            <Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 0.5, fontSize: '0.72rem' }}>
                Curator Handle
              </Typography>
              <TextField
                size="small"
                value={recommendedBy}
                onChange={(e) => {
                  setRecommendedBy(e.target.value);
                  saveCreatorHandle(e.target.value);
                }}
                placeholder="@YourHandle"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    color: '#f8fafc',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                    '&:hover fieldset': { borderColor: '#818cf8' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Card 2: Curator Rating */}
          <Box
            sx={{
              p: 1.8,
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 1.2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                Your Score
              </Typography>
              <Chip
                label={`${Number(customRating).toFixed(1)} / 5.0`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.35)',
                  color: '#fbbf24',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  height: 22,
                  borderRadius: '4px',
                }}
              />
            </Box>

            <Box sx={{ py: 0.5 }}>
              <Rating
                value={customRating}
                precision={0.5}
                onChange={(_, newVal) => newVal && setCustomRating(newVal)}
                emptyIcon={<StarIcon style={{ opacity: 0.25 }} fontSize="inherit" />}
                sx={{
                  fontSize: 26,
                  '& .MuiRating-iconFilled': {
                    color: '#fbbf24',
                  },
                }}
              />
            </Box>

            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
              Click stars to calibrate score displayed on export poster
            </Typography>
          </Box>

          {/* Card 3: Reviewer Note */}
          <Box
            sx={{
              p: 1.8,
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
            }}
          >
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>
              Why You Should Watch This (Curator Note)
            </Typography>
            <TextField
              size="small"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Write why someone should watch this anime..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: '#f8fafc',
                  fontSize: '0.84rem',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                  '&:hover fieldset': { borderColor: '#818cf8' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
              }}
            />
          </Box>
        </Box>
      </Box>

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
          {/* Left: Status & Format Info */}
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
              LIVE STUDIO PREVIEW
            </Typography>
            <Chip
              label={`${dims.width} × ${dims.height}px • ${aspectRatio === '16-9' ? '16:9 Banner' : aspectRatio === '9-16' ? '9:16 Story' : '1:1 Square'}`}
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
              onClick={handleCopy}
              disabled={isExporting || isConvertingImage}
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
              onClick={handleDownload}
              disabled={isExporting || isConvertingImage}
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
              {isExporting ? 'Exporting...' : 'Export Poster'}
            </Button>
          </Box>
        </Box>

        {/* Stage Viewport */}
        <Box
          ref={stageContainerRef}
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
          {/* Proportional Scaled Stage Wrapper */}
          <Box
            sx={{
              width: `${dims.width * effectiveScale}px`,
              height: `${dims.height * effectiveScale}px`,
              position: 'relative',
              flexShrink: 0,
              transition: isExporting ? 'none' : 'width 0.18s ease, height 0.18s ease',
            }}
          >
            {/* THE EXPORTABLE ELEMENT */}
            <Box
              id="anime-recommendation-card"
              ref={posterRef}
              sx={{
                width: `${dims.width}px`,
                minWidth: `${dims.width}px`,
                maxWidth: `${dims.width}px`,
                flexShrink: 0,
                height: `${dims.height}px`,
                minHeight: `${dims.height}px`,
                maxHeight: `${dims.height}px`,
                transform: effectiveScale === 1 ? 'none' : `scale(${effectiveScale})`,
                transformOrigin: 'top left',
                backgroundColor: activeTheme.baseBg,
                color: activeTheme.textColor,
                borderRadius: isExporting ? '0px' : '8px',
                border: activeTheme.border,
                boxShadow: isExporting ? 'none' : activeTheme.glow,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: aspectRatio === '9-16' ? 'column' : 'row',
                p: 4,
                gap: 3.5,
                boxSizing: 'border-box',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              {/* Background Graphic Layer: Restored Full-Width Visibility with Optical Depth of Field */}
              {base64Banner && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `linear-gradient(135deg, rgba(6, 8, 18, 0.32) 0%, rgba(6, 8, 18, 0.45) 50%, rgba(6, 8, 18, 0.65) 100%), url(${base64Banner})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 20%',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.98,
                    filter: 'contrast(1.08) saturate(1.15)',
                    zIndex: 0,
                  }}
                />
              )}

              {/* Left Column: High-Res Anime Cover & Stats */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  flexShrink: 0,
                  width: aspectRatio === '9-16' ? '100%' : aspectRatio === '1-1' ? '290px' : '330px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: aspectRatio === '9-16' ? 'center' : 'stretch',
                  justifyContent: 'flex-start',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: aspectRatio === '9-16' ? '280px' : '100%',
                    height: aspectRatio === '9-16' ? '370px' : aspectRatio === '1-1' ? '380px' : '460px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    position: 'relative',
                    backgroundColor: '#0a0d18',
                  }}
                >
                {base64Cover ? (
                  <img
                    src={base64Cover}
                    alt={titleText}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={36} />
                  </Box>
                )}

                {/* Score badge floating over cover */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: 'rgba(5, 7, 15, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '4px',
                    px: 1.4,
                    py: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <StarIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.85rem' }}>
                    {anime.averageScore ? `${anime.averageScore}%` : `${customRating * 20}%`}
                  </Typography>
                </Box>
              </Box>

              {/* Quick Meta Stats below cover */}
              <Box
                sx={{
                  mt: 2,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  p: 1.6,
                  borderRadius: '8px',
                  background: 'linear-gradient(145deg, rgba(20, 25, 48, 0.90) 0%, rgba(10, 13, 26, 0.96) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                  boxSizing: 'border-box',
                }}
              >
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem', fontWeight: 600, mb: 0.3, lineHeight: 1 }}>
                    Episodes
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.92rem', lineHeight: 1.2 }}>
                    {episodesStr}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255, 255, 255, 0.18)', borderRight: '1px solid rgba(255, 255, 255, 0.18)', px: 0.5 }}>
                  <Typography sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem', fontWeight: 600, mb: 0.3, lineHeight: 1 }}>
                    Status
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.92rem', lineHeight: 1.2 }}>
                    {statusStr}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem', fontWeight: 600, mb: 0.3, lineHeight: 1 }}>
                    Format
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.92rem', lineHeight: 1.2 }}>
                    {formatStr}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right Column: Premium Frosted Glassmorphism Panel */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'linear-gradient(140deg, rgba(16, 22, 48, 0.70) 0%, rgba(8, 12, 28, 0.82) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '10px',
                p: 3.8,
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.65)',
                boxSizing: 'border-box',
              }}
            >
              <Box>
                {/* Top Category Badge & Type/Year */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.6, flexWrap: 'wrap', gap: 1 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.7,
                      background: activeTheme.accentGradient,
                      color: '#05070e',
                      fontWeight: 900,
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      px: 1.6,
                      py: 0.55,
                      borderRadius: '4px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                      boxSizing: 'border-box',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.2,
                    }}
                  >
                    <span>✦</span>
                    <span>ANIME SPOTLIGHT</span>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formatStr && (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: 'rgba(255, 255, 255, 0.12)',
                          color: '#f1f5f9',
                          fontWeight: 700,
                          fontSize: '11px',
                          letterSpacing: '0.05em',
                          px: 1.4,
                          py: 0.5,
                          borderRadius: '4px',
                          boxSizing: 'border-box',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.2,
                        }}
                      >
                        {formatStr}
                      </Box>
                    )}
                    {releaseYearStr && (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: 'rgba(255, 255, 255, 0.12)',
                          color: '#f1f5f9',
                          fontWeight: 700,
                          fontSize: '11px',
                          letterSpacing: '0.05em',
                          px: 1.4,
                          py: 0.5,
                          borderRadius: '4px',
                          boxSizing: 'border-box',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.2,
                        }}
                      >
                        {releaseYearStr.toUpperCase()}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Anime Title: Scaled & Clamped to preserve template proportions */}
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    mb: 1.4,
                    fontSize: titleText.length > 70 ? '1.45rem' : titleText.length > 35 ? '1.85rem' : titleText.length > 20 ? '2.15rem' : '2.5rem',
                    color: '#ffffff',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    display: '-webkit-box',
                    WebkitLineClamp: aspectRatio === '9-16' ? 3 : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={titleText}
                >
                  {titleText}
                </Typography>

                {/* Studio & Metadata Highlights Bar */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    gap: 1.4,
                    mb: 1.8,
                    pb: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.6 }}>
                    <Typography component="span" sx={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      Studio
                    </Typography>
                    <Typography component="span" sx={{ color: activeTheme.primaryColor, fontSize: '0.86rem', fontWeight: 800 }}>
                      {studioStr}
                    </Typography>
                  </Box>

                  <Typography component="span" sx={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.85rem', userSelect: 'none' }}>
                    •
                  </Typography>

                  <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.6 }}>
                    <Typography component="span" sx={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      Episodes
                    </Typography>
                    <Typography component="span" sx={{ color: '#f8fafc', fontSize: '0.86rem', fontWeight: 700 }}>
                      {episodesStr}
                    </Typography>
                  </Box>

                  <Typography component="span" sx={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.85rem', userSelect: 'none' }}>
                    •
                  </Typography>

                  <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.6 }}>
                    <Typography component="span" sx={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      Status
                    </Typography>
                    <Typography component="span" sx={{ color: '#f8fafc', fontSize: '0.86rem', fontWeight: 700 }}>
                      {statusStr}
                    </Typography>
                  </Box>
                </Box>

                {/* Genre Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 1.8 }}>
                  {(anime.genres || []).slice(0, 5).map((genre) => (
                    <Box
                      key={genre}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: activeTheme.badgeBg,
                        color: activeTheme.primaryColor,
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: 1,
                        px: 1.3,
                        py: 0.6,
                        borderRadius: '4px',
                        border: `1px solid ${activeTheme.badgeBorder || 'rgba(255, 255, 255, 0.15)'}`,
                        boxSizing: 'border-box',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      #{genre}
                    </Box>
                  ))}
                </Box>

                {/* High-Contrast Description */}
                <Typography
                  sx={{
                    color: '#cbd5e1',
                    fontSize: '0.94rem',
                    lineHeight: 1.62,
                    mb: 2.2,
                    textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                  }}
                >
                  {cleanDescription}
                </Typography>
              </Box>

              {/* Bottom: Reviewer Note & Curator Signature */}
              <Box>
                {userNote && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      background: 'rgba(5, 8, 20, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderLeft: `4px solid ${activeTheme.primaryColor}`,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                      mb: 2,
                      boxSizing: 'border-box',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: activeTheme.primaryColor,
                        fontWeight: 900,
                        display: 'block',
                        mb: 0.4,
                        fontSize: '0.72rem',
                      }}
                    >
                      ✦ WHY YOU SHOULD WATCH THIS:
                    </Typography>
                    <Typography sx={{ fontStyle: 'italic', fontSize: '0.94rem', lineHeight: 1.45, color: '#f8fafc' }}>
                      "{userNote}"
                    </Typography>
                  </Box>
                )}

                {/* Footer Signature */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 1.6,
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  {/* Left: Creator Attribution */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: activeTheme.accentGradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      {creatorLogo ? (
                        <img
                          src={creatorLogo}
                          alt="Creator Logo"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <Typography sx={{ fontSize: '1.05rem', lineHeight: 1 }}>🎌</Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: activeTheme.subtextColor, display: 'block', fontSize: '0.7rem' }}>
                        Curated Recommendation
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: activeTheme.textColor, fontSize: '0.9rem' }}>
                        {recommendedBy}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right: Community Rating */}
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: activeTheme.subtextColor, display: 'block', fontSize: '0.7rem', mb: 0.3 }}>
                      Community Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          sx={{
                            fontSize: 16,
                            color: i < Math.floor(customRating) ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Subtle Bottom-Left Official Project Watermark */}
            <ProjectWatermark
              size={aspectRatio === '9-16' ? 24 : 28}
              insetBottom={aspectRatio === '9-16' ? 14 : 18}
              insetLeft={aspectRatio === '9-16' ? 18 : 22}
              opacity={0.75}
            />
          </Box>
        </Box>
        </Box>
      </Box>

      {/* Notifications */}
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

export default TemplateCard;
