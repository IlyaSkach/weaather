const API_KEY = "588ab13e48mshf126aa065283146p14cbe9jsna8d27fe80529"; // Вставьте свой API-ключ RapidAPI
const API_HOST = "meteostat.p.rapidapi.com";

const stations = {
    "Москва": { lat: 55.7558, lon: 37.6173 },
    "Санкт-Петербург": { lat: 59.9343, lon: 30.3351 },
    "Новосибирск": { lat: 55.0084, lon: 82.9357 }
};

const weatherContainer = document.getElementById("weather");

// Получаем данные по всем городам
Promise.all(
    Object.entries(stations).map(([city, { lat, lon }]) =>
        fetch(`https://${API_HOST}/point/daily?lat=${lat}&lon=${lon}&alt=200&start=2024-03-05&end=2024-03-05`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": API_KEY,
                "x-rapidapi-host": API_HOST
            }
        })
        .then(response => response.json())
        .then(data => ({
            city,
            weather: data.data?.[0] // Берем последние доступные данные
        }))
    )
).then(results => {
    weatherContainer.innerHTML = results.map(({ city, weather }) =>
        weather
            ? `<p><strong>${city}</strong>: ${weather.tavg}°C, Ветер: ${weather.wspd} км/ч</p>`
            : `<p><strong>${city}</strong>: Нет данных</p>`
    ).join("");
}).catch(error => console.error("Ошибка загрузки погоды:", error));

