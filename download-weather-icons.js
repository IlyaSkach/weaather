const fs = require('fs');
const https = require('https');
const path = require('path');

const baseUrl = 'https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg';
const icons = {
    // Дневные иконки
    'clear-day': 'clear-day.svg',
    'partly-cloudy-day': 'partly-cloudy-day.svg',
    'cloudy': 'cloudy.svg',
    'overcast': 'overcast.svg',
    'rain': 'rain.svg',
    'snow': 'snow.svg',
    'sleet': 'sleet.svg',
    'thunderstorm': 'thunderstorms.svg',
    'fog': 'fog.svg',
    'drizzle': 'drizzle.svg',
    'wind': 'wind.svg',
    'mist': 'mist.svg',

    // Ночные иконки
    'clear-night': 'clear-night.svg',
    'partly-cloudy-night': 'partly-cloudy-night.svg',
    'rain-night': 'rain-night.svg',
    'snow-night': 'snow-night.svg',
    'thunderstorm-night': 'thunderstorms-night.svg',

    // Экстремальные погодные условия
    'extreme-rain': 'extreme-rain.svg',
    'extreme-snow': 'extreme-snow.svg',
    'extreme-thunderstorm': 'extreme-thunderstorms.svg',
    'extreme-fog': 'extreme-fog.svg'
};

const downloadIcon = (name, filename) => {
    const url = `${baseUrl}/${filename}`;
    const filePath = path.join(__dirname, 'icons', `${name}.svg`);

    https.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    }, (response) => {
        if (response.statusCode === 404) {
            console.error(`Icon not found: ${name}`);
            return;
        }
        const file = fs.createWriteStream(filePath);
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded: ${name}.svg`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading ${name}.svg:`, err);
    });
};

// Создаем директорию для иконок, если её нет
const iconDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir);
}

// Скачиваем все иконки
Object.entries(icons).forEach(([name, filename]) => downloadIcon(name, filename)); 