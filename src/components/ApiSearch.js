import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Skeleton,
  Fade,
  LinearProgress,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import StarIcon from '@mui/icons-material/Star';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { FEATURED_ANIME } from '../constants/featuredAnime';

const getHighestQualityImage = (coverImage) => {
  if (!coverImage) return null;
  if (typeof coverImage === 'string') return coverImage;
  return coverImage.extraLarge || coverImage.large || coverImage.medium || null;
};

const AnimeCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(16, 23, 42, 0.65)', borderRadius: '8px', overflow: 'hidden' }}>
    <Skeleton
      variant="rectangular"
      sx={{ width: '100%', height: 275, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
      animation="wave"
    />
    <CardContent sx={{ flexGrow: 1, p: 2 }}>
      <Skeleton variant="text" width="80%" height={28} animation="wave" />
      <Skeleton variant="text" width="100%" height={18} animation="wave" />
      <Skeleton variant="text" width="90%" height={18} animation="wave" />
      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, mb: 1 }}>
        <Skeleton variant="rounded" width={55} height={20} sx={{ borderRadius: '4px' }} animation="wave" />
        <Skeleton variant="rounded" width={55} height={20} sx={{ borderRadius: '4px' }} animation="wave" />
      </Box>
      <Skeleton variant="rounded" width="100%" height={36} sx={{ mt: 2, borderRadius: '6px' }} animation="wave" />
    </CardContent>
  </Card>
);

const GENRE_FILTERS = [
  'All',
  'Action',
  'Adventure',
  'Fantasy',
  'Drama',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Supernatural',
];

const ApiSearch = ({ onAnimeSelect, isWeekly, selectedCount = 0, sourceType = 'api', onSourceTypeChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState({ message: '', details: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeGenre, setActiveGenre] = useState('All');
  const [trendingAnime, setTrendingAnime] = useState(FEATURED_ANIME);

  // Fetch live trending anime from AniList on mount, fallback to verified collection
  useEffect(() => {
    let isMounted = true;
    const fetchTrendingAnime = async () => {
      try {
        const query = `
          query {
            Page(page: 1, perPage: 8) {
              media(type: ANIME, sort: TRENDING_DESC) {
                id
                title {
                  userPreferred
                  english
                  romaji
                }
                description
                coverImage {
                  extraLarge
                  large
                  medium
                  color
                }
                bannerImage
                genres
                averageScore
                episodes
                duration
                season
                seasonYear
                status
                format
                studios {
                  nodes {
                    name
                  }
                }
              }
            }
          }
        `;
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ query }),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.data?.Page?.media && data.data.Page.media.length > 0) {
            setTrendingAnime(data.data.Page.media);
          }
        }
      } catch (err) {
        // Fall back to verified FEATURED_ANIME collection quietly
      }
    };
    fetchTrendingAnime();
    return () => {
      isMounted = false;
    };
  }, []);

  const startLoadingProgress = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 180);
    return interval;
  };

  const searchAnime = async (query, isRandom = false) => {
    if (!isRandom && !query.trim()) {
      setSearchResults([]);
      return;
    }

    let loadingInterval;
    if (isRandom) {
      setIsLoading(true);
      setLoadingProgress(0);
      loadingInterval = startLoadingProgress();
    } else {
      setIsLoading(true);
    }

    setError({ message: '', details: '' });
    setSearchType(isRandom ? 'random' : 'manual');

    try {
      const variables = isRandom
        ? {
            genre: GENRE_FILTERS[Math.floor(Math.random() * (GENRE_FILTERS.length - 1)) + 1],
            page: Math.floor(Math.random() * 8) + 1,
          }
        : { search: query };

      const queryString = `
        query ($${isRandom ? 'genre: String, $page: Int' : 'search: String'}) {
          Page(page: ${isRandom ? '$page' : '1'}, perPage: 8) {
            media(${isRandom ? 'genre: $genre' : 'search: $search'}, type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                userPreferred
                english
                romaji
                native
              }
              description
              coverImage {
                extraLarge
                large
                medium
                color
              }
              bannerImage
              genres
              averageScore
              episodes
              duration
              season
              seasonYear
              status
              source
              format
              studios {
                nodes {
                  name
                }
              }
            }
          }
        }
      `;

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: queryString,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors.map((err) => err.message).join(', '));
      }

      if (!data.data?.Page?.media || data.data.Page.media.length === 0) {
        setError({
          message: 'No results found',
          details: isRandom
            ? 'Try another random search.'
            : `No anime found matching "${query}". Try a different search term.`,
        });
        setSearchResults([]);
        return;
      }

      setSearchResults(data.data.Page.media);
      setError({ message: '', details: '' });
    } catch (err) {
      console.error('Search error:', err);
      let errorMessage = 'Failed to fetch anime data.';
      let errorDetails = '';

      if (err.message.includes('Network error')) {
        errorMessage = 'Network connection issue';
        errorDetails = 'Please check your internet connection and try again.';
      } else {
        errorMessage = 'An error occurred while searching AniList';
        errorDetails = err.message || 'Please try again later.';
      }

      setError({ message: errorMessage, details: errorDetails });
      setSearchResults([]);
    } finally {
      if (isRandom) {
        clearInterval(loadingInterval);
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setLoadingProgress(0);
        }, 250);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    searchAnime(query);
  };

  const handleRandomSearch = () => {
    setSearchQuery('');
    searchAnime('', true);
  };

  const handleAnimeSelect = useCallback(
    (anime) => {
      if (isWeekly && selectedCount >= 3) {
        setError({
          message: 'Selection limit reached',
          details: 'You can only select up to 3 anime for weekly recommendations',
        });
        return;
      }

      const processedAnime = {
        title:
          typeof anime.title === 'string'
            ? anime.title
            : anime.title?.userPreferred ||
              anime.title?.english ||
              anime.title?.romaji ||
              anime.title?.native,
        description: anime.description,
        coverImage: getHighestQualityImage(anime.coverImage),
        bannerImage: anime.bannerImage,
        genres: anime.genres || [],
        averageScore: anime.averageScore,
        episodes: anime.episodes,
        duration: anime.duration,
        season: anime.season,
        seasonYear: anime.seasonYear,
        status: anime.status,
        source: anime.source,
        format: anime.format,
        studios: anime.studios?.nodes?.map((studio) => studio.name) || (anime.studios || []),
      };

      onAnimeSelect(processedAnime);
      setSearchQuery('');
      setSearchResults([]);
    },
    [onAnimeSelect, isWeekly, selectedCount]
  );

  // Filter featured cards by genre
  const filteredFeaturedAnime = useMemo(() => {
    if (activeGenre === 'All') return trendingAnime;
    return trendingAnime.filter(
      (a) => a.genres && a.genres.some((g) => g.toLowerCase() === activeGenre.toLowerCase())
    );
  }, [activeGenre, trendingAnime]);

  // Card Renderer Component for consistent, authentic anime presentation
  const renderAnimeCard = (anime) => {
    const titleStr = typeof anime.title === 'string'
      ? anime.title
      : anime.title?.userPreferred || anime.title?.english || anime.title?.romaji || 'Anime Title';
    const coverUrl = getHighestQualityImage(anime.coverImage) ||
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80';
    const studioName = anime.studios?.nodes?.[0]?.name || (Array.isArray(anime.studios) && anime.studios[0]) || 'Animation Studio';
    const cleanDesc = (anime.description || 'A standout anime recommendation curated for storytelling and visual artistry.')
      .replace(/<[^>]*>/g, '').trim();
    const mediaFormat = anime.format || 'TV';

    return (
      <Card
        className="glass-panel-interactive"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'rgba(16, 23, 42, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.35)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Photo Container: Proper framing with cover fit */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 260, sm: 280, md: 300 },
            overflow: 'hidden',
            backgroundColor: '#0a0d18',
          }}
        >
          <img
            src={coverUrl}
            alt={titleStr}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80';
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%',
              display: 'block',
              transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Media Format Tag in top-left corner */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: 'rgba(8, 12, 22, 0.85)',
              backdropFilter: 'blur(8px)',
              px: 1,
              py: 0.4,
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Typography sx={{ color: '#e2e8f0', fontWeight: 800, fontSize: '0.70rem', letterSpacing: '0.04em' }}>
              {mediaFormat}
            </Typography>
          </Box>

          {/* Overlay Rating Badge in top-right corner */}
          {anime.averageScore && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                background: 'rgba(8, 12, 22, 0.85)',
                backdropFilter: 'blur(8px)',
                px: 1.1,
                py: 0.4,
                borderRadius: '4px',
                border: '1px solid rgba(251, 191, 36, 0.38)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              <StarIcon sx={{ color: '#fbbf24', fontSize: 14 }} />
              <Typography sx={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.78rem' }}>
                {anime.averageScore}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* Card Content */}
        <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          {/* Studio Meta Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography
              sx={{
                color: '#818cf8',
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                maxWidth: '70%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {studioName}
            </Typography>

            {anime.seasonYear && (
              <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>
                {anime.seasonYear}
              </Typography>
            )}
          </Box>

          {/* Anime Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.02rem',
              lineHeight: 1.35,
              mb: 0.7,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#f8fafc',
            }}
            title={titleStr}
          >
            {titleStr}
          </Typography>

          {/* Synopsis */}
          <Typography
            variant="body2"
            sx={{
              color: '#94a3b8',
              mb: 1.8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontSize: '0.82rem',
              lineHeight: 1.5,
            }}
          >
            {cleanDesc}
          </Typography>

          {/* Genre Chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 2 }}>
            {(anime.genres || []).slice(0, 3).map((genre) => (
              <Chip
                key={genre}
                label={genre}
                size="small"
                sx={{
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  color: '#a5b4fc',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  height: 22,
                  borderRadius: '4px',
                  border: '1px solid rgba(99, 102, 241, 0.22)',
                }}
              />
            ))}
          </Box>

          {/* Generate Post Section */}
          <Box sx={{ mt: 'auto', pt: 1.6, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              aria-label="Add to selection"
              onClick={() => handleAnimeSelect(anime)}
              endIcon={<ArrowForwardIcon />}
              className="btn-shimmer"
              sx={{
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '0.88rem',
                py: 0.95,
                textTransform: 'none',
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.55)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Generate Poster
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      {isLoading && searchType === 'random' && (
        <LinearProgress
          variant="determinate"
          value={loadingProgress}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
            },
          }}
        />
      )}

      {/* UNIFIED STUDIO CONTROL & SEARCH PANEL (Attached together as requested) */}
      <Box
        className="glass-panel"
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 4,
          borderRadius: '10px',
          backgroundColor: 'rgba(16, 23, 42, 0.78)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 10px 32px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Row 1: Title & Mode Switcher */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em', color: '#f8fafc' }}>
              Select Anime to Recommend
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.84rem' }}>
              Search 15,000+ titles via AniList GraphQL or enter custom recommendation data
            </Typography>
          </Box>

          {/* Segmented Source Tabs */}
          {onSourceTypeChange && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                borderRadius: '6px',
                p: 0.5,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                alignSelf: { xs: 'stretch', sm: 'auto' },
                gap: 0.5,
              }}
            >
              <Button
                size="small"
                variant={sourceType === 'api' ? 'contained' : 'text'}
                onClick={() => onSourceTypeChange('api')}
                startIcon={<TravelExploreIcon fontSize="small" />}
                sx={{
                  borderRadius: '4px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: { xs: 1.5, sm: 2.2 },
                  py: 0.7,
                  fontSize: { xs: '0.80rem', sm: '0.84rem' },
                  whiteSpace: 'nowrap',
                  background:
                    sourceType === 'api'
                      ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                      : 'transparent',
                  color: sourceType === 'api' ? '#ffffff' : '#94a3b8',
                  boxShadow: sourceType === 'api' ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none',
                }}
              >
                AniList API Search
              </Button>
              <Button
                size="small"
                variant={sourceType === 'manual' ? 'contained' : 'text'}
                onClick={() => onSourceTypeChange('manual')}
                startIcon={<EditNoteIcon fontSize="small" />}
                sx={{
                  borderRadius: '4px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: { xs: 1.5, sm: 2.2 },
                  py: 0.7,
                  fontSize: { xs: '0.80rem', sm: '0.84rem' },
                  whiteSpace: 'nowrap',
                  background:
                    sourceType === 'manual'
                      ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                      : 'transparent',
                  color: sourceType === 'manual' ? '#ffffff' : '#94a3b8',
                  boxShadow: sourceType === 'manual' ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none',
                }}
              >
                Custom / Manual Entry
              </Button>
            </Box>
          )}
        </Box>

        {/* Row 2: Search Input & Random Button (Unified directly inside the box) */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <TextField
            fullWidth
            label="Search Anime"
            placeholder="Search by title (e.g., Tokyo Revengers, Frieren, Jujutsu Kaisen)..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={isLoading && searchType === 'random'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.light', ml: 0.5 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                borderRadius: '6px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  transition: 'border-color 0.2s',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.light',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                  boxShadow: '0 0 16px rgba(99, 102, 241, 0.35)',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#94a3b8',
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleRandomSearch}
            disabled={isLoading && searchType === 'random'}
            startIcon={
              isLoading && searchType === 'random' ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ShuffleIcon />
              )
            }
            className="btn-shimmer"
            sx={{
              minWidth: { xs: '110px', sm: '140px' },
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.92rem',
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                transform: 'translateY(-1.5px)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
              },
            }}
          >
            {isLoading && searchType === 'random' ? 'Loading...' : 'Random'}
          </Button>
        </Box>

        {/* Row 3: Genre Quick Filter Chips (Attached directly inside the panel) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, mr: 0.5 }}>
            Filter:
          </Typography>
          {GENRE_FILTERS.map((genre) => (
            <Chip
              key={genre}
              label={genre}
              size="small"
              onClick={() => setActiveGenre(genre)}
              sx={{
                fontWeight: 700,
                fontSize: '0.74rem',
                cursor: 'pointer',
                borderRadius: '4px',
                backgroundColor: activeGenre === genre ? '#6366f1' : 'rgba(255, 255, 255, 0.04)',
                color: activeGenre === genre ? '#ffffff' : '#94a3b8',
                border: '1px solid',
                borderColor: activeGenre === genre ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                transition: 'all 0.18s ease',
                '&:hover': {
                  backgroundColor: activeGenre === genre ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* ERROR ALERT */}
      {error.message && (
        <Fade in={!!error.message}>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
            }}
            action={
              <Button color="inherit" size="small" onClick={() => setError({ message: '', details: '' })}>
                Dismiss
              </Button>
            }
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {error.message}
            </Typography>
            {error.details && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {error.details}
              </Typography>
            )}
          </Alert>
        </Fade>
      )}

      {/* WEEKLY SELECTION COUNTER */}
      {isWeekly && (
        <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={`Selected: ${selectedCount}/3 Anime`}
            color={selectedCount === 3 ? 'success' : 'primary'}
            sx={{ fontWeight: 800, borderRadius: '4px' }}
          />
          <Typography variant="caption" color="text.secondary">
            Pick 3 titles for this week's editorial showcase
          </Typography>
        </Box>
      )}

      {/* SEARCH RESULTS VIEW (When query exists or random results fetched) */}
      {(searchQuery || searchResults.length > 0) && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
              Search Results {searchResults.length > 0 ? `(${searchResults.length})` : ''}
            </Typography>
            {searchQuery && (
              <Button
                size="small"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                sx={{ color: '#94a3b8' }}
              >
                Clear Search
              </Button>
            )}
          </Box>

          {isLoading && searchType !== 'random' && (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <AnimeCardSkeleton />
                </Grid>
              ))}
            </Grid>
          )}

          <Fade in={!isLoading && searchResults.length > 0}>
            <Grid container spacing={3}>
              {searchResults.map((anime) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={anime.id}>
                  {renderAnimeCard(anime)}
                </Grid>
              ))}
            </Grid>
          </Fade>
        </Box>
      )}

      {/* TRENDING & QUICK-PICK SHELF */}
      {!searchQuery && searchResults.length === 0 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.4 }}>
              🔥 Trending Anime & Staff Favorites
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select any title to instantly open the 1080p Poster Studio with preloaded artwork
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {filteredFeaturedAnime.map((anime) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={anime.id}>
                {renderAnimeCard(anime)}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* SOCIAL MEDIA EXPORT CAPABILITIES SHELF */}
      {!searchQuery && searchResults.length === 0 && (
        <Box
          className="glass-panel"
          sx={{
            mb: 4,
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 23, 42, 0.72)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 32px -8px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
            <AutoAwesomeIcon sx={{ color: '#818cf8', fontSize: 22 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#f8fafc' }}>
              Multi-Platform Social Media Publishing
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, fontSize: '0.86rem' }}>
            Every anime card is dynamically composited in 3 native aspect ratios with zero loss in resolution.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '8px',
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2,
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '6px',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AspectRatioIcon sx={{ color: '#818cf8', fontSize: 22 }} />
                  </Box>
                  <Chip
                    label="1920 × 1080"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      color: '#a5b4fc',
                      fontWeight: 700,
                      fontSize: '0.70rem',
                      height: 22,
                      borderRadius: '4px',
                    }}
                  />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.96rem', color: '#f8fafc' }}>
                  16:9 Landscape Banner
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.80rem', lineHeight: 1.5 }}>
                  Engineered for YouTube Community posts, X (Twitter) embeds, and Discord recommendations.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '8px',
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2,
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    borderColor: 'rgba(236, 72, 153, 0.4)',
                    backgroundColor: 'rgba(236, 72, 153, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '6px',
                      backgroundColor: 'rgba(236, 72, 153, 0.15)',
                      border: '1px solid rgba(236, 72, 153, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MovieFilterIcon sx={{ color: '#f472b6', fontSize: 22 }} />
                  </Box>
                  <Chip
                    label="1080 × 1080"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(236, 72, 153, 0.12)',
                      color: '#f472b6',
                      fontWeight: 700,
                      fontSize: '0.70rem',
                      height: 22,
                      borderRadius: '4px',
                    }}
                  />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.96rem', color: '#f8fafc' }}>
                  1:1 Square Feed Post
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.80rem', lineHeight: 1.5 }}>
                  Tailored for Instagram Feed grids, Threads, Pinterest pins, and Reddit community carousels.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '8px',
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2,
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    borderColor: 'rgba(6, 182, 212, 0.4)',
                    backgroundColor: 'rgba(6, 182, 212, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '6px',
                      backgroundColor: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AutoAwesomeIcon sx={{ color: '#22d3ee', fontSize: 22 }} />
                  </Box>
                  <Chip
                    label="1080 × 1920"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(6, 182, 212, 0.12)',
                      color: '#67e8f9',
                      fontWeight: 700,
                      fontSize: '0.70rem',
                      height: 22,
                      borderRadius: '4px',
                    }}
                  />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.96rem', color: '#f8fafc' }}>
                  9:16 Vertical Story
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.80rem', lineHeight: 1.5 }}>
                  Formatted for TikTok posts, Instagram Stories, YouTube Shorts, and mobile phone wallpapers.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ApiSearch;
