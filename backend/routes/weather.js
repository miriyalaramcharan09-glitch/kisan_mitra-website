import { Router } from 'express';

const router = Router();

// Major agricultural regions coordinates
const CITY_COORDS = {
  hyderabad: { lat: 17.385, lon: 78.4867, name: 'Hyderabad, Telangana' },
  warangal: { lat: 17.9689, lon: 79.5941, name: 'Warangal, Telangana' },
  guntur: { lat: 16.3067, lon: 80.4365, name: 'Guntur, Andhra Pradesh' },
  vijayawada: { lat: 16.5062, lon: 80.648, name: 'Vijayawada, Andhra Pradesh' },
  kurnool: { lat: 15.8281, lon: 78.0373, name: 'Kurnool, Andhra Pradesh' },
  bengaluru: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru, Karnataka' },
  pune: { lat: 18.5204, lon: 73.8567, name: 'Pune, Maharashtra' },
  delhi: { lat: 28.6139, lon: 77.209, name: 'Delhi NCR' },
  lucknow: { lat: 26.8467, lon: 80.9462, name: 'Lucknow, Uttar Pradesh' },
  patna: { lat: 25.5941, lon: 85.1376, name: 'Patna, Bihar' },
};

function calculateFarmingAdvisory(temp, humidity, rainProb, windSpeed) {
  let spraying = {
    status: 'Favorable',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    advice: 'Good weather window for pesticide and fertilizer foliar spraying. Wind is calm and rain probability is low.'
  };

  if (rainProb > 45) {
    spraying = {
      status: 'Avoid Spraying',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      advice: 'High rain probability. Pesticide wash-off risk. Postpone foliar spraying until dry weather.'
    };
  } else if (windSpeed > 15) {
    spraying = {
      status: 'Caution - High Wind',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      advice: 'Wind speed exceeds 15 km/h. High drift hazard. Spray only during early morning calm hours.'
    };
  } else if (temp > 35) {
    spraying = {
      status: 'Early Morning / Evening Only',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      advice: 'High mid-day heat may cause rapid evaporation and leaf scorch. Spray between 6-9 AM or 4-6 PM.'
    };
  }

  let irrigation = {
    status: 'Normal Irrigation',
    advice: 'Maintain regular field moisture. Soil moisture levels are standard.'
  };
  if (rainProb > 50) {
    irrigation = {
      status: 'Hold Irrigation',
      advice: 'Rain expected in next 24-48 hours. Conserve water and prevent waterlogging.'
    };
  } else if (temp > 34 && humidity < 45) {
    irrigation = {
      status: 'Irrigation Needed',
      advice: 'High evapotranspiration rate. Provide light irrigation to prevent moisture stress.'
    };
  }

  let diseaseRisk = {
    level: 'Moderate',
    cause: 'Moderate humidity levels.'
  };
  if (humidity > 80 && temp >= 22 && temp <= 30) {
    diseaseRisk = {
      level: 'High Alert',
      cause: 'Combination of high humidity (>80%) and warm temperature (22-30°C) is ideal for fungal blast, blight, and mildew pathogens.'
    };
  } else if (humidity < 50) {
    diseaseRisk = {
      level: 'Low',
      cause: 'Dry air suppresses fungal sporulation. Watch for sucking pests (mites/thrips).'
    };
  }

  return { spraying, irrigation, diseaseRisk };
}

// GET /api/weather?lat=&lon=&city=
router.get('/', async (req, res) => {
  let lat = parseFloat(req.query.lat);
  let lon = parseFloat(req.query.lon);
  let cityName = 'Your Farm Location';

  const cityParam = (req.query.city || '').toLowerCase().trim();
  if (CITY_COORDS[cityParam]) {
    lat = CITY_COORDS[cityParam].lat;
    lon = CITY_COORDS[cityParam].lon;
    cityName = CITY_COORDS[cityParam].name;
  }

  if (isNaN(lat) || isNaN(lon)) {
    // Default to Hyderabad / Deccan agricultural belt
    lat = 17.385;
    lon = 78.4867;
    cityName = 'Hyderabad, Telangana';
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
    const response = await fetch(url, { headers: { 'User-Agent': 'KisanMitraApp/1.0' } });

    if (!response.ok) {
      throw new Error(`OpenMeteo HTTP ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const temp = Math.round(current.temperature_2m ?? 28);
    const humidity = Math.round(current.relative_humidity_2m ?? 65);
    const windSpeed = Math.round(current.wind_speed_10m ?? 8);
    const rainProb = daily.precipitation_probability_max?.[0] ?? 15;

    const advisory = calculateFarmingAdvisory(temp, humidity, rainProb, windSpeed);

    // Weather condition mapping
    const codeMap = {
      0: 'Clear Sky ☀️',
      1: 'Mainly Clear 🌤️',
      2: 'Partly Cloudy ⛅',
      3: 'Overcast ☁️',
      45: 'Foggy 🌫️',
      51: 'Light Drizzle 🌦️',
      61: 'Slight Rain 🌧️',
      63: 'Moderate Rain 🌧️',
      65: 'Heavy Rain ⛈️',
      80: 'Rain Showers 🌦️',
      95: 'Thunderstorm ⚡'
    };

    const condition = codeMap[current.weather_code] || 'Partly Cloudy ⛅';

    // 5-day forecast
    const forecast = (daily.time || []).slice(0, 5).map((date, idx) => ({
      date,
      dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? 32),
      minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? 22),
      rainProb: daily.precipitation_probability_max?.[idx] ?? 10,
      condition: codeMap[daily.weather_code?.[idx]] || 'Clear ☀️'
    }));

    return res.json({
      location: cityName,
      coordinates: { lat, lon },
      current: {
        temp,
        humidity,
        windSpeed,
        rainProb,
        condition,
        weatherCode: current.weather_code ?? 2
      },
      forecast,
      advisory
    });
  } catch (err) {
    console.warn('Weather API fallback used:', err.message);
    // Reliable fallback for offline or network issues
    const fallbackAdvisory = calculateFarmingAdvisory(29, 68, 20, 10);
    return res.json({
      location: cityName,
      coordinates: { lat, lon },
      current: {
        temp: 29,
        humidity: 68,
        windSpeed: 10,
        rainProb: 20,
        condition: 'Partly Cloudy ⛅',
        weatherCode: 2
      },
      forecast: [
        { date: 'Day 1', dayName: 'Today', maxTemp: 32, minTemp: 23, rainProb: 20, condition: 'Partly Cloudy ⛅' },
        { date: 'Day 2', dayName: 'Tomorrow', maxTemp: 33, minTemp: 24, rainProb: 15, condition: 'Mainly Clear 🌤️' },
        { date: 'Day 3', dayName: 'Thu', maxTemp: 31, minTemp: 22, rainProb: 35, condition: 'Showers 🌦️' },
        { date: 'Day 4', dayName: 'Fri', maxTemp: 30, minTemp: 22, rainProb: 40, condition: 'Rain 🌧️' },
        { date: 'Day 5', dayName: 'Sat', maxTemp: 32, minTemp: 23, rainProb: 10, condition: 'Sunny ☀️' }
      ],
      advisory: fallbackAdvisory,
      isFallback: true
    });
  }
});

export default router;
