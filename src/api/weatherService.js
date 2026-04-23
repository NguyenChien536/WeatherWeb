/**
 * weatherService — Centralized API service layer.
 * Handles all HTTP communication with 3 external APIs:
 *   1. OpenWeatherMap One Call 3.0 (current + hourly + daily weather)
 *   2. WeatherAPI.com (UV index, AQI, search suggestions)
 *   3. Windy API v2 (point wind forecast)
 *
 * Uses axios instances with pre-configured base URLs and API keys.
 * All methods include error handling with user-friendly messages.
 */
import axios from 'axios';

// API keys loaded from environment variables (.env file)
const OWM_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const WINDY_API_KEY = process.env.REACT_APP_WINDY_API_KEY;

/** Axios instance for OpenWeatherMap One Call 3.0 API */
const owmClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/3.0',
  params: {
    appid: OWM_API_KEY,
  },
});

/** Axios instance for OpenWeatherMap Geocoding API (city name ↔ coordinates) */
const geoClient = axios.create({
  baseURL: 'https://api.openweathermap.org/geo/1.0',
  params: {
    appid: OWM_API_KEY,
  },
});

/** Axios instance for WeatherAPI.com (UV, AQI, search autocomplete) */
const weatherApiClient = axios.create({
  baseURL: 'https://api.weatherapi.com/v1',
  params: {
    key: WEATHER_API_KEY,
  },
});

export const weatherService = {
  // Get coordinates from city name
  async getCoordinates(query) {
    try {
      const response = await geoClient.get('/direct', {
        params: { q: query, limit: 1 }
      });
      if (response.data && response.data.length > 0) {
        return {
          lat: response.data[0].lat,
          lon: response.data[0].lon,
          name: response.data[0].name,
          country: response.data[0].country
        };
      }
      throw new Error('City not found');
    } catch (error) {
      this.handleApiError(error);
    }
  },

  // Reverse geocoding for coordinates
  async getCityName(lat, lon) {
    try {
      const response = await geoClient.get('/reverse', {
        params: { lat, lon, limit: 1 }
      });
      if (response.data && response.data.length > 0) {
        const n = response.data[0].name;
        const c = response.data[0].country;
        return c ? `${n}, ${c}` : n;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Get current weather and forecast from OWM One Call 3.0
  async getWeatherData(query, units = 'metric') {
    try {
      let lat, lon, cityName;

      if (typeof query === 'object' && query.lat && query.lon) {
        lat = query.lat;
        lon = query.lon;
        cityName = query.name;
        
        if (!cityName) {
          try {
            const revCoords = await this.getCityName(lat, lon);
            if (revCoords) cityName = revCoords;
          } catch (e) { }
        }
      } else {
        const coords = await this.getCoordinates(query);
        lat = coords.lat;
        lon = coords.lon;
        cityName = coords.country ? `${coords.name}, ${coords.country}` : coords.name;
      }

      const response = await owmClient.get('/onecall', {
        params: {
          lat,
          lon,
          units,
          exclude: 'minutely',
        },
      });

      // Map One Call 3.0 data to a structure similar to what the app expects, 
      // but enhanced with new features
      return {
        current: {
          ...response.data.current,
          name: cityName || response.data.timezone,
          coord: { lat, lon },
          weather: response.data.current.weather,
          main: {
            temp: response.data.current.temp,
            feels_like: response.data.current.feels_like,
            temp_max: response.data.daily[0].temp.max,
            temp_min: response.data.daily[0].temp.min,
            pressure: response.data.current.pressure,
            humidity: response.data.current.humidity,
          },
          wind: {
            speed: response.data.current.wind_speed,
            deg: response.data.current.wind_deg,
          },
          sys: {
            sunrise: response.data.current.sunrise,
            sunset: response.data.current.sunset,
          },
          timezone: response.data.timezone,
          timezone_offset: response.data.timezone_offset,
        },
        hourly: response.data.hourly,
        daily: response.data.daily,
        alerts: response.data.alerts || [],
        // Backward compatibility for components expecting forecast.list
        forecast: {
          list: response.data.hourly.map(hour => ({
            dt: hour.dt,
            main: {
              temp: hour.temp,
              feels_like: hour.feels_like,
              pressure: hour.pressure,
              humidity: hour.humidity,
            },
            weather: hour.weather,
            wind: {
              speed: hour.wind_speed,
              deg: hour.wind_deg,
            },
            clouds: { all: hour.clouds },
            visibility: hour.visibility,
            pop: hour.pop,
          }))
        }
      };
    } catch (error) {
      this.handleApiError(error);
    }
  },

  handleApiError(error) {
    if (error.response) {
      const { status, data } = error.response;
      let message = 'An error occurred with the Weather service.';
      
      if (status === 401) {
        message = 'Invalid API Key. Please check your OpenWeatherMap API key in the .env file.';
      } else if (status === 403) {
        message = 'Access Forbidden. Ensure you have subscribed to the "One Call by Call" plan in your OpenWeatherMap dashboard.';
      } else if (status === 429) {
        message = 'Too many requests. You have reached your API limit.';
      } else if (data && data.message) {
        message = data.message;
      }
      
      const newError = new Error(message);
      newError.status = status;
      throw newError;
    }
    throw error;
  },

  // Get detailed indices from WeatherAPI.com
  async getDetailedIndices(query) {
    const isCoords = typeof query === 'object' && query.lat && query.lon;
    const q = isCoords ? `${query.lat},${query.lon}` : query;
    
    const response = await weatherApiClient.get('/forecast.json', {
      params: {
        q,
        days: 1, // We just need today's detailed indices for now
        aqi: 'yes',
      },
    });

    return response.data;
  },

  // Get point forecast from Windy API v2
  async getWindyForecast(lat, lon) {
    const response = await axios.post(
      'https://api.windy.com/api/point-forecast/v2',
      {
        lat,
        lon,
        model: 'gfs',
        parameters: ['wind', 'dewpoint', 'rh', 'pressure', 'temp', 'precip', 'cape'],
        levels: ['surface'],
        key: WINDY_API_KEY,
      }
    );

    return response.data;
  },

  // Get search suggestions
  async getSearchSuggestions(query) {
    if (!query || query.length < 3) return [];
    const response = await weatherApiClient.get('/search.json', {
      params: { q: query },
    });
    return response.data;
  },
};
