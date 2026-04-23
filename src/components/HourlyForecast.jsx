/**
 * HourlyForecast — Horizontally scrollable 48-hour forecast strip.
 * Displays hourly temperature, weather icons, and precipitation probability.
 * Features drag-to-scroll interaction and day/night icon differentiation.
 *
 * @param {Array} props.hourlyData - Hourly forecast array from OWM One Call 3.0
 * @param {Object} props.settings - User settings (theme, units)
 */
import React, { useRef, useState, useCallback } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

// Import Custom PNG Icons
import sunIcon from "../assets/icons/sun.png";
import moonIcon from "../assets/icons/moon.png";

import cloudIcon from "../assets/icons/cloud_10828610.png";
import rainIcon from "../assets/icons/rain.png";
import stormIcon from "../assets/icons/storm.png";
import snowIcon from "../assets/icons/snow.png";
import mistIcon from "../assets/icons/mist.png";

const getWeatherIcon = (condition, isNight) => {
  const iconMap = {
    Clear: isNight ? moonIcon : sunIcon,
    Clouds: cloudIcon,
    Rain: rainIcon,
    Drizzle: rainIcon,
    Thunderstorm: stormIcon,
    Snow: snowIcon,
    Mist: mistIcon,
    Fog: mistIcon,
    Haze: mistIcon,
    Smoke: mistIcon,
  };
  return iconMap[condition] || cloudIcon;
};



const convertTemp = (temp) => Math.round(temp);

// Hook for drag-to-scroll
const useDragScroll = () => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
    el.style.cursor = "grabbing";
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    if (ref.current) ref.current.style.cursor = "grab";
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      if (!isDragging || !ref.current) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      ref.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft],
  );

  // Allow mouse wheel to scroll horizontally
  const onWheel = useCallback((e) => {
    if (!ref.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      ref.current.scrollLeft += e.deltaY;
    }
  }, []);

  return {
    ref,
    onMouseDown,
    onMouseUp,
    onMouseMove,
    onMouseLeave: onMouseUp,
    onWheel,
  };
};

export const HourlyForecast = ({ hourlyData, settings }) => {
  const theme = settings.theme;
  const unit = settings.units.temp;

  if (!hourlyData || hourlyData.length === 0) return null;

  // Group hourly data by date (48 hours = ~2 days)
  const grouped = {};
  hourlyData.forEach((hour) => {
    const date = new Date(hour.dt * 1000);
    const dateKey = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(hour);
  });

  const now = new Date();

  return (
    <div
      className={`relative p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] border transition-all duration-500 ${
        theme === "dark"
          ? "bg-slate-900/900 border-white/10 shadow-2xl"
          : "bg-white/255 border-slate-200/80 shadow-xl"
      } backdrop-blur-3xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center mb-5">
        <div className="flex items-center gap-3">
          <Clock
            size={20}
            className={theme === "dark" ? "text-blue-400" : "text-white"}
          />
          <h3
            className={`text-lg font-bold ${theme === "dark" ? "text-blue-400" : "text-white"}`}
          >
            Hourly Forecast
          </h3>
        </div>
      </div>

      {/* Hourly rows grouped by day */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([dateKey, hours], groupIdx) => {
          const isToday =
            new Date(hours[0].dt * 1000).toDateString() === now.toDateString();

          return (
            <DayRow
              key={dateKey}
              dateKey={dateKey}
              hours={hours}
              isToday={isToday}
              groupIdx={groupIdx}
              theme={theme}
              unit={unit}
              now={now}
            />
          );
        })}
      </div>
    </div>
  );
};

// Separated DayRow so each row has its own drag-scroll ref
const DayRow = ({ dateKey, hours, isToday, groupIdx, theme, unit, now }) => {
  const dragScroll = useDragScroll();

  return (
    <div>
      {/* Date label with visible separator */}
      <div className="flex items-center gap-3 mb-3 px-1 ">
        <span
          className={`text-xs font-bold whitespace-nowrap ${
            isToday
              ? "text-white"
              : theme === "dark"
                ? "text-slate-500"
                : "text-slate-100"
          }`}
        >
          {isToday ? "Today" : dateKey}
        </span>
        <div
          className={`flex-1 h-[1.5px] ${
            theme === "dark" ? "bg-white" : "bg-slate-300"
          }`}
        />
      </div>

      {/* Scrollable hourly cards — drag + wheel scroll */}
      <div
        ref={dragScroll.ref}
        onMouseDown={dragScroll.onMouseDown}
        onMouseUp={dragScroll.onMouseUp}
        onMouseMove={dragScroll.onMouseMove}
        onMouseLeave={dragScroll.onMouseLeave}
        onWheel={dragScroll.onWheel}
        className="flex gap-4 overflow-x-auto pb-4 select-none"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: "grab",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`.hourly-row::-webkit-scrollbar { display: none; }`}</style>
        {hours.map((hour, idx) => {
          const date = new Date(hour.dt * 1000);
          const hourStr = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          const condition = hour.weather[0].main;
          const sunriseHour = 6;
          const sunsetHour = 18;
          const currentHour = date.getHours();
          const isNight =
            currentHour < sunriseHour || currentHour >= sunsetHour;
          const iconSrc = getWeatherIcon(condition, isNight);
          const temp = convertTemp(hour.temp, unit);

          const isCurrentHour =
            isToday &&
            date.getHours() === now.getHours() &&
            date.getDate() === now.getDate();

          return (
            <motion.div
              key={hour.dt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: (groupIdx * hours.length + idx) * 0.015,
              }}
              className={`flex-shrink-0 flex flex-col items-center gap-2 md:gap-3 px-5 md:px-7 py-4 md:py-5 rounded-2xl border transition-all duration-300 min-w-[95px] md:min-w-[120px] ${
                isCurrentHour
                  ? theme === "dark"
                    ? "bg-blue-500/20 border-blue-500/30"
                    : "bg-blue-600/50 border-blue-400"
                  : theme === "dark"
                    ? "bg-white/5 border-white/5 hover:bg-white/10"
                    : "bg-white/10 border-slate-200/60 hover:bg-white/40 shadow-sm"
              }`}
            >
              {/* Time */}
              <span
                className={`text-xs font-bold ${
                  isCurrentHour ? "text-white" : "text-white"
                }`}
              >
                {isCurrentHour ? "Now" : hourStr}
              </span>

              {/* Weather Icon */}
              <img
                src={iconSrc}
                alt={condition}
                className="w-7 h-7 object-contain"
              />

              {/* Temperature */}
              <span className="text-base font-bold tabular-nums text-white">
                {temp}°
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
