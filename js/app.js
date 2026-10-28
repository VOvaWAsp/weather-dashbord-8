
const apiKey = "a66281db80595ed12520a9c8df8e5b0a";

const apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";

const weatherSearchForm = document.querySelector("#weather-search-form");
const cityInput = document.querySelector("#weather-input");
const error = document.querySelector(".error");

const containerSingle = document.querySelector("#current-weather");
const weatherImg = document.querySelector(".weather-img");

const listContainer = document.querySelector("#forecast");
const title = document.querySelector(".title");
const avgTemp = document.querySelector("#avg-temp");

const weatherForm = document.querySelector("#weather-form");
const dayInput = document.querySelector("#day");
const tempInput = document.querySelector("#tempC");
const descriptionInput = document.querySelector("#description");
const recordsList = document.querySelector("#records-list");
const hottestDayButton = document.querySelector("#hottest-day-button");
const hottestDayResult = document.querySelector("#hottest-day-result");

const weatherRecords = [];

const weatherTranslations = {
    "clear sky": "Ясно",
    "few clouds": "Малохмарно",
    "scattered clouds": "Мінлива хмарність",
    "broken clouds": "Хмарно",
    "overcast clouds": "Похмуро",
    "shower rain": "Злива",
    "rain": "Дощ",
    "light rain": "Невеликий дощ",
    "moderate rain": "Помірний дощ",
    "heavy intensity rain": "Сильний дощ",
    "thunderstorm": "Гроза",
    "snow": "Сніг",
    "mist": "Туман",
    "fog": "Туман"
};

async function getWeather(city) {
    try {
        const response = await fetch(
            `${apiUrl}${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Місто не знайдено");
        }

        const temperature = Math.round(data.main.temp);

        document.querySelector(".city").textContent = data.name;
        document.querySelector(".temp").textContent = `${temperature}°C`;

        const description = data.weather[0].description;

        document.querySelector(".description").textContent =
            weatherTranslations[description] || description;

        weatherImg.src =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

        weatherImg.alt = description;

        containerSingle.classList.remove("cold", "warm", "mild");

        if (temperature <= 10) {
            containerSingle.classList.add("cold");
        } else if (temperature >= 25) {
            containerSingle.classList.add("warm");
        } else {
            containerSingle.classList.add("mild");
        }

        error.style.display = "none";
        containerSingle.style.display = "block";
    } catch (err) {
        console.error("Помилка отримання поточної погоди:", err);
        error.textContent =
            "Не вдалося знайти місто. Перевірте назву та спробуйте ще раз.";
        error.style.display = "block";
        containerSingle.style.display = "none";
    }
}

function renderForecast(forecastData) {
    listContainer
        .querySelectorAll(".forecast-card")
        .forEach(card => card.remove());

    if (forecastData.length === 0) {
        avgTemp.textContent = "Прогноз відсутній";
        return;
    }

    let totalTemp = 0;

    forecastData.forEach(item => {
        const card = document.createElement("article");
        card.classList.add("forecast-card");

        if (item.temp <= 10) {
            card.classList.add("cold");
        }

        const dayTitle = document.createElement("h3");
        dayTitle.textContent = item.date;

        const icon = document.createElement("img");
        icon.classList.add("forecast-icon");
        icon.src =
            `https://openweathermap.org/img/wn/${item.icon}@2x.png`;
        icon.alt = item.description;

        const tempText = document.createElement("p");
        tempText.textContent = `${item.temp}°C`;

        const description = document.createElement("p");
        description.textContent = item.description;

        card.append(dayTitle, icon, tempText, description);
        listContainer.append(card);

        totalTemp += item.temp;
    });

    const average = (totalTemp / forecastData.length).toFixed(1);

    avgTemp.textContent = `Середня температура: ${average}°C`;
}

async function getForecast(city) {
    try {
        const response = await fetch(
            `${forecastUrl}${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Не вдалося отримати прогноз");
        }

        const forecastData = data.list
            .filter((item, index) => index % 4 === 0)
            .slice(0, 7)
            .map(item => ({
                date: new Date(item.dt * 1000).toLocaleString("uk-UA", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                }),
                temp: Math.round(item.main.temp),
                description:
                    weatherTranslations[item.weather[0].description] ||
                    item.weather[0].description,
                icon: item.weather[0].icon
            }));

        console.log("Масив даних прогнозу:", forecastData);

        renderForecast(forecastData);

        listContainer.style.display = "grid";
        title.style.display = "block";
    } catch (err) {
        console.error("Помилка отримання прогнозу:", err);
        avgTemp.textContent = "Не вдалося завантажити прогноз";
    }
}

weatherSearchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchCity();
});

function searchCity() {
    const city = cityInput.value.trim();

    if (!city) {
        cityInput.setCustomValidity("Введіть назву міста.");
        cityInput.reportValidity();
        return;
    }

    cityInput.setCustomValidity("");

    getWeather(city);
    getForecast(city);

    weatherSearchForm.reset();
}

cityInput.addEventListener("input", () => {
    if (cityInput.value.trim() === "") {
        cityInput.setCustomValidity("Введіть назву міста.");
    } else {
        cityInput.setCustomValidity("");
    }
});

function renderRecords(records) {
    recordsList.replaceChildren();

    records.forEach(record => {
        const card = document.createElement("article");
        card.classList.add("forecast-card");

        const dayTitle = document.createElement("h3");
        dayTitle.textContent = record.day;

        const temperature = document.createElement("p");
        temperature.textContent = `${record.tempC}°C`;

        const description = document.createElement("p");
        description.textContent = record.description || "Опис відсутній";

        card.append(dayTitle, temperature, description);
        recordsList.append(card);
    });
}

weatherForm.addEventListener("submit", event => {
    event.preventDefault();

    const day = dayInput.value.trim();
    const tempC = Number(tempInput.value);
    const description = descriptionInput.value.trim();

    const newRecord = {
        day: day,
        tempC: tempC,
        description: description
    };

    weatherRecords.push(newRecord);

    renderRecords(weatherRecords);

    weatherForm.reset();
    tempInput.setCustomValidity("");

    hottestDayResult.textContent = "";
});

tempInput.addEventListener("input", () => {
    if (
        tempInput.value !== "" &&
        (
            Number(tempInput.value) < -50 ||
            Number(tempInput.value) > 50
        )
    ) {
        tempInput.setCustomValidity(
            "Температура поза реалістичним діапазоном"
        );
    } else {
        tempInput.setCustomValidity("");
    }
});

hottestDayButton.addEventListener("click", () => {
    if (weatherRecords.length === 0) {
        hottestDayResult.textContent =
            "Спочатку додайте запис про погоду.";
        return;
    }

    const hottestDay = weatherRecords.reduce((max, record) => {
        return record.tempC > max.tempC ? record : max;
    });

    hottestDayResult.textContent =
        `Найтепліший день: ${hottestDay.day}, ` +
        `${hottestDay.tempC}°C. ${hottestDay.description}`;
});

