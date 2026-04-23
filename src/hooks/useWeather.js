import { useState, useEffect, useCallback } from 'react';
import { weatherService } from '../api/weatherService';

export const useWeather = (initialQuery = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [units, setUnits] = useState('metric');

  const fetchWeather = useCallback(async (query, currentUnits) => {
    if (!query) return;
    
    setLoading(true);
    setError(null);
    try {
      const [owmData, detailedData] = await Promise.all([
        weatherService.getWeatherData(query, currentUnits || units),
        weatherService.getDetailedIndices(query),
      ]);

      // Fetch Windy forecast data using coordinates
      let windyData = null;
      try {
        const lat = owmData.current.coord.lat;
        const lon = owmData.current.coord.lon;
        windyData = await weatherService.getWindyForecast(lat, lon);
      } catch (windyErr) {
        console.warn('Windy API error (non-critical):', windyErr.message);
      }

      setData({
        ...owmData,
        details: detailedData,
        windy: windyData,
      });
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.message || 'Failed to fetch weather data. Please check your API keys or city name.');
    } finally {
      setLoading(false);
    }
  }, [units]);

  useEffect(() => {
    if (initialQuery) {
      fetchWeather(initialQuery, units);
    } else if (!data) {
      // Default to user geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            }, units);
          },
          () => {
            fetchWeather('Hanoi', units);
          }
        );
      } else {
        fetchWeather('Hanoi', units);
      }
    } else {
      // Re-fetch with new units if data already exists
      const currentQuery = data.current.coord || data.current.name;
      fetchWeather(currentQuery, units);
    }
  }, [initialQuery, units]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, units, setUnits, refresh: () => fetchWeather(initialQuery) };
};
