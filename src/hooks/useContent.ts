import { useState, useEffect, useCallback } from "react";
import { contentStore, Movie, TVShow, ShortMovie } from "@/lib/contentStore";

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>(contentStore.getMovies());

  useEffect(() => {
    const unsubscribe = contentStore.subscribe(() => {
      setMovies(contentStore.getMovies());
    });
    return unsubscribe;
  }, []);

  const getMovie = useCallback((id: string) => {
    return contentStore.getMovie(id);
  }, []);

  const addMovie = useCallback((movie: Omit<Movie, "id">) => {
    return contentStore.addMovie(movie);
  }, []);

  const updateMovie = useCallback((id: string, updates: Partial<Movie>) => {
    return contentStore.updateMovie(id, updates);
  }, []);

  const deleteMovie = useCallback((id: string) => {
    return contentStore.deleteMovie(id);
  }, []);

  return { movies, getMovie, addMovie, updateMovie, deleteMovie };
}

export function useTVShows() {
  const [tvShows, setTVShows] = useState<TVShow[]>(contentStore.getTVShows());

  useEffect(() => {
    const unsubscribe = contentStore.subscribe(() => {
      setTVShows(contentStore.getTVShows());
    });
    return unsubscribe;
  }, []);

  const getTVShow = useCallback((id: string) => {
    return contentStore.getTVShow(id);
  }, []);

  const addTVShow = useCallback((show: Omit<TVShow, "id">) => {
    return contentStore.addTVShow(show);
  }, []);

  const updateTVShow = useCallback((id: string, updates: Partial<TVShow>) => {
    return contentStore.updateTVShow(id, updates);
  }, []);

  const deleteTVShow = useCallback((id: string) => {
    return contentStore.deleteTVShow(id);
  }, []);

  return { tvShows, getTVShow, addTVShow, updateTVShow, deleteTVShow };
}

export function useShortMovies() {
  const [shortMovies, setShortMovies] = useState<ShortMovie[]>(contentStore.getShortMovies());

  useEffect(() => {
    const unsubscribe = contentStore.subscribe(() => {
      setShortMovies(contentStore.getShortMovies());
    });
    return unsubscribe;
  }, []);

  const getShortMovie = useCallback((id: string) => {
    return contentStore.getShortMovie(id);
  }, []);

  const addShortMovie = useCallback((movie: Omit<ShortMovie, "id">) => {
    return contentStore.addShortMovie(movie);
  }, []);

  const updateShortMovie = useCallback((id: string, updates: Partial<ShortMovie>) => {
    return contentStore.updateShortMovie(id, updates);
  }, []);

  const deleteShortMovie = useCallback((id: string) => {
    return contentStore.deleteShortMovie(id);
  }, []);

  return { shortMovies, getShortMovie, addShortMovie, updateShortMovie, deleteShortMovie };
}
