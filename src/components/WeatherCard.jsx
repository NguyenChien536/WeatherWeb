/**
 * WeatherCard — Main hero dashboard card with dynamic video background.
 * Displays current weather data, temperature, wind, humidity, UV, visibility,
 * pressure, and sunrise/sunset times. Video background changes based on
 * current weather condition (Rain, Snow, Storm, etc.) via useWeatherVideo hook.
 *
 * @param {Object} props.weather - Combined weather data from useWeather hook
 * @param {Object} props.settings - User settings (theme, units)
 */
import React from "react";
import { useWeatherVideo } from "../hooks/useWeatherVideo";
import {
  Gauge,
  Eye,
  Thermometer,
  ArrowUp,
  ArrowDown,
  Wind as WindIcon,
  MapPin,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

// Import Custom PNG Icons
import sunIcon from "../assets/icons/sun.png";
import moonIcon from "../assets/icons/moon.png";
import sunCloudIcon from "../assets/icons/sun-cloud.png";
import cloudIcon from "../assets/icons/cloud_10828610.png";
import rainIcon from "../assets/icons/rain.png";
import stormIcon from "../assets/icons/storm.png";
import snowIcon from "../assets/icons/snow.png";
import mistIcon from "../assets/icons/mist.png";
import uvIcon from "../assets/icons/uv.png";
import humidityIcon from "../assets/icons/humidity.png";
import pressureIcon from "../assets/icons/pressure.png";
import visibilityIcon from "../assets/icons/visibility.png";
import sunriseIcon from "../assets/icons/sunrise_10493299.png";
import sunsetIcon from "../assets/icons/beach-sunset_12883919.png";
import windIcon from "../assets/icons/wind.png";

const WeatherIcon = ({ condition, className }) => {
  const iconMap = {
    Clear: sunIcon,
    Clouds: cloudIcon,
    Rain: rainIcon,
    Drizzle: rainIcon,
    Thunderstorm: stormIcon,
    Snow: snowIcon,
    Mist: mistIcon,
    Smoke: mistIcon,
    Haze: mistIcon,
    Dust: mistIcon,
    Fog: mistIcon,
    "Partly Cloudy": sunCloudIcon,
  };

  const iconSrc = iconMap[condition] || cloudIcon;
  return <img src={iconSrc} alt={condition} className={className} />;
};

// Unit Conversion Helpers
const convertTemp = (temp) => Math.round(temp);
const convertWind = (speed, unitType, apiBase) => {
  if (apiBase === "F") {
    // API is Imperial (mph)
    if (unitType === "mph") return speed.toFixed(1);
    if (unitType === "km/h") return (speed * 1.60934).toFixed(1);
    return (speed * 0.44704).toFixed(1); // m/s
  } else {
    // API is Metric (m/s)
    if (unitType === "km/h") return (speed * 3.6).toFixed(1);
    if (unitType === "mph") return (speed * 2.237).toFixed(1);
    return speed.toFixed(1);
  }
};
const convertPressure = (hpa, unitType) => {
  if (unitType === "inHg") return (hpa * 0.02953).toFixed(2);
  return hpa.toFixed(0);
};
const convertVisibility = (meters, unitType, apiBase) => {
  if (apiBase === "F") {
    // API is Imperial (miles)
    const miles = meters / 1609.34;
    if (unitType === "mi") return miles.toFixed(1);
    return (miles * 1.60934).toFixed(1); // km
  } else {
    // API is Metric (meters)
    const km = meters / 1000;
    if (unitType === "mi") return (km * 0.621371).toFixed(1);
    return km.toFixed(1);
  }
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  unit,
  comment,
  color,
  theme,
}) => (
  <motion.div
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`relative overflow-hidden p-4 rounded-[2rem] border transition-all duration-300 ${
      theme === "dark"
        ? "bg-white/5 border-white/5 hover:bg-white/10"
        : "bg-white/10 border-slate-200/60 hover:bg-white/40 shadow-sm"
    } backdrop-blur-2xl group`}
  >
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        {Icon ? (
          <div
            className={`transition-colors group-hover:scale-110 duration-300`}
          >
            {typeof Icon === "string" ? (
              <img src={Icon} alt={label} className="w-8 h-8 object-contain" />
            ) : (
              <div
                className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-white/5" : "bg-slate-100"} ${color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            )}
          </div>
        ) : null}
        <span
          className={`text-xs font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-100"}`}
        >
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span
          className={`text-3xl font-bold tabular-nums tracking-tight text-white`}
        >
          {value}
        </span>
        <span
          className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-white"}`}
        >
          {unit}
        </span>
      </div>
      <p
        className={`text-[13px] font-medium leading-relaxed italic ${theme === "dark" ? "text-slate-400" : "text-slate-200"} group-hover:text-blue-400 transition-colors`}
      >
        {comment}
      </p>
    </div>
    <div
      className={`absolute top-0 right-0 w-20 h-20 blur-3xl opacity-10 rounded-full -m-6 ${color.replace("text-", "bg-")}`}
    />
  </motion.div>
);

export const WeatherCard = ({ weather, settings }) => {
  const weatherMain = weather?.current?.weather?.[0]?.main || "Clouds";

  // Weather video hook — MUST be called before any early return
  const { videoSrc, fallbackGradient, isLoaded, hasError, onLoad, onError } =
    useWeatherVideo(weatherMain);

  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!weather || !weather.current) return null;

  const { current, details } = weather;
  const theme = settings.theme;
  const units = settings.units;

  // Derive metrics based on settings
  const apiBase = settings.units.temp; // "C" or "F"
  const displayTemp = convertTemp(current.main.temp);
  const displayFeelsLike = convertTemp(current.main.feels_like);
  const displayHigh = convertTemp(current.main.temp_max);
  const displayLow = convertTemp(current.main.temp_min);

  const displayWind = convertWind(current.wind.speed, units.wind, apiBase);
  const displayVis = convertVisibility(
    current.visibility,
    units.distance,
    apiBase,
  );
  const displayPressure = convertPressure(
    current.main.pressure,
    units.pressure,
  );

  const getTimeStr = (ts) => {
    try {
      return new Intl.DateTimeFormat([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: current.timezone,
      }).format(new Date(ts * 1000));
    } catch (e) {
      return new Date(ts * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getLocalTimeStr = () => {
    try {
      return new Intl.DateTimeFormat([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: current.timezone,
        second: "2-digit",
      }).format(currentTime);
    } catch (e) {
      return currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Hero Card with Weather Video Background */}
      <div
        className={`relative p-5 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border overflow-hidden transition-all duration-500 ${
          theme === "dark"
            ? "bg-slate-900/90 border-white/10 shadow-2xl shadow-black/50"
            : "bg-white/25 border-slate-200/80 shadow-xl shadow-slate-200/50"
        } backdrop-blur-3xl`}
      >
        {/* === Weather Video Background === */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem]">
          {/* Video element */}
          {!hasError && videoSrc && (
            <video
              key={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={onLoad}
              onError={onError}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1 000 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          )}

          {/* Fallback gradient when video fails or is loading */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} transition-opacity duration-700 ${
              isLoaded && !hasError ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Dark scrim overlay for text readability */}
          <div
            className={`absolute inset-0 transition-all duration-700 ${
              theme === "dark"
                ? "bg-gradient-to-b from-slate-950/10 via-slate-900/20 to-slate-950/30"
                : "bg-gradient-to-b from-white/10 via-white/20 to-white/30"
            }`}
          />

          {/* Extra subtle blur */}
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>

        {/* Content on top of video */}
        <div className="relative z-10">
          {/* Glow effects */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative flex flex-col xl:flex-row items-center justify-between gap-12">
            {/* Left: Location & Main Temp */}
            <div className="flex-1 w-full text-center xl:text-left">
              <div className="flex items-center justify-center xl:justify-start gap-2 mb-4">
                <MapPin size={18} className="text-blue-500" />
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-wrap-balance text-white">
                  {current.name}
                </h2>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 mb-8 justify-center xl:justify-start">
                <div className="relative">
                  <span className="text-7xl md:text-9xl font-bold tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-gray-500 via-white to-white">
                    {displayTemp}
                  </span>
                  <span className="text-3xl md:text-5xl font-bold align-top ml-0 md:ml-1 tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-gray-500 via-white to-white">
                    °{units.temp}
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <p
                    className={`text-lg md:text-xl font-bold capitalize text-white leading-tight`}
                  >
                    {current.weather[0].description}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-bold text-base text-white">
                      <ArrowUp size={16} className="text-red-400" />
                      <span>H: {displayHigh}°</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <ArrowDown size={16} className="text-blue-400" />
                      <span>L: {displayLow}°</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Overlay */}
              <div
                className={`inline-flex items-center gap-6 p-1.5 px-4 rounded-full border ${theme === "dark" ? "bg-white/5 border-white/5" : "bg-white/10 border-slate-200/60"} backdrop-blur-md`}
              >
                <div
                  className={`flex items-center gap-2 text-xs font-bold ${theme === "dark" ? "text-white/70" : "text-white"}`}
                >
                  <Thermometer size={14} className="text-orange-400" />
                  Feels Like{" "}
                  <span className={`text-white ml-1`}>{displayFeelsLike}°</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div
                  className={`flex items-center gap-2 text-xs font-bold ${theme === "dark" ? "text-white/70" : "text-white"}`}
                >
                  <Clock size={14} className="text-blue-400" />
                  Local Time{" "}
                  <span className={`text-white ml-1`}>
                    {getLocalTimeStr()}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Hero Icon */}
            <div className="flex-1 flex justify-center order-first xl:order-none">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <WeatherIcon
                  condition={current.weather[0].main}
                  className={`w-48 h-48 md:w-64 md:h-64 drop-shadow-[0_20px_40px_rgba(59,130,246,0.3)] transition-all duration-500`}
                />
                <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full scale-50" />
              </motion.div>
            </div>

            {/* Right: Sun Cycle */}
            <div className="flex-1 w-full space-y-4 max-w-sm">
              <div
                className={`p-6 rounded-[2.5rem] border ${theme === "dark" ? "bg-black/20 border-white/5" : "bg-white/10 border-slate-200/60"} backdrop-blur-md shadow-sm`}
              >
                <div className="flex items-center justify-center mb-6">
                  <span className={`text-xs font-bold text-white`}>
                    Astro Data
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      <img
                        src={sunriseIcon}
                        alt="Sunrise"
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <p className={`text-xs font-bold text-white`}>
                          Sunrise
                        </p>
                        <p className="text-lg font-bold text-white">
                          {getTimeStr(current.sys.sunrise)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`h-px w-full ${theme === "dark" ? "bg-white/5" : "bg-slate-200"}`}
                  />

                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      <img
                        src={sunsetIcon}
                        alt="Sunset"
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <p className={`text-xs font-bold text-white`}>Sunset</p>
                        <p className="text-lg font-bold text-white">
                          {getTimeStr(current.sys.sunset)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        <MetricCard
          icon={uvIcon}
          label="UV Index"
          value={details?.uv || 0}
          unit="Index"
          comment={
            details?.uv > 5
              ? "⚠️ Warning: Use strong SPF"
              : "✅ Safe: Normal exposure"
          }
          color="text-orange-500"
          theme={theme}
        />
        <MetricCard
          icon={windIcon}
          label="Wind Force"
          value={displayWind}
          unit={units.wind}
          comment={
            current.wind.speed > 5
              ? "💨 Noticeable breeze"
              : "🍃 Gentle air flow"
          }
          color="text-teal-400"
          theme={theme}
        />
        <MetricCard
          icon={humidityIcon}
          label="Humidity"
          value={current.main.humidity}
          unit="%"
          comment={
            current.main.humidity > 60
              ? "💧 High moisture"
              : current.main.humidity < 30
                ? "🏜️ Dry air"
                : "👍 Comfortable"
          }
          color="text-cyan-400"
          theme={theme}
        />
        <MetricCard
          icon={visibilityIcon}
          label="Visibility"
          value={displayVis}
          unit={units.distance}
          comment={
            current.visibility > 5000
              ? "🔭 Excellent clarity"
              : "🌫️ Limited sight"
          }
          color="text-blue-400"
          theme={theme}
        />
        <MetricCard
          icon={pressureIcon}
          label="Pressure"
          value={displayPressure}
          unit={units.pressure}
          comment={
            current.main.pressure > 1013
              ? "🔼 High pressure / Dry"
              : "🔽 Low pressure / Rain"
          }
          color="text-indigo-400"
          theme={theme}
        />
      </div>
    </div>
  );
};
