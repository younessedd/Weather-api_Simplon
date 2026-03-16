/**
 * AstroWeather - Hero Module
 * Handles dynamic hero section with sun/moon movement, time display, and sky
 */

const Hero = (function() {
    let currentTimeInterval = null;
    let celestialAnimationFrame = null;
    let isDaytime = true;
    let currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let sunriseTime = null;
    let sunsetTime = null;

    /**
     * Initialize hero section
     */
    function init() {
        updateTime();
        updateCelestial();
        createStars();
        
        // Update time every second
        currentTimeInterval = setInterval(updateTime, 1000);
        
        // Update celestial body position
        updateCelestialPosition();
        celestialAnimationFrame = requestAnimationFrame(animateCelestial);
        
        // Listen for weather updates with sunrise/sunset data
        window.addEventListener('weatherLoaded', (e) => {
            if (e.detail && e.detail.timezone) {
                currentTimezone = e.detail.timezone;
            }
            // Update sun times from weather data
            if (e.detail && e.detail.data && e.detail.data.daily) {
                const daily = e.detail.data.daily;
                if (daily.sunrise && daily.sunset) {
                    sunriseTime = new Date(daily.sunrise[0]);
                    sunsetTime = new Date(daily.sunset[0]);
                    console.log('Hero: Sunrise set to', sunriseTime);
                    console.log('Hero: Sunset set to', sunsetTime);
                    checkDayNight(new Date());
                }
            }
        });
    }

    /**
     * Update time display
     */
    function updateTime() {
        const timeValue = document.getElementById('time-value');
        const dateValue = document.getElementById('date-value');
        
        if (!timeValue) return;

        const now = new Date();
        
        const timeOptions = {
            timeZone: currentTimezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        const dateOptions = {
            timeZone: currentTimezone,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const timeStr = now.toLocaleTimeString('en-US', timeOptions);
        const dateStr = now.toLocaleDateString('en-US', dateOptions);
        
        timeValue.textContent = timeStr;
        
        // Update date if element exists
        if (dateValue) {
            dateValue.textContent = dateStr;
        }
        
        // Check if day or night based on real sunrise/sunset
        checkDayNight(now);
    }

    /**
     * Check if it's day or night using real sunrise/sunset times
     */
    function checkDayNight(date) {
        const wasDaytime = isDaytime;
        
        // If we have real sunrise/sunset times, use them
        if (sunriseTime && sunsetTime) {
            const currentTime = date.getTime();
            const sunrise = sunriseTime.getTime();
            const sunset = sunsetTime.getTime();
            
            // It's daytime if current time is between sunrise and sunset
            isDaytime = currentTime >= sunrise && currentTime < sunset;
            
            // Update theme based on time (only if user hasn't manually set theme)
            const theme = isDaytime ? 'light' : 'dark';
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const manualTheme = sessionStorage.getItem('manualTheme');
            
            if (!manualTheme && currentTheme !== theme) {
                // Auto-switch theme only if user hasn't manually set it
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                
                // Update theme toggle icon
                const themeIcon = document.querySelector('.theme-icon');
                if (themeIcon) {
                    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
                }
                
                console.log(`Hero: Auto-switched to ${theme} theme`);
            }
        } else {
            // Fallback to 6am-6pm if no sunrise/sunset data
            const hour = date.getHours();
            isDaytime = hour >= 6 && hour < 18;
        }
        
        if (wasDaytime !== isDaytime) {
            updateCelestial();
            updateBackground();
        }
    }

    /**
     * Update celestial body (sun/moon)
     */
    function updateCelestial() {
        const celestialBody = document.getElementById('celestial-body');
        const celestialIcon = document.getElementById('celestial-icon');
        
        if (!celestialBody || !celestialIcon) return;
        
        const heroBg = document.getElementById('hero-bg');
        const heroStars = document.getElementById('hero-stars');
        
        if (isDaytime) {
            // Sun
            celestialBody.innerHTML = getSunSVG();
            heroBg?.classList.remove('night');
            heroBg?.classList.add('day');
            heroStars?.classList.remove('visible');
        } else {
            // Moon
            celestialBody.innerHTML = getMoonSVG();
            heroBg?.classList.remove('day');
            heroBg?.classList.add('night');
            heroStars?.classList.add('visible');
        }
    }

    /**
     * Get sun SVG - beautiful modern design
     */
    function getSunSVG() {
        return `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#fff7a0"/>
                    <stop offset="40%" stop-color="#ffd700"/>
                    <stop offset="100%" stop-color="#ff8c00"/>
                </radialGradient>
                <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <!-- Sun rays -->
            <g stroke="#ffd700" stroke-width="2" stroke-linecap="round" opacity="0.6">
                <line x1="50" y1="8" x2="50" y2="18"/>
                <line x1="50" y1="82" x2="50" y2="92"/>
                <line x1="8" y1="50" x2="18" y2="50"/>
                <line x1="82" y1="50" x2="92" y2="50"/>
                <line x1="20.3" y1="20.3" x2="27.9" y2="27.9"/>
                <line x1="72.1" y1="72.1" x2="79.7" y2="79.7"/>
                <line x1="20.3" y1="79.7" x2="27.9" y2="72.1"/>
                <line x1="72.1" y1="27.9" x2="79.7" y2="20.3"/>
            </g>
            <!-- Sun body -->
            <circle cx="50" cy="50" r="22" fill="url(#sunGradient)" filter="url(#sunGlow)"/>
            <!-- Inner glow -->
            <circle cx="50" cy="50" r="15" fill="#ffffff" opacity="0.4"/>
        </svg>`;
    }

    /**
     * Get moon SVG - beautiful modern design
     */
    function getMoonSVG() {
        return `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f0f0f0"/>
                    <stop offset="50%" stop-color="#e0e0e0"/>
                    <stop offset="100%" stop-color="#c0c0c0"/>
                </linearGradient>
                <filter id="moonGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <!-- Moon body -->
            <path d="M50 15C30 15 15 32 15 50C15 68 30 85 50 85C60 85 70 80 78 72C70 78 60 82 50 82C32 82 18 66 18 50C18 34 32 18 50 18C60 18 70 22 78 30C70 24 60 20 50 15Z" 
                  fill="url(#moonGradient)" filter="url(#moonGlow)"/>
            <!-- Craters -->
            <circle cx="35" cy="40" r="6" fill="#c8c8c8" opacity="0.5"/>
            <circle cx="55" cy="55" r="4" fill="#c8c8c8" opacity="0.4"/>
            <circle cx="45" cy="65" r="3" fill="#c8c8c8" opacity="0.3"/>
            <circle cx="60" cy="35" r="2" fill="#c8c8c8" opacity="0.3"/>
        </svg>`;
    }

    /**
     * Update celestial position based on real sunrise/sunset times
     */
    function updateCelestialPosition() {
        const celestialBody = document.getElementById('celestial-body');
        if (!celestialBody) return;

        const now = new Date();
        const currentTime = now.getTime();
        
        let progress;
        
        if (isDaytime && sunriseTime && sunsetTime) {
            // Sun position based on real sunrise/sunset
            const sunrise = sunriseTime.getTime();
            const sunset = sunsetTime.getTime();
            const dayDuration = sunset - sunrise;
            
            // Progress from 0 (sunrise) to 1 (sunset)
            progress = (currentTime - sunrise) / dayDuration;
        } else if (!isDaytime && sunriseTime && sunsetTime) {
            // Moon position - show at night
            // Calculate time since sunset or until sunrise
            const sunset = sunsetTime.getTime();
            const sunrise = sunriseTime.getTime() + 24 * 60 * 60 * 1000; // Next day's sunrise
            
            if (currentTime >= sunset) {
                // After sunset
                const nightDuration = sunrise - sunset;
                progress = (currentTime - sunset) / nightDuration;
            } else {
                // Before sunrise
                const nightDuration = sunrise - sunset;
                progress = (currentTime - sunset + nightDuration) / nightDuration;
            }
        } else {
            // Fallback: use fixed 6am-6pm
            const hour = now.getHours();
            const minute = now.getMinutes();
            if (isDaytime) {
                progress = (hour - 6 + minute / 60) / 12;
            } else {
                if (hour >= 18) {
                    progress = (hour - 18 + minute / 60) / 12;
                } else {
                    progress = (hour + 6 + minute / 60) / 12;
                }
            }
        }
        
        progress = Math.max(0, Math.min(1, progress));
        
        // Calculate position across the top (left to right)
        // 0 = left, 0.5 = center (noon/midnight), 1 = right
        const padding = 100; // Keep away from edges
        const centerX = window.innerWidth / 2;
        const centerY = 120; // Position below header (navbar height ~70px + margin)
        const width = window.innerWidth - (padding * 2);
        
        // Calculate x position (left to right movement)
        const x = padding + (width * progress) - 50; // -50 to center the 100px celestial body
        const y = centerY - 50; // -50 to center vertically
        
        celestialBody.style.left = `${x}px`;
        celestialBody.style.top = `${y}px`;
        
        // Add rotation effect for more dynamic movement
        const rotation = progress * 360;
        celestialBody.style.transform = `rotate(${rotation}deg)`;
    }

    /**
     * Animate celestial body
     */
    function animateCelestial() {
        updateCelestialPosition();
        celestialAnimationFrame = requestAnimationFrame(animateCelestial);
    }

    /**
     * Update background based on theme
     */
    function updateBackground() {
        const heroBg = document.getElementById('hero-bg');
        const heroStars = document.getElementById('hero-stars');
        
        if (!heroBg) return;
        
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        
        if (isDaytime) {
            heroBg.classList.remove('night');
            heroBg.classList.add('day');
            heroStars?.classList.remove('visible');
        } else {
            heroBg.classList.remove('day');
            heroBg.classList.add('night');
            heroStars?.classList.add('visible');
        }
    }

    /**
     * Update theme
     */
    function updateTheme() {
        updateBackground();
    }

    /**
     * Create stars for night mode
     */
    function createStars() {
        const starsContainer = document.getElementById('hero-stars');
        if (!starsContainer) return;

        const starCount = 100;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 60}%`;
            star.style.width = `${Math.random() * 2 + 1}px`;
            star.style.height = star.style.width;
            star.style.animationDelay = `${Math.random() * 2}s`;
            star.style.animationDuration = `${Math.random() * 2 + 2}s`;
            starsContainer.appendChild(star);
        }
    }

    /**
     * Update location display
     */
    function updateLocation(locationName) {
        const locationEl = document.getElementById('location-name');
        if (locationEl) {
            locationEl.textContent = locationName;
        }
    }

    /**
     * Update weather display
     */
    function updateWeather(data) {
        const tempEl = document.getElementById('temp-value');
        const descEl = document.getElementById('weather-desc');
        const iconEl = document.getElementById('weather-icon');
        
        if (tempEl && data.current) {
            tempEl.textContent = Math.round(data.current.temperature_2m);
        }
        
        if (descEl && data.current) {
            const weatherInfo = getWeatherInfo(data.current.weather_code, data.current.is_day);
            descEl.textContent = weatherInfo.desc;
            if (iconEl) {
                iconEl.textContent = weatherInfo.icon;
            }
        }
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
     * Update sun times
     */
    function updateSunTimes(sunrise, sunset) {
        const sunriseEl = document.getElementById('sunrise-value');
        const sunsetEl = document.getElementById('sunset-value');
        
        if (sunriseEl && sunrise) {
            sunriseEl.textContent = sunrise;
        }
        
        if (sunsetEl && sunset) {
            sunsetEl.textContent = sunset;
        }
    }

    // Public API
    return {
        init,
        updateLocation,
        updateWeather,
        updateSunTimes,
        updateTheme
    };
})();
