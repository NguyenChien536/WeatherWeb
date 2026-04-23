import React, { useState, useEffect, useMemo } from "react";
import { useWeather } from "./hooks/useWeather";
import { SearchBar } from "./components/SearchBar";
import { WeatherCard } from "./components/WeatherCard";
import { WeatherChart } from "./components/WeatherChart";
import { Forecast } from "./components/Forecast";
import { HourlyForecast } from "./components/HourlyForecast";
import { WeatherMap } from "./components/WeatherMap";
import { MediaBackground } from "./components/MediaBackground";
import { LoadingState, ErrorState } from "./components/StatusStates";
import { LifestyleActivities } from "./components/LifestyleActivities";
import { HeaderControls } from "./components/HeaderControls";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_SETTINGS = {
  theme: "dark",
  units: {
    temp: "C",
    wind: "m/s",
    pressure: "hPa",
    distance: "km",
    precip: "mm",
  },
};

/**
 * App — Root component and main orchestrator.
 * Manages global settings (theme, units), coordinates data fetching via useWeather hook,
 * and renders the full-page layout: Header → Main Dashboard → Footer.
 */
function App() {
  const [searchQuery, setSearchQuery] = useState(null);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("weatherSettings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const {
    data,
    loading,
    error,
    refresh,
    setUnits: setApiUnits,
  } = useWeather(searchQuery);

  // Sync API units with settings
  const apiUnits = useMemo(() => {
    return settings.units.temp === "F" ? "imperial" : "metric";
  }, [settings.units.temp]);

  useEffect(() => {
    setApiUnits(apiUnits);
  }, [apiUnits, setApiUnits]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("weatherSettings", JSON.stringify(settings));
    // Apply theme class to body
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefault = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${settings.theme === "dark" ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"} font-sans selection:bg-blue-500/30 overflow-x-hidden`}
    >
      {/* Media Background (Theme-based Day/Night Video) */}
      <MediaBackground theme={settings.theme} />

      {/* Header / Navigation - Full Width - Sticky */}
      <header
        className={`fixed top-0 z-30 w-full backdrop-blur-xl transition-colors duration-300 ${settings.theme === "dark" ? "bg-slate-950/70" : "bg-white/10"} border-b ${settings.theme === "dark" ? "border-white/5" : "border-slate-200/50"}`}
      >
        {/* px-4 md:px-9 py-3 md:py-5 */}
        <div className="w-full px-4 md:px-9 py-2 md:py-3 flex flex-col xl:flex-row items-center justify-between gap-3 xl:gap-8">
          <div className="flex items-center justify-between gap-4 w-full xl:w-auto">
            {/* Logo */}
            <div
              className="flex items-center gap-2 md:gap-3 group cursor-pointer shrink-0"
              onClick={() => window.location.reload()}
            >
              <h1 className="text-lg md:text-2xl font-bold tracking-tight">
                <span
                  className={`${settings.theme === "dark" ? "text-white" : "text-slate-900"}`}
                >
                  Weather
                </span>
                <span
                  className={`${settings.theme === "dark" ? "text-blue-400" : "text-white"}`}
                >
                  now
                </span>
              </h1>
            </div>

            {/* Header Controls (Clock, Toggles, Favorites) */}
            <div className="flex items-center py-1">
              <HeaderControls
                current={data?.current}
                onSearch={handleSearch}
                settings={settings}
                updateSettings={updateSettings}
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full xl:w-auto flex-1 max-w-2xl px-0 shrink-0">
            <SearchBar
              onSearch={handleSearch}
              settings={settings}
              updateSettings={updateSettings}
              resetToDefault={resetToDefault}
            />
          </div>
        </div>
      </header>

      {/* Main Content - Full Width - Offset for Fixed Header */}
      <main className="relative z-10 w-full px-4 md:px-9 pt-32 md:pt-28 pb-10">
        <AnimatePresence mode="wait">
          {loading && !data ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="loading"
              className="flex justify-center items-center h-[60vh]"
            >
              <LoadingState />
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              key="error"
              className="max-w-xl mx-auto"
            >
              <ErrorState message={error} onRetry={refresh} />
            </motion.div>
          ) : data ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              key="content"
              className="flex flex-col gap-8 w-full"
            >
              {/* Top Section: Dashboard Grid (Grid layout for precise 60/40 split) */}
              <div className="xl:grid xl:grid-cols-10 flex flex-col gap-8 w-full items-start">
                {/* Left: Current Weather & Hourly Chart */}
                <div className="flex-1 xl:col-span-6 space-y-8 w-full">
                  <WeatherCard weather={data} settings={settings} />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <h2 className="text-xl font-bold text-white">
                        Weather Trends
                      </h2>
                    </div>
                    <WeatherChart
                      data={data.forecast.list}
                      currentData={data}
                      settings={settings}
                    />
                  </div>

                  <LifestyleActivities
                    current={data.current}
                    details={data.details}
                    settings={settings}
                  />
                </div>

                {/* Right: Hourly Forecast & Daily Forecast */}
                <div className="flex-1 xl:col-span-4 space-y-8 w-full">
                  <HourlyForecast
                    hourlyData={data.hourly}
                    settings={settings}
                  />
                  <Forecast
                    data={data.forecast}
                    daily={data.daily}
                    settings={settings}
                  />
                </div>
              </div>

              {/* Bottom Section: Full Width Map */}
              <div className="w-full mt-16">
                <WeatherMap
                  center={{
                    lat: data.current.coord.lat,
                    lon: data.current.coord.lon,
                  }}
                  settings={settings}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Footer - Full Width */}
      <footer
        className={`relative z-20 border-t ${settings.theme === "dark" ? "border-slate-900 bg-slate-950/50" : "border-slate-200 bg-white/255"} backdrop-blur-xl py-4 md:py-6`}
      >
        <div className="w-full px-4 md:px-9 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-900 dark:text-slate-400 text-sm font-medium">
            © 2026 <span className="text-slate-900">Weather</span>
            <span className="text-white">Now</span> • IWS Midterm Application
          </p>
          <p className="text-[12px] text-white font-mono text-center md:text-right">
            Powered by OpenWeather 3.0 • Windy V2 • WeatherAPI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
