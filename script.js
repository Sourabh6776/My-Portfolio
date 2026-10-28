"use strict";

// ==========================================

// SOURABH RATHORE — PERSONAL PORTFOLIO

// Features: Theme Toggle, Project Search,

// Automatic Copyright Year, SkyCast Weather

// ==========================================

// 1. GET HTML ELEMENTS

const themeToggle = document.getElementById("theme-toggle");

const projectSearch = document.getElementById("project-search");

const projectCards = document.querySelectorAll(".project-card");

const noResults = document.getElementById("no-results");

const yearElement = document.getElementById("year");

const weatherForm = document.getElementById("weather-form");

const citySearch = document.getElementById("city-search");

const weatherSearchBtn = document.getElementById("weather-search-btn");

const useLocationBtn = document.getElementById("use-location-btn");

const unitCelsiusBtn = document.getElementById("unit-celsius");

const unitFahrenheitBtn = document.getElementById("unit-fahrenheit");

const weatherLoading = document.getElementById("weather-loading");

const weatherError = document.getElementById("weather-error");

const weatherResults = document.getElementById("weather-results");

const weatherLocation = document.getElementById("weather-location");

const weatherUpdated = document.getElementById("weather-updated");

const weatherTemp = document.getElementById("weather-temp");

const weatherCondition = document.getElementById("weather-condition");

const weatherHumidity = document.getElementById("weather-humidity");

const weatherWind = document.getElementById("weather-wind");

const forecastGrid = document.getElementById("forecast-grid");

// 2. AUTOMATIC COPYRIGHT YEAR

function updateCopyrightYear() {

    if (yearElement) {

        yearElement.textContent = new Date().getFullYear();

    }

}

updateCopyrightYear();

// 3. THEME MANAGEMENT

// Dark mode is the default.

// If the visitor previously selected light mode,

// that preference is restored from localStorage.

function applySavedTheme() {

    let savedTheme = "dark";

    try {

        savedTheme = localStorage.getItem("portfolio-theme") || "dark";

    } catch (error) {

        console.warn("Theme preference could not be loaded.", error);

    }

    if (savedTheme === "light") {

        document.body.classList.add("light-mode");

    } else {

        document.body.classList.remove("light-mode");

    }

    updateThemeButton();

}

// Update the icon and accessible label.

function updateThemeButton() {

    if (!themeToggle) {

        return;

    }

    const isLightMode = document.body.classList.contains("light-mode");

    // Moon means clicking will switch to dark mode.

    // Sun means clicking will switch to light mode.

    themeToggle.textContent = isLightMode ? "🌙" : "☀️";

    themeToggle.setAttribute(

        "aria-label",

        isLightMode ? "Switch to dark mode" : "Switch to light mode"

    );

    themeToggle.setAttribute("title", themeToggle.getAttribute("aria-label"));

}

// Save the selected theme.

function saveTheme(theme) {

    try {

        localStorage.setItem("portfolio-theme", theme);

    } catch (error) {

        console.warn("Theme preference could not be saved.", error);

    }

}

// Apply the theme saved by the visitor.

applySavedTheme();

// Switch between dark mode and light mode.

if (themeToggle) {

    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("light-mode");

        const isLightMode = document.body.classList.contains("light-mode");

        saveTheme(isLightMode ? "light" : "dark");

        updateThemeButton();

    });

}

// 4. PROJECT SEARCH

// Search by project name, description or technology.

function filterProjects() {

    if (!projectSearch) {

        return;

    }

    const query = projectSearch.value.trim().toLowerCase();

    let visibleProjects = 0;

    projectCards.forEach(function (card) {

        const searchableText = card.textContent.toLowerCase();

        const matches = searchableText.includes(query);

        card.hidden = !matches;

        if (matches) {

            visibleProjects++;

        }

    });

    // Show a message if no projects match.

    if (noResults) {

        noResults.hidden = visibleProjects !== 0;

    }

}

// Run the filter whenever the visitor types.

if (projectSearch) {

    projectSearch.addEventListener("input", filterProjects);

}

// 5. RESET SEARCH WHEN THE SEARCH BOX IS CLEARED

// The input event already handles clearing the box.

// This also supports browsers that dispatch the search event.

if (projectSearch) {

    projectSearch.addEventListener("search", filterProjects);

}

// 6. INITIALISE PROJECT VISIBILITY

// Ensure all projects are visible when the page first loads.

projectCards.forEach(function (card) {

    card.hidden = false;

});

if (noResults) {

    noResults.hidden = true;

}

// 7. SKYCAST WEATHER FORECAST

// Uses the free Open-Meteo geocoding and forecast APIs (no API key).

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

let weatherUnit = "celsius";

let latestWeatherData = null;

