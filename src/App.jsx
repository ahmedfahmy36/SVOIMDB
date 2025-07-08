import React, { useEffect, useState } from "react";
import Search from "./components/search";
import MovieCard from "./components/MovieCard";
import Spinner from "./components/Spinner";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "../appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);

  const [loading, setLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );
  const fetchMovies = async (query = "") => {
    setLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`failed to fetch movies`);
      }
      const data = await response.json();
      if (data.response === "False") {
        setErrorMessage(data.error || "No movies found.");
        setMoviesList([]);
        return;
      }
      setMoviesList(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Fetch error:':${error} `);
      setErrorMessage("Error fetching  movies. Please try again later.");
      return [];
    } finally {
      setLoading(false);
    }
  };
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Fetch error:':${error} `);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  useEffect(() => { 
    loadTrendingMovies();
  }, []);
  return (
    <>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="src/assets/img/hero-img.png" alt="logo" className="logo" />
          <h1 className="text-3xl font-bold  text-center">
            Find <span className="text-gradient">Movies </span> You'll enjoy
            without the hassle!
          </h1>
        </header>
        { trendingMovies.length > 0 && (
          <section className="trending">
            <h2 className="mt-[40px]">Trending Movies</h2> 
            <ul>
              {trendingMovies.map((movie, index) => (
              <li key={movie.id}>
                <p>{index + 1}</p>
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                />
                <p>{movie.title}</p>
              </li>  
              ))}
            </ul>
          </section>
        )}
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {loading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul className="movies-list">
              {moviesList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

export default App;
