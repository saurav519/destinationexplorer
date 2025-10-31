const searchButton = document.getElementById('search-button');
const destinationInput = document.getElementById('destination-input');
const slidesContainer = document.querySelector('.slides');
const prevButton = document.querySelector('.prev-slide');
const nextButton = document.querySelector('.next-slide');
const weatherContainer = document.querySelector('.weather-data');
const touristPlacesContainer = document.querySelector('.tourist-places-list');
const favoriteFoodContainer = document.querySelector('.favorite-food-list');

const unsplashApiKey = 'zJLpZU2iBSnIwVjCSxgtY_s2DDGonEj6y_ewpfOi0sA';
const geoapifyApiKey = '8bfa70c98c53406aba7b7c578939f9e7';
let images = [];
let currentSlide = 0;

const weatherIconMapping = {
    0: 'wi-day-sunny',
    1: 'wi-day-cloudy',
    2: 'wi-cloudy',
    3: 'wi-cloudy',
    45: 'wi-fog',
    48: 'wi-fog',
    51: 'wi-day-sprinkle',
    53: 'wi-day-sprinkle',
    55: 'wi-day-rain',
    56: 'wi-day-sleet',
    57: 'wi-day-sleet',
    61: 'wi-day-rain',
    63: 'wi-day-rain',
    65: 'wi-day-rain',
    66: 'wi-day-sleet',
    67: 'wi-day-sleet',
    71: 'wi-day-snow',
    73: 'wi-day-snow',
    75: 'wi-day-snow',
    77: 'wi-day-snow',
    80: 'wi-day-showers',
    81: 'wi-day-showers',
    82: 'wi-day-showers',
    85: 'wi-day-snow',
    86: 'wi-day-snow',
    95: 'wi-day-thunderstorm',
    96: 'wi-day-thunderstorm',
    99: 'wi-day-thunderstorm',
};

function showSlide(index) {
    if (images.length === 0) {
        slidesContainer.innerHTML = '<p>No images found for this destination.</p>';
        return;
    }
    const imageUrl = images[index].urls.regular;
    slidesContainer.innerHTML = `<img src="${imageUrl}" alt="${images[index].alt_description}">`;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % images.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + images.length) % images.length;
    showSlide(currentSlide);
}

async function fetchImages(destination) {
    if (!destination) {
        return;
    }

    const url = `https://api.unsplash.com/search/photos?query=${destination}&client_id=${unsplashApiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        images = data.results;
        currentSlide = 0;
        showSlide(currentSlide);
    } catch (error) {
        console.error('Error fetching images from Unsplash:', error);
        slidesContainer.innerHTML = '<p>Error fetching images. Please try again later.</p>';
    }
}

async function fetchCoordinates(destination) {
    if (!destination) {
        return null;
    }

    const url = `https://api.geoapify.com/v1/geocode/search?text=${destination}&apiKey=${geoapifyApiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            return {
                latitude: data.features[0].properties.lat,
                longitude: data.features[0].properties.lon,
                country: data.features[0].properties.country,
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null;
    }
}

async function fetchWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

function displayWeather(weatherData) {
    if (!weatherData) {
        weatherContainer.innerHTML = '<p>Could not fetch weather data.</p>';
        return;
    }

    const { daily } = weatherData;
    let html = '<div class="weather-grid">';
    for (let i = 0; i < daily.time.length; i++) {
        const weatherCode = daily.weathercode[i];
        const iconClass = weatherIconMapping[weatherCode] || 'wi-na';
        html += `<div class="weather-day">
            <div class="weather-date">${new Date(daily.time[i]).toLocaleDateString(undefined, { weekday: 'short' })}</div>
            <i class="wi ${iconClass} weather-icon"></i>
            <div class="weather-temps">
                <span class="temp-max">${daily.temperature_2m_max[i]}°C</span>
                <span class="temp-min">${daily.temperature_2m_min[i]}°C</span>
            </div>
        </div>`;
    }
    html += '</div>';
    weatherContainer.innerHTML = html;
    weatherContainer.classList.add('fade-in');
}

