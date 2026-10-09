import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ApiSearch from './ApiSearch';
import html2canvas from 'html2canvas';

const DEFAULT_SLOT_LABELS = [
  '👑 #1 MUST WATCH',
  '🔥 #2 BINGE WORTHY',
  '✨ #3 HIDDEN GEM'
];

const WEEKLY_THEMES = {
  midnight: {
    name: 'Midnight Neon',
    bg: 'linear-gradient(135deg, #090b16 0%, #15162c 50%, #0d0f1e 100%)',
    cardBg: 'rgba(23, 26, 49, 0.75)',
    border: '1px solid rgba(99, 102, 241, 0.35)',
    accent: '#6366f1',
    glow: '0 0 50px rgba(99, 102, 241, 0.25)',
  },
  crimson: {
    name: 'Crimson Abyss',
    bg: 'linear-gradient(135deg, #14070a 0%, #260f16 50%, #13060a 100%)',
    cardBg: 'rgba(40, 15, 23, 0.8)',
    border: '1px solid rgba(244, 63, 94, 0.4)',
    accent: '#f43f5e',
    glow: '0 0 50px rgba(244, 63, 94, 0.25)',
  },
  cyber: {
    name: 'Cyberpunk Teal',
    bg: 'linear-gradient(135deg, #05161d 0%, #0c2b36 50%, #061720 100%)',
    cardBg: 'rgba(12, 43, 54, 0.8)',
    border: '1px solid rgba(6, 182, 212, 0.35)',
    accent: '#06b6d4',
    glow: '0 0 50px rgba(6, 182, 212, 0.25)',
  }
};

