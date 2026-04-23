/**
 * Forecast — 8-day daily forecast component.
 * Renders a scrollable list of daily weather cards with condition icons,
 * hi/lo temperatures, and short descriptions. Supports theme-aware styling.
 *
 * @param {Object} props.data - Forecast data with list array
 * @param {Array} props.daily - Daily forecast array from OWM One Call 3.0
 * @param {Object} props.settings - User settings (theme, units)
 */
import { MessageSquareQuote, Thermometer } from "lucide-react";
import { motion } from "framer-motion";

// Import Custom PNG Icons
import sunIcon from "../assets/icons/sun.png";
import sunCloudIcon from "../assets/icons/sun-cloud.png";
import cloudIcon from "../assets/icons/cloud_10828610.png";
import rainIcon from "../assets/icons/rain.png";
import stormIcon from "../assets/icons/storm.png";
import snowIcon from "../assets/icons/snow.png";
import mistIcon from "../assets/icons/mist.png";

const ForecastIcon = ({ condition, className }) => {
  const iconMap = {
    Clear: sunIcon,
    Clouds: cloudIcon,
    Rain: rainIcon,
    Drizzle: rainIcon,
    Thunderstorm: stormIcon,
    Snow: snowIcon,
    Mist: mistIcon,
    Fog: mistIcon,
    Haze: mistIcon,
    "Partly Cloudy": sunCloudIcon,
  };
  const iconSrc = iconMap[condition] || cloudIcon;
  return <img src={iconSrc} alt={condition} className={className} />;
};

const convertTemp = (temp) => Math.round(temp);

export const Forecast = ({ data, daily, settings }) => {
  const theme = settings.theme;
  const unit = settings.units.temp;

  // Use daily from One Call 3.0 (8 days)
  const dailyForecast = daily || [];

  if (dailyForecast.length === 0) return null;

  // Get the overall summary if available
  const overallSummary = dailyForecast[0]?.summary;

  return (
    <div
      className={`relative p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border transition-all duration-500 ${
        theme === "dark"
          ? "bg-slate-900/900 border-white/10 shadow-2xl"
          : "bg-white/255 border-slate-200/80 shadow-xl"
      } backdrop-blur-3xl overflow-hidden`}
    >
      {/* Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Thermometer
              size={20}
              className={theme === "dark" ? "text-blue-400" : "text-white"}
            />
            <h3
              className={`text-lg font-bold ${theme === "dark" ? "text-blue-400" : "text-white"}`}
            >
              8-Day Forecast
            </h3>
          </div>
        </div>

        {overallSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-start gap-4 p-5 rounded-[2rem] border mb-8 ${
              theme === "dark"
                ? "bg-white/5 border-white/5 hover:bg-white/10"
                : "bg-white/10 border-slate-200/60 hover:bg-white/40 shadow-sm"
            }`}
          >
            <MessageSquareQuote
              size={20}
              className={`shrink-0 mt-0.5 md:mt-1 ${theme === "dark" ? "text-blue-500" : "text-white"}`}
            />
            <p
              className={`text-xs md:text-sm font-bold leading-relaxed italic text-wrap-balance ${theme === "dark" ? "text-blue-100" : "text-white"}`}
            >
              {overallSummary}
            </p>
          </motion.div>
        )}

        <div className="grid gap-4">
          {dailyForecast.map((day, idx) => {
            const maxTemp = convertTemp(day.temp?.max || 0, unit);
            const minTemp = convertTemp(day.temp?.min || 0, unit);
            const isToday = idx === 0;

            return (
              <motion.div
                key={day.dt}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group flex items-center justify-between px-3 py-3 md:p-4 rounded-3xl md:rounded-[2rem] border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-white/5 border-white/5 hover:bg-white/10"
                    : "bg-white/10 border-slate-200/60 hover:bg-white/40 shadow-sm"
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-[100px]">
                  <span
                    className={`text-sm font-bold ${isToday ? "text-white" : theme === "dark" ? "text-white" : "text-slate-100"}`}
                  >
                    {isToday
                      ? "Today"
                      : new Date(day.dt * 1000).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                  </span>
                  <span
                    className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-white"}`}
                  >
                    {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-4 flex-1 justify-center">
                  <div className="group-hover:scale-110 transition-transform">
                    <ForecastIcon
                      condition={day.weather[0].main}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span
                    className={`text-xs font-bold hidden md:block ${theme === "dark" ? "text-white" : "text-white"}`}
                  >
                    {day.weather[0].main}
                  </span>
                </div>

                <div className="flex items-center gap-5 min-w-[120px] justify-end">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold tabular-nums text-white">
                      {maxTemp}°
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${theme === "dark" ? "text-white" : "text-white"}`}
                    >
                      High
                    </span>
                  </div>

                  <div
                    className={`h-4 w-px ${theme === "dark" ? "bg-white/20" : "bg-slate-100/30"}`}
                  />

                  <div className="flex flex-col items-end">
                    <span
                      className={`text-sm font-semibold tabular-nums ${theme === "dark" ? "text-white" : "text-white"}`}
                    >
                      {minTemp}°
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${theme === "dark" ? "text-white" : "text-white"}`}
                    >
                      Low
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
