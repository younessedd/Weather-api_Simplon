/**
 * AstroWeather - Astronomy Module
 * Handles sun, moon, and planet data
 */

const Astronomy = (function() {
    /**
     * Get sun times from sunrise-sunset.org API
     */
    async function getSunTimes(lat, lon) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(
                `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${today}&formatted=0`
            );
            const data = await response.json();
            
            if (data.status === 'OK') {
                return {
                    sunrise: new Date(data.results.sunrise),
                    sunset: new Date(data.results.sunset),
                    dayLength: data.results.day_length
                };
            }
        } catch (error) {
            console.error('Sun times error:', error);
        }
        return null;
    }

    /**
     * Get moon phase
     */
    function getMoonPhase(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        let c, e, jd, b;
        
        if (month < 3) {
            c = year - 1;
            e = month + 12;
        } else {
            c = year;
            e = month;
        }
        
        jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5;
        b = Math.floor((c - 100) / 400) - Math.floor((c - 100) / 100) + 2;
        jd += b;
        
        const daysSinceNew = (jd - 2451549.5) % 29.530588853;
        const illumination = Math.round((1 - Math.cos(daysSinceNew / 29.530588853 * Math.PI)) / 2 * 100);
        
        const phases = [
            { name: 'New Moon', icon: '🌑' },
            { name: 'Waxing Crescent', icon: '🌒' },
            { name: 'First Quarter', icon: '🌓' },
            { name: 'Waxing Gibbous', icon: '🌔' },
            { name: 'Full Moon', icon: '🌕' },
            { name: 'Waning Gibbous', icon: '🌖' },
            { name: 'Last Quarter', icon: '🌗' },
            { name: 'Waning Crescent', icon: '🌘' }
        ];
        
        const phaseIndex = Math.floor((daysSinceNew / 29.530588853) * 8) % 8;
        
        return {
            name: phases[phaseIndex].name,
            icon: phases[phaseIndex].icon,
            illumination,
            age: Math.round(daysSinceNew * 10) / 10
        };
    }

    /**
     * Get planets visibility
     */
    function getPlanetsVisibility() {
        // Simplified planet positions (in real app, use astronomy calculations)
        const planets = [
            { name: 'Mercury', symbol: '☿', position: 'Below Horizon', visible: false },
            { name: 'Venus', symbol: '♀', position: 'Night Sky', visible: true },
            { name: 'Mars', symbol: '♂', position: 'Night Sky', visible: true },
            { name: 'Jupiter', symbol: '♃', position: 'Night Sky', visible: true },
            { name: 'Saturn', symbol: '♄', position: 'Night Sky', visible: true }
        ];
        
        return planets;
    }

    /**
     * Load astronomy data
     */
    async function loadAstronomy(lat, lon) {
        try {
            // Get sun times
            const sunTimes = await getSunTimes(lat, lon);
            
            if (sunTimes) {
                const sunriseStr = sunTimes.sunrise.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                });
                const sunsetStr = sunTimes.sunset.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                });
                
                // Update sunrise/sunset in astronomy section
                const astroSunrise = document.getElementById('astro-sunrise');
                const astroSunset = document.getElementById('astro-sunset');
                const dayLengthEl = document.getElementById('day-length');
                
                if (astroSunrise) astroSunrise.textContent = sunriseStr;
                if (astroSunset) astroSunset.textContent = sunsetStr;
                if (dayLengthEl) dayLengthEl.textContent = sunTimes.dayLength;
            }

            // Get moon phase
            const moonPhase = getMoonPhase();
            
            // Update moon display
            const moonPhaseEl = document.getElementById('moon-phase');
            const moonIllumination = document.getElementById('moon-illumination');
            const moonAge = document.getElementById('moon-age');
            const moonVisual = document.getElementById('moon-visual');
            
            if (moonPhaseEl) moonPhaseEl.textContent = moonPhase.name;
            if (moonIllumination) moonIllumination.textContent = `${moonPhase.illumination}%`;
            if (moonAge) moonAge.textContent = `${moonPhase.age} days`;
            
            // Update moon visual shadow
            if (moonVisual) {
                const shadow = moonVisual.querySelector('.moon-shadow');
                if (shadow) {
                    const shadowPercent = (moonPhase.age / 29.53) * 100;
                    if (shadowPercent < 50) {
                        shadow.style.width = `${shadowPercent * 2}%`;
                        shadow.style.left = '0';
                    } else {
                        shadow.style.width = `${(100 - shadowPercent) * 2}%`;
                        shadow.style.left = 'auto';
                        shadow.style.right = '0';
                    }
                }
            }

            // Get and display planets
            const planets = getPlanetsVisibility();
            const planetsList = document.getElementById('planets-list');
            
            if (planetsList) {
                let html = '';
                planets.forEach(planet => {
                    html += `
                        <div class="planet-item">
                            <div class="planet-icon">${planet.symbol}</div>
                            <div class="planet-info">
                                <div class="planet-name">${planet.name}</div>
                                <div class="planet-position">${planet.position}</div>
                            </div>
                            <div class="planet-visibility ${planet.visible ? 'visible' : 'not-visible'}">
                                ${planet.visible ? 'Visible' : 'Not Visible'}
                            </div>
                        </div>
                    `;
                });
                planetsList.innerHTML = html;
            }

        } catch (error) {
            console.error('Astronomy load error:', error);
        }
    }

    // Public API
    return {
        loadAstronomy,
        getMoonPhase,
        getPlanetsVisibility
    };
})();
