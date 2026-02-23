const apiKey = "YOUR_API_KEY";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherContainer = document.getElementById("weatherContainer");

// Show loading spinner
function showLoading() {
  weatherContainer.innerHTML = `<div class="spinner"></div>`;
}

// Show error message
function showError(message) {
  weatherContainer.innerHTML = `<p class="error">${message}</p>`;
}

// Display weather data
function displayWeather(data) {
  weatherContainer.innerHTML = `
    <h2>${data.name}</h2>
    <p>Temperature: ${data.main.temp}°C</p>
    <p>${data.weather[0].description}</p>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
  `;
}

// Async function using async/await
async function getWeather(city) {
  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  showLoading();
  searchBtn.disabled = true;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);

    displayWeather(response.data);

  } catch (error) {
    showError("City not found. Please try again.");
  } finally {
    searchBtn.disabled = false;
  }
}

// Button click event
searchBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();
  getWeather(city);
  cityInput.value = "";
});

// Enter key support
cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    const city = cityInput.value.trim();
    getWeather(city);
    cityInput.value = "";
  }
});