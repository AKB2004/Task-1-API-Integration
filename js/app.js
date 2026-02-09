
const API_KEY = '76553638462148e70db8336ba662db1a'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';


const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');

const loadingCard = document.getElementById('loadingCard');
const errorCard = document.getElementById('errorCard');
const weatherCard = document.getElementById('weatherCard');

const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

const cityName = document.getElementById('cityName');
const dateTime = document.getElementById('dateTime');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weatherDescription');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const feelsLike = document.getElementById('feelsLike');
const pressure = document.getElementById('pressure');


searchBtn.addEventListener('click', handleSearch);

// Enter key press in input field
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Location button click
locationBtn.addEventListener('click', handleLocationSearch);

// Retry button click
retryBtn.addEventListener('click', () => {
    hideError();
    cityInput.focus();
});



function handleSearch() {
    const city = cityInput.value.trim();
    
    
    if (!city) {
        showError('Please enter a city name!');
        return;
    }
    
    if (city.length < 2) {
        showError('City name is too short!');
        return;
    }
    
   
    fetchWeatherByCity(city);
    cityInput.value='';
    cityInput.focus();
}

function handleLocationSearch() {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser!');
        return;
    }   
    showLoading();
    
    // Get current position
    navigator.geolocation.getCurrentPosition(
        
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoordinates(lat, lon);
        },
        
        (error) => {
            hideLoading();
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    showError('Location access denied. Please enable location services.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    showError('Location information unavailable.');
                    break;
                case error.TIMEOUT:
                    showError('Location request timeout.');
                    break;
                default:
                    showError('An unknown error occurred while getting location.');
            }
        }
    );
}
/**
 * Fetch weather data by city name
 * @param {string} city - City name to search
 */
async function fetchWeatherByCity(city) {
    showLoading();
    
    try {
        const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(response.status);
        }
        
        const data = await response.json();
        displayWeatherData(data);
        
    } catch (error) {
        hideLoading();
        handleAPIError(error);
    }
}
/**
 * Fetch weather data by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
async function fetchWeatherByCoordinates(lat, lon) {
    try {
        const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(response.status);
        }
        
        const data = await response.json();
        displayWeatherData(data);
        
    } catch (error) {
        hideLoading();
        handleAPIError(error);
    }
}

/**
 * Display weather data on the UI
 * @param {object} data - Weather data from API
 */
function displayWeatherData(data) {
    hideLoading();
    hideError();
    
    // city name
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    
    // date and time
    dateTime.textContent = getCurrentDateTime();
    
    // weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    
    // Get temperature
    const temp = Math.round(data.main.temp);
    
    // temperature (rounded to nearest integer)
    temperature.textContent = `${temp}°C`;
    
    updateBackgroundByTemperature(temp);
    
    // weather description
    weatherDescription.textContent = data.weather[0].description;
    
    // humidity
    humidity.textContent = `${data.main.humidity}%`;
    
    // wind speed (converted to km/h and rounded)
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    
    // feels like temperature
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    
    // pressure
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // Show weather card
    weatherCard.style.display = 'block';
}
/**
 * Update background based on temperature
 * @param {number} temp - Temperature in Celsius
 */
function updateBackgroundByTemperature(temp) {
    // Remove all temperature classes
    document.body.classList.remove('bg-freezing', 'bg-cold', 'bg-moderate', 'bg-warm', 'bg-hot');
    
    // Add appropriate class based on temperature
    if (temp < 0) {
        document.body.classList.add('bg-freezing');
        console.log('🥶 Freezing background applied');
    } else if (temp >= 0 && temp < 15) {
        document.body.classList.add('bg-cold');
        console.log('🧊 Cold background applied');
    } else if (temp >= 15 && temp < 25) {
        document.body.classList.add('bg-moderate');
        console.log('😊 Moderate background applied');
    } else if (temp >= 25 && temp < 30) {
        document.body.classList.add('bg-warm');
        console.log('☀️ Warm background applied');
    } else {
        document.body.classList.add('bg-hot');
        console.log('🔥 Hot background applied');
    }
}

/**
 * Get current date and time formatted
 * @returns {string} Formatted date and time string
 */
function getCurrentDateTime() {
    const now = new Date();
    
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const dateStr = now.toLocaleDateString('en-US', options);
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `${dateStr} | ${timeStr}`;
}

/**
 * Handle API errors
 * @param {Error} error - Error object
 */
function handleAPIError(error) {
    const errorCode = error.message;
    
    switch(errorCode) {
        case '404':
            showError('City not found! Please check the spelling and try again.');
            break;
        case '401':
            showError('Invalid API key. Please check your configuration.');
            break;
        case '429':
            showError('Too many requests! Please try again later.');
            break;
        case '500':
        case '502':
        case '503':
            showError('Server error. Please try again later.');
            break;
        default:
            showError('Unable to fetch weather data. Please check your internet connection.');
    }
}

/**
 * Show loading state
 */
function showLoading() {
    loadingCard.style.display = 'block';
    errorCard.style.display = 'none';
    weatherCard.style.display = 'none';
    
    // Disable buttons while loading
    searchBtn.disabled = true;
    locationBtn.disabled = true;
}

/**
 * Hide loading state
 */
function hideLoading() {
    loadingCard.style.display = 'none';
    
    // Enable buttons
    searchBtn.disabled = false;
    locationBtn.disabled = false;
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorCard.style.display = 'block';
    weatherCard.style.display = 'none';
    loadingCard.style.display = 'none';
}

function hideError() {
    errorCard.style.display = 'none';
}

/**
 * Initialize the app
 * Auto-focus on input field when page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    cityInput.focus();
    console.log('Weather App Initialized!');
    console.log('⚠️ Remember to add your OpenWeatherMap API key in app.js');
});