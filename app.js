const apiKey = "8bc66c5d9f05ee4d210e287d8c8b8825"; // Keep your real key here

function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  axios.get(url)
    .then(function(response) {
      console.log(response.data);

      const data = response.data;

      // Extract data
      const cityName = data.name;
      const temperature = data.main.temp;
      const description = data.weather[0].description;
      const iconCode = data.weather[0].icon;

      // Update DOM
      document.getElementById("city").textContent = cityName;
      document.getElementById("temperature").textContent = temperature + "°C";
      document.getElementById("description").textContent = description;

      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
      document.getElementById("icon").src = iconUrl;
    })
    .catch(function(error) {
      console.error("Error fetching weather:", error);
    });
}

fetchWeather("London");
