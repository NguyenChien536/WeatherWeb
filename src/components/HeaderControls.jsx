/**
 * HeaderControls — Sticky header utility bar (memoized).
 * Contains: live clock, theme toggle (Sun/Moon), saved cities dropdown
 * with localStorage persistence, and unit toggle (°C/°F).
 *
 * @param {Object} props.current - Current weather data (for city name)
 * @param {Function} props.onSearch - Callback to trigger a new city search
 * @param {Object} props.settings - User settings (theme, units)
 * @param {Function} props.updateSettings - Callback to update global settings
 */
import React, { useState, useEffect, useRef, memo } from "react";
import {
  Star,
  Clock,
  Sun,
  Moon,
  ChevronDown,
  Trash2,
  MapPin,
} from "lucide-react";

export const HeaderControls = memo(({
  current,
  onSearch,
  settings,
  updateSettings,
}) => {
  const [time, setTime] = useState(new Date());
  const [favorites, setFavorites] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live clock effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load favorites from local storage
  useEffect(() => {
    const saved = localStorage.getItem("weatherFavorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites");
      }
    }
  }, []);

  const saveFavorites = (newFavs) => {
    setFavorites(newFavs);
    localStorage.setItem("weatherFavorites", JSON.stringify(newFavs));
  };

  const currentCityName = current ? current.name : "";
  const isCurrentFavorite = favorites.some((f) => f.name === currentCityName);

  const toggleFavorite = () => {
    if (!current) return;
    if (isCurrentFavorite) {
      // Remove
      saveFavorites(favorites.filter((f) => f.name !== currentCityName));
    } else {
      // Add
      saveFavorites([
        ...favorites,
        {
          lat: current.coord.lat,
          lon: current.coord.lon,
          name: currentCityName,
        },
      ]);
    }
  };

  const isDark = settings.theme === "dark";

  return (
    <div className="flex items-center gap-1.5 md:gap-4 xl:gap-8 pb-1 md:pb-0 relative z-50">
      {/* 1. Live Clock & Date */}
      <div
        className={`flex flex-col shrink-0 ${isDark ? "text-white" : "text-black"} font-bold`}
      >
        <div className="flex items-center justify-center xl:justify-start gap-1.5 md:gap-2 text-sm md:text-lg">
          <Clock size={16} className={`${isDark ? "text-white" : "text-black"} md:w-5 md:h-5`} />
          <span className="tabular-nums tracking-tight">
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).replace(/\s?[APM]{2}$/, "")}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider opacity-80 ml-[22px] hidden xl:block">
          {time.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* 2. Quick Toggles */}
      <div
        className={`flex items-center shrink-0 gap-0.5 md:gap-1 p-0.5 md:p-1 rounded-full border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200 shadow-sm"}`}
      >
        <button
          onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
          className={`p-1 md:p-1.5 rounded-full transition-colors ${isDark ? "hover:bg-white/10 text-yellow-400" : "bg-white text-slate-700 hover:text-blue-500 shadow-sm"} `}
          title="Toggle Theme"
        >
          {isDark ? <Sun size={14} className="md:w-[15px] md:h-[15px]" /> : <Moon size={14} className="md:w-[15px] md:h-[15px]" />}
        </button>
        <div
          className={`w-px h-3 md:h-4 ${isDark ? "bg-white/10" : "bg-slate-300"}`}
        />
        <button
          onClick={() =>
            updateSettings({
              units: {
                ...settings.units,
                temp: settings.units.temp === "C" ? "F" : "C",
              },
            })
          }
          className={`px-1.5 md:px-2 py-0.5 rounded-full transition-colors font-bold text-[10px] md:text-xs h-6 md:h-[26px] flex items-center justify-center ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-white text-slate-700 hover:text-blue-600"}`}
          title="Toggle Temperature Unit"
        >
          °{settings.units.temp === "C" ? "F" : "C"}
        </button>
      </div>

      {/* 3. Favorite Cities Dropdown */}
      <div
        className="flex items-center gap-1.5 md:gap-2 shrink-0 relative"
        ref={dropdownRef}
      >
        {current && (
          <button
            onClick={toggleFavorite}
            className={`p-1 md:p-1.5 rounded-full border transition-all ${
              isCurrentFavorite
                ? isDark
                  ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                  : "bg-yellow-100 border-yellow-400 text-yellow-600 shadow-sm"
                : isDark
                  ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm"
            }`}
            title={
              isCurrentFavorite ? "Remove from Favorites" : "Add to Favorites"
            }
          >
            <Star
              size={14}
              className="md:w-4 md:h-4"
              fill={isCurrentFavorite ? "currentColor" : "none"}
            />
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1 md:gap-2 px-1.5 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold border transition-colors whitespace-nowrap relative ${
              isDropdownOpen
                ? isDark
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                  : "bg-blue-50 border-blue-200 text-blue-700"
                : isDark
                  ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm"
            }`}
          >
            <MapPin size={12} className="md:hidden" />
            <span className="hidden sm:inline">Saved Cities</span>
            <span className="hidden sm:inline-flex ml-1.5 items-center justify-center bg-blue-500 text-white text-[9px] w-3.5 h-3.5 rounded-full">
              {favorites.length}
            </span>
            {favorites.length > 0 && (
              <span className="sm:hidden absolute -top-1 -right-1 flex items-center justify-center bg-blue-600 text-white text-[8px] w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm">
                {favorites.length}
              </span>
            )}
            <ChevronDown
              size={10}
              className={`md:w-3.5 md:h-3.5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className={`absolute top-full mt-2 right-0 w-64 rounded-2xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                isDark
                  ? "bg-slate-900/95 border-white/10 backdrop-blur-xl"
                  : "bg-white/95 border-slate-200 backdrop-blur-xl"
              }`}
            >
              <div
                className={`px-4 py-3 text-xs font-bold border-b ${isDark ? "border-white/10 text-slate-400" : "border-slate-100 text-slate-500"}`}
              >
                My Favorite Locations ({favorites.length})
              </div>

              {favorites.length === 0 ? (
                <div
                  className={`px-4 py-6 text-sm text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  No saved locations yet.
                  <br />
                  Click the star icon to save!
                </div>
              ) : (
                <ul className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                  {favorites.map((city) => (
                    <li
                      key={city.name}
                      className={`flex items-center justify-between group rounded-xl p-1 mb-1 transition-colors cursor-pointer ${
                        isDark ? "hover:bg-white/10" : "hover:bg-blue-50/50"
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSearch({
                            lat: city.lat,
                            lon: city.lon,
                            name: city.name,
                          });
                          setIsDropdownOpen(false);
                        }}
                        className={`flex-1 flex items-center gap-3 px-2 py-1.5 text-sm text-left ${
                          currentCityName === city.name
                            ? isDark
                              ? "text-blue-400 font-bold"
                              : "text-blue-600 font-bold"
                            : isDark
                              ? "text-slate-300"
                              : "text-slate-700"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg ${isDark ? "bg-white/5" : "bg-slate-100"} group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-colors`}
                        >
                          <MapPin
                            size={14}
                            className={
                              currentCityName === city.name
                                ? "opacity-100 text-blue-500"
                                : "opacity-60"
                            }
                          />
                        </div>
                        <span className="truncate pr-2">
                          {city.name.split(",")[0]}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveFavorites(
                            favorites.filter((f) => f.name !== city.name),
                          );
                        }}
                        className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${
                          isDark
                            ? "text-red-400 hover:bg-red-500/20"
                            : "text-red-500 hover:bg-red-50"
                        }`}
                        title="Remove from favorites"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
