/**
 * WeatherChart — Interactive 24-hour precision forecast chart powered by Recharts.
 * Supports multiple metrics (Temperature, Humidity, Wind, UV, Visibility, Pressure)
 * with animated area fills, responsive axes, custom tick components, and
 * a dropdown metric selector. Mobile-optimized with scaled fonts and icons.
 *
 * @param {Array} props.data - Hourly forecast list from OWM One Call 3.0
 * @param {Object} props.currentData - Full weather data object (for current values)
 * @param {Object} props.settings - User settings (theme, units)
 */
import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Thermometer,
  Wind as WindIcon,
  Droplets,
  Eye,
  Gauge,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import Custom PNG Icons
import sunIcon from "../assets/icons/sun.png";
import moonIcon from "../assets/icons/moon.png";
import sunCloudIcon from "../assets/icons/sun-cloud.png";
import cloudIcon from "../assets/icons/cloud_10828610.png";
import rainIcon from "../assets/icons/rain.png";
import stormIcon from "../assets/icons/storm.png";
import snowIcon from "../assets/icons/snow.png";
import mistIcon from "../assets/icons/mist.png";
import uvIconPng from "../assets/icons/uv.png";

// Weather Icon Helper — returns PNG src
const getWeatherIconSrc = (weatherId, isDay) => {
  if (weatherId >= 200 && weatherId < 300) return stormIcon;
  if (weatherId >= 300 && weatherId < 600) return rainIcon;
  if (weatherId >= 600 && weatherId < 700) return snowIcon;
  if (weatherId >= 700 && weatherId < 800) return mistIcon;
  if (weatherId === 800) return isDay ? sunIcon : moonIcon;
  if (weatherId === 801 || weatherId === 802)
    return isDay ? sunCloudIcon : moonIcon;
  return cloudIcon;
};

const getWindDirectionIcon = (deg) => (
  <ArrowUp
    size={16}
    className="text-teal-400"
    style={{ transform: `rotate(${deg}deg)` }}
  />
);

const METRICS = [
  { id: "temp", name: "Temperature", icon: Thermometer, color: "#f97316" },
  { id: "feels_like", name: "Feels Like", icon: Thermometer, color: "#fb923c" },
  {
    id: "uv",
    name: "UV Index",
    icon: null,
    iconPng: uvIconPng,
    color: "#a855f7",
  },
  { id: "wind", name: "Wind", icon: WindIcon, color: "#2dd4bf" },
  { id: "humidity", name: "Humidity", icon: Droplets, color: "#0ea5e9" },
  { id: "visibility", name: "Visibility", icon: Eye, color: "#f8fafc" },
  { id: "pressure", name: "Pressure", icon: Gauge, color: "#c084fc" },
];

