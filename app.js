const apiKey = "8bc66c5d9f05ee4d210e287d8c8b8825";

/* ===== CONSTRUCTOR ===== */
function WeatherApp() {
    // DOM Elements
    this.cityElement = document.getElementById("city");
    this.tempElement = document.getElementById("temperature");
    this.descElement = document.getElementById("description");
    this.iconElement = document.getElementById("icon");
    this.forecastContainer = document.getElementById("forecast-container");

    this.cityInput = document.getElementById("cityInput");
    this.searchBtn = document.getElementById("searchBtn");
}

/* ===== INIT ===== */
WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));
    this.cityInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") this.handleSearch();
    });

    this.getWeather("London"); // default city
};

/* ===== HANDLE SEARCH ===== */
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();
    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }
    this.getWeather(city);
    this.cityInput.value = "";
};

/* ===== GET WEATHER + FORECAST ===== */
WeatherApp.prototype.getWeather = async function (city) {
    try {
        this.showLoading();
        this.searchBtn.disabled = true;

        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        const [weatherResponse, forecastResponse] = await Promise.all([
            axios.get(weatherURL),
            axios.get(forecastURL)
        ]);

        this.displayWeather(weatherResponse.data);
        const dailyForecast = this.processForecastData(forecastResponse.data.list);
        this.displayForecast(dailyForecast);

    } catch (error) {
        this.showError("City not found. Please try again.");
    } finally {
        this.searchBtn.disabled = false;
    }
};

/* ===== DISPLAY CURRENT WEATHER ===== */
WeatherApp.prototype.displayWeather = function (data) {
    this.cityElement.textContent = data.name;
    this.tempElement.textContent = Math.round(data.main.temp) + "°C";
    this.descElement.textContent = data.weather[0].description
        .split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
    const iconCode = data.weather[0].icon;
    this.iconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

/* ===== PROCESS FORECAST DATA ===== */
WeatherApp.prototype.processForecastData = function (list) {
    // filter only noon forecasts and pick 5 days
    const dailyForecast = list.filter(item => item.dt_txt.includes("12:00:00"));
    return dailyForecast.slice(0, 5);
};

/* ===== DISPLAY FORECAST ===== */
WeatherApp.prototype.displayForecast = function (forecastData) {
    this.forecastContainer.innerHTML = "";

    forecastData.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString("en-US", { weekday: "long" });
        const temp = Math.round(item.main.temp);
        const description = item.weather[0].description
            .split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
        const iconCode = item.weather[0].icon;

        const card = `
            <div class="forecast-card">
                <h4>${day}</h4>
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" />
                <p>${temp}°C</p>
                <p>${description}</p>
            </div>
        `;

        this.forecastContainer.innerHTML += card;
    });
};

/* ===== LOADING ===== */
WeatherApp.prototype.showLoading = function () {
    this.cityElement.textContent = "Loading...";
    this.tempElement.textContent = "";
    this.descElement.textContent = "";
    this.iconElement.src = "";
    this.forecastContainer.innerHTML = "";
};

/* ===== ERROR ===== */
WeatherApp.prototype.showError = function (message) {
    this.cityElement.textContent = "Error";
    this.tempElement.textContent = message;
    this.descElement.textContent = "";
    this.iconElement.src = "";
    this.forecastContainer.innerHTML = "";
};

/* ===== CREATE INSTANCE ===== */
const app = new WeatherApp();
app.init();