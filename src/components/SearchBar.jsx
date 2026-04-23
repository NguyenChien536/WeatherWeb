/**
 * SearchBar — Full-featured city search with autocomplete suggestions.
 * Uses WeatherAPI's search endpoint for real-time suggestions with debounce (300ms).
 * Includes geolocation support, recent search history, and integrated SettingsMenu.
 *
 * @param {Function} props.onSearch - Callback to trigger weather data fetch
 * @param {Object} props.settings - User settings (theme, units)
 * @param {Function} props.updateSettings - Callback to update global settings
 * @param {Function} props.resetToDefault - Callback to restore default settings
 */
import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Navigation, History } from "lucide-react";
import { weatherService } from "../api/weatherService";
import { useDebounce } from "../hooks/useDebounce";
import { SettingsMenu } from "./SettingsMenu";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utility: Merge Tailwind CSS classes with conflict resolution */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const SearchBar = ({
  onSearch,
  settings,
  updateSettings,
  resetToDefault,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("weatherRecentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches");
      }
    }
  }, []);

  const saveHistory = (item) => {
    if (typeof item === "string") return;

    const filtered = recentSearches.filter(
      (r) => r.name !== item.name || r.lat !== item.lat,
    );
    const updated = [item, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("weatherRecentSearches", JSON.stringify(updated));
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Trigger at 2 characters instead of 3 for better UX
      if (debouncedQuery.length >= 2) {
        try {
          const results =
            await weatherService.getSearchSuggestions(debouncedQuery);
          setSuggestions(results);
          setIsOpen(true);
        } catch (err) {
          console.error("Error fetching suggestions:", err);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion) => {
    const location = {
      lat: suggestion.lat,
      lon: suggestion.lon,
      name: `${suggestion.name}, ${suggestion.country}`,
    };
    onSearch(location);
    saveHistory(suggestion);
    setQuery(suggestion.name);
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setIsOpen(false);
    }
  };

  const [isLocating, setIsLocating] = useState(false);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          onSearch({ lat, lon });
          setQuery("");
          setIsOpen(false);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          alert("Location unavailable. Please check your access permissions.");
        },
        { timeout: 10000, enableHighAccuracy: true },
      );
    } else {
      alert("Your browser does not support location.");
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="flex items-center gap-4 w-full max-w-3xl z-40"
    >
      <form onSubmit={handleSubmit} className="relative flex-1">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search
              className={`h-4 w-4 md:h-5 md:w-5 ${settings.theme === "dark" ? "text-slate-500" : "text-slate-600"} group-focus-within:text-blue-500 transition-colors`}
            />
          </div>
          <input
            type="text"
            id="search-input"
            name="city-search"
            aria-label="Search city or location"
            autoComplete="off"
            className={cn(
              "block w-full pl-12 md:pl-14 pr-10 md:pr-12 py-3 md:py-4 rounded-2xl md:rounded-[1.5rem] text-sm md:text-base font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10",
              settings.theme === "dark"
                ? "bg-slate-800/80 border-white/5 text-white placeholder-slate-500 focus:bg-slate-800"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-500 shadow-sm focus:border-blue-500/50",
            )}
            placeholder="Explore weather in..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-500 hover:text-blue-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && (
          <div
            className={cn(
              "absolute top-full mt-3 w-full rounded-[2rem] shadow-2xl border backdrop-blur-3xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50",
              settings.theme === "dark"
                ? "bg-slate-900/95 border-white/5"
                : "bg-white/95 border-slate-200",
            )}
          >
            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="py-4 px-2">
                <div className="px-5 py-2 text-xs font-bold text-slate-500 flex items-center gap-2 mb-2">
                  <History className="w-3 h-3" />
                  Recent Locations
                </div>
                <ul>
                  {recentSearches.map((item, idx) => (
                    <li
                      key={`hist-${idx}`}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "group px-5 py-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all mx-2 mb-1",
                        settings.theme === "dark"
                          ? "hover:bg-white/10"
                          : "hover:bg-blue-50/50",
                      )}
                    >
                      <div
                        className={`p-2 rounded-xl ${settings.theme === "dark" ? "bg-white/5" : "bg-slate-100"} group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-all`}
                      >
                        <History className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold group-hover:text-blue-500 transition-colors">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">{item.country}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions list */}
            {suggestions.length > 0 && (
              <div className="py-4 px-2">
                <div className="px-5 py-2 text-xs font-bold flex items-center gap-2 mb-2">
                  <MapPin className="w-3 h-3" />
                  Search Results
                </div>
                <ul className="max-h-80 overflow-auto">
                  {suggestions.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "group px-5 py-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all mx-2 mb-1",
                        settings.theme === "dark"
                          ? "hover:bg-white/10"
                          : "hover:bg-blue-50/50",
                      )}
                    >
                      <div
                        className={`p-2 rounded-xl ${settings.theme === "dark" ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"} group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-all`}
                      >
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold group-hover:text-blue-500 transition-colors">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.region}, {item.country}
                        </p>
                      </div>

                      {/* Premium Lat/Lon display */}
                      <div className="hidden sm:grid grid-cols-[30px_55px] gap-y-1 text-[13px] font-mono text-slate-500 transition-all duration-300">
                        <div className="flex items-center">
                          <span className="text-blue-500/80 font-bold">
                            LAT
                          </span>
                        </div>
                        <div className="text-right font-medium">
                          {item.lat.toFixed(2)}°
                        </div>
                        <div className="flex items-center">
                          <span className="text-blue-500/80 font-bold">
                            LON
                          </span>
                        </div>
                        <div className="text-right font-medium">
                          {item.lon.toFixed(2)}°
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {query.length >= 2 && suggestions.length === 0 && (
              <div className="px-5 py-10 text-center text-slate-500 text-sm font-medium">
                No locations matching "
                <span className="text-blue-500 font-bold">{query}</span>"
              </div>
            )}
          </div>
        )}
      </form>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className={cn(
            "p-2.5 md:p-3.5 rounded-2xl transition-all duration-300 relative group border border-white/10 backdrop-blur-xl",
            settings.theme === "dark"
              ? "bg-slate-800/80 text-slate-300 hover:bg-blue-600 hover:text-white"
              : "bg-white/80 text-slate-900 shadow-sm hover:bg-blue-600 hover:text-white",
            isLocating && "animate-pulse cursor-wait opacity-70",
          )}
        >
          <div className="relative z-10 flex items-center gap-2">
            <Navigation
              className={cn("h-5 w-5", isLocating && "animate-spin")}
            />
            <span className="hidden lg:block text-xs font-bold">
              My Location
            </span>
          </div>
        </button>

        <SettingsMenu
          settings={settings}
          updateSettings={updateSettings}
          resetToDefault={resetToDefault}
        />
      </div>
    </div>
  );
};
