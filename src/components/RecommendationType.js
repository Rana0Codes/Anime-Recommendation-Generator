import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ApiSearch from './ApiSearch';
import ManualInput from './ManualInput';
import TemplateCard from './TemplateCard';
import WeeklyRecommendations from './WeeklyRecommendations';

const RecommendationType = ({ searchType: initialSearchType = 'api', mode: controlledMode = null }) => {
  const [selectedType, setSelectedType] = useState('single');
  const [sourceType, setSourceType] = useState(initialSearchType || 'api');
  const [selectedAnime, setSelectedAnime] = useState(null);

  const activeType = controlledMode || selectedType;

  const handleAnimeSelect = (animeData) => {
    setSelectedAnime(animeData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Primary Studio Mode Switcher (Visible when not controlled by Navbar) */}
      {!controlledMode && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
          <Button
            variant={activeType === 'single' ? 'contained' : 'outlined'}
            onClick={() => setSelectedType('single')}
            startIcon={<MovieFilterIcon />}
            sx={{
              minWidth: '220px',
              py: 1.2,
              borderRadius: '6px',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.95rem',
              background:
                activeType === 'single'
                  ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                  : 'rgba(255, 255, 255, 0.03)',
              borderColor: activeType === 'single' ? 'transparent' : 'rgba(255, 255, 255, 0.15)',
              boxShadow: activeType === 'single' ? '0 6px 20px rgba(99, 102, 241, 0.4)' : 'none',
            }}
          >
            Single Poster Studio
          </Button>
          <Button
            variant={activeType === 'weekly' ? 'contained' : 'outlined'}
            onClick={() => setSelectedType('weekly')}
            startIcon={<CalendarMonthIcon />}
            sx={{
              minWidth: '220px',
              py: 1.2,
              borderRadius: '6px',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.95rem',
              background:
                activeType === 'weekly'
                  ? 'linear-gradient(90deg, #ec4899, #f43f5e)'
                  : 'rgba(255, 255, 255, 0.03)',
              borderColor: activeType === 'weekly' ? 'transparent' : 'rgba(255, 255, 255, 0.15)',
              boxShadow: activeType === 'weekly' ? '0 6px 20px rgba(236, 72, 153, 0.4)' : 'none',
            }}
          >
            Weekly Top 3 Showcase
          </Button>
        </Box>
      )}

      {/* SINGLE POSTER STUDIO */}
      {activeType === 'single' && (
        <Box>
          {selectedAnime ? (
            <TemplateCard
              anime={selectedAnime}
              onBack={() => setSelectedAnime(null)}
            />
          ) : (
            <Box>
              {sourceType === 'api' ? (
                <ApiSearch
                  onAnimeSelect={handleAnimeSelect}
                  sourceType={sourceType}
                  onSourceTypeChange={setSourceType}
                />
              ) : (
                <Box>
                  {/* Unified Studio Control & Source Switcher in Manual Mode */}
                  <Box
                    className="glass-panel"
                    sx={{
                      p: { xs: 2.5, sm: 3 },
                      mb: 3.5,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(16, 23, 42, 0.78)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 10px 32px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'stretch', sm: 'center' },
                      gap: 2,
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

                    {/* Source Selection Segmented Tabs */}
                    <Box
                      sx={{
                        display: 'flex',
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        borderRadius: '6px',
                        p: 0.5,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                        alignSelf: { xs: 'flex-start', sm: 'auto' },
                      }}
                    >
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setSourceType('api')}
                        startIcon={<TravelExploreIcon fontSize="small" />}
                        sx={{
                          borderRadius: '4px',
                          fontWeight: 700,
                          textTransform: 'none',
                          px: 2.2,
                          py: 0.7,
                          fontSize: '0.84rem',
                          color: '#94a3b8',
                          '&:hover': { color: '#ffffff' },
                        }}
                      >
                        AniList API Search
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setSourceType('manual')}
                        startIcon={<EditNoteIcon fontSize="small" />}
                        sx={{
                          borderRadius: '4px',
                          fontWeight: 700,
                          textTransform: 'none',
                          px: 2.2,
                          py: 0.7,
                          fontSize: '0.84rem',
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          color: '#ffffff',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                        }}
                      >
                        Custom / Manual Entry
                      </Button>
                    </Box>
                  </Box>

                  <ManualInput onAnimeSelect={handleAnimeSelect} />
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* WEEKLY SHOWCASE STUDIO */}
      {activeType === 'weekly' && <WeeklyRecommendations />}
    </Box>
  );
};

export default RecommendationType;
