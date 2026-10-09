import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ApiSearch from './ApiSearch';
import ManualInput from './ManualInput';
import TemplateCard from './TemplateCard';
import WeeklyRecommendations from './WeeklyRecommendations';

const RecommendationType = ({ searchType }) => {
  const [selectedType, setSelectedType] = useState('single');
  const [selectedAnime, setSelectedAnime] = useState(null);

  const handleAnimeSelect = (animeData) => {
    setSelectedAnime(animeData);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Type Switcher */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
        <Button
          variant={selectedType === 'single' ? 'contained' : 'outlined'}
          onClick={() => {
            setSelectedType('single');
          }}
          startIcon={<MovieFilterIcon />}
          sx={{
            minWidth: '220px',
            py: 1.2,
            borderRadius: 2.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            background: selectedType === 'single' ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'transparent',
          }}
        >
          Single Recommendation
        </Button>
        <Button
          variant={selectedType === 'weekly' ? 'contained' : 'outlined'}
          onClick={() => {
            setSelectedType('weekly');
          }}
          startIcon={<CalendarMonthIcon />}
          sx={{
            minWidth: '220px',
            py: 1.2,
            borderRadius: 2.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            background: selectedType === 'weekly' ? 'linear-gradient(90deg, #ec4899, #f43f5e)' : 'transparent',
          }}
        >
          Weekly Top 3 Showcase
        </Button>
      </Box>

      {/* Single Mode */}
      {selectedType === 'single' && (
        <Box>
          {selectedAnime ? (
            <TemplateCard
              anime={selectedAnime}
              onBack={() => setSelectedAnime(null)}
            />
          ) : (
            <Box>
              {searchType === 'api' ? (
                <ApiSearch onAnimeSelect={handleAnimeSelect} />
              ) : (
                <ManualInput onAnimeSelect={handleAnimeSelect} />
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Weekly Mode */}
      {selectedType === 'weekly' && (
        <WeeklyRecommendations />
      )}
    </Box>
  );
};

export default RecommendationType;