const WeeklyRecommendations = () => {
  const [selectedAnimeList, setSelectedAnimeList] = useState([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [weekTitle, setWeekTitle] = useState('Top 3 Anime of the Week');
  const [curator, setCurator] = useState('@Rana0Codes');
  const [themeKey, setThemeKey] = useState('midnight');
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [showSearchModal, setShowSearchModal] = useState(false);

  const weeklyPosterRef = useRef(null);
  const activeTheme = WEEKLY_THEMES[themeKey];

  const handleSelectAnime = (anime) => {
    const updated = [...selectedAnimeList];
    updated[activeSlotIndex] = anime;
    setSelectedAnimeList(updated);
    setShowSearchModal(false);
  };

  const handleRemoveAnime = (index) => {
    const updated = selectedAnimeList.filter((_, i) => i !== index);
    setSelectedAnimeList(updated);
  };

  const handleOpenSearchForSlot = (index) => {
    setActiveSlotIndex(index);
    setShowSearchModal(true);
  };

  const handleExportPoster = async () => {
    if (!weeklyPosterRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(weeklyPosterRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        backgroundColor: null,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `weekly-anime-recommendations-${Date.now()}.png`;
      link.href = image;
      link.click();

      setNotification({
        open: true,
        message: 'Weekly 1920x1080 poster exported successfully!',
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

  return (
    <Box sx={{ width: '100%', maxWidth: 1250, mx: 'auto', p: { xs: 1, md: 2 } }}>
      {/* Top Banner / Headline */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(90deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Weekly Anime Showcase Builder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pick up to 3 anime for your weekly curation and export an ultra HD 1920x1080 banner ready for Twitter, Discord, or Reddit.
        </Typography>
      </Box>

      {/* Settings Bar */}
      <Paper
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              fullWidth
              label="Weekly Headline"
              value={weekTitle}
              onChange={(e) => setWeekTitle(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              fullWidth
              label="Curator Tag"
              value={curator}
              onChange={(e) => setCurator(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Poster Theme</InputLabel>
              <Select
                value={themeKey}
                label="Poster Theme"
                onChange={(e) => setThemeKey(e.target.value)}
              >
                {Object.entries(WEEKLY_THEMES).map(([k, t]) => (
                  <MenuItem key={k} value={k}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* 3 Slots Selection Area */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[0, 1, 2].map((index) => {
          const anime = selectedAnimeList[index];
          const label = DEFAULT_SLOT_LABELS[index];

          return (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor: anime ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                  border: anime ? `1px solid ${activeTheme.accent}` : '1px dashed rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                }}
              >
                <Chip
                  label={label}
                  size="small"
                  sx={{
                    mb: 1.5,
                    alignSelf: 'flex-start',
                    fontWeight: 700,
                    backgroundColor: anime ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                  }}
                />

                {anime ? (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ position: 'relative', height: 260, borderRadius: 2, overflow: 'hidden', mb: 1.5 }}>
                      <img
                        src={anime.coverImage?.large || anime.coverImage || anime.image_url}
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

                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', mb: 0.5, lineHeight: 1.3 }}>
                      {anime.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        icon={<StarIcon sx={{ fontSize: '14px !important', color: '#fbbf24' }} />}
                        label={anime.averageScore ? `${anime.averageScore}%` : 'N/A'}
                        size="small"
                        sx={{ height: 22, fontSize: '0.75rem' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {anime.episodes ? `${anime.episodes} Ep` : 'Ongoing'} • {anime.format || 'TV'}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenSearchForSlot(index)}
                      sx={{ mt: 'auto', textTransform: 'none', borderRadius: 2 }}
                    >
                      Change Anime
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
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                    }}
                    onClick={() => handleOpenSearchForSlot(index)}
                  >
                    <AddCircleOutlineIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Add Slot {index + 1}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click to search and select anime
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
            borderRadius: 3,
            backgroundColor: 'rgba(20, 24, 38, 0.95)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Search Anime for Slot #{activeSlotIndex + 1} ({DEFAULT_SLOT_LABELS[activeSlotIndex]})
            </Typography>
            <Button size="small" variant="outlined" onClick={() => setShowSearchModal(false)}>
              Close
            </Button>
          </Box>
          <ApiSearch onAnimeSelect={handleSelectAnime} isWeekly={false} />
        </Paper>
      )}

      {/* Export Section */}
      {selectedAnimeList.filter(Boolean).length >= 1 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Live 1920x1080 Showcase Poster
            </Typography>
            <Button
              variant="contained"
              startIcon={isExporting ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
              onClick={handleExportPoster}
              disabled={isExporting}
              sx={{
                background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 100%)',
                fontWeight: 700,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              {isExporting ? 'Generating HD Poster...' : 'Download 1080p Poster (.png)'}
            </Button>
          </Box>

          {/* Poster Wrapper with horizontal scroll */}
          <Box
            sx={{
              overflowX: 'auto',
              p: 2,
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: '1px dashed rgba(255,255,255,0.15)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* The 1920x1080 export element */}
            <Box
              ref={weeklyPosterRef}
              sx={{
                width: '1200px',
                minHeight: '675px',
                background: activeTheme.bg,
                color: '#ffffff',
                borderRadius: '24px',
                border: activeTheme.border,
                boxShadow: activeTheme.glow,
                position: 'relative',
                overflow: 'hidden',
                p: 5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Chip
                      label="WEEKLY SPOTLIGHT"
                      size="small"
                      sx={{
                        background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Official Community Watchlist
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    {weekTitle}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                    Curated By
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: activeTheme.accent }}>
                    {curator}
                  </Typography>
                </Box>
              </Box>

              {/* 3 Columns */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, my: 'auto' }}>
                {[0, 1, 2].map((slotIdx) => {
                  const item = selectedAnimeList[slotIdx];
                  const slotLabel = DEFAULT_SLOT_LABELS[slotIdx];

                  return (
                    <Box
                      key={slotIdx}
                      sx={{
                        background: activeTheme.cardBg,
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        backdropFilter: 'blur(12px)',
                      }}
                    >
                      <Box sx={{ position: 'relative', height: 260, borderRadius: '12px', overflow: 'hidden', mb: 2 }}>
                        {item ? (
                          <img
                            src={item.coverImage?.large || item.coverImage || item.image_url}
                            alt={item.title}
                            crossOrigin="anonymous"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Slot Empty</Typography>
                          </Box>
                        )}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            px: 1.2,
                            py: 0.4,
                            borderRadius: '8px',
                            background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.7rem' }}>
                            {slotLabel}
                          </Typography>
                        </Box>
                      </Box>

                      {item ? (
                        <>
                          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 1, minHeight: '2.4em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                            <Chip
                              icon={<StarIcon sx={{ fontSize: '13px !important', color: '#fbbf24' }} />}
                              label={item.averageScore ? `${item.averageScore}%` : 'Recommended'}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.1)' }}
                            />
                            <Typography variant="caption" sx={{ color: '#94a3b8', alignSelf: 'center' }}>
                              {item.episodes ? `${item.episodes} Ep` : 'Ongoing'}
                            </Typography>
                          </Box>
                          <Typography sx={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.description?.replace(/<[^>]*>/g, '') || 'An outstanding anime recommendation for this week.'}
                          </Typography>
                        </>
                      ) : (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Select an anime</Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Poster Footer */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  🎌 Generated with Anime Recommendation Generator
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  AniList API • 1920x1080 Ultra HD Quality
                </Typography>
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
        <Alert severity={notification.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WeeklyRecommendations;
