import React, { useState, useCallback } from "react";
import bgDay from "../assets/backgrounds/day.jpg";

/**
 * MediaBackground — Global fullscreen background.
 * Depends ONLY on theme (light/dark), NOT weather data.
 * - Light theme → Static image (day.jpg)
 * - Dark theme → Nighttime sky video
 * - Semi-transparent scrim overlay for text readability
 * - Smooth transition when switching theme
 */

const THEME_MEDIA = Object.freeze({
  light: { type: "image", src: bgDay },
  dark: {
    type: "video",
    src: "https://assets.mixkit.co/videos/39768/39768-720.mp4",
  },
});

const THEME_SCRIMS = Object.freeze({
  light: "from-sky-100/50 via-slate-100/20 to-slate-200/60",
  dark: "from-slate-950/200 via-indigo-950/30 to-black/70",
});

const THEME_FALLBACK_BG = Object.freeze({
  light: "bg-sky-200",
  dark: "bg-slate-950",
});

export const MediaBackground = ({ theme }) => {
  const [videoError, setVideoError] = useState(false);
  const themeKey = theme === "dark" ? "dark" : "light";
  const media = THEME_MEDIA[themeKey];

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-1000 ${
        theme === "dark" ? "bg-black" : "bg-slate-100"
      }`}
    >
      {/* Background Media */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        {media.type === "video" && !videoError ? (
          <video
            key={media.src}
            autoPlay
            muted
            loop
            playsInline
            onError={handleVideoError}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          >
            <source src={media.src} type="video/mp4" />
          </video>
        ) : media.type === "image" ? (
          <img
            src={media.src}
            alt="background"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          />
        ) : null}
      </div>

      {/* Fallback gradient when video fails or no media type matched */}
      {videoError && media.type === "video" && (
        <div
          className={`absolute inset-0 ${THEME_FALLBACK_BG[themeKey]} transition-all duration-1000`}
        />
      )}
    </div>
  );
};
