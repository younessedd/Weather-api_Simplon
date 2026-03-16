/**
 * AstroWeather - Main Application Module
 * Initializes all modules and handles global functionality
 */

const App = (function() {
    let isInitialized = false;
    let currentTheme = localStorage.getItem('theme') || 'dark';

    /**
     * Initialize the application
     */
    async function init() {
        if (isInitialized) return;

        try {
            // Apply theme
            applyTheme(currentTheme);

            // Initialize splash screen
            initSplash();

            // Initialize navbar scroll
            initNavbar();

            // Initialize temperature toggle
            initTempToggle();

            // Initialize map
            if (typeof MapModule !== 'undefined') {
                MapModule.init();
            }

            // Load weather data
            await loadWeatherData();

            isInitialized = true;
            console.log('AstroWeather initialized successfully');
        } catch (error) {
            console.error('App initialization error:', error);
        }
    }

    /**
     * Initialize splash screen
     */
    function initSplash() {
        const splashScreen = document.getElementById('splash-screen');
        const mainContent = document.getElementById('main-content');

        if (!splashScreen || !mainContent) return;

        setTimeout(() => {
            splashScreen.classList.add('hidden');
            mainContent.classList.add('visible');
        }, 2000);
    }

    /**
     * Initialize navbar scroll effect
     */
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking a link
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    /**
     * Initialize temperature unit toggle
     */
    function initTempToggle() {
        // Will be implemented in weather module
    }

    /**
     * Apply theme
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }

    /**
     * Toggle theme
     */
    function toggleTheme() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);

        // Update hero background
        if (typeof Hero !== 'undefined') {
            Hero.updateTheme();
        }
        
        // Store user preference (disable auto-theme for this session)
        sessionStorage.setItem('manualTheme', currentTheme);
    }

    /**
     * Load weather data for user's location
     */
    async function loadWeatherData() {
        try {
            console.log('App: Starting weather data load...');
            
            if (typeof Weather !== 'undefined') {
                console.log('App: Calling Weather.init()...');
                const weatherResult = await Weather.init();
                console.log('App: Weather result:', weatherResult);

                if (weatherResult && weatherResult.coords) {
                    const { coords } = weatherResult;
                    console.log('App: Loading forecast for coords:', coords);

                    // Load forecast
                    if (typeof Forecast !== 'undefined') {
                        Forecast.loadForecast(coords.lat, coords.lon);
                    }

                    // Load astronomy data
                    if (typeof Astronomy !== 'undefined') {
                        Astronomy.loadAstronomy(coords.lat, coords.lon);
                    }

                    // Update map
                    if (typeof MapModule !== 'undefined' && weatherResult.data) {
                        MapModule.addWeatherMarker(
                            coords.lat,
                            coords.lon,
                            weatherResult.location,
                            weatherResult.data
                        );
                    }
                } else {
                    console.error('App: No coords in weather result, using default location');
                    // Fallback: Load default location weather
                    const defaultResult = await Weather.loadWeather(40.7128, -74.0060, 'New York');
                    if (defaultResult) {
                        Forecast.loadForecast(40.7128, -74.0060);
                        Astronomy.loadAstronomy(40.7128, -74.0060);
                    }
                }
            } else {
                console.error('App: Weather module not defined');
            }
        } catch (error) {
            console.error('Weather data load error:', error);
            // Try default location as fallback
            try {
                const defaultResult = await Weather.loadWeather(40.7128, -74.0060, 'New York');
                if (defaultResult) {
                    Forecast.loadForecast(40.7128, -74.0060);
                    Astronomy.loadAstronomy(40.7128, -74.0060);
                }
            } catch (e) {
                console.error('Fallback also failed:', e);
            }
        }
    }

    // Public API
    return {
        init,
        toggleTheme,
        loadWeatherData
    };
})();

// Initialize splash screen
function initSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const splashIcon = document.getElementById('splash-icon');
    
    if (splashIcon) {
        // Check current theme and set appropriate celestial body
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const svgContent = currentTheme === 'dark' ? getMoonSVG() : getSunSVG();
        splashIcon.innerHTML = svgContent;
    }
    
    // Hide splash screen after loading
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add('hidden');
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 500);
        }
    }, 3000);
}