async function fetchTouristPlaces(latitude, longitude) {
    const url = `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:${longitude},${latitude},5000&apiKey=${geoapifyApiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching tourist places:', error);
        return null;
    }
}

function displayTouristPlaces(touristPlacesData) {
    if (!touristPlacesData || touristPlacesData.features.length === 0) {
        touristPlacesContainer.innerHTML = '<li>No tourist places found.</li>';
        return;
    }

    let html = '';
    for (const place of touristPlacesData.features) {
        html += `<li><i class="fas fa-map-marker-alt"></i> ${place.properties.name}</li>`;
    }
    touristPlacesContainer.innerHTML = html;
    touristPlacesContainer.classList.add('fade-in');
}

async function fetchFood(country) {
    if (!country) {
        return null;
    }

    const countryToAreaMapping = {
        "United States": "American",
        "United Kingdom": "British",
        "Canada": "Canadian",
        "China": "Chinese",
        "Croatia": "Croatian",
        "Netherlands": "Dutch",
        "Egypt": "Egyptian",
        "Philippines": "Filipino",
        "France": "French",
        "Greece": "Greek",
        "India": "Indian",
        "Ireland": "Irish",
        "Italy": "Italian",
        "Jamaica": "Jamaican",
        "Japan": "Japanese",
        "Kenya": "Kenyan",
        "Malaysia": "Malaysian",
        "Mexico": "Mexican",
        "Morocco": "Moroccan",
        "Poland": "Polish",
        "Portugal": "Portuguese",
        "Russia": "Russian",
        "Spain": "Spanish",
        "Syria": "Syrian",
        "Thailand": "Thai",
        "Tunisia": "Tunisian",
        "Turkey": "Turkish",
        "Ukraine": "Ukrainian",
        "Uruguay": "Uruguayan",
        "Vietnam": "Vietnamese"
    };

    const area = countryToAreaMapping[country] || country;

    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching food data:', error);
        return null;
    }
}

async function fetchFood(country) {
    if (!country) {
        return null;
    }

    const countryToAreaMapping = {
        "United States": "American",
        "United Kingdom": "British",
        "Canada": "Canadian",
        "China": "Chinese",
        "Croatia": "Croatian",
        "Netherlands": "Dutch",
        "Egypt": "Egyptian",
        "Philippines": "Filipino",
        "France": "French",
        "Greece": "Greek",
        "India": "Indian",
        "Ireland": "Irish",
        "Italy": "Italian",
        "Jamaica": "Jamaican",
        "Japan": "Japanese",
        "Kenya": "Kenyan",
        "Malaysia": "Malaysian",
        "Mexico": "Mexican",
        "Morocco": "Moroccan",
        "Poland": "Polish",
        "Portugal": "Portuguese",
        "Russia": "Russian",
        "Spain": "Spanish",
        "Syria": "Syrian",
        "Thailand": "Thai",
        "Tunisia": "Tunisian",
        "Turkey": "Turkish",
        "Ukraine": "Ukrainian",
        "Uruguay": "Uruguayan",
        "Vietnam": "Vietnamese"
    };

    const area = countryToAreaMapping[country] || country;

    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching food data:', error);
        return null;
    }
}

function displayFood(foodData) {
    if (!foodData || !foodData.meals) {
        favoriteFoodContainer.innerHTML = '<li>No food found for this destination.</li>';
        return;
    }

    let html = '';
    for (const meal of foodData.meals) {
        html += `<li><i class="fas fa-utensils"></i> ${meal.strMeal}</li>`;
    }
    favoriteFoodContainer.innerHTML = html;
}

// New functions for destination summary
const destinationSummaryContainer = document.getElementById('destination-summary-container');
const destinationSummaryTitle = document.getElementById('destination-summary-title');
const destinationSummaryText = document.getElementById('destination-summary-text');

async function fetchDestinationSummary(destination) {
    if (!destination) {
        return null;
    }
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${destination}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.extract;
    } catch (error) {
        console.error('Error fetching destination summary:', error);
        return null;
    }
}

function displayDestinationSummary(summary, destinationName) {
    if (!summary) {
        destinationSummaryTitle.textContent = destinationName;
        destinationSummaryText.textContent = 'No summary found for this destination.';
        destinationSummaryContainer.classList.add('fade-in');
        return;
    }

    const words = summary.split(' ');
    const truncatedSummary = words.slice(0, 200).join(' ') + (words.length > 200 ? '...' : '');

    destinationSummaryTitle.textContent = destinationName;
    destinationSummaryText.textContent = truncatedSummary;
    destinationSummaryContainer.classList.add('fade-in');
}

searchButton.addEventListener('click', async () => {
    const destination = destinationInput.value;
    fetchImages(destination);

    // Fetch and display destination summary
    const summary = await fetchDestinationSummary(destination);
    displayDestinationSummary(summary, destination);

    const coordinates = await fetchCoordinates(destination);
    if (coordinates) {
        const weatherData = await fetchWeather(coordinates.latitude, coordinates.longitude);
        displayWeather(weatherData);

        const touristPlacesData = await fetchTouristPlaces(coordinates.latitude, coordinates.longitude);
        displayTouristPlaces(touristPlacesData);

        const foodData = await fetchFood(coordinates.country);
        displayFood(foodData);

    } else {
        weatherContainer.innerHTML = '<p>Could not find coordinates for this destination.</p>';
        touristPlacesContainer.innerHTML = '<li>Could not find coordinates for this destination.</li>';
        favoriteFoodContainer.innerHTML = '<li>Could not find coordinates for this destination.</li>';
        destinationSummaryText.textContent = 'Could not find coordinates for this destination.';
    }
});

nextButton.addEventListener('click', nextSlide);
prevButton.addEventListener('click', prevSlide);

// Initially, you might want to show some default images or a message
slidesContainer.innerHTML = '<p>Enter a destination to see images.</p>';
weatherContainer.innerHTML = '<p>Enter a destination to see the weather forecast.</p>';
touristPlacesContainer.innerHTML = '<li>Enter a destination to see tourist places.</li>';
favoriteFoodContainer.innerHTML = '<li>Enter a destination to see favorite food.</li>';
destinationSummaryText.textContent = 'Enter a destination to see its summary.';
