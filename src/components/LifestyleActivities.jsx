/**
 * LifestyleActivities — Activity recommendation cards based on current weather.
 * Evaluates temperature, humidity, wind, and UV to suggest outdoor/indoor activities
 * with dynamic comfort scores and contextual advice.
 *
 * @param {Object} props.current - Current weather data
 * @param {Object} props.details - Detailed indices (UV, AQI) from WeatherAPI
 * @param {Object} props.settings - User settings (theme, units)
 */
import React from "react";
import { motion } from "framer-motion";
import { Activity, Car, CarFront, Sun } from "lucide-react";

export const LifestyleActivities = ({ current, details, settings }) => {
  const theme = settings.theme;
  const isDark = theme === "dark";

  if (!current) return null;

  // Simple logic to determine indices
  const tempStr =
    settings.units.temp === "F"
      ? ((current.main.temp - 32) * 5) / 9 // approximate to C for logic
      : current.main.temp;
  const condition = current.weather[0]?.main || "Clear";
  const uv = details?.uv || 0;

  const isRaining = ["Rain", "Drizzle", "Thunderstorm"].includes(condition);
  const isSnowing = condition === "Snow";

  const getRunningIndex = () => {
    if (isRaining || isSnowing)
      return {
        status: "Poor",
        color: "text-red-400",
        message: "Too wet or cold to run comfortably.",
      };
    if (tempStr > 32)
      return {
        status: "Poor",
        color: "text-orange-400",
        message: "Extreme heat, risk of exhaustion.",
      };
    if (tempStr > 25)
      return {
        status: "Fair",
        color: "text-yellow-400",
        message: "Warm, stay hydrated.",
      };
    if (tempStr < 5)
      return {
        status: "Fair",
        color: "text-blue-300",
        message: "Cold, wrap up warm.",
      };
    return {
      status: "Excellent",
      color: "text-green-400",
      message: "Perfect weather for a run!",
    };
  };

  const getCarWashIndex = () => {
    if (isRaining || isSnowing)
      return {
        status: "Poor",
        color: "text-red-400",
        message: "Precipitating, dirt will return.",
      };
    return {
      status: "Good",
      color: "text-green-400",
      message: "Great time to clean your car.",
    };
  };

  const getDrivingIndex = () => {
    if (condition === "Fog" || condition === "Mist")
      return {
        status: "Poor",
        color: "text-red-400",
        message: "Low visibility, drive with caution.",
      };
    if (isRaining || isSnowing)
      return {
        status: "Fair",
        color: "text-orange-400",
        message: "Slippery roads, slow down.",
      };
    return {
      status: "Good",
      color: "text-green-400",
      message: "Clear roads, safe driving conditions.",
    };
  };

  const getUVIndex = () => {
    if (uv > 7)
      return {
        status: "Extreme",
        color: "text-red-400",
        message: "Avoid sun exposure, wear SPF 50+.",
      };
    if (uv > 3)
      return {
        status: "Moderate",
        color: "text-orange-400",
        message: "Apply sunscreen if outdoors.",
      };
    return {
      status: "Low",
      color: "text-green-400",
      message: "Safe to be outdoors without protection.",
    };
  };

  const activities = [
    {
      id: "running",
      label: "Running",
      icon: Activity,
      data: getRunningIndex(),
    },
    { id: "carwash", label: "Car Wash", icon: Car, data: getCarWashIndex() },
    {
      id: "driving",
      label: "Driving",
      icon: CarFront,
      data: getDrivingIndex(),
    },
    { id: "uv", label: "UV Protection", icon: Sun, data: getUVIndex() },
  ];

  return (
    <div
      className={`relative p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border transition-all duration-500 ${
        isDark
          ? "bg-slate-900/900 border-white/10 shadow-2xl"
          : "bg-white/255 border-slate-200/80 shadow-xl"
      } backdrop-blur-3xl overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-base font-bold text-white`}>
          Lifestyle & Activities
        </h3>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {activities.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-col gap-2 md:gap-3 p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all duration-300 ${
                isDark
                  ? "bg-white/5 border-white/5 hover:bg-white/10"
                  : "bg-white/10 border-slate-200/60 hover:bg-white/40 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${isDark ? "bg-white/10" : "bg-white/50"}`}
                >
                  <Icon
                    size={18}
                    className={isDark ? "text-slate-200" : "text-slate-900"}
                  />
                </div>
                <span className={`text-sm font-semibold text-white`}>
                  {item.label}
                </span>
              </div>

              <div className="mt-1">
                <span className={`text-base font-bold ${item.data.color}`}>
                  {item.data.status}
                </span>
                <p
                  className={`text-[11px] font-medium mt-1 leading-snug ${isDark ? "text-slate-300" : "text-slate-200"}`}
                >
                  {item.data.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
