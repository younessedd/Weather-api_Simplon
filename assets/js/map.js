/**
 * AstroWeather - Map Module
 * Handles interactive map with Leaflet.js
 */

const MapModule = (function() {
    let map = null;
    let currentMarker = null;

    /**
     * Initialize the map
     */
    function init() {
        if (typeof L === 'undefined') {
            console.error('Leaflet not loaded');
            return;
        }

        // Initialize map
        map = L.map('weather-map', {
            center: [40.7128, -74.0060],
            zoom: 10,
            zoomControl: false,
            scrollWheelZoom: false
        });

        // Add tile layer (OpenStreetMap with light theme)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Enable scroll wheel zoom when map is clicked
        map.on('click', function() {
            map.scrollWheelZoom.enable();
        });

        // Add control buttons
        setupControls();
    }

    /**
     * Setup map control buttons
     */
    function setupControls() {
        const locateBtn = document.getElementById('locate-btn');
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');

        if (locateBtn) {
            locateBtn.addEventListener('click', goToCurrentLocation);
        }
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => map?.setZoom(map.getZoom() + 1));
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => map?.setZoom(map.getZoom() - 1));
        }
    }

    /**
     * Go to current location
     */
    async function goToCurrentLocation() {
        try {
            const pos = await Weather.getCurrentPosition();
            map?.setView([pos.lat, pos.lon], 12);
        } catch (error) {
            console.error('Location error:', error);
        }
    }

    /**
     * Add weather marker to map
     */
    function addWeatherMarker(lat, lon, name, data) {
        if (!map) return;

        // Remove previous marker
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        const current = data.current;
        const temp = current.temperature_2m;
        const unit = Weather.getCurrentUnit() === 'fahrenheit' ? '°F' : '°C';
        const tempDisplay = Weather.getCurrentUnit() === 'fahrenheit' 
            ? Math.round((temp * 9/5) + 32) 
            : Math.round(temp);

        const weatherInfo = getWeatherInfo(current.weather_code);
        
        // Create custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="map-marker current">${weatherInfo.icon}</div>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });

        // Create popup content
        const popupContent = `
            <div class="map-popup">
                <div class="map-popup-title">${name}</div>
                <div class="map-popup-temp">${tempDisplay}${unit}</div>
                <div class="map-popup-desc">${weatherInfo.desc}</div>
                <div class="map-popup-details">
                    💧 ${current.relative_humidity_2m}% • 💨 ${current.wind_speed_10m} m/s
                </div>
            </div>
        `;

        // Add marker with popup
        currentMarker = L.marker([lat, lon], { icon })
            .addTo(map)
            .bindPopup(popupContent, { className: 'custom-popup' })
            .openPopup();

        // Center map on marker
        map.setView([lat, lon], 10);
    }

    /**
     * Get weather info from code
     */
    function getWeatherInfo(code) {
        const codes = {
            0: { desc: 'Clear', icon: '☀️' },
            1: { desc: 'Mainly clear', icon: '🌤️' },
            2: { desc: 'Partly cloudy', icon: '⛅' },
            3: { desc: 'Overcast', icon: '☁️' },
            45: { desc: 'Foggy', icon: '🌫️' },
            48: { desc: 'Foggy', icon: '🌫️' },
            51: { desc: 'Drizzle', icon: '🌧️' },
            61: { desc: 'Rain', icon: '🌧️' },
            71: { desc: 'Snow', icon: '🌨️' },
            95: { desc: 'Thunderstorm', icon: '⛈️' }
        };
        return codes[code] || { desc: 'Unknown', icon: '🌡️' };
    }

    // Public API
    return {
        init,
        addWeatherMarker,
        goToCurrentLocation
    };
})();
