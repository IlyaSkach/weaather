const API_KEY = "c2a4d3b120ba309a9bf7a6ba07f02ca4";

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
    // Добавляем код страны и язык
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},RU&units=metric&lang=ru&appid=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const data = await response.json();

    // Используем название города из ответа API
    const cityName = data.city.name;
    document.getElementById("city-name").textContent = `В ${cityName}`;

    const currentWeather = data.list[0];
    const temp = Math.round(currentWeather.main.temp);
    const feelsLike = Math.round(currentWeather.main.feels_like);
    const description = currentWeather.weather[0].description;
    const windSpeed = Math.round(currentWeather.wind.speed);
    const windDir = getWindDirection(currentWeather.wind.deg);

    const weatherText = `Сейчас ${description}, температура воздуха ${temp}°C, ощущается как ${feelsLike}°C. 
            Ветер ${windDir} ${windSpeed} м/с. Влажность воздуха ${currentWeather.main.humidity}%, 
            атмосферное давление ${currentWeather.main.pressure} мм рт. ст.`;

    document.getElementById("weather-description-text").textContent =
      weatherText;
    document.getElementById("current-date").textContent = formatDate(
      data.list[0].dt
    );

    const weatherData = document.getElementById("weather-data");
    const tomorrowWeather = document.getElementById("tomorrow-weather");

    weatherData.innerHTML = "";
    tomorrowWeather.innerHTML = "";

    const today = new Date().getDate();
    const currentHour = new Date().getHours();

    // Группируем прогнозы по дням и времени суток
    const forecasts = {
      today: { День: null, Вечер: null },
      tomorrow: { Ночь: null, Утро: null, День: null, Вечер: null },
    };

    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const hour = date.getHours();
      const timeOfDay = getTimeOfDay(hour);

      if (date.getDate() === today) {
        // Для сегодня показываем только день и вечер
        if (
          (timeOfDay === "День" && !forecasts.today.День) ||
          (timeOfDay === "Вечер" && !forecasts.today.Вечер)
        ) {
          forecasts.today[timeOfDay] = item;
        }
      } else if (date.getDate() === today + 1) {
        // Для завтра показываем все времена суток
        if (!forecasts.tomorrow[timeOfDay]) {
          forecasts.tomorrow[timeOfDay] = item;
        }
      }
    });

    // Функция создания строки таблицы
    function createRow(item, timeOfDay) {
      if (!item) return "";
      return `
                <tr>
                    <td>${timeOfDay}</td>
                    <td class="temperature">${Math.round(item.main.temp)}°</td>
                    <td><img src="https://openweathermap.org/img/wn/${
                      item.weather[0].icon
                    }@2x.png" class="weather-icon" alt="${
        item.weather[0].description
      }"></td>
                    <td class="weather-description">${
                      item.weather[0].description
                    }</td>
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

    // Заполняем таблицу для сегодня
    ["День", "Вечер"].forEach((timeOfDay) => {
      if (forecasts.today[timeOfDay]) {
        weatherData.innerHTML += createRow(
          forecasts.today[timeOfDay],
          timeOfDay
        );
      }
    });

    // Заполняем таблицу для завтра
    ["Ночь", "Утро", "День", "Вечер"].forEach((timeOfDay) => {
      if (forecasts.tomorrow[timeOfDay]) {
        tomorrowWeather.innerHTML += createRow(
          forecasts.tomorrow[timeOfDay],
          timeOfDay
        );
      }
    });

    // Добавляем информацию о погоде в аэропорту
    const airportCode = airportCodes[city];
    if (airportCode) {
      const metarData = await fetchMetar(airportCode);
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
          // Проверим, нет ли уже блока с погодой аэропорта
          const existingAirportWeather =
            weatherSummary.querySelector(".airport-weather");
          if (existingAirportWeather) {
            existingAirportWeather.remove();
          }
          weatherSummary.insertAdjacentHTML("beforeend", airportWeather);
        } else {
          console.error("Элемент .weather-summary не найден");
        }
      }
    }
  } catch (error) {
    console.error("Ошибка получения данных:", error);
    alert(`Ошибка: ${error.message}`);
  }
}

// Загружаем погоду при загрузке страницы
fetchWeather(city);
