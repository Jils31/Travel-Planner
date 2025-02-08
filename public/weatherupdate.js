const WeatherApiService = {
    BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
    apiKey: null,

    async initialize() {
        if (!this.apiKey) {
            try {
                const response = await fetch('/api/weather-key');
                if (!response.ok) throw new Error('Failed to fetch API key');
                const data = await response.json();
                this.apiKey = data.WEATHER_API_KEY;
            } catch (error) {
                console.error('Error initializing weather service:', error);
                throw error;
            }
        }
    },

    async getWeatherData(city) {
        await this.initialize();
        const url = `${this.BASE_URL}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data fetch failed');
        return response.json();
    }
};

const WeatherUI = {
    elements: {
        searchInput: document.getElementById('search-weather'),
        cityName: document.getElementById('cityname'),
        finalTemp: document.getElementById('finaltemp'),
        description: document.getElementById('d'),
        longDescription: document.getElementById('longdescription'),
        feelsLike: document.getElementById('feelslike'),
        humidity: document.getElementById('humidity'),
        minTemp: document.getElementById('mintemp'),
        maxTemp: document.getElementById('maxtemp'),
        wind: document.getElementById('wind')
    },

    setLoading(isLoading) {
        const loadingText = {
            cityname: 'Loading...',
            finaltemp: '--°C',
            d: '--',
            longdescription: 'Fetching weather...',
            feelslike: '--°C',
            humidity: '--%',
            mintemp: '--°C',
            maxtemp: '--°C',
            wind: '-- m/s'
        };

        for (const [id, text] of Object.entries(loadingText)) {
            if (isLoading && this.elements[id]) {
                this.elements[id].textContent = text;
            }
        }
    },

    updateDisplay(data) {
        const { main, weather, wind } = data;
        
        this.elements.cityName.textContent = data.name;
        this.elements.finalTemp.textContent = `${Math.ceil(main.temp)}°C`;
        this.elements.description.textContent = weather[0].main;
        this.elements.longDescription.textContent = 
            weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1);
        this.elements.feelsLike.textContent = `${Math.floor(main.feels_like)}°C`;
        this.elements.humidity.textContent = `${main.humidity}%`;
        this.elements.minTemp.textContent = `${Math.floor(main.temp_min)}°C`;
        this.elements.maxTemp.textContent = `${Math.ceil(main.temp_max)}°C`;
        this.elements.wind.textContent = `${wind.speed} m/s`;
    }
};

const WeatherApp = {
    async init() {
        try {
            await WeatherApiService.initialize();
            this.setupEventListeners();
            await this.updateWeather();
        } catch (error) {
            console.error('Failed to initialize weather app:', error);
            WeatherUI.elements.cityName.textContent = 'Error initializing app';
        }
    },

    setupEventListeners() {
        WeatherUI.elements.searchInput?.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                await this.updateWeather();
                document.getElementById('search-weather').value = ""
            }
        });
    },

    async updateWeather() {
        WeatherUI.setLoading(true);
        try {
            const city = WeatherUI.elements.searchInput?.value || 'Bangalore';
            const weatherData = await WeatherApiService.getWeatherData(city);
            
            if (weatherData.cod === 200) {
                WeatherUI.updateDisplay(weatherData);
            } else {
                WeatherUI.elements.cityName.textContent = 'City not found';
            }
        } catch (error) {
            console.error('Weather update failed:', error);
            WeatherUI.elements.cityName.textContent = 'Error fetching weather';
        } finally {
            WeatherUI.setLoading(false);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => WeatherApp.init());