// Content Store - manages movies, TV shows, and short movies data with state management

export interface Movie {
  id: string;
  title: string;
  genre: string;
  language: string;
  duration: string;
  rating: string;
  status: "published" | "pending" | "draft";
  subscriptionRequired: boolean;
  adsEnabled: boolean;
  thumbnail: string;
  description?: string;
  tagline?: string;
  releaseDate?: string;
  ageRating?: string;
  genres?: string[];
  tags?: string[];
}

export interface Episode {
  id: string;
  title: string;
  duration: string;
  episodeNumber: number;
  description?: string;
  thumbnailPreview?: string;
  videoFileName?: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title?: string;
  description?: string;
  episodes: Episode[];
}

export interface TVShow {
  id: string;
  title: string;
  genre: string;
  language: string;
  rating: string;
  status: "published" | "pending" | "draft";
  subscriptionRequired: boolean;
  thumbnail: string;
  description?: string;
  seasons: Season[];
  totalEpisodes: number;
  channel?: string;
  airTime?: string;
  tagline?: string;
  releaseDate?: string;
  ageRating?: string;
  genres?: string[];
  tags?: string[];
}

export interface ShortMovie {
  id: string;
  title: string;
  genre: string;
  language: string;
  duration: string;
  rating: string;
  status: "published" | "pending" | "draft";
  subscriptionRequired: boolean;
  adsEnabled: boolean;
  thumbnail: string;
  description?: string;
  director?: string;
  views?: number;
  tagline?: string;
  releaseDate?: string;
  ageRating?: string;
  genres?: string[];
  tags?: string[];
}

// Initial data
const initialMovies: Movie[] = [
  {
    id: "1",
    title: "The Last Frontier",
    genre: "Action",
    language: "English",
    duration: "2h 15m",
    rating: "8.5",
    status: "published",
    subscriptionRequired: true,
    adsEnabled: false,
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    description: "An epic action thriller about survival in the wild west.",
    genres: ["Action", "Adventure"],
  },
  {
    id: "2",
    title: "Midnight Dreams",
    genre: "Drama",
    language: "Hindi",
    duration: "1h 58m",
    rating: "7.8",
    status: "pending",
    subscriptionRequired: false,
    adsEnabled: true,
    thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop",
    description: "A heartfelt drama exploring dreams and aspirations.",
    genres: ["Drama"],
  },
  {
    id: "3",
    title: "Space Odyssey",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 32m",
    rating: "9.1",
    status: "published",
    subscriptionRequired: true,
    adsEnabled: false,
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=450&fit=crop",
    description: "A breathtaking journey through the cosmos.",
    genres: ["Sci-Fi", "Adventure"],
  },
  {
    id: "4",
    title: "Love in Paris",
    genre: "Romance",
    language: "French",
    duration: "1h 45m",
    rating: "7.2",
    status: "draft",
    subscriptionRequired: false,
    adsEnabled: true,
    thumbnail: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=450&fit=crop",
    description: "A romantic tale set in the city of love.",
    genres: ["Romance"],
  },
];

const initialTVShows: TVShow[] = [
  {
    id: "1",
    title: "Family Tales",
    genre: "Drama",
    language: "Hindi",
    rating: "8.5",
    status: "published",
    subscriptionRequired: false,
    thumbnail: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=450&fit=crop",
    description: "A heartwarming family drama about three generations living under one roof.",
    channel: "Star Plus",
    airTime: "Mon-Fri 8:00 PM",
    seasons: [
      { id: "s1", seasonNumber: 1, episodes: Array(50).fill(null).map((_, i) => ({ id: `e${i}`, title: `Episode ${i + 1}`, duration: "22m", episodeNumber: i + 1 })) },
    ],
    totalEpisodes: 50,
    genres: ["Drama", "Family"],
  },
  {
    id: "2",
    title: "Crime Patrol",
    genre: "Crime",
    language: "Hindi",
    rating: "7.9",
    status: "published",
    subscriptionRequired: true,
    thumbnail: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=300&h=450&fit=crop",
    description: "Real crime stories dramatized for television.",
    channel: "Sony TV",
    airTime: "Sat-Sun 10:00 PM",
    seasons: [
      { id: "s1", seasonNumber: 1, episodes: Array(100).fill(null).map((_, i) => ({ id: `e${i}`, title: `Episode ${i + 1}`, duration: "45m", episodeNumber: i + 1 })) },
      { id: "s2", seasonNumber: 2, episodes: Array(80).fill(null).map((_, i) => ({ id: `e${i}`, title: `Episode ${i + 1}`, duration: "45m", episodeNumber: i + 1 })) },
    ],
    totalEpisodes: 180,
    genres: ["Crime", "Drama"],
  },
  {
    id: "3",
    title: "Comedy Nights",
    genre: "Comedy",
    language: "Hindi",
    rating: "8.8",
    status: "pending",
    subscriptionRequired: false,
    thumbnail: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=300&h=450&fit=crop",
    description: "A late-night comedy show featuring celebrity guests.",
    channel: "Colors TV",
    airTime: "Sat 9:30 PM",
    seasons: [
      { id: "s1", seasonNumber: 1, episodes: Array(25).fill(null).map((_, i) => ({ id: `e${i}`, title: `Episode ${i + 1}`, duration: "60m", episodeNumber: i + 1 })) },
    ],
    totalEpisodes: 25,
    genres: ["Comedy"],
  },
  {
    id: "4",
    title: "Reality Bites",
    genre: "Reality",
    language: "English",
    rating: "7.2",
    status: "draft",
    subscriptionRequired: false,
    thumbnail: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=450&fit=crop",
    description: "A reality competition show with everyday challenges.",
    channel: "MTV",
    airTime: "Fri 9:00 PM",
    seasons: [
      { id: "s1", seasonNumber: 1, episodes: Array(12).fill(null).map((_, i) => ({ id: `e${i}`, title: `Episode ${i + 1}`, duration: "50m", episodeNumber: i + 1 })) },
    ],
    totalEpisodes: 12,
    genres: ["Reality"],
  },
];

