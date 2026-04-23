import { useState, useMemo, useCallback } from "react";

/**
 * useWeatherVideo — Maps weather condition to a Mixkit video URL.
 * Returns { videoSrc, fallbackGradient, isLoaded, hasError, onLoad, onError }
 *
 * @param {string} weatherMain — e.g. "Clear", "Rain", "Clouds", etc.
 */

const WEATHER_VIDEOS = Object.freeze({
  clear: "https://assets.mixkit.co/videos/4799/4799-720.mp4",
  clouds: "https://assets.mixkit.co/videos/118/118-720.mp4",
  rain: "https://assets.mixkit.co/videos/28087/28087-720.mp4",
  storm: "https://assets.mixkit.co/videos/9681/9681-720.mp4",
  snow: "https://assets.mixkit.co/videos/4283/4283-720.mp4",
  fog: "https://assets.mixkit.co/videos/28341/28341-720.mp4",
});

const WEATHER_FALLBACK_GRADIENTS = Object.freeze({
  clear: "from-amber-400/30 via-orange-300/20 to-sky-400/30",
  clouds: "from-slate-400/30 via-gray-300/20 to-slate-500/30",
  rain: "from-blue-600/30 via-slate-500/20 to-indigo-600/30",
  storm: "from-indigo-700/30 via-slate-600/20 to-purple-800/30",
  snow: "from-white/30 via-blue-100/20 to-slate-200/30",
  fog: "from-gray-300/30 via-slate-200/20 to-gray-400/30",
});

const getWeatherKey = (weatherMain) => {
  if (!weatherMain) return "clouds";
  const main = weatherMain.toLowerCase();
  if (main === "clear") return "clear";
  if (main === "clouds") return "clouds";
  if (main === "rain" || main === "drizzle") return "rain";
  if (main === "thunderstorm") return "storm";
  if (main === "snow") return "snow";
  if (
    main === "mist" ||
    main === "haze" ||
    main === "fog" ||
    main === "smoke" ||
    main === "dust" ||
    main === "sand" ||
    main === "ash" ||
    main === "squall" ||
    main === "tornado"
  )
    return "fog";
  return "clouds";
};

export const useWeatherVideo = (weatherMain) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const weatherKey = useMemo(() => getWeatherKey(weatherMain), [weatherMain]);

  const videoSrc = WEATHER_VIDEOS[weatherKey];
  const fallbackGradient = WEATHER_FALLBACK_GRADIENTS[weatherKey];

  const onLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const onError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  return {
    videoSrc,
    fallbackGradient,
    weatherKey,
    isLoaded,
    hasError,
    onLoad,
    onError,
  };
};