const WEATHER_CODES = {

    0: "Clear sky",

    1: "Mainly clear",

    2: "Partly cloudy",

    3: "Overcast",

    45: "Foggy",

    48: "Depositing rime fog",

    51: "Light drizzle",

    53: "Moderate drizzle",

    55: "Dense drizzle",

    56: "Light freezing drizzle",

    57: "Dense freezing drizzle",

    61: "Slight rain",

    63: "Moderate rain",

    65: "Heavy rain",

    66: "Light freezing rain",

    67: "Heavy freezing rain",

    71: "Slight snow fall",

    73: "Moderate snow fall",

    75: "Heavy snow fall",

    77: "Snow grains",

    80: "Slight rain showers",

    81: "Moderate rain showers",

    82: "Violent rain showers",

    85: "Slight snow showers",

    86: "Heavy snow showers",

    95: "Thunderstorm",

    96: "Thunderstorm with slight hail",

    99: "Thunderstorm with heavy hail"

};

function describeWeatherCode(code) {

    if (code === null || code === undefined || Number.isNaN(Number(code))) {

        return "Unavailable";

    }

    return WEATHER_CODES[Number(code)] || "Unavailable";

}

function formatTemperature(valueCelsius) {

    if (valueCelsius === null || valueCelsius === undefined || Number.isNaN(Number(valueCelsius))) {

        return "—";

    }

    const celsius = Number(valueCelsius);

    const value = weatherUnit === "fahrenheit"

        ? (celsius * 9 / 5) + 32

        : celsius;

    const unitLabel = weatherUnit === "fahrenheit" ? "°F" : "°C";

    return Math.round(value) + unitLabel;

}

function formatWindSpeed(speedKmh) {

    if (speedKmh === null || speedKmh === undefined || Number.isNaN(Number(speedKmh))) {

        return "—";

    }

    return Math.round(Number(speedKmh)) + " km/h";

}

function formatHumidity(humidity) {

    if (humidity === null || humidity === undefined || Number.isNaN(Number(humidity))) {

        return "—";

    }

    return Math.round(Number(humidity)) + "%";

}

function formatForecastDay(dateString) {

    const date = new Date(dateString + "T12:00:00");

    if (Number.isNaN(date.getTime())) {

        return { day: "—", dateLabel: "—" };

    }

    return {

        day: date.toLocaleDateString(undefined, { weekday: "short" }),

        dateLabel: date.toLocaleDateString(undefined, {

            month: "short",

            day: "numeric"

        })

    };

}

function setWeatherLoading(isLoading) {

    if (weatherLoading) {

        weatherLoading.hidden = !isLoading;

    }

    if (weatherSearchBtn) {

        weatherSearchBtn.disabled = isLoading;

    }

    if (useLocationBtn) {

        useLocationBtn.disabled = isLoading;

    }

}

function showWeatherError(message) {

    if (!weatherError) {

        return;

    }

    weatherError.textContent = message;

    weatherError.hidden = false;

    if (weatherResults) {

        weatherResults.hidden = true;

    }

}

function clearWeatherError() {

    if (!weatherError) {

        return;

    }

    weatherError.textContent = "";

    weatherError.hidden = true;

}

function updateUnitButtons() {

    const isCelsius = weatherUnit === "celsius";

    if (unitCelsiusBtn) {

        unitCelsiusBtn.classList.toggle("is-active", isCelsius);

        unitCelsiusBtn.setAttribute("aria-pressed", isCelsius ? "true" : "false");

    }

    if (unitFahrenheitBtn) {

        unitFahrenheitBtn.classList.toggle("is-active", !isCelsius);

        unitFahrenheitBtn.setAttribute("aria-pressed", isCelsius ? "false" : "true");

    }

}

function buildLocationLabel(place) {

    const parts = [];

    if (place.name) {

        parts.push(place.name);

    }

    if (place.admin1 && place.admin1 !== place.name) {

        parts.push(place.admin1);

    }

    if (place.country) {

        parts.push(place.country);

    }

    return parts.length > 0 ? parts.join(", ") : "Selected location";

}

