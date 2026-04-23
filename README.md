# ☀️ WeatherNow

A modern, responsive weather dashboard built with **React 19**, **Tailwind CSS**, and **Recharts**. Integrates 3 weather APIs to deliver real-time data, interactive charts, and a dynamic video-powered UI.

## ✨ Features

- 🌡️ **Real-time Weather** — Current conditions with dynamic video backgrounds
- 📊 **Interactive Charts** — 24-hour forecast with 6 switchable metrics (Recharts)
- 🗺️ **Live Weather Map** — Windy-powered interactive map with overlay controls
- 📅 **8-Day Forecast** — Daily forecast with custom weather icons
- ⏰ **48-Hour Hourly** — Drag-to-scroll hourly forecast strip
- 🎨 **Dark/Light Theme** — Full dual-theme support with smooth transitions
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop
- 🔍 **Smart Search** — Autocomplete city search with debounce & geolocation
- ⚙️ **Unit Settings** — Configurable temperature, wind, pressure, distance units
- 💾 **Saved Cities** — localStorage-persisted favorite locations

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Tailwind CSS | Utility-first styling |
| Recharts | Data visualization |
| Framer Motion | Animations |
| Axios | HTTP client |
| Lucide React | Icon library |

## 🌐 APIs Used

| API | Version | Data Provided |
|---|---|---|
| OpenWeatherMap | One Call 3.0 | Current, hourly, daily weather |
| WeatherAPI.com | v1 | UV index, AQI, search suggestions |
| Windy | v2 | Interactive map, wind forecast |

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- yarn or npm

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd weather-web

# 2. Install dependencies
yarn install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# 4. Start development server
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
src/
├── api/
│   └── weatherService.js    # Centralized API service layer
├── hooks/
│   ├── useWeather.js        # Main weather data hook
│   ├── useWeatherVideo.js   # Weather-based video mapping
│   └── useDebounce.js       # Input debounce utility
├── components/
│   ├── WeatherCard.jsx      # Hero card with video background
│   ├── WeatherChart.jsx     # Interactive forecast chart
│   ├── WeatherMap.jsx       # Windy map integration
│   ├── Forecast.jsx         # 8-day daily forecast
│   ├── HourlyForecast.jsx   # 48-hour scrollable strip
│   ├── HeaderControls.jsx   # Clock, theme toggle, favorites
│   ├── SearchBar.jsx        # Search with autocomplete
│   ├── SettingsMenu.jsx     # Unit & theme settings
│   ├── MediaBackground.jsx  # Global video/image background
│   ├── LifestyleActivities.jsx  # Activity recommendations
│   └── StatusStates.jsx     # Loading & error states
├── assets/
│   ├── icons/               # Custom PNG weather icons
│   └── backgrounds/         # Background images
├── App.js                   # Root orchestrator
├── index.js                 # Entry point
└── index.css                # Global styles & Tailwind imports
```

## 👨‍💻 Author

IWS Midterm Application — © 2026 WeatherNow
