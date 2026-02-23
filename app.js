const apiKey = "8bc66c5d9f05ee4d210e287d8c8b8825";

/* CONSTRUCTOR */
function WeatherApp() {
    this.cityElement = document.getElementById("city");
    this.tempElement = document.getElementById("temperature");
    this.descElement = document.getElementById("description");
    this.iconElement = document.getElementById("icon");
    this.forecastContainer = document.getElementById("forecast-container");

    this.cityInput = document.getElementById("cityInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.recentContainer = document.getElementById("recent-searches");

    this.recentSearches = [];
}

/* INIT */
WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));
    this.cityInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") this.handleSearch();
    });

    this.loadRecentSearches();
    this.loadLastCity();
};

/* HANDLE SEARCH */
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();
    if (!city) return this.showError("Please enter a city name.");

    this.getWeather(city);
    this.cityInput.value = "";
};

/* GET WEATHER + FORECAST */
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
        const processedForecast = this.processForecastData(forecastResponse.data.list);
        this.displayForecast(processedForecast);

        this.saveRecentSearch(city);

    } catch (error) {
        this.showError("City not found. Please try again.");
    } finally {
        this.searchBtn.disabled = false;
    }
};

/* DISPLAY CURRENT WEATHER */
WeatherApp.prototype.displayWeather = function (data) {
    this.cityElement.textContent = data.name;
    this.tempElement.textContent = data.main.temp + "°C";
    this.descElement.textContent = data.weather[0].description;

    const iconCode = data.weather[0].icon;
    this.iconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

/* PROCESS FORECAST */
WeatherApp.prototype.processForecastData = function (forecastList) {
    const dailyForecast = forecastList.filter(item => item.dt_txt.includes("12:00:00"));
    return dailyForecast.slice(0, 5);
};

/* DISPLAY FORECAST */
WeatherApp.prototype.displayForecast = function (forecastData) {
    this.forecastContainer.innerHTML = "";

    forecastData.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString("en-US", { weekday: "long" });
        const temp = item.main.temp;
        const description = item.weather[0].description;
        const iconCode = item.weather[0].icon;

        const card = `
            <div class="forecast-card">
                <h4>${day}</h4>
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" />
                <p>${temp}°C</p>
                <p>${description}</p>
            </div>
        `;
        this.forecastContainer.innerHTML += card;
    });
};

/* LOADING */
WeatherApp.prototype.showLoading = function () {
    this.cityElement.textContent = "Loading...";
    this.tempElement.textContent = "";
    this.descElement.textContent = "";
    this.iconElement.src = "";
    this.forecastContainer.innerHTML = "";
};

/* ERROR */
WeatherApp.prototype.showError = function (message) {
    this.cityElement.textContent = "Error";
    this.tempElement.textContent = message;
    this.descElement.textContent = "";
    this.iconElement.src = "";
    this.forecastContainer.innerHTML = "";
};

/* LOCALSTORAGE METHODS */
WeatherApp.prototype.loadRecentSearches = function () {
    const saved = JSON.parse(localStorage.getItem("recentSearches")) || [];
    this.recentSearches = saved;
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function (city) {
    const titleCase = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    this.recentSearches = this.recentSearches.filter(c => c !== titleCase);
    this.recentSearches.unshift(titleCase);

    if (this.recentSearches.length > 5) this.recentSearches.pop();

    localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));
    localStorage.setItem("lastCity", titleCase);
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    this.recentContainer.innerHTML = "";
    this.recentSearches.forEach(city => {
        const btn = document.createElement("button");
        btn.className = "recent-btn";
        btn.textContent = city;
        btn.addEventListener("click", () => this.getWeather(city));
        this.recentContainer.appendChild(btn);
    });
};

WeatherApp.prototype.loadLastCity = function () {
    const lastCity = localStorage.getItem("lastCity") || "London";
    this.getWeather(lastCity);
};

/* CREATE INSTANCE */
const app = new WeatherApp();
app.init();