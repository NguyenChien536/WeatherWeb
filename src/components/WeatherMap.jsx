/**
 * WeatherMap — Interactive Windy-powered weather map with overlay controls.
 * Embeds Windy's iframe API with configurable overlays (Wind, Temp, Rain,
 * Clouds, Pressure) via a dropdown selector. Supports expand/collapse toggle
 * and responsive sizing with glassmorphism control styling.
 *
 * @param {Object} props.center - Map center coordinates { lat, lon }
 * @param {Object} props.settings - User settings (theme, units)
 */
import React, { useEffect, useRef, useState } from "react";
import {
  Wind,
  Thermometer,
  CloudRain,
  Cloud,
  Gauge,
  Maximize2,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WINDY_API_KEY = process.env.REACT_APP_WINDY_API_KEY;

const OVERLAY_OPTIONS = [
  { id: "wind", label: "Wind", icon: Wind, color: "text-teal-400" },
  { id: "temp", label: "Temp", icon: Thermometer, color: "text-orange-500" },
  { id: "rain", label: "Rain", icon: CloudRain, color: "text-blue-500" },
  { id: "clouds", label: "Clouds", icon: Cloud, color: "text-slate-400" },
  { id: "pressure", label: "Pressure", icon: Gauge, color: "text-purple-500" },
];

export const WeatherMap = ({ center, settings }) => {
  const iframeRef = useRef(null);
  const [activeOverlay, setActiveOverlay] = useState("wind");
  const [isExpanded, setIsExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const theme = settings.theme;
  const units = settings.units;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const activeOption = OVERLAY_OPTIONS.find((o) => o.id === activeOverlay);

  const getWindyUrl = () => {
    const lat = center?.lat || 21.028;
    const lon = center?.lon || 105.854;

    // Windy metrics options: metricRain (mm, in), metricTemp (°C, °F), metricWind (kt, km/h, m/s, mph, bft)
    const tempUnit = units.temp === "F" ? "°F" : "°C";
    const windUnit =
      units.wind === "m/s" ? "m/s" : units.wind === "mph" ? "mph" : "km/h";
    const rainUnit = units.precip === "in" ? "in" : "mm";

    return `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=${rainUnit}&metricTemp=${tempUnit}&metricWind=${windUnit}&zoom=7&overlay=${activeOverlay}&product=ecmwf&level=surface&lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&marker=true&message=true&calendar=now&pressure=true&type=map&menu=&forecast=12&key=${WINDY_API_KEY}`;
  };

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = getWindyUrl();
    }
  }, [activeOverlay, center, units]);

  return (
    <div
      className={`relative w-full transition-all duration-700 ease-in-out ${isExpanded ? "h-[700px]" : "h-[500px]"} rounded-[2rem] overflow-hidden border transition-all duration-500 shadow-2xl hover:shadow-xl hover:scale-[1.002] mb-4 ${
        theme === "dark"
          ? "border-white/5 bg-slate-900/40 shadow-black/50"
          : "border-slate-200 bg-white shadow-slate-200/50"
      } backdrop-blur-3xl group`}
    >
      {/* Map Embed */}
      <iframe
        ref={iframeRef}
        title="Dynamic Weather Map"
        src={getWindyUrl()}
        className="absolute inset-0 w-full h-full border-0 grayscale-[0.2] contrast-[1.1]"
        loading="lazy"
        allow="fullscreen"
      />

      {/* Glass Overlay Controls */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 rounded-2xl border backdrop-blur-2xl transition-all ${
              theme === "dark"
                ? "bg-slate-900/80 border-white/10 text-white hover:bg-slate-800/90"
                : "bg-white/80 border-slate-200 text-slate-800 hover:bg-slate-50 shadow-lg"
            }`}
          >
            <activeOption.icon
              size={isMobile ? 14 : 18}
              className={activeOption.color}
            />
            <span className="text-[10px] md:text-xs font-bold">
              {activeOption.label}
            </span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute top-full left-0 mt-2 w-32 md:w-30 p-2 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 ${
                  theme === "dark"
                    ? "bg-slate-900/90 border-white/10"
                    : "bg-white/90 border-slate-200"
                }`}
              >
                {OVERLAY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setActiveOverlay(opt.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 md:gap-3 w-full p-2 md:p-2.5 rounded-xl text-left transition-colors ${
                      activeOverlay === opt.id
                        ? theme === "dark"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                        : theme === "dark"
                          ? "hover:bg-white/5 text-slate-400"
                          : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <opt.icon
                      size={isMobile ? 14 : 16}
                      className={
                        activeOverlay === opt.id ? opt.color : "text-current"
                      }
                    />
                    <span className="text-[10px] md:text-xs font-bold">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl border backdrop-blur-2xl transition-all duration-300 ${
            theme === "dark"
              ? "bg-slate-900/80 border-white/10 text-slate-400 hover:text-white"
              : "bg-white/80 border-slate-200 text-slate-600 hover:text-blue-600 shadow-lg"
          }`}
        >
          <Maximize2
            size={isMobile ? 16 : 18}
            className={isExpanded ? "rotate-180" : ""}
          />
        </button>
      </div>
      {/* Map Decoration Mask */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-current/10 to-transparent pointer-events-none" />
    </div>
  );
};