function renderForecast(daily) {

    if (!forecastGrid) {

        return;

    }

    forecastGrid.textContent = "";

    if (!daily || !Array.isArray(daily.time) || daily.time.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "weather-updated";

        emptyMessage.textContent = "Forecast data is currently unavailable.";

        forecastGrid.appendChild(emptyMessage);

        return;

    }

    const dayCount = Math.min(7, daily.time.length);

    for (let index = 0; index < dayCount; index += 1) {

        const labels = formatForecastDay(daily.time[index]);

        const maxTemp = daily.temperature_2m_max

            ? daily.temperature_2m_max[index]

            : null;

        const minTemp = daily.temperature_2m_min

            ? daily.temperature_2m_min[index]

            : null;

        const code = daily.weather_code ? daily.weather_code[index] : null;

        const card = document.createElement("article");

        card.className = "forecast-card";

        const dayEl = document.createElement("p");

        dayEl.className = "forecast-day";

        dayEl.textContent = labels.day;

        const dateEl = document.createElement("p");

        dateEl.className = "forecast-date";

        dateEl.textContent = labels.dateLabel;

        const conditionEl = document.createElement("p");

        conditionEl.className = "forecast-condition";

        conditionEl.textContent = describeWeatherCode(code);

        const tempsEl = document.createElement("div");

        tempsEl.className = "forecast-temps";

        const highEl = document.createElement("span");

        highEl.className = "forecast-high";

        highEl.textContent = formatTemperature(maxTemp);

        const lowEl = document.createElement("span");

        lowEl.className = "forecast-low";

        lowEl.textContent = formatTemperature(minTemp);

        tempsEl.appendChild(highEl);

        tempsEl.appendChild(lowEl);

        card.appendChild(dayEl);

        card.appendChild(dateEl);

        card.appendChild(conditionEl);

        card.appendChild(tempsEl);

        forecastGrid.appendChild(card);

    }

}

function renderWeather() {

    if (!latestWeatherData || !weatherResults) {

        return;

    }

    const current = latestWeatherData.forecast.current || {};

    const daily = latestWeatherData.forecast.daily;

    if (weatherLocation) {

        weatherLocation.textContent = latestWeatherData.locationLabel;

    }

    if (weatherUpdated) {

        if (current.time) {

            const updatedAt = new Date(current.time);

            weatherUpdated.textContent = Number.isNaN(updatedAt.getTime())

                ? "Updated just now"

                : "Updated " + updatedAt.toLocaleString();

        } else {

            weatherUpdated.textContent = "Updated just now";

        }

    }

    if (weatherTemp) {

        weatherTemp.textContent = formatTemperature(current.temperature_2m);

    }

    if (weatherCondition) {

        weatherCondition.textContent = describeWeatherCode(current.weather_code);

    }

    if (weatherHumidity) {

        weatherHumidity.textContent = formatHumidity(current.relative_humidity_2m);

    }

    if (weatherWind) {

        weatherWind.textContent = formatWindSpeed(current.wind_speed_10m);

    }

    renderForecast(daily);

    weatherResults.hidden = false;

}

async function fetchForecast(latitude, longitude) {

    const params = new URLSearchParams({

        latitude: String(latitude),

        longitude: String(longitude),

        current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",

        daily: "weather_code,temperature_2m_max,temperature_2m_min",

        timezone: "auto",

        forecast_days: "7",

        wind_speed_unit: "kmh"

    });

    const response = await fetch(FORECAST_URL + "?" + params.toString());

    if (!response.ok) {

        throw new Error("forecast-failed");

    }

    const data = await response.json();

    if (!data || !data.current) {

        throw new Error("forecast-incomplete");

    }

    return data;

}

async function geocodeCity(cityName) {

    const params = new URLSearchParams({

        name: cityName,

        count: "1",

        language: "en",

        format: "json"

    });

    const response = await fetch(GEOCODING_URL + "?" + params.toString());

    if (!response.ok) {

        throw new Error("geocode-failed");

    }

    const data = await response.json();

    if (!data || !Array.isArray(data.results) || data.results.length === 0) {

        throw new Error("city-not-found");

    }

    return data.results[0];

}

async function loadWeatherForCoordinates(latitude, longitude, locationLabel) {

    setWeatherLoading(true);

    clearWeatherError();

    try {

        const forecast = await fetchForecast(latitude, longitude);

        latestWeatherData = {

            locationLabel: locationLabel,

            forecast: forecast

        };

        renderWeather();

    } catch (error) {

        latestWeatherData = null;

        if (error && error.message === "forecast-incomplete") {

            showWeatherError(

                "Weather data for this location is incomplete right now. Please try again."

            );

        } else {

            showWeatherError(

                "Unable to load weather data. Please check your connection and try again."

            );

        }

    } finally {

        setWeatherLoading(false);

    }

}

async function searchWeatherByCity(cityName) {

    const trimmedCity = cityName.trim();

    if (!trimmedCity) {

        showWeatherError("Please enter a city name to search.");

        return;

    }

    setWeatherLoading(true);

    clearWeatherError();

    try {

        const place = await geocodeCity(trimmedCity);

        const locationLabel = buildLocationLabel(place);

        if (citySearch) {

            citySearch.value = place.name || trimmedCity;

        }

        const forecast = await fetchForecast(place.latitude, place.longitude);

        latestWeatherData = {

            locationLabel: locationLabel,

            forecast: forecast

        };

        renderWeather();

    } catch (error) {

        latestWeatherData = null;

        if (error && error.message === "city-not-found") {

            showWeatherError(

                "No matching city was found. Please check the spelling and try another name."

            );

        } else {

            showWeatherError(

                "Unable to load weather data. Please check your connection and try again."

            );

        }

    } finally {

        setWeatherLoading(false);

    }

}

