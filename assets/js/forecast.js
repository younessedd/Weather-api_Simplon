/**
 * AstroWeather - Forecast Module
 * Handles hourly and daily forecast data
 */

const Forecast = (function() {
    const CONFIG = {
        hourlyDays: 1,
        dailyDays: 7
    };

    /**
     * Load forecast data
     */
    async function loadForecast(lat, lon) {
        const hourlyContainer = document.getElementById('hourly-container');
        const dailyContainer = document.getElementById('daily-forecast');
        
        // Show fallback first
        renderHourlyFallback(hourlyContainer);
        renderDailyFallback(dailyContainer);
        
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&timezone=auto&forecast_days=7`;
            console.log('Forecast URL:', url);
            
            const response = await fetch(url);
            console.log('Forecast response:', response.status);
            
            if (!response.ok) {
                console.log('Forecast API error, using fallback');
                return;
            }
            
            const data = await response.json();
            console.log('Forecast data received:', data);

            // Update with real data
            if (data.hourly && data.hourly.time && data.hourly.time.length > 0) {
                renderHourly(data);
            }

            if (data.daily && data.daily.time && data.daily.time.length > 0) {
                renderDaily(data);
            }

            // Update sun times in hero
            if (data.daily && data.daily.sunrise && data.daily.sunset) {
                const sunrise = new Date(data.daily.sunrise[0]);
                const sunset = new Date(data.daily.sunset[0]);
                const sunriseStr = sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                const sunsetStr = sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                
                const sunriseEl = document.getElementById('sunrise-value');
                const sunsetEl = document.getElementById('sunset-value');
                if (sunriseEl) sunriseEl.textContent = sunriseStr;
                if (sunsetEl) sunsetEl.textContent = sunsetStr;
                
                // Also update astronomy section
                const astroSunrise = document.getElementById('astro-sunrise');
                const astroSunset = document.getElementById('astro-sunset');
                if (astroSunrise) astroSunrise.textContent = sunriseStr;
                if (astroSunset) astroSunset.textContent = sunsetStr;
                
                // Calculate day length
                const dayLength = sunset - sunrise;
                const hours = Math.floor(dayLength / (1000 * 60 * 60));
                const minutes = Math.floor((dayLength % (1000 * 60 * 60)) / (1000 * 60));
                const dayLengthEl = document.getElementById('day-length');
                if (dayLengthEl) dayLengthEl.textContent = `${hours}h ${minutes}m`;
            }

        } catch (error) {
            console.error('Forecast fetch error:', error);
        }
    }

    /**
     * Render hourly forecast
     */
    function renderHourly(data) {
        const container = document.getElementById('hourly-container');
        if (!container) return;

        const now = new Date();
        const times = data.hourly.time;
        const temps = data.hourly.temperature_2m;
        const codes = data.hourly.weather_code;
        const isDay = data.hourly.is_day;

        let html = '';
        let count = 0;
        
        for (let i = 0; i < times.length && count < 24; i++) {
            const time = new Date(times[i]);
            if (time >= now || count < 12) {
                const hour = time.getHours();
                const timeStr = count === 0 ? 'Now' : `${hour.toString().padStart(2, '0')}:00`;
                const temp = Math.round(temps[i]);
                const weatherInfo = getWeatherInfo(codes[i], isDay[i]);
                
                html += `
                    <div class="hourly-item">
                        <div class="hourly-time">${timeStr}</div>
                        <div class="hourly-icon">${weatherInfo.icon}</div>
                        <div class="hourly-temp">${temp}°</div>
                    </div>
                `;
                count++;
            }
        }

        container.innerHTML = html;
    }

    /**
     * Render daily forecast
     */
    function renderDaily(data) {
        const container = document.getElementById('daily-forecast');
        if (!container) return;

        const times = data.daily.time;
        const maxTemps = data.daily.temperature_2m_max;
        const minTemps = data.daily.temperature_2m_min;
        const codes = data.daily.weather_code;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let html = '';
        
        for (let i = 0; i < times.length; i++) {
            const date = new Date(times[i]);
            const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[date.getDay()];
            const dateStr = `${months[date.getMonth()]} ${date.getDate()}`;
            const maxTemp = Math.round(maxTemps[i]);
            const minTemp = Math.round(minTemps[i]);
            const weatherInfo = getWeatherInfo(codes[i], 1);
            
            html += `
                <div class="daily-item">
                    <div class="daily-day">${dayName}<br><small style="color: var(--text-muted); font-size: 0.8rem;">${dateStr}</small></div>
                    <div class="daily-icon">${weatherInfo.icon}</div>
                    <div class="daily-desc">${weatherInfo.desc}</div>
                    <div class="daily-temps">
                        <span class="daily-high">${maxTemp}°</span>
                        <div class="daily-bar" style="width: ${Math.min(60, maxTemp - minTemp + 20)}px"></div>
                        <span class="daily-low">${minTemp}°</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    /**
     * Render hourly fallback
     */
    function renderHourlyFallback(container) {
        if (!container) return;
        
        const now = new Date();
        let html = '';
        
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
            const timeStr = i === 0 ? 'Now' : hour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            html += `
                <div class="hourly-item">
                    <div class="hourly-time">${timeStr}</div>
                    <div class="hourly-icon">⏳</div>
                    <div class="hourly-temp">--°</div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    /**
     * Render daily fallback
     */
    function renderDailyFallback(container) {
        if (!container) return;
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        let html = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[date.getDay()];
            html += `
                <div class="daily-item">
                    <div class="daily-day">${dayName}</div>
                    <div class="daily-icon">⏳</div>
                    <div class="daily-desc">Loading...</div>
                    <div class="daily-temps">
                        <span class="daily-high">--°</span>
                        <div class="daily-bar" style="width: 40px"></div>
                        <span class="daily-low">--°</span>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    /**
     * Get weather info from code
     */
    function getWeatherInfo(code, isDay = 1) {
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
        
        const info = codes[code] || { desc: 'Unknown', icon: '🌡️' };
        
        if (!isDay && [0, 1].includes(code)) {
            info.icon = '🌙';
        }
        
        return info;
    }

    // Public API
    return {
        loadForecast
    };
})();
