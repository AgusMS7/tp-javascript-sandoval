// Variables globales
let allCharacters = [];
let filteredCharacters = [];
let currentPage = 1;
let totalPages = 1;
let searchTimeout = null;

// Elementos del DOM
const searchInput = document.getElementById("search-input");
const searchStatus = document.getElementById("search-status");
const characterGrid = document.getElementById("character-grid");
const loadingElement = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const noResults = document.getElementById("no-results");
const retryButton = document.getElementById("retry-button");
const pagination = document.getElementById("pagination");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

// Función para inicializar la aplicación
async function initApp() {
  // Configurar event listeners
  searchInput.addEventListener("input", handleSearch);
  retryButton.addEventListener("click", fetchCharacters);
  prevPageButton.addEventListener("click", () => changePage(currentPage - 1));
  nextPageButton.addEventListener("click", () => changePage(currentPage + 1));

  // Cargar personajes
  await fetchCharacters();
}

// Función para obtener personajes de la API
async function fetchCharacters() {
  showLoading();
  hideError();
  hideNoResults();

  try {
    let allData = [];
    let nextPage = "https://rickandmortyapi.com/api/character";

    // Iterar sobre todas las páginas de la API
    while (nextPage) {
      const response = await fetch(nextPage);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      allData = allData.concat(data.results); // Agregar los resultados de la página actual
      nextPage = data.info.next; // Actualizar la URL de la siguiente página
    }

    allCharacters = allData; // Guardar todos los personajes
    filteredCharacters = [...allCharacters]; // Inicializar los personajes filtrados
    totalPages = Math.ceil(filteredCharacters.length / 20); // Calcular el total de páginas

    updatePagination();
    renderCharacters(filteredCharacters.slice(0, 20)); // Mostrar la primera página
    hideLoading();
  } catch (error) {
    console.error("Error al obtener personajes:", error);
    hideLoading();
    showError();
  }
}

// Función para manejar la búsqueda
function handleSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (searchTerm) {
    searchStatus.textContent = "Buscando...";
  } else {
    searchStatus.textContent = "";
  }

  searchTimeout = setTimeout(() => {
    if (searchTerm === "") {
      // Restablecer a todos los personajes
      filteredCharacters = [...allCharacters];
      totalPages = Math.ceil(allCharacters.length / 20); // Recalcular páginas
      searchStatus.textContent = "";
    } else {
      // Filtrar personajes según el término de búsqueda
      filteredCharacters = allCharacters.filter((character) =>
        character.name.toLowerCase().includes(searchTerm)
      );

      totalPages = Math.ceil(filteredCharacters.length / 20); // Recalcular páginas
      searchStatus.textContent = `${filteredCharacters.length} personajes encontrados`;
    }

    currentPage = 1; // Reiniciar a la primera página
    updatePagination();

    if (filteredCharacters.length === 0) {
      showNoResults();
      hideCharacterGrid();
    } else {
      hideNoResults();
      renderCharacters(filteredCharacters.slice(0, 20)); // Mostrar solo la primera página
    }
  }, 300);
}

// Función para renderizar personajes
function renderCharacters(characters) {
  characterGrid.innerHTML = "";
  characterGrid.classList.remove("hidden");

  characters.forEach((character) => {
    const card = document.createElement("div");
    card.className = "character-card";

    let statusClass = "status-unknown";
    if (character.status.toLowerCase() === "alive") {
      statusClass = "status-alive";
    } else if (character.status.toLowerCase() === "dead") {
      statusClass = "status-dead";
    }

    card.innerHTML = `
      <img src="${character.image}" alt="${character.name}" class="character-image">
      <div class="character-info">
        <h2 class="character-name">${character.name}</h2>
        <p class="character-species">${character.species}</p>
        <span class="character-status ${statusClass}">${character.status}</span>
      </div>
    `;

    characterGrid.appendChild(card);
  });
}

// Función para cambiar de página
function changePage(page) {
  if (page < 1 || page > totalPages) return; // Validar límites de página

  currentPage = page; // Actualizar la página actual
  updatePagination();

  // Calcular los índices de los personajes para la página actual
  const startIndex = (currentPage - 1) * 20;
  const endIndex = startIndex + 20;

  // Renderizar los personajes de la página actual
  renderCharacters(filteredCharacters.slice(startIndex, endIndex));

  // Desplazar hacia arriba al cambiar de página
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Función para actualizar la paginación
function updatePagination() {
  pagination.classList.remove("hidden");
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

  // Habilitar o deshabilitar los botones de navegación según la página actual
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
}

// Funciones de utilidad para mostrar/ocultar elementos
function showLoading() {
  loadingElement.classList.remove("hidden");
}

function hideLoading() {
  loadingElement.classList.add("hidden");
}

function showError() {
  errorMessage.classList.remove("hidden");
}

function hideError() {
  errorMessage.classList.add("hidden");
}

function showNoResults() {
  noResults.classList.remove("hidden");
}

function hideNoResults() {
  noResults.classList.add("hidden");
}

function hideCharacterGrid() {
  characterGrid.classList.add("hidden");
}

// Iniciar la aplicación cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", initApp);