const ANILIST_API_URL = 'https://graphql.anilist.co';

// Query for searching anime
const searchQuery = `
  query ($search: String, $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
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
        }
        genres
        averageScore
        episodes
        status
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        seasonYear
        source
        duration
        studios {
          nodes {
            name
          }
        }
      }
    }
  }
`;

// Query for trending and popular anime
const trendingQuery = `
  query ($perPage: Int) {
    trending: Page(page: 1, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
          extraLarge
        }
        bannerImage
        episodes
        format
        meanScore
        genres
        seasonYear
        status
      }
    }
    popular: Page(page: 1, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
          extraLarge
        }
        bannerImage
        episodes
        format
        meanScore
        genres
        seasonYear
        status
      }
    }
  }
`;

const transformAnimeData = (anime) => ({
  id: anime.id,
  title: anime.title.english || anime.title.romaji,
  description: anime.description,
  image_url: anime.coverImage.large,
  background_image: anime.bannerImage,
  episodes: anime.episodes,
  score: anime.meanScore / 10, // Convert to 10-point scale
  type: anime.format,
  year: anime.seasonYear,
  genres: anime.genres,
  status: anime.status
});

const fetchFromAniList = async (query, variables = {}) => {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const data = await response.json();
    return data.data.Page.media.map(anime => ({
      id: anime.id,
      title: anime.title.english || anime.title.romaji,
      description: anime.description,
      // Get highest quality image available
      coverImage: anime.coverImage.extraLarge || anime.coverImage.large,
      genres: anime.genres,
      score: anime.averageScore / 10, // Convert to 10-point scale
      source: 'anilist'
    }));
  } catch (error) {
    console.error('Error fetching from AniList:', error);
    throw error;
  }
};

export const searchAnimeFromAniList = async (searchTerm, limit = 10) => {
  try {
    console.log('Fetching anime data from AniList:', { searchTerm, limit });

    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: searchTerm ? searchQuery : trendingQuery,
        variables: {
          search: searchTerm,
          perPage: limit
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AniList API response:', data);

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    if (searchTerm) {
      const results = data.data.Page.media.map(anime => {
        // Clean up description by removing HTML tags
        const cleanDescription = anime.description ? 
          anime.description.replace(/<br>/g, '\n').replace(/<\/?[^>]+(>|$)/g, '') : '';

        return {
          id: anime.id,
          title: {
            userPreferred: anime.title.userPreferred || anime.title.english || anime.title.romaji,
            english: anime.title.english,
            romaji: anime.title.romaji
          },
          coverImage: {
            extraLarge: anime.coverImage?.extraLarge || anime.bannerImage,
            large: anime.coverImage?.large,
            medium: anime.coverImage?.medium
          },
          bannerImage: anime.bannerImage,
          description: cleanDescription,
          genres: anime.genres || [],
          averageScore: anime.averageScore,
          episodes: anime.episodes,
          duration: anime.duration,
          status: anime.status,
          season: anime.season,
          seasonYear: anime.seasonYear,
          format: anime.format
        };
      });

      console.log('Processed anime results:', results);
      return results;
    } else {
      // Combine and transform trending and popular results
      const trending = data.data.trending.media.map(transformAnimeData);
      const popular = data.data.popular.media
        .filter(item => !trending.some(t => t.id === item.id))
        .map(transformAnimeData);
      
      // Return a mix of trending and popular, ensuring no duplicates
      return [...trending, ...popular].slice(0, limit);
    }
  } catch (error) {
    console.error('Error fetching from AniList:', error);
    throw error;
  }
};

export const searchAnime = async (query) => {
  return fetchFromAniList(searchQuery, { search: query });
};

export const getTopAnime = async () => {
  return fetchFromAniList(trendingQuery);
};

// Fallback to Jikan API if AniList fails
export const searchAnimeFromJikan = async (searchTerm, limit = 10) => {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/${searchTerm ? 'anime' : 'top/anime'}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return null;
    }

    return data.data.map(anime => ({
      id: anime.mal_id,
      title: anime.title,
      description: anime.synopsis,
      image_url: anime.images?.jpg?.image_url || anime.images?.webp?.image_url,
      background_image: anime.images?.jpg?.large_image_url || anime.images?.webp?.large_image_url,
      episodes: anime.episodes,
      score: anime.score,
      type: anime.type,
      year: anime.year,
      genres: anime.genres?.map(g => g.name) || [],
      status: anime.status
    }));
  } catch (error) {
    console.error('Error fetching from Jikan:', error);
    return null;
  }
};
