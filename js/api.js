"use strict";

import { getWeatherIcon } from "/js/helper.js";

const locationButton = document.querySelector("button");
const resetButton = document.querySelector("#reset");
const rain = document.querySelector("#rain");
const noRain = document.querySelector("#noRain");
const error = document.querySelector("#error");
const actually = document.querySelector("#actually");
const nextHours = document.querySelector("#nextHours");

function clean() {
  rain.classList.add("hidden");
  noRain.classList.add("hidden");
  error.classList.add("hidden");
  actually.classList.add("hidden");
  nextHours.classList.add("hidden");
}
clean();

function showActuallyData(current) {
  const date = new Date();
  const now = date.getDate() + " - " + (date.getMonth() + 1);
  const hourData = date.getHours();

  const h2 = document.querySelector("#actually h2");
  h2.textContent = now;

  const hour = document.querySelector("#actually .actuallyHour");
  hour.textContent = `${hourData} h.`;

  const degree = document.querySelector("#actually .degree");
  degree.textContent = `${Math.round(parseInt(current.temp) - 273.15)} ºC`;

  const img = document.querySelector("#actually img");
  img.src = getWeatherIcon(current.weather[0].main);
}

function showHourlyData(hourly) {
  const date = new Date();
  const hour = date.getHours();

  hourly.forEach((item, index) => {
    const section = document.createElement("section");
    const next = document.createElement("h3");
    const degree = document.createElement("p");
    const img = document.createElement("img");

    const hourData = hour + index + 1;
    if (hourData <= 24) {
      next.textContent = `${hourData} h.`;
    } else if (hourData > 24) {
      next.textContent = `${hourData - 24} h.`;
    }

    img.src = getWeatherIcon(hourly[index].weather[0].main);

    degree.textContent = `${Math.round(parseInt(item.temp) - 273.15)} ºC`;

    section.appendChild(next);
    section.appendChild(img);
    section.appendChild(degree);
    nextHours.appendChild(section);
  });
}

function removeHidden(square) {
  square.classList.remove("hidden");
}

locationButton.addEventListener("click", async () => {
  removeHidden(actually, nextHours);
  locationButton.classList.add("hidden");

  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=16ce9a4a05f095cfc0c771f280038c39`
        );

        if (response.ok) {
          const data = await response.json();
          const finalData = {
            current: data.current,
            hourly: data.hourly.slice(0, 7),
          };

          showActuallyData(finalData.current);

          showHourlyData(finalData.hourly);

          if (
            finalData.current.weather.main === "Rain" ||
            finalData.hourly.some((item) => item.weather[0].main === "Rain")
          ) {
            removeHidden(rain);
          } else {
            removeHidden(noRain);
          }
        } else {
          console.log("No se ha podido acceder a tu ubicación");
        }
      });
    }
  } catch (error) {
    console.log(error.message);
    removeHidden(error);
  }
});

resetButton.addEventListener("click", () => {
  nextHours.value = "";
  actually.value = "";
  removeHidden(locationButton);
  clean();
});
