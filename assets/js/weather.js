/**
 * AstroWeather - Weather Module
 * Handles current weather data fetching and display
 */

const Weather = (function() {
    // Configuration - Using Open-Meteo (free, no API key required)
    const CONFIG = {
        weatherApi: 'https://api.open-meteo.com/v1/forecast',
        geocodingApi: 'https://geocoding-api.open-meteo.com/v1/search',
        cacheExpiry: 10 * 60 * 1000, // 10 minutes
        defaultLocation: { lat: 40.7128, lon: -74.0060, name: 'New York' }
    };

    let currentUnit = 'celsius';
    let currentPosition = null;

    /**
     * Initialize weather module
     */
    async function init() {
        try {
            // Monitor location permission changes
            monitorLocationPermission();
            
            // Try to get user's position
            const position = await getCurrentPosition();
            return await loadWeather(position.lat, position.lon, position.name);
        } catch (error) {
            console.warn('Geolocation failed, using default location:', error.message);
            // Use default location (New York)
            return await loadWeather(
                CONFIG.defaultLocation.lat,
                CONFIG.defaultLocation.lon,
                CONFIG.defaultLocation.name
            );
        }
    }

    /**
     * Get current position
     */
    function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Try to get location name
                    let locationName = 'Your Location';
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                        );
                        const data = await response.json();
                        if (data.address && (data.address.city || data.address.town || data.address.village)) {
                            locationName = data.address.city || data.address.town || data.address.village;
                        }
                    } catch (e) {
                        console.warn('Could not get location name:', e);
                    }

                    currentPosition = { lat: latitude, lon: longitude };
                    resolve({ lat: latitude, lon: longitude, name: locationName });
                },
                (error) => {
                    reject(new Error(error.message));
                },
                { enableHighAccuracy: false, timeout: 5000 }
            );
        });
    }

    /**
     * Monitor geolocation permission changes
     */
    function monitorLocationPermission() {
        if (!navigator.permissions || !navigator.permissions.query) {
            return;
        }

        navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
            permissionStatus.addEventListener('change', () => {
                if (permissionStatus.state === 'granted') {
                    console.log('Location permission granted, refreshing location...');
                    // Dispatch custom event to refresh location
                    window.dispatchEvent(new CustomEvent('locationPermissionGranted'));
                }
            });
        });
    }

    /**
     * Load weather data
     */
    async function loadWeather(lat, lon, locationName) {
        try {
            // Check cache first
            const cacheKey = `weather_${lat}_${lon}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CONFIG.cacheExpiry) {
                    console.log('Using cached weather data');
                    updateDisplay(data, locationName);
                    return { coords: { lat, lon }, data, location: locationName };
                }
            }

            // Fetch fresh data
            const url = `${CONFIG.weatherApi}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,wind_speed_10m,surface_pressure,uv_index&timezone=auto`;

            console.log('Fetching weather from:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Weather fetch failed');
            }

            const data = await response.json();
            console.log('Weather data received:', data);

            // Cache the data
            localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));

            // Update display
            updateDisplay(data, locationName);

            // Get timezone from API response
            const timezone = data.timezone || 'UTC';

            // Dispatch event for other modules
            window.dispatchEvent(new CustomEvent('weatherLoaded', {
                detail: {
                    coords: { lat, lon },
                    location: locationName,
                    data,
                    timezone
                }
            }));

            return { coords: { lat, lon }, data, location: locationName, timezone };
        } catch (error) {
            console.error('Weather load error:', error);
            showError('Failed to load weather data');
            return null;
        }
    }

    /**
     * Update display
     */
    function updateDisplay(data, locationName) {
        const current = data.current;
        
        // Update location
        const locationEl = document.getElementById('location-name');
        if (locationEl) locationEl.textContent = locationName;

        // Update temperature
        const tempEl = document.getElementById('temp-value');
        if (tempEl) {
            const temp = currentUnit === 'fahrenheit' 
                ? Math.round((current.temperature_2m * 9/5) + 32)
                : Math.round(current.temperature_2m);
            tempEl.textContent = temp;
        }

        // Update description
        const descEl = document.getElementById('weather-desc');
        const iconEl = document.getElementById('weather-icon');
        if (descEl) {
            const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);
            descEl.textContent = weatherInfo.desc;
            if (iconEl) iconEl.textContent = weatherInfo.icon;
        }

        // Update details
        updateDetailCard('humidity-value', `${current.relative_humidity_2m}%`);
        updateDetailCard('wind-value', `${current.wind_speed_10m} m/s`);
        updateDetailCard('uv-value', current.uv_index || '0');
        updateDetailCard('pressure-value', `${current.surface_pressure} hPa`);

        // Update hero with weather data
        if (typeof Hero !== 'undefined') {
            Hero.updateWeather(data);
            Hero.updateLocation(locationName);
        }
    }

    /**
     * Update detail card
     */
    function updateDetailCard(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    /**
     * Get weather info from code
     */
    function getWeatherInfo(code, isDay = 1) {
        const codes = {
            0: { desc: 'Clear sky', icon: '☀️' },
            1: { desc: 'Mainly clear', icon: '🌤️' },
            2: { desc: 'Partly cloudy', icon: '⛅' },
            3: { desc: 'Overcast', icon: '☁️' },
            45: { desc: 'Foggy', icon: '🌫️' },
            48: { desc: 'Foggy', icon: '🌫️' },
            51: { desc: 'Drizzle', icon: '🌧️' },
            53: { desc: 'Drizzle', icon: '🌧️' },
            55: { desc: 'Drizzle', icon: '🌧️' },
            61: { desc: 'Rain', icon: '🌧️' },
            63: { desc: 'Rain', icon: '🌧️' },
            65: { desc: 'Rain', icon: '🌧️' },
            71: { desc: 'Snow', icon: '🌨️' },
            73: { desc: 'Snow', icon: '🌨️' },
            75: { desc: 'Snow', icon: '🌨️' },
            77: { desc: 'Snow grains', icon: '🌨️' },
            80: { desc: 'Rain showers', icon: '🌦️' },
            81: { desc: 'Rain showers', icon: '🌦️' },
            82: { desc: 'Rain showers', icon: '🌦️' },
            85: { desc: 'Snow showers', icon: '🌨️' },
            86: { desc: 'Snow showers', icon: '🌨️' },
            95: { desc: 'Thunderstorm', icon: '⛈️' },
            96: { desc: 'Thunderstorm', icon: '⛈️' },
            99: { desc: 'Thunderstorm', icon: '⛈️' }
        };

        const info = codes[code] || { desc: 'Unknown', icon: '🌡️' };

        if (!isDay && [0, 1].includes(code)) {
            info.icon = '🌙';
        }

        return info;
    }

    /**
     * Show error
     */
    function showError(message) {
        const descEl = document.getElementById('weather-desc');
        if (descEl) descEl.textContent = message;
    }

    /**
     * Search cities
     */
    async function searchCities(query) {
        try {
            const response = await fetch(
                `${CONFIG.geocodingApi}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
            );
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('City search error:', error);
            return [];
        }
    }

    /**
     * Set temperature unit
     */
    function setUnit(unit) {
        currentUnit = unit;
        // Reload weather to update display
        if (currentPosition) {
            loadWeather(currentPosition.lat, currentPosition.lon, 'Current Location');
        }
    }

    /**
     * Get current unit
     */
    function getCurrentUnit() {
        return currentUnit;
    }

    /**
     * Get current position
     */
    function getCurrentPositionSync() {
        return currentPosition;
    }

    // Public API
    return {
        init,
        loadWeather,
        searchCities,
        setUnit,
        getCurrentUnit,
        getCurrentPosition
    };
})();