function handleGeolocationSuccess(position) {

    const latitude = position.coords.latitude;

    const longitude = position.coords.longitude;

    const locationLabel = "Your current location";

    loadWeatherForCoordinates(latitude, longitude, locationLabel);

}

function handleGeolocationError(error) {

    setWeatherLoading(false);

    if (error && error.code === error.PERMISSION_DENIED) {

        showWeatherError(

            "Location permission was denied. Please allow location access or search for a city instead."

        );

        return;

    }

    if (error && error.code === error.POSITION_UNAVAILABLE) {

        showWeatherError(

            "Your location is currently unavailable. Please try searching for a city instead."

        );

        return;

    }

    if (error && error.code === error.TIMEOUT) {

        showWeatherError(

            "Finding your location took too long. Please try again or search for a city."

        );

        return;

    }

    showWeatherError(

        "Unable to access your location. Please try searching for a city instead."

    );

}

function requestWeatherByLocation() {

    if (!navigator.geolocation) {

        showWeatherError(

            "Geolocation is not supported in this browser. Please search for a city instead."

        );

        return;

    }

    setWeatherLoading(true);

    clearWeatherError();

    navigator.geolocation.getCurrentPosition(

        handleGeolocationSuccess,

        handleGeolocationError,

        {

            enableHighAccuracy: false,

            timeout: 12000,

            maximumAge: 300000

        }

    );

}

function setWeatherUnit(unit) {

    if (unit !== "celsius" && unit !== "fahrenheit") {

        return;

    }

    weatherUnit = unit;

    updateUnitButtons();

    if (latestWeatherData) {

        renderWeather();

    }

}

if (weatherForm) {

    weatherForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const cityName = citySearch ? citySearch.value : "";

        searchWeatherByCity(cityName);

    });

}

if (useLocationBtn) {

    useLocationBtn.addEventListener("click", function () {

        requestWeatherByLocation();

    });

}

if (unitCelsiusBtn) {

    unitCelsiusBtn.addEventListener("click", function () {

        setWeatherUnit("celsius");

    });

}

if (unitFahrenheitBtn) {

    unitFahrenheitBtn.addEventListener("click", function () {

        setWeatherUnit("fahrenheit");

    });

}

updateUnitButtons();

console.log("Sourabh Rathore's portfolio loaded successfully.");


// ==========================================
// AI CHATBOT SECTION
// ==========================================
const chatbotForm = document.getElementById("chatbot-form");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotMessages = document.getElementById("chatbot-messages");
const chatbotSend = document.getElementById("chatbot-send");
const chatbotStatus = document.getElementById("chatbot-status");
const CHATBOT_API_URL = "https://portfolio-ai-chatbot.rsourabh041.workers.dev/api/chat";

function addChatMessage(text, role) {
    const message = document.createElement("div");
    message.className = "chat-message " + (role === "user" ? "user-message" : "bot-message");
    const label = document.createElement("span");
    label.className = "chat-message-label";
    label.textContent = role === "user" ? "You" : "AI Assistant";
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    message.append(label, paragraph);
    chatbotMessages.appendChild(message);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return message;
}

async function sendChatbotMessage(rawMessage) {
    const message = rawMessage.trim();
    if (!message || !chatbotSend) return;
    addChatMessage(message, "user");
    chatbotInput.value = "";
    chatbotSend.disabled = true;
    chatbotStatus.textContent = "Thinking...";
    const thinkingMessage = addChatMessage("One moment, I'm preparing a response...", "bot");

    try {
        const response = await fetch(CHATBOT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || data.message || "The chatbot service returned an error.");
        }
        const reply = data.reply || data.response || data.answer || data.message || data.output || data.text;
        if (typeof reply !== "string" || !reply.trim()) {
            throw new Error("The chatbot responded, but its reply format was not recognized.");
        }
        thinkingMessage.querySelector("p").textContent = reply;
        chatbotStatus.textContent = "Message sent. Ask another question anytime.";
    } catch (error) {
        thinkingMessage.querySelector("p").textContent = "Sorry, I couldn't connect to the AI assistant right now. Please try again in a moment.";
        chatbotStatus.textContent = "Connection issue: " + error.message;
    } finally {
        chatbotSend.disabled = false;
        chatbotInput.focus();
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
}

if (chatbotForm) {
    chatbotForm.addEventListener("submit", function (event) {
        event.preventDefault();
        sendChatbotMessage(chatbotInput.value);
    });
}

document.querySelectorAll(".chat-prompt").forEach(function (button) {
    button.addEventListener("click", function () {
        sendChatbotMessage(button.dataset.question || "");
    });
});
