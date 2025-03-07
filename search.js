// Список всех городов
const cities = [
  { name: "Москва", url: "weather.html?city=Moscow" },
  { name: "Магнитогорск", url: "weather.html?city=Magnitogorsk" },
  { name: "Мурманск", url: "weather.html?city=Murmansk" },
  { name: "Новосибирск", url: "weather.html?city=Novosibirsk" },
  { name: "Нижний Новгород", url: "weather.html?city=Nizhniy Novgorod" },
  { name: "Новокузнецк", url: "weather.html?city=Novokuznetsk" },
  { name: "Санкт-Петербург", url: "weather.html?city=Saint Petersburg" },
  { name: "Самара", url: "weather.html?city=Samara" },
  { name: "Сочи", url: "weather.html?city=Sochi" },
  { name: "Екатеринбург", url: "weather.html?city=Yekaterinburg" },
  { name: "Владивосток", url: "weather.html?city=Vladivostok" },
  { name: "Волгоград", url: "weather.html?city=Volgograd" },
  { name: "Воронеж", url: "weather.html?city=Voronezh" },
];

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("citySearch");
  const searchResults = document.getElementById("searchResults");
  let selectedIndex = -1;

  function searchCities(query) {
    if (!query) return [];
    const normalizedQuery = query.toLowerCase();
    return cities.filter((city) =>
      city.name.toLowerCase().includes(normalizedQuery)
    );
  }

  function showResults(results) {
    searchResults.innerHTML = "";
    if (results.length === 0) {
      searchResults.classList.remove("active");
      return;
    }

    results.forEach((city, index) => {
      const div = document.createElement("div");
      div.className = "search-result-item";
      div.textContent = city.name;
      div.addEventListener("click", () => {
        window.location.href = city.url;
      });
      searchResults.appendChild(div);
    });

    searchResults.classList.add("active");
  }

  searchInput.addEventListener("input", (e) => {
    const results = searchCities(e.target.value);
    showResults(results);
    selectedIndex = -1;
  });

  searchInput.addEventListener("keydown", (e) => {
    const items = searchResults.getElementsByClassName("search-result-item");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelection(items);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      window.location.href = cities.find(
        (city) => city.name === items[selectedIndex].textContent
      ).url;
    }
  });

  function updateSelection(items) {
    Array.from(items).forEach((item, index) => {
      item.classList.toggle("selected", index === selectedIndex);
    });
  }

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove("active");
    }
  });

  searchInput.addEventListener("focus", () => {
    if (searchInput.value) {
      const results = searchCities(searchInput.value);
      showResults(results);
    }
  });
});
