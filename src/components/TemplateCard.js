import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Rating
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PaletteIcon from '@mui/icons-material/Palette';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import html2canvas from 'html2canvas';

const THEMES = {
  cyberpunk: {
    name: 'Cyberpunk Neon',
    bg: 'linear-gradient(135deg, #090a15 0%, #161233 50%, #0a0d24 100%)',
    cardBg: 'rgba(18, 20, 44, 0.75)',
    border: '1px solid rgba(99, 102, 241, 0.4)',
    accentGradient: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 50%, #f093fb 100%)',
    primaryColor: '#00f2fe',
    secondaryColor: '#f093fb',
    textColor: '#ffffff',
    subtextColor: '#94a3b8',
    glow: '0 0 40px rgba(79, 172, 254, 0.25)',
  },
  dark_minimal: {
    name: 'Dark Onyx',
    bg: 'linear-gradient(135deg, #0b0c10 0%, #1f2833 100%)',
    cardBg: 'rgba(20, 24, 33, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    accentGradient: 'linear-gradient(90deg, #66fcf1 0%, #45a29e 100%)',
    primaryColor: '#66fcf1',
    secondaryColor: '#45a29e',
    textColor: '#ffffff',
    subtextColor: '#cbd5e1',
    glow: '0 0 30px rgba(102, 252, 241, 0.15)',
  },
  sakura: {
    name: 'Sakura Night',
    bg: 'linear-gradient(135deg, #180d1b 0%, #291428 50%, #15091a 100%)',
    cardBg: 'rgba(38, 18, 38, 0.75)',
    border: '1px solid rgba(244, 63, 94, 0.35)',
    accentGradient: 'linear-gradient(90deg, #ff758c 0%, #ff7eb3 50%, #fad0c4 100%)',
    primaryColor: '#ff758c',
    secondaryColor: '#ffb199',
    textColor: '#ffffff',
    subtextColor: '#e2e8f0',
    glow: '0 0 35px rgba(255, 117, 140, 0.25)',
  },
  sunset: {
    name: 'Sunset Synthwave',
    bg: 'linear-gradient(135deg, #150826 0%, #2d103b 50%, #3e1b40 100%)',
    cardBg: 'rgba(34, 14, 50, 0.8)',
    border: '1px solid rgba(249, 115, 22, 0.4)',
    accentGradient: 'linear-gradient(90deg, #f97316 0%, #e11d48 50%, #a855f7 100%)',
    primaryColor: '#f97316',
    secondaryColor: '#a855f7',
    textColor: '#ffffff',
    subtextColor: '#cbd5e1',
    glow: '0 0 40px rgba(249, 115, 22, 0.25)',
  }
};

const TemplateCard = ({ anime, onBack }) => {
  const [themeKey, setThemeKey] = useState('cyberpunk');
  const [aspectRatio, setAspectRatio] = useState('16-9'); // '16-9', '9-16', '1-1'
  const [userNote, setUserNote] = useState('A phenomenal anime with breathtaking animation and an unforgettable storyline!');
  const [recommendedBy, setRecommendedBy] = useState('@Rana0Codes');
  const [customRating, setCustomRating] = useState(anime.averageScore ? (anime.averageScore / 20) : 4.5);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const posterRef = useRef(null);
  const activeTheme = THEMES[themeKey];

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2, // High resolution (e.g. 1920x1080 * 2)
        backgroundColor: null,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeTitle = (anime.title || 'anime').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `${safeTitle}-recommendation-${aspectRatio}.png`;
      link.href = image;
      link.click();

      setNotification({
        open: true,
        message: 'High-resolution template exported successfully!',
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
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        backgroundColor: null,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob creation failed');
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setNotification({
            open: true,
            message: 'Image copied to clipboard!',
            severity: 'success',
          });
        } catch (clipboardErr) {
          // Fallback download if clipboard item is not supported in browser
          const link = document.createElement('a');
          link.download = `anime-recommendation.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setNotification({
            open: true,
            message: 'Image downloaded (clipboard permission not granted)',
            severity: 'info',
          });
        }
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

  // Dimensions based on ratio for full export container
  const getContainerDimensions = () => {
    if (aspectRatio === '16-9') return { width: 1200, height: 675 }; // standard 16:9 banner
    if (aspectRatio === '9-16') return { width: 675, height: 1200 }; // 9:16 mobile story
    return { width: 900, height: 900 }; // 1:1 square
  };

  const dims = getContainerDimensions();
  const coverUrl = anime.coverImage?.extraLarge || anime.coverImage?.large || anime.coverImage || anime.image_url;
  const bannerUrl = anime.bannerImage || anime.background_image || coverUrl;

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 3 } }}>
      {/* Controls & Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          variant="outlined"
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Select Another Anime
        </Button>

        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            onClick={handleDownload}
            disabled={isExporting}
            sx={{
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          >
            {isExporting ? 'Generating HD Image...' : 'Download Template (.png)'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            disabled={isExporting}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Copy Image
          </Button>
        </Stack>
      </Box>

      {/* Customization Settings Bar */}
      <Box
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          alignItems: 'center'
        }}
      >
        <FormControl fullWidth size="small">
          <InputLabel id="theme-select-label">Theme Style</InputLabel>
          <Select
            labelId="theme-select-label"
            value={themeKey}
            label="Theme Style"
            onChange={(e) => setThemeKey(e.target.value)}
            startAdornment={<PaletteIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />}
          >
            {Object.entries(THEMES).map(([key, t]) => (
              <MenuItem key={key} value={key}>{t.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
            <AspectRatioIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} /> Format / Ratio
          </Typography>
          <ToggleButtonGroup
            value={aspectRatio}
            exclusive
            onChange={(_, val) => val && setAspectRatio(val)}
            size="small"
            fullWidth
          >
            <ToggleButton value="16-9">16:9 Banner</ToggleButton>
            <ToggleButton value="9-16">9:16 Story</ToggleButton>
            <ToggleButton value="1-1">1:1 Post</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TextField
          size="small"
          label="Recommended By"
          value={recommendedBy}
          onChange={(e) => setRecommendedBy(e.target.value)}
          placeholder="@YourHandle"
          fullWidth
        />

        <Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
            Your Rating ({customRating} / 5)
          </Typography>
          <Rating
            value={customRating}
            precision={0.5}
            onChange={(_, newVal) => newVal && setCustomRating(newVal)}
            emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
          />
        </Box>

        <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <TextField
            size="small"
            label="Recommendation Headline / Note"
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            multiline
            rows={2}
            fullWidth
            placeholder="Write why someone should watch this anime..."
          />
        </Box>
      </Box>

      {/* Poster Preview Frame */}
      <Box sx={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', p: 1 }}>
        <Box
          sx={{
            maxWidth: '100%',
            overflowX: 'auto',
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 3,
            border: '1px dashed rgba(255,255,255,0.15)',
          }}
        >
          {/* THE EXPORTABLE ELEMENT */}
          <Box
            ref={posterRef}
            sx={{
              width: `${dims.width}px`,
              minHeight: `${dims.height}px`,
              background: activeTheme.bg,
              color: activeTheme.textColor,
              borderRadius: '24px',
              border: activeTheme.border,
              boxShadow: activeTheme.glow,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: aspectRatio === '9-16' ? 'column' : 'row',
              p: { xs: 3, md: 5 },
              gap: 4,
              boxSizing: 'border-box',
              fontFamily: 'Inter, system-ui, sans-serif',
              transformOrigin: 'top center',
            }}
          >
            {/* Ambient Background Graphic Layer */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(30px) brightness(0.2)',
                opacity: 0.5,
                zIndex: 0,
              }}
            />

            {/* Subtle Gradient Overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 70%)',
                zIndex: 0,
              }}
            />

            {/* Left / Top: Anime Cover & Quick Badges */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
                width: aspectRatio === '9-16' ? '100%' : aspectRatio === '1-1' ? '300px' : '360px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: aspectRatio === '9-16' ? 'center' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  width: aspectRatio === '9-16' ? '280px' : '100%',
                  height: aspectRatio === '9-16' ? '380px' : aspectRatio === '1-1' ? '400px' : '480px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                  border: activeTheme.border,
                  position: 'relative',
                }}
              >
                <img
                  src={coverUrl}
                  alt={anime.title}
                  crossOrigin="anonymous"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {/* Score badge on cover */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    px: 1.5,
                    py: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <StarIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                    {anime.averageScore ? `${anime.averageScore}%` : `${customRating * 20}%`}
                  </Typography>
                </Box>
              </Box>

              {/* Quick Meta Stats below cover */}
              <Box
                sx={{
                  mt: 2.5,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-around',
                  p: 1.5,
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: activeTheme.subtextColor, textTransform: 'uppercase' }}>
                    Episodes
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {anime.episodes || 'TBA'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: activeTheme.subtextColor, textTransform: 'uppercase' }}>
                    Status
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {anime.status || 'Finished'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: activeTheme.subtextColor, textTransform: 'uppercase' }}>
                    Format
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {anime.format || 'TV'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right / Bottom: Detailed Info & Recommendation Content */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Header: Title & Badges */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label="ANIME SPOTLIGHT"
                    size="small"
                    sx={{
                      background: activeTheme.accentGradient,
                      color: '#000000',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                    }}
                  />
                  {anime.seasonYear && (
                    <Chip
                      label={`${anime.season || ''} ${anime.seasonYear}`.trim()}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: activeTheme.textColor,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {anime.studios && anime.studios[0] && (
                    <Chip
                      label={`Studio: ${anime.studios[0]}`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: activeTheme.textColor,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    mb: 2,
                    fontSize: aspectRatio === '9-16' ? '2.2rem' : '2.8rem',
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {anime.title}
                </Typography>

                {/* Genres */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {(anime.genres || []).slice(0, 5).map((genre) => (
                    <Box
                      key={genre}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: activeTheme.primaryColor,
                      }}
                    >
                      #{genre}
                    </Box>
                  ))}
                </Box>

                {/* Synopsis */}
                <Typography
                  sx={{
                    color: activeTheme.subtextColor,
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    mb: 3,
                    display: '-webkit-box',
                    WebkitLineClamp: aspectRatio === '9-16' ? 4 : 5,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {anime.description?.replace(/<[^>]*>/g, '') || 'An incredible journey and unforgettable story.'}
                </Typography>
              </Box>

              {/* Bottom: Recommendation Note & User Card */}
              <Box>
                {/* Note Box */}
                {userNote && (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '16px',
                      background: activeTheme.cardBg,
                      border: activeTheme.border,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      mb: 3,
                      position: 'relative',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: activeTheme.primaryColor,
                        fontWeight: 800,
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      Why You Should Watch This:
                    </Typography>
                    <Typography sx={{ fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.5, color: '#f8fafc' }}>
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
                    pt: 2,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: activeTheme.accentGradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        fontWeight: 900,
                        fontSize: '1rem',
                      }}
                    >
                      🎌
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: activeTheme.subtextColor, display: 'block' }}>
                        Curated Recommendation
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: activeTheme.textColor }}>
                        {recommendedBy}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: activeTheme.subtextColor, display: 'block' }}>
                      Community Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          sx={{
                            fontSize: 18,
                            color: i < Math.floor(customRating) ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
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
        <Alert severity={notification.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TemplateCard;