function getSunSVG() {
    return `
        <defs>
            <linearGradient id="splashSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fbbf24"/>
                <stop offset="50%" stop-color="#f59e0b"/>
                <stop offset="100%" stop-color="#d97706"/>
            </linearGradient>
            <filter id="splashSunGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <circle cx="32" cy="32" r="12" fill="url(#splashSunGrad)" filter="url(#splashSunGlow)"/>
        <line x1="32" y1="8" x2="32" y2="12" stroke="#fbbf24" stroke-width="2"/>
        <line x1="32" y1="52" x2="32" y2="56" stroke="#fbbf24" stroke-width="2"/>
        <line x1="8" y1="32" x2="12" y2="32" stroke="#fbbf24" stroke-width="2"/>
        <line x1="52" y1="32" x2="56" y2="32" stroke="#fbbf24" stroke-width="2"/>
    `;
}

function getMoonSVG() {
    return `
        <defs>
            <linearGradient id="splashMoonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#f8fafc"/>
                <stop offset="30%" stop-color="#f1f5f9"/>
                <stop offset="60%" stop-color="#e2e8f0"/>
                <stop offset="100%" stop-color="#cbd5e1"/>
            </linearGradient>
            <radialGradient id="moonSurface" cx="40%" cy="30%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
                <stop offset="50%" stop-color="#f8fafc" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.1"/>
            </radialGradient>
            <filter id="splashMoonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="moonCraters">
                <feGaussianBlur stdDeviation="0.5"/>
            </filter>
        </defs>
        <!-- Main moon circle -->
        <circle cx="32" cy="32" r="14" fill="url(#splashMoonGrad)" filter="url(#splashMoonGlow)"/>
        
        <!-- Moon surface texture -->
        <circle cx="32" cy="32" r="14" fill="url(#moonSurface)" opacity="0.6"/>
        
        <!-- Moon craters -->
        <circle cx="28" cy="28" r="2" fill="#cbd5e1" opacity="0.3" filter="url(#moonCraters)"/>
        <circle cx="35" cy="30" r="1.5" fill="#cbd5e1" opacity="0.25" filter="url(#moonCraters)"/>
        <circle cx="30" cy="35" r="1.8" fill="#cbd5e1" opacity="0.2" filter="url(#moonCraters)"/>
        <circle cx="38" cy="36" r="1.2" fill="#cbd5e1" opacity="0.3" filter="url(#moonCraters)"/>
        <circle cx="25" cy="33" r="1" fill="#cbd5e1" opacity="0.25" filter="url(#moonCraters)"/>
        
        <!-- Crescent shadow for realistic moon shape -->
        <path d="M32 18c-7.7 0-14 6.3-14 14s6.3 14 14 14c-3.5-3.2-5.7-7.8-5.7-14s2.2-10.8 5.7-14z" 
              fill="#94a3b8" opacity="0.3"/>
        
        <!-- Highlight on edge -->
        <path d="M32 18c3.5 3.2 5.7 7.8 5.7 14s-2.2 10.8-5.7 14c4.4-0.7 7.8-4.5 7.8-9s-3.4-8.3-7.8-9z" 
              fill="#ffffff" opacity="0.4"/>
    `;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize hero first (time display, sun/moon)
    if (typeof Hero !== 'undefined') {
        Hero.init();
    }
    
    App.init();
    
    // Initialize splash screen
    initSplashScreen();
    
    // Initialize city search
    initCitySearch();

    // Listen for location permission granted event
    window.addEventListener('locationPermissionGranted', async () => {
        console.log('Location permission granted, refreshing weather data...');
        if (typeof App !== 'undefined') {
            await App.loadWeatherData();
        }
    });

    // Theme toggle event
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            App.toggleTheme();
        });
    }
});

/**
 * Initialize city search functionality
 */
function initCitySearch() {
const searchInput = document.getElementById('city-search');
const navSearchInput = document.getElementById('nav-city-search');
const searchResults = document.getElementById('search-results');
const navSearchResults = document.getElementById('nav-search-results');
    
// Desktop search
if (searchInput) {
    setupSearchInput(searchInput, searchResults);
}
    
// Mobile search
if (navSearchInput) {
    setupSearchInput(navSearchInput, navSearchResults);
}
}

