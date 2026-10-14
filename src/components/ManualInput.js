import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Rating,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import PanoramaIcon from '@mui/icons-material/Panorama';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ALL_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80';
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&auto=format&fit=crop&q=80';

const ManualInput = ({ onAnimeSelect, submitLabel = 'Generate Recommendation Poster', onCancel = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverPreview, setCoverPreview] = useState(null);
  const [bannerImage, setBannerImage] = useState('');
  const [bannerPreview, setBannerPreview] = useState(null);
  const [rating, setRating] = useState(4.5);
  const [episodes, setEpisodes] = useState('');
  const [format, setFormat] = useState('TV');
  const [status, setStatus] = useState('Finished');
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear().toString());
  const [studio, setStudio] = useState('');
  const [selectedGenres, setSelectedGenres] = useState(['Action', 'Adventure']);
  const [error, setError] = useState('');

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, WebP) for the cover.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Cover image file size must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
        setCoverImage(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, WebP) for the banner.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Banner image file size must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
        setBannerImage(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length >= 5) {
        setError('You can select up to 5 genres.');
        return;
      }
      setError('');
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Anime title is required.');
      return;
    }

    if (seasonYear && (isNaN(seasonYear) || parseInt(seasonYear, 10) < 1950 || parseInt(seasonYear, 10) > 2035)) {
      setError('Please provide a valid 4-digit release year (e.g. 1980 - 2030).');
      return;
    }

    if (episodes && (isNaN(episodes) || parseInt(episodes, 10) <= 0)) {
      setError('Please provide a positive integer for episode count.');
      return;
    }

    const finalCover = coverImage || DEFAULT_COVER;
    const finalBanner = bannerImage || coverImage || DEFAULT_BANNER;

    const processedAnime = {
      title: title.trim(),
      description: description.trim() || 'A handpicked anime recommendation curated for quality storytelling and animation.',
      coverImage: {
        extraLarge: finalCover,
        large: finalCover,
      },
      bannerImage: finalBanner,
      genres: selectedGenres.length > 0 ? selectedGenres : ['Action', 'Fantasy'],
      averageScore: Math.round(rating * 20),
      episodes: episodes ? parseInt(episodes, 10) : null,
      seasonYear: seasonYear ? parseInt(seasonYear, 10) : null,
      status: status,
      format: format,
      studios: studio.trim() ? [studio.trim()] : ['Curated Independent'],
    };

    onAnimeSelect(processedAnime);
  };

  const handleLoadSample = () => {
    setTitle('Frieren: Beyond Journey\'s End');
    setDescription('During their decade-long quest to defeat the Demon King, the members of the hero\'s party—Himmel the hero, Heiter the priest, Eisen the warrior, and Frieren the mage—bound themselves together through countless battles. After victory, the immortal elf Frieren embarks on a new personal journey to understand humanity.');
    setCoverImage('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80');
    setCoverPreview('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80');
    setBannerImage('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80');
    setBannerPreview('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80');
    setRating(4.8);
    setEpisodes('28');
    setFormat('TV');
    setStatus('Finished');
    setSeasonYear('2023');
    setStudio('Madhouse');
    setSelectedGenres(['Adventure', 'Drama', 'Fantasy']);
    setError('');
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(20, 26, 50, 0.75) 0%, rgba(12, 16, 32, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.5)',
      }}
    >
      <Box sx={{ mb: 3.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '-0.02em' }}>
            <AutoAwesomeIcon sx={{ color: '#ec4899' }} /> Custom Anime Recommendation Entry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter any anime, hidden gem, or upcoming series manually with custom cover and banner artwork.
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={handleLoadSample}
          startIcon={<AutoAwesomeIcon />}
          sx={{
            borderRadius: '6px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.82rem',
            borderColor: 'rgba(99, 102, 241, 0.4)',
            color: '#a5b4fc',
            '&:hover': {
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#ffffff',
            },
          }}
        >
          ✨ Load Sample Data
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '6px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column: Form Details */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Anime Title *"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. Frieren: Beyond Journey's End"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Synopsis / Recommendation Reason"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this anime worth watching? Describe the tone, world, or character arcs..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Total Episodes"
                  type="number"
                  value={episodes}
                  onChange={(e) => setEpisodes(e.target.value)}
                  placeholder="e.g. 28"
                  inputProps={{ min: 1, max: 2000 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="manual-format-label">Format</InputLabel>
                  <Select
                    labelId="manual-format-label"
                    value={format}
                    label="Format"
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <MenuItem value="TV">TV Series</MenuItem>
                    <MenuItem value="MOVIE">Movie</MenuItem>
                    <MenuItem value="OVA">OVA</MenuItem>
                    <MenuItem value="ONA">ONA</MenuItem>
                    <MenuItem value="SPECIAL">Special</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="manual-status-label">Status</InputLabel>
                  <Select
                    labelId="manual-status-label"
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="Finished">Finished Airing</MenuItem>
                    <MenuItem value="Releasing">Currently Airing</MenuItem>
                    <MenuItem value="Upcoming">Not Yet Released</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Release Year"
                  value={seasonYear}
                  onChange={(e) => setSeasonYear(e.target.value)}
                  placeholder="e.g. 2024"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Animation Studio"
                  value={studio}
                  onChange={(e) => setStudio(e.target.value)}
                  placeholder="e.g. Madhouse, MAPPA, Wit Studio"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Select Genres (Up to 5):</span>
                  <span style={{ fontSize: '0.8rem', color: selectedGenres.length === 5 ? '#f43f5e' : '#94a3b8' }}>
                    {selectedGenres.length} / 5 selected
                  </span>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {ALL_GENRES.map((g) => {
                    const isSelected = selectedGenres.includes(g);
                    return (
                      <Chip
                        key={g}
                        label={g}
                        clickable
                        onClick={() => handleGenreToggle(g)}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        size="small"
                      />
                    );
                  })}
                </Box>
              </Grid>

              {/* Rating Slider / Selector */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Curator Score: {Math.round(rating * 20)}% ({rating * 2} / 10)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Affects score badge rendered on the poster
                    </Typography>
                  </Box>
                  <Rating
                    value={rating}
                    precision={0.5}
                    onChange={(_, v) => v && setRating(v)}
                    emptyIcon={<StarIcon style={{ opacity: 0.2 }} fontSize="inherit" />}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column: Visual Artwork Upload & Live Preview */}
          <Grid item xs={12} md={5}>
            {/* Cover Upload Box */}
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <CloudUploadIcon fontSize="small" color="primary" /> Poster Cover Art (Vertical)
              </Typography>

              {coverPreview ? (
                <Box sx={{ position: 'relative', width: '100%', mb: 1.5, textAlign: 'center' }}>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{
                      maxHeight: '130px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => { setCoverPreview(null); setCoverImage(''); }}
                    sx={{ mt: 0.5, display: 'block', mx: 'auto', textTransform: 'none', borderRadius: '4px' }}
                  >
                    Remove Cover
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ borderRadius: '6px', textTransform: 'none', mb: 1 }}
                  >
                    Upload Cover File
                    <input type="file" accept="image/*" hidden onChange={handleCoverUpload} />
                  </Button>
                </Box>
              )}

              <TextField
                fullWidth
                size="small"
                label="Or Cover Image URL"
                value={typeof coverImage === 'string' && !coverImage.startsWith('data:') ? coverImage : ''}
                onChange={(e) => {
                  setCoverImage(e.target.value);
                  setCoverPreview(e.target.value);
                }}
                placeholder="https://..."
              />
            </Box>

            {/* Custom Background / Banner Artwork Upload Box */}
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <PanoramaIcon fontSize="small" sx={{ color: '#06b6d4' }} /> Custom Backdrop / Banner Art (Wide, Optional)
              </Typography>

              {bannerPreview ? (
                <Box sx={{ position: 'relative', width: '100%', mb: 1.5, textAlign: 'center' }}>
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    style={{
                      width: '100%',
                      maxHeight: '100px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => { setBannerPreview(null); setBannerImage(''); }}
                    sx={{ mt: 0.5, display: 'block', mx: 'auto', textTransform: 'none', borderRadius: '4px' }}
                  >
                    Remove Banner
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ borderRadius: '6px', textTransform: 'none', mb: 1 }}
                  >
                    Upload Wide Banner File
                    <input type="file" accept="image/*" hidden onChange={handleBannerUpload} />
                  </Button>
                </Box>
              )}

              <TextField
                fullWidth
                size="small"
                label="Or Banner Image URL (Optional)"
                value={typeof bannerImage === 'string' && !bannerImage.startsWith('data:') ? bannerImage : ''}
                onChange={(e) => {
                  setBannerImage(e.target.value);
                  setBannerPreview(e.target.value);
                }}
                placeholder="https://... (falls back to cover art)"
              />
            </Box>

            {/* Live Summary Preview Card */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'block', mb: 1 }}>
                Live Summary Preview
              </Typography>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  display: 'flex',
                  p: 1.5,
                  gap: 1.5,
                  alignItems: 'center',
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ width: 64, height: 90, borderRadius: '4px', objectFit: 'cover', backgroundColor: '#0f172a' }}
                  image={coverPreview || DEFAULT_COVER}
                  alt={title || 'Preview cover'}
                />
                <CardContent sx={{ p: '0 !important', flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {title.trim() || 'Untitled Anime'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {studio || 'Studio TBA'} • {seasonYear || '2024'} • {format}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.5 }}>
                    <StarIcon sx={{ fontSize: '13px', color: '#fbbf24' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {Math.round(rating * 20)}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                      {episodes ? `${episodes} Ep` : 'TBA'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.8, overflow: 'hidden', flexWrap: 'nowrap' }}>
                    {selectedGenres.slice(0, 2).map((g) => (
                      <Chip key={g} label={g} size="small" sx={{ height: 18, fontSize: '0.65rem', borderRadius: '4px' }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{ borderRadius: '6px', textTransform: 'none', px: 3 }}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CheckCircleIcon />}
            sx={{
              background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 100%)',
              px: 4,
              py: 1.2,
              fontWeight: 800,
              borderRadius: '6px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              textTransform: 'none',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
              },
            }}
          >
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ManualInput;