export const WeatherChart = ({ data, currentData, settings }) => {
  const [metricId, setMetricId] = useState("temp");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const theme = settings.theme;
  const units = settings.units;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Unit Conversion
  const convertValue = (val, type) => {
    switch (type) {
      case "temp":
      case "feels_like":
        return val; // OWM API already returns F if requested, no double conversion needed
      case "wind":
        if (units.temp === "F") {
          // API was Imperial, so Wind is in mph out-of-the-box
          if (units.wind === "mph") return val;
          if (units.wind === "km/h") return val * 1.60934;
          if (units.wind === "m/s") return val * 0.44704;
        } else {
          // API was Metric, so Wind is in m/s out-of-the-box
          if (units.wind === "km/h") return val * 3.6;
          if (units.wind === "mph") return val * 2.2374;
          return val;
        }
        return val;
      case "visibility":
        return units.distance === "mi" ? (val / 1000) * 0.621371 : val / 1000;
      case "pressure":
        if (units.pressure === "inHg") return val * 0.02953;
        return val;
      default:
        return val;
    }
  };

  const truncateData = useMemo(() => {
    return (data || []).slice(0, 24);
  }, [data]);

  // Calculate current time label for the reference line
  // We compute this directly since it's just a string and avoids hook dependency chains
  const nowTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const chartData = useMemo(() => {
    if (!truncateData.length) return [];
    return truncateData.map((item) => {
      const isDay =
        item.dt >= currentData?.current?.sys?.sunrise &&
        item.dt < currentData?.current?.sys?.sunset;
      let rawVal = 0;

      if (metricId === "temp") rawVal = item.main.temp;
      else if (metricId === "feels_like") rawVal = item.main.feels_like;
      else if (metricId === "wind") rawVal = item.wind.speed;
      else if (metricId === "humidity") rawVal = item.main.humidity;
      else if (metricId === "visibility") rawVal = item.visibility;
      else if (metricId === "pressure") rawVal = item.main.pressure;
      else if (metricId === "uv") rawVal = item.uv || 0;

      return {
        time: new Date(item.dt * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: parseFloat(convertValue(rawVal, metricId).toFixed(1)),
        weatherId: item.weather?.[0]?.id || 800,
        isDay,
        windDeg: item.wind?.deg || 0,
      };
    });
  }, [truncateData, metricId, units, currentData]);

  // Find the closest time label in chartData to current time
  const closestTimeLabel = useMemo(() => {
    if (!chartData || !chartData.length) return null;
    // Find exact match first
    const exact = chartData.find((d) => d.time === nowTime);
    if (exact) return exact.time;
    // Otherwise find the closest
    const now = new Date();
    let minDiff = Infinity;
    let closest = chartData[0].time;
    chartData.forEach((d) => {
      if (!d.time) return;
      const [h, m] = d.time.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return;
      const diff = Math.abs(
        now.getHours() * 60 + now.getMinutes() - (h * 60 + m),
      );
      if (diff < minDiff) {
        minDiff = diff;
        closest = d.time;
      }
    });
    return closest;
  }, [chartData, nowTime]);

  if (!data || data.length === 0) return null;

  const currentMetric = METRICS.find((m) => m.id === metricId);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${theme === "dark" ? "bg-slate-900/90 border-white/10 text-white" : "bg-white/90 border-slate-200 text-slate-800"}`}
        >
          <p className="text-[10px] font-bold text-slate-500 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full`}
              style={{ backgroundColor: currentMetric.color }}
            />
            <span className="text-lg font-bold">{payload[0].value}</span>
            <span className="text-xs font-bold text-slate-500">
              {metricId === "temp" || metricId === "feels_like"
                ? `°${units.temp}`
                : metricId === "wind"
                  ? units.wind
                  : metricId === "visibility"
                    ? units.distance
                    : metricId === "pressure"
                      ? units.pressure
                      : metricId === "humidity"
                        ? "%"
                        : ""}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const TopXAxisTick = ({ x, y, payload, index }) => {
    const d = chartData.find((item) => item.time === payload.value);
    if (!d) return null;

    if (metricId === "wind") {
      return (
        <g transform={`translate(${x},${y - (isMobile ? 14 : 20)})`}>
          <foreignObject x={isMobile ? "-6" : "-10"} y="0" width={isMobile ? "12" : "20"} height={isMobile ? "12" : "20"}>
            <div className="flex justify-center flex-col items-center gap-1">
              <ArrowUp
                size={isMobile ? 12 : 16}
                className="text-teal-400"
                style={{ transform: `rotate(${d.windDeg}deg)` }}
              />
            </div>
          </foreignObject>
        </g>
      );
    }

    if (metricId === "uv") {
      return (
        <g transform={`translate(${x},${y - 12})`}>
          <text
            x={0}
            y={0}
            dy={0}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={13}
            fontWeight="bold"
          >
            {d.value}
          </text>
        </g>
      );
    }

    if (metricId === "humidity") {
      return (
        <g transform={`translate(${x},${y - 12})`}>
          <text
            x={0}
            y={0}
            dy={0}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={12}
            fontWeight="bold"
          >
            {d.value}%
          </text>
        </g>
      );
    }

    if (metricId === "visibility") {
      return (
        <g transform={`translate(${x},${y - 12})`}>
          <text
            x={0}
            y={0}
            dy={0}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={11}
            fontWeight="bold"
          >
            {d.value} {units.distance}
          </text>
        </g>
      );
    }

    if (metricId === "pressure") {
      const prevD = index > 0 ? chartData[index - 1] : d;
      return (
        <g transform={`translate(${x},${y - (isMobile ? 14 : 20)})`}>
          <foreignObject x={isMobile ? "-6" : "-8"} y="0" width={isMobile ? "12" : "16"} height={isMobile ? "12" : "16"}>
            <div className="flex justify-center flex-col items-center text-white">
              {d.value > prevD.value ? (
                <ArrowUp size={isMobile ? 12 : 16} />
              ) : d.value < prevD.value ? (
                <ArrowDown size={isMobile ? 12 : 16} />
              ) : (
                <Minus size={isMobile ? 12 : 16} />
              )}
            </div>
          </foreignObject>
        </g>
      );
    }

    const iconSrc = getWeatherIconSrc(d.weatherId, d.isDay);
    return (
      <g transform={`translate(${x},${y - (isMobile ? 16 : 24)})`}>
        <foreignObject x={isMobile ? "-8" : "-12"} y="0" width={isMobile ? "16" : "24"} height={isMobile ? "16" : "24"}>
          <img
            src={iconSrc}
            alt=""
            style={{ width: isMobile ? 16 : 24, height: isMobile ? 16 : 24, objectFit: "contain" }}
          />
        </foreignObject>
      </g>
    );
  };

  // Render metric icon (PNG or Lucide)
  const renderMetricIcon = (m, size = 20) => {
    if (m.iconPng) {
      return (
        <img
          src={m.iconPng}
          alt={m.name}
          style={{ width: size, height: size, objectFit: "contain" }}
        />
      );
    }
    if (m.icon) {
      const Icon = m.icon;
      return <Icon size={size} style={{ color: m.color }} />;
    }
    return null;
  };

  const BottomXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={12}
          textAnchor="middle"
          fill={theme === "dark" ? "#cbd5e1" : "#ffffff"}
          style={{ fontSize: isMobile ? "8px" : "10px", fontWeight: 700 }}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div
      className={`relative px-2 py-4 md:p-6 lg:p-8 rounded-[2rem] md:rounded-[3rem] border transition-all duration-400 h-full ${
        theme === "dark"
          ? "bg-slate-900 border-white/10 shadow-2xl"
          : "bg-white/10 border-slate-200/80 shadow-xl"
      } backdrop-blur-3xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-2 mb-0 md:mb-10">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-1.5 md:gap-3 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl border transition-all ${
              theme === "dark"
                ? "bg-white/5 border-white/10 hover:bg-white/10"
                : "bg-slate-100/80 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {renderMetricIcon(currentMetric, 14)}
            <span className="font-bold text-[11px] md:text-sm">
              {currentMetric.name}
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
                className={`absolute top-full left-0 mt-2 w-56 p-2 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 ${
                  theme === "dark"
                    ? "bg-slate-900 border-white/10"
                    : "bg-white border-slate-200"
                }`}
              >
                {METRICS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMetricId(m.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-colors ${
                      metricId === m.id
                        ? theme === "dark"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                        : theme === "dark"
                          ? "hover:bg-white/5 text-slate-400"
                          : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {renderMetricIcon(m, 16)}
                    <span className="text-xs font-bold">{m.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-white">
            <p className="text-[11px] font-bold leading-none mb-1.5 opacity-80">
              Current
            </p>
            <p className="text-xl md:text-3xl font-bold tabular-nums">
              {chartData[0]?.value || 0}
              <span className="text-sm ml-1 font-bold opacity-80">
                {metricId.includes("temp")
                  ? `°${units.temp}`
                  : metricId === "humidity"
                    ? "%"
                    : metricId === "visibility"
                      ? units.distance
                      : metricId === "wind"
                        ? units.wind
                        : metricId === "pressure"
                          ? units.pressure
                          : ""}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] md:h-[350px] lg:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 30, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={currentMetric.color}
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor={currentMetric.color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="5 4"
              vertical={false}
              stroke={theme === "dark" ? "#ffffff71" : "#ffffff60 "}
            />
            <XAxis
              dataKey="time"
              hide={false}
              axisLine={false}
              tickLine={false}
              interval={2}
              tick={<BottomXAxisTick />}
            />
            <XAxis
              xAxisId="top"
              dataKey="time"
              orientation="top"
              axisLine={false}
              tickLine={false}
              interval={2}
              tick={<TopXAxisTick />}
            />
            <YAxis
              hide={false}
              domain={["dataMin - 2", "dataMax + 2"]}
              axisLine={false}
              tickLine={false}
              width={45}
              tickFormatter={(val) => {
                if (metricId === "humidity") return `${val}%`;
                if (metricId === "visibility")
                  return `${val} ${units.distance}`;
                return val;
              }}
              tick={{
                fill: "#ffffff",
                fontSize: isMobile ? 8 : 11,
                fontWeight: 600,
              }}
            />
            {/* Current Time Reference Line */}
            {closestTimeLabel && (
              <ReferenceLine
                x={closestTimeLabel}
                stroke={theme === "dark" ? "#60a5fa" : "#2563eb"}
                strokeWidth={2}
                strokeDasharray="6 4"
                label={{
                  value: "Now",
                  position: "top",
                  fill: theme === "dark" ? "#60a5fa" : "#2563eb",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
            )}
            <RechartsTooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: currentMetric.color,
                strokeWidth: 2,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={currentMetric.color}
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#chartGradient)"
              animationDuration={1500}
              activeDot={{
                r: 8,
                stroke: theme === "dark" ? "#0f172a" : "#fff",
                strokeWidth: 3,
                fill: currentMetric.color,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="hidden md:block absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1.5 text-[12px] font-bold text-white">
        24-Hour Precision Forecast
      </div>
    </div>
  );
};