function setupSearchInput(input, resultsContainer) {
    let debounceTimer;
    
    // Show default cities on focus
    input.addEventListener('focus', () => {
        const query = input.value.trim();
        if (query.length === 0) {
            const defaultCities = [
                { name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'UK' },
                { name: 'New York', latitude: 40.7128, longitude: -74.0060, country: 'USA' },
                { name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France' },
                { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan' },
                { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'Australia' },
                { name: 'Dubai', latitude: 25.2048, longitude: 55.2708, country: 'UAE' }
            ];
            displaySearchResults(defaultCities, resultsContainer);
        }
    });
    
    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (query.length < 1) {
            resultsContainer.classList.remove('active');
            resultsContainer.innerHTML = '';
            return;
        }
        
        debounceTimer = setTimeout(async () => {
            try {
                let results;
                
                if (query.length === 1) {
                    results = getCityRecommendations(query.toLowerCase());
                } else {
                    results = await Weather.searchCities(query);
                }
                
                displaySearchResults(results, resultsContainer);
            } catch (error) {
                console.error('Search error:', error);
                resultsContainer.innerHTML = '<div class="search-result-item"><span class="search-result-name">Search error</span></div>';
                resultsContainer.classList.add('active');
            }
        }, 300);
    });
    
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.remove('active');
        }
    });
}

