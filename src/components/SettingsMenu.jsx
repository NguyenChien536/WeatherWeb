/**
 * SettingsMenu — Gear-icon activated settings panel with slide-in animation.
 * Allows users to configure: theme (dark/light), temperature unit (°C/°F),
 * wind speed unit, pressure unit, distance unit, and precipitation unit.
 * Includes a "Reset to Default" option. Uses click-outside detection.
 *
 * @param {Object} props.settings - Current user settings
 * @param {Function} props.updateSettings - Callback to persist setting changes
 * @param {Function} props.resetToDefault - Callback to restore defaults
 */
import React, { useState, useRef, useEffect } from "react";
import {
  Settings,
  Moon,
  Sun,
  RotateCcw,
  ChevronRight,
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SettingsMenu = ({ settings, updateSettings, resetToDefault }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  };

  const handleUnitChange = (category, value) => {
    updateSettings({
      units: {
        ...settings.units,
        [category]: value,
      },
    });
  };

  const unitOptions = {
    temp: [
      { label: "Celsius (°C)", value: "C" },
      { label: "Fahrenheit (°F)", value: "F" },
    ],
    wind: [
      { label: "m/s", value: "m/s" },
      { label: "km/h", value: "km/h" },
      { label: "mph", value: "mph" },
    ],
    precip: [
      { label: "mm", value: "mm" },
      { label: "inches", value: "in" },
    ],
    pressure: [
      { label: "hPa", value: "hPa" },
      { label: "mbar", value: "mbar" },
      { label: "inHg", value: "inHg" },
    ],
    distance: [
      { label: "km", value: "km" },
      { label: "miles", value: "mi" },
    ],
  };

  const categories = [
    { id: "temp", label: "Temperature", icon: Thermometer },
    { id: "wind", label: "Wind Speed", icon: Wind },
    { id: "precip", label: "Precipitation", icon: Droplets },
    { id: "pressure", label: "Pressure", icon: Gauge },
    { id: "distance", label: "Visibility", icon: Eye },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3.5 rounded-2xl transition-all duration-300 ${
          settings.theme === "dark"
            ? "bg-slate-800/80 hover:bg-slate-700 text-slate-300"
            : "bg-white/80 hover:bg-slate-100 text-slate-900 shadow-sm"
        } border border-white/10 backdrop-blur-xl group`}
        aria-label="Settings"
      >
        <Settings
          className={`w-6 h-6 group-hover:rotate-90 transition-transform duration-500`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute right-0 mt-3 w-80 p-4 rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-2xl z-50 ${
              settings.theme === "dark"
                ? "bg-slate-900/100 text-white"
                : "bg-white/95 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="font-bold text-lg">Settings</h3>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-colors ${
                  settings.theme === "dark"
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {settings.theme === "dark" ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} className="text-slate-900" />
                )}
              </button>
            </div>

            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-900">
                    <cat.icon size={12} />
                    {cat.label}
                  </div>
                  <div
                    className={`grid grid-cols-${unitOptions[cat.id].length} gap-2 p-1 rounded-xl ${settings.theme === "dark" ? "bg-black/20" : "bg-slate-200"}`}
                  >
                    {unitOptions[cat.id].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleUnitChange(cat.id, opt.value)}
                        className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                          settings.units[cat.id] === opt.value
                            ? settings.theme === "dark"
                              ? "bg-blue-600 text-white shadow-lg"
                              : "bg-white text-blue-600 shadow-md"
                            : settings.theme === "dark"
                              ? "text-white hover:text-slate-300"
                              : "text-slate-900 hover:text-slate-600"
                        }`}
                      >
                        {opt.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`h-px w-full my-6 ${settings.theme === "dark" ? "bg-white/5" : "bg-slate-900"}`}
            />

            <button
              onClick={() => {
                resetToDefault();
                setIsOpen(false);
              }}
              className={`w-full py-4 flex items-center justify-center gap-2 rounded-2xl transition-all font-bold text-sm ${
                settings.theme === "dark"
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "bg-red-90/80 text-red-600 hover:bg-red-200"
              }`}
            >
              <RotateCcw size={16} />
              Reset to Defaults
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
