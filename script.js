const API_KEY = "c2a4d3b120ba309a9bf7a6ba07f02ca4";
const citySelect = document.getElementById("city");

function getWindDirection(deg) {
    const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
    return directions[Math.round(deg / 45) % 8];
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    return hours + ':00';
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=ru&appid=${API_KEY}`);
        const data = await response.json();
        
        const cityName = city.split(',')[0];
        document.getElementById('city-name').textContent = `В ${cityName}`;
        
        const currentWeather = data.list[0];
        const temp = Math.round(currentWeather.main.temp);
        const feelsLike = Math.round(currentWeather.main.feels_like);
        const description = currentWeather.weather[0].description;
        const windSpeed = Math.round(currentWeather.wind.speed);
        const windDir = getWindDirection(currentWeather.wind.deg);
        
        const weatherText = `Сейчас ${description}, температура воздуха ${temp}°C, ощущается как ${feelsLike}°C. 
            Ветер ${windDir} ${windSpeed} м/с. Влажность воздуха ${currentWeather.main.humidity}%, 
            атмосферное давление ${currentWeather.main.pressure} мм рт. ст.`;
        
        document.getElementById('weather-description-text').textContent = weatherText;
        
        document.getElementById('current-date').textContent = formatDate(data.list[0].dt);
        
        const weatherData = document.getElementById('weather-data');
        const tomorrowWeather = document.getElementById('tomorrow-weather');
        
        weatherData.innerHTML = '';
        tomorrowWeather.innerHTML = '';

        const today = new Date().getDate();
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const row = `
                <tr>
                    <td>${formatTime(item.dt)}</td>
                    <td class="temperature">${Math.round(item.main.temp)}°</td>
                    <td><img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" class="weather-icon" alt="${item.weather[0].description}"></td>
                    <td class="weather-description">${item.weather[0].description}</td>
                    <td class="pressure">${item.main.pressure}</td>
                    <td class="humidity">${item.main.humidity}%</td>
                    <td class="wind-info">
                        <span class="wind-direction">${getWindDirection(item.wind.deg)}</span>, 
                        ${Math.round(item.wind.speed)} м/с
                    </td>
                </tr>
            `;
            
            if (date.getDate() === today) {
                weatherData.innerHTML += row;
            } else if (date.getDate() === today + 1) {
                tomorrowWeather.innerHTML += row;
            }
        });
    } catch (error) {
        console.error("Ошибка получения данных:", error);
        alert(`Ошибка: ${error.message}`);
    }
}

citySelect.addEventListener("change", function() {
    fetchWeather(this.value);
});

fetchWeather(citySelect.value); 