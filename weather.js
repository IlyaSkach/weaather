const API_KEY = "c2a4d3b120ba309a9bf7a6ba07f02ca4";
const YR_USER_AGENT = "WeatherApp/1.0 skachilya@gmail.com"; // Важно указать контакт для yr.no

// Получаем параметр city из URL
const urlParams = new URLSearchParams(window.location.search);
const city = urlParams.get("city");

if (!city) {
  window.location.href = "index.html";
}

// Удалим неиспользуемые API ключи
const airportCodes = {
  Moscow: "UUEE", // Шереметьево
  "Saint Petersburg": "ULLI", // Пулково
  Novosibirsk: "UNNT", // Новосибирск
  Yekaterinburg: "USSS", // Кольцово
  Vladivostok: "UHWW", // Владивосток
  Sochi: "URSS", // Сочи
  Murmansk: "ULMM", // Мурманск
  Samara: "UWWW", // Самара
  Volgograd: "URWW", // Волгоград
  Magnitogorsk: "USCM", // Магнитогорск
  "Nizhniy Novgorod": "UWGG", // Нижний Новгород
  Novokuznetsk: "UNWW", // Новокузнецк
  Voronezh: "UUOO", // Воронеж
};

// Добавим описания аэропортов
const airportNames = {
  UUEE: "Шереметьево",
  ULLI: "Пулково",
  UNNT: "Новосибирск (Толмачёво)",
  USSS: "Кольцово",
  UHWW: "Владивосток",
  URSS: "Сочи",
  ULMM: "Мурманск",
  UWWW: "Самара (Курумоч)",
  URWW: "Волгоград",
  USCM: "Магнитогорск",
  UWGG: "Нижний Новгород (Стригино)",
  UNWW: "Новокузнецк (Спиченково)",
  UUOO: "Воронеж",
};

// Координаты городов для yr.no
const cityCoordinates = {
  Moscow: { lat: 55.7558, lon: 37.6173 },
  "Saint Petersburg": { lat: 59.9343, lon: 30.3351 },
  Novosibirsk: { lat: 55.0084, lon: 82.9357 },
  Yekaterinburg: { lat: 56.8389, lon: 60.6057 },
  Vladivostok: { lat: 43.1198, lon: 131.8869 },
  Sochi: { lat: 43.6028, lon: 39.7342 },
  Murmansk: { lat: 68.9585, lon: 33.0827 },
  Samara: { lat: 53.1959, lon: 50.1001 },
  Volgograd: { lat: 48.708, lon: 44.5133 },
  Magnitogorsk: { lat: 53.4186, lon: 58.9705 },
  "Nizhniy Novgorod": { lat: 56.2965, lon: 43.9361 },
  Novokuznetsk: { lat: 53.7557, lon: 87.1099 },
  Voronezh: { lat: 51.672, lon: 39.1843 },
};

function getWindDirection(deg) {
  const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
  return directions[Math.round(deg / 45) % 8];
}

function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 12) return "Утро";
  if (hour >= 12 && hour < 17) return "День";
  if (hour >= 17 && hour < 23) return "Вечер";
  return "Ночь";
}

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const days = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  const months = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

async function fetchMetar(airportCode) {
  try {
    // Создаем фиктивные данные для демонстрации
    const now = new Date();
    const temp = Math.round(Math.random() * 30 - 10); // от -10 до +20
    const visibility = Math.round(Math.random() * 8 + 2); // от 2 до 10
    const windDir = Math.round(Math.random() * 360);
    const windSpeed = Math.round(Math.random() * 15);

    return {
      station: airportCode,
      name: airportNames[airportCode],
      temp: { value: temp },
      visibility: { value: visibility },
      wind: {
        direction: { value: windDir },
        speed: { value: windSpeed },
      },
      time: now,
    };
  } catch (error) {
    console.error("Ошибка METAR:", error);
    return null;
  }
}

async function fetchWeather(city) {
  try {
    const coords = cityCoordinates[city];
    if (!coords) throw new Error("Город не найден");

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw API response:", data); // Отладочная информация

    const forecasts = {
      today: [],
      tomorrow: [],
    };

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const isToday = date.getDate() === today.getDate();
      const isTomorrow = date.getDate() === tomorrow.getDate();

      if (isToday || isTomorrow) {
        const weatherData = {
          dt: item.dt,
          hour: date.getHours(),
          main: {
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            pressure: Math.round(item.main.pressure * 0.750062),
            humidity: item.main.humidity,
          },
          weather: [
            {
              id: item.weather[0].id, // Убедимся, что ID передается корректно
              description: getWeatherDescription(item.weather[0].id),
            },
          ],
          wind: {
            speed: item.wind.speed,
            deg: item.wind.deg,
          },
        };

        console.log("Processed weather data:", weatherData); // Отладочная информация

        if (isToday) {
          forecasts.today.push(weatherData);
        } else {
          forecasts.tomorrow.push(weatherData);
        }
      }
    });

    // Обновляем интерфейс
    updateWeatherDisplay(forecasts, city);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

function getWeatherDescription(weatherId) {
  // Преобразуем коды OpenWeather в описания
  const descriptions = {
    200: "Гроза с небольшим дождем",
    201: "Гроза с дождем",
    202: "Гроза с сильным дождем",
    210: "Легкая гроза",
    211: "Гроза",
    212: "Сильная гроза",
    221: "Прерывистая гроза",
    230: "Гроза с мелкой моросью",
    231: "Гроза с моросью",
    232: "Гроза с сильной моросью",
    300: "Легкая морось",
    301: "Морось",
    302: "Сильная морось",
    310: "Легкий моросящий дождь",
    311: "Моросящий дождь",
    312: "Сильный моросящий дождь",
    313: "Ливень и морось",
    314: "Сильный ливень и морось",
    321: "Ливневый дождь",
    500: "Небольшой дождь",
    501: "Дождь",
    502: "Сильный дождь",
    503: "Очень сильный дождь",
    504: "Экстремальный дождь",
    511: "Ледяной дождь",
    520: "Небольшой ливень",
    521: "Ливень",
    522: "Сильный ливень",
    531: "Прерывистый ливень",
    600: "Небольшой снег",
    601: "Снег",
    602: "Сильный снег",
    611: "Мокрый снег",
    612: "Небольшой мокрый снег",
    613: "Ливень с мокрым снегом",
    615: "Небольшой дождь со снегом",
    616: "Дождь со снегом",
    620: "Небольшой снегопад",
    621: "Снегопад",
    622: "Сильный снегопад",
    701: "Туман",
    711: "Дымка",
    721: "Мгла",
    731: "Песчаная буря",
    741: "Туман",
    751: "Песчаная буря",
    761: "Пыльная буря",
    762: "Вулканический пепел",
    771: "Шквалы",
    781: "Торнадо",
    800: "Ясно",
    801: "Небольшая облачность",
    802: "Переменная облачность",
    803: "Облачно с прояснениями",
    804: "Пасмурно",
  };
  return descriptions[weatherId] || "Неизвестно";
}

function getWeatherIcon(weatherId, hour) {
  const isDay = hour >= 6 && hour < 22;

  // Преобразуем коды OpenWeather в названия иконок
  const iconMap = {
    200: isDay ? "thunderstorm" : "thunderstorm-night",
    201: isDay ? "thunderstorm" : "thunderstorm-night",
    202: "extreme-thunderstorm",
    210: isDay ? "thunderstorm" : "thunderstorm-night",
    211: isDay ? "thunderstorm" : "thunderstorm-night",
    212: "extreme-thunderstorm",
    221: isDay ? "thunderstorm" : "thunderstorm-night",
    230: isDay ? "thunderstorm" : "thunderstorm-night",
    231: isDay ? "thunderstorm" : "thunderstorm-night",
    232: "extreme-thunderstorm",
    300: "drizzle",
    301: "drizzle",
    302: "rain",
    310: "rain",
    311: "rain",
    312: "extreme-rain",
    313: "rain",
    314: "extreme-rain",
    321: "rain",
    500: isDay ? "rain" : "rain-night",
    501: isDay ? "rain" : "rain-night",
    502: "extreme-rain",
    503: "extreme-rain",
    504: "extreme-rain",
    511: "sleet",
    520: isDay ? "rain" : "rain-night",
    521: isDay ? "rain" : "rain-night",
    522: "extreme-rain",
    531: "rain",
    600: isDay ? "snow" : "snow-night",
    601: isDay ? "snow" : "snow-night",
    602: "extreme-snow",
    611: "sleet",
    612: "sleet",
    613: "sleet",
    615: "sleet",
    616: "sleet",
    620: isDay ? "snow" : "snow-night",
    621: isDay ? "snow" : "snow-night",
    622: "extreme-snow",
    701: "mist",
    711: "fog",
    721: "fog",
    731: "wind",
    741: "fog",
    751: "wind",
    761: "wind",
    762: "fog",
    771: "wind",
    781: "extreme-thunderstorm",
    800: isDay ? "clear-day" : "clear-night",
    801: isDay ? "partly-cloudy-day" : "partly-cloudy-night",
    802: isDay ? "partly-cloudy-day" : "partly-cloudy-night",
    803: "cloudy",
    804: "overcast",
  };

  const iconName = iconMap[weatherId] || (isDay ? "clear-day" : "clear-night");
  const iconPath = `icons/${iconName}.svg`;

  // Проверяем наличие файла (можно добавить для отладки)
  console.log(`Loading icon: ${iconPath} for weather ID: ${weatherId}`);

  return iconPath;
}

// Обновляем функцию создания строки таблицы
function createRow(item) {
  if (!item) return "";
  const hour = String(item.hour).padStart(2, "0") + ":00";

  // Добавляем отладочную информацию
  console.log("Weather data:", {
    hour: item.hour,
    weatherId: item.weather[0].id,
    description: item.weather[0].description,
    isDay: item.hour >= 6 && item.hour < 22,
  });

  const iconUrl = getWeatherIcon(item.weather[0].id, item.hour);

  return `
        <tr>
            <td>${hour}</td>
            <td class="temperature">${Math.round(item.main.temp)}°</td>
            <td class="weather-icon-cell">
                <img src="${iconUrl}" 
                     alt="${item.weather[0].description}" 
                     class="weather-icon"
                     onerror="this.src='icons/clear-day.svg'">
            </td>
            <td class="weather-description">${item.weather[0].description}</td>
            <td class="pressure">${item.main.pressure}</td>
            <td class="humidity">${item.main.humidity}%</td>
            <td class="wind-info">
                <span class="wind-direction">${getWindDirection(
                  item.wind.deg
                )}</span>, 
                ${Math.round(item.wind.speed)} м/с
            </td>
        </tr>
    `;
}

// Обновляем функцию обновления таблиц
function updateWeatherTables(forecasts) {
  const weatherData = document.getElementById("weather-data");
  const tomorrowWeather = document.getElementById("tomorrow-weather");

  weatherData.innerHTML = "";
  tomorrowWeather.innerHTML = "";

  // Заполняем таблицу для сегодня
  forecasts.today.forEach((hourData) => {
    weatherData.innerHTML += createRow(hourData);
  });

  // Заполняем таблицу для завтра
  forecasts.tomorrow.forEach((hourData) => {
    tomorrowWeather.innerHTML += createRow(hourData);
  });
}

function updateWeatherDisplay(forecasts, city) {
  document.getElementById("city-name").textContent = `В ${city}`;

  const currentWeather = forecasts.today[0] || forecasts.today[1];
  if (currentWeather) {
    const temp = Math.round(currentWeather.main.temp);
    const feelsLike = Math.round(currentWeather.main.feels_like);
    const description = currentWeather.weather[0].description;
    const windSpeed = Math.round(currentWeather.wind.speed);
    const windDir = getWindDirection(currentWeather.wind.deg);
    const iconUrl = getWeatherIcon(currentWeather.weather[0].id, currentWeather.hour);

    // Обновляем карточку текущей погоды
    document.getElementById("current-weather-icon").src = iconUrl;
    document.querySelector(".current-temp").textContent = `${temp}°C`;
    document.querySelector(".current-desc").textContent = description;
    document.querySelector(".current-feels-like").textContent = `Ощущается как ${feelsLike}°C`;
    document.querySelector(".humidity-value").textContent = `${currentWeather.main.humidity}%`;
    document.querySelector(".pressure-value").textContent = `${currentWeather.main.pressure} мм рт. ст.`;
    document.querySelector(".wind-value").textContent = `${windDir}, ${windSpeed} м/с`;

    // Обновляем остальную информацию
    document.getElementById("current-date").textContent = formatDate(currentWeather.dt);
  }

  // Обновление таблиц
  updateWeatherTables(forecasts);

  // Добавляем информацию о погоде в аэропорту
  const airportCode = airportCodes[city];
  if (airportCode) {
    fetchMetar(airportCode).then((metarData) => {
      if (metarData) {
        const airportWeather = `
                    <div class="airport-weather">
                        <h3>Погода в аэропорту ${metarData.name}</h3>
                        <p>Температура: ${metarData.temp.value}°C</p>
                        <p>Видимость: ${metarData.visibility.value} км</p>
                        <p>Ветер: ${metarData.wind.direction.value}° ${
          metarData.wind.speed.value
        } м/с</p>
                        <p>Время наблюдения: ${metarData.time.toLocaleTimeString()}</p>
                    </div>
                `;

        const weatherSummary = document.querySelector(".weather-summary");
        if (weatherSummary) {
          const existingAirportWeather =
            weatherSummary.querySelector(".airport-weather");
          if (existingAirportWeather) {
            existingAirportWeather.remove();
          }
          weatherSummary.insertAdjacentHTML("beforeend", airportWeather);
        }
      }
    });
  }
}

// Загружаем погоду при загрузке страницы
fetchWeather(city);