function getCityRecommendations(letter) {
    const recommendations = {
        'a': [
            { name: 'Amsterdam', latitude: 52.3676, longitude: 4.9041, country: 'Netherlands' },
            { name: 'Athens', latitude: 37.9838, longitude: 23.7275, country: 'Greece' },
            { name: 'Atlanta', latitude: 33.7490, longitude: -84.3880, country: 'USA' },
            { name: 'Austin', latitude: 30.2672, longitude: -97.7431, country: 'USA' }
        ],
        'b': [
            { name: 'Berlin', latitude: 52.5200, longitude: 13.4050, country: 'Germany' },
            { name: 'Boston', latitude: 42.3601, longitude: -71.0589, country: 'USA' },
            { name: 'Barcelona', latitude: 41.3851, longitude: 2.1734, country: 'Spain' },
            { name: 'Bangkok', latitude: 13.7563, longitude: 100.5018, country: 'Thailand' }
        ],
        'c': [
            { name: 'Chicago', latitude: 41.8781, longitude: -87.6298, country: 'USA' },
            { name: 'Cairo', latitude: 30.0444, longitude: 31.2357, country: 'Egypt' },
            { name: 'Copenhagen', latitude: 55.6761, longitude: 12.5683, country: 'Denmark' },
            { name: 'Cape Town', latitude: -33.9249, longitude: 18.4241, country: 'South Africa' }
        ],
        'd': [
            { name: 'Dubai', latitude: 25.2048, longitude: 55.2708, country: 'UAE' },
            { name: 'Dublin', latitude: 53.3498, longitude: -6.2603, country: 'Ireland' },
            { name: 'Denver', latitude: 39.7392, longitude: -104.9903, country: 'USA' },
            { name: 'Delhi', latitude: 28.7041, longitude: 77.1025, country: 'India' }
        ],
        'l': [
            { name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'UK' },
            { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, country: 'USA' },
            { name: 'Lisbon', latitude: 38.7223, longitude: -9.1393, country: 'Portugal' },
            { name: 'Las Vegas', latitude: 36.1699, longitude: -115.1398, country: 'USA' }
        ],
        'm': [
            { name: 'Madrid', latitude: 40.4168, longitude: -3.7038, country: 'Spain' },
            { name: 'Moscow', latitude: 55.7558, longitude: 37.6173, country: 'Russia' },
            { name: 'Miami', latitude: 25.7617, longitude: -80.1918, country: 'USA' },
            { name: 'Montreal', latitude: 45.5017, longitude: -73.5673, country: 'Canada' }
        ],
        'n': [
            { name: 'New York', latitude: 40.7128, longitude: -74.0060, country: 'USA' },
            { name: 'Nairobi', latitude: -1.2921, longitude: 36.8219, country: 'Kenya' },
            { name: 'New Delhi', latitude: 28.6139, longitude: 77.2090, country: 'India' },
            { name: 'Naples', latitude: 40.8518, longitude: 14.2681, country: 'Italy' }
        ],
        'p': [
            { name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France' },
            { name: 'Prague', latitude: 50.0755, longitude: 14.4378, country: 'Czech Republic' },
            { name: 'Phoenix', latitude: 33.4484, longitude: -112.0740, country: 'USA' },
            { name: 'Perth', latitude: -31.9505, longitude: 115.8605, country: 'Australia' }
        ],
        'r': [
            { name: 'Rome', latitude: 41.9028, longitude: 12.4964, country: 'Italy' },
            { name: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729, country: 'Brazil' },
            { name: 'Reykjavik', latitude: 64.1466, longitude: -21.9426, country: 'Iceland' },
            { name: 'Riyadh', latitude: 24.7136, longitude: 46.6753, country: 'Saudi Arabia' }
        ],
        's': [
            { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'Australia' },
            { name: 'Singapore', latitude: 1.3521, longitude: 103.8198, country: 'Singapore' },
            { name: 'Stockholm', latitude: 59.3293, longitude: 18.0686, country: 'Sweden' },
            { name: 'Seoul', latitude: 37.5665, longitude: 126.9780, country: 'South Korea' }
        ],
        't': [
            { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan' },
            { name: 'Toronto', latitude: 43.6532, longitude: -79.3832, country: 'Canada' },
            { name: 'Tel Aviv', latitude: 32.0853, longitude: 34.7818, country: 'Israel' },
            { name: 'Taipei', latitude: 25.0330, longitude: 121.5654, country: 'Taiwan' }
        ],
        'v': [
            { name: 'Vienna', latitude: 48.2082, longitude: 16.3738, country: 'Austria' },
            { name: 'Vancouver', latitude: 49.2827, longitude: -123.1207, country: 'Canada' },
            { name: 'Venice', latitude: 45.4408, longitude: 12.3155, country: 'Italy' },
            { name: 'Valencia', latitude: 39.4699, longitude: -0.3763, country: 'Spain' }
        ]
    };
    
    return recommendations[letter] || [];
}

function displaySearchResults(results, resultsContainer) {
if (!results || results.length === 0) {
    resultsContainer.innerHTML = '<div class="search-result-item"><span class="search-result-name">No cities found</span></div>';
    resultsContainer.classList.add('active');
    return;
}
    
let html = '';
results.forEach(city => {
    // Format city name properly
    let cityName = city.name;
    let region = '';
        
    // Add region/state if available
    if (city.admin1) {
        region = city.admin1;
    }
        
    // Add country name
    let country = city.country || '';
        
    html += `
        <div class="search-result-item" data-lat="${city.latitude}" data-lon="${city.longitude}" data-name="${cityName}">
            <span class="search-result-name">${cityName}</span>
            <span class="search-result-location">${region ? `${region}, ${country}` : country}</span>
        </div>
    `;
});
    
resultsContainer.innerHTML = html;
resultsContainer.classList.add('active');
    
// Add click handlers
resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
        const lat = parseFloat(item.dataset.lat);
        const lon = parseFloat(item.dataset.lon);
        const name = item.dataset.name;
            
        // Update both search inputs
        document.getElementById('city-search').value = name;
        document.getElementById('nav-city-search').value = name;
            
        resultsContainer.classList.remove('active');
            
        // Close mobile menu
        document.getElementById('nav-menu').classList.remove('active');
            
        // Load weather for selected city
        loadCityWeather(lat, lon, name);
    });
});
}

function getCountryFlag(countryCode) {
    if (!countryCode) return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

async function loadCityWeather(lat, lon, name) {
    try {
        const result = await Weather.loadWeather(lat, lon, name);
        
        if (result && result.coords) {
            // Update forecast
            if (typeof Forecast !== 'undefined') {
                Forecast.loadForecast(lat, lon);
            }
            
            // Update astronomy
            if (typeof Astronomy !== 'undefined') {
                Astronomy.loadAstronomy(lat, lon);
            }
            
            // Update map
            if (typeof MapModule !== 'undefined' && result.data) {
                MapModule.addWeatherMarker(lat, lon, name, result.data);
            }
            
            // Update hero location
            if (typeof Hero !== 'undefined') {
                Hero.updateLocation(name);
            }
        }
    } catch (error) {
        console.error('Error loading city weather:', error);
    }
}