const initialShortMovies: ShortMovie[] = [
  {
    id: "1",
    title: "The Last Call",
    genre: "Drama",
    language: "English",
    duration: "15m",
    rating: "8.2",
    status: "published",
    subscriptionRequired: false,
    adsEnabled: true,
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
    description: "A touching story about a phone call that changes everything.",
    director: "John Smith",
    views: 15420,
    genres: ["Drama"],
  },
  {
    id: "2",
    title: "Morning Coffee",
    genre: "Romance",
    language: "Hindi",
    duration: "12m",
    rating: "7.8",
    status: "published",
    subscriptionRequired: true,
    adsEnabled: false,
    thumbnail: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=450&fit=crop",
    description: "Two strangers meet at a coffee shop and discover unexpected connections.",
    director: "Priya Sharma",
    views: 8930,
    genres: ["Romance"],
  },
  {
    id: "3",
    title: "The Chase",
    genre: "Thriller",
    language: "English",
    duration: "18m",
    rating: "8.9",
    status: "pending",
    subscriptionRequired: true,
    adsEnabled: false,
    thumbnail: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop",
    description: "A heart-pounding chase through the city streets.",
    director: "Mike Johnson",
    views: 22150,
    genres: ["Thriller", "Action"],
  },
  {
    id: "4",
    title: "Silent Words",
    genre: "Drama",
    language: "Tamil",
    duration: "20m",
    rating: "9.1",
    status: "published",
    subscriptionRequired: false,
    adsEnabled: true,
    thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=300&h=450&fit=crop",
    description: "A deaf artist communicates through his paintings.",
    director: "Rajesh Kumar",
    views: 31200,
    genres: ["Drama", "Art"],
  },
  {
    id: "5",
    title: "Five Minutes",
    genre: "Sci-Fi",
    language: "English",
    duration: "5m",
    rating: "7.5",
    status: "draft",
    subscriptionRequired: false,
    adsEnabled: true,
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=450&fit=crop",
    description: "What would you do if you had only five minutes left?",
    director: "Sarah Lee",
    views: 0,
    genres: ["Sci-Fi"],
  },
  {
    id: "6",
    title: "The Gift",
    genre: "Comedy",
    language: "Hindi",
    duration: "10m",
    rating: "8.0",
    status: "published",
    subscriptionRequired: false,
    adsEnabled: true,
    thumbnail: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&h=450&fit=crop",
    description: "A hilarious mix-up involving birthday gifts.",
    director: "Amit Patel",
    views: 12890,
    genres: ["Comedy"],
  },
];

type Listener = () => void;

class ContentStore {
  private movies: Movie[] = initialMovies;
  private tvShows: TVShow[] = initialTVShows;
  private shortMovies: ShortMovie[] = initialShortMovies;
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Movies
  getMovies() {
    return this.movies;
  }

  getMovie(id: string) {
    return this.movies.find((m) => m.id === id);
  }

  addMovie(movie: Omit<Movie, "id">) {
    const newMovie = { ...movie, id: Date.now().toString() };
    this.movies = [...this.movies, newMovie];
    this.notify();
    return newMovie;
  }

  updateMovie(id: string, updates: Partial<Movie>) {
    this.movies = this.movies.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    this.notify();
  }

  deleteMovie(id: string) {
    this.movies = this.movies.filter((m) => m.id !== id);
    this.notify();
  }

  // TV Shows
  getTVShows() {
    return this.tvShows;
  }

  getTVShow(id: string) {
    return this.tvShows.find((s) => s.id === id);
  }

  addTVShow(show: Omit<TVShow, "id">) {
    const newShow = { ...show, id: Date.now().toString() };
    this.tvShows = [...this.tvShows, newShow];
    this.notify();
    return newShow;
  }

  updateTVShow(id: string, updates: Partial<TVShow>) {
    this.tvShows = this.tvShows.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    this.notify();
  }

  deleteTVShow(id: string) {
    this.tvShows = this.tvShows.filter((s) => s.id !== id);
    this.notify();
  }

  // Short Movies
  getShortMovies() {
    return this.shortMovies;
  }

  getShortMovie(id: string) {
    return this.shortMovies.find((m) => m.id === id);
  }

  addShortMovie(movie: Omit<ShortMovie, "id">) {
    const newMovie = { ...movie, id: Date.now().toString() };
    this.shortMovies = [...this.shortMovies, newMovie];
    this.notify();
    return newMovie;
  }

  updateShortMovie(id: string, updates: Partial<ShortMovie>) {
    this.shortMovies = this.shortMovies.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    this.notify();
  }

  deleteShortMovie(id: string) {
    this.shortMovies = this.shortMovies.filter((m) => m.id !== id);
    this.notify();
  }
}

export const contentStore = new ContentStore();
