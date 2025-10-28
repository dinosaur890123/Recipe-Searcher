interface Recipe {
    id: number;
    title: string;
    image: string;
    summary: string;
    sourceUrl: string;
}
interface SpoonacularSearchResponse {
    results: Recipe[];
    offset: number;
    number: number;
    totalResults: number;
}
const API_KEY = 'b0cad93a1b1b4b4fb64f8c6a6c046211';
const RESULTS_PER_PAGE = 10;
let currentQuery: string = '';
let currentDiet: string = '';
let currentCuisine: string = '';
let currentOffset: number = 0;
let totalResults: number = 0;
const searchForm = document.getElementById('search-form') as HTMLFormElement | null;
const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
const searchButton = document.getElementById('search-button') as HTMLButtonElement | null;
const resultsContainer = document.getElementById('results-container') as HTMLDivElement | null;
const loadingSpinner = document.getElementById('loading-spinner') as HTMLDivElement | null;
const errorMessage = document.getElementById('error-message') as HTMLDivElement | null;
const dietFilter = document.getElementById('diet-filter') as HTMLSelectElement | null;
const cuisineFilter = document.getElementById('cuisine-filter') as HTMLSelectElement | null;
const loadMoreButton = document.getElementById('load-more-button') as HTMLButtonElement | null;
if (searchForm) {
    searchForm.addEventListener('submit', handleNewSearch);
} else {
    console.error('Search form not found');
}
if (loadMoreButton) {
    loadMoreButton.addEventListener('click', handleLoadMore);
} else {
    console.error('Load more button not found');
}
function handleLoadMore(): void {
    currentOffset += RESULTS_PER_PAGE;
    fetchRecipes();
}
function handleNewSearch(e: Event): void {
    e.preventDefault();
    if (!searchInput || !searchButton || !loadingSpinner || !errorMessage || !resultsContainer || !dietFilter || !cuisineFilter || !loadMoreButton) { // I got this thing from a book that said to add these checks for elements lol
        console.error('Elements are not present');
        return;
    }
    currentQuery = searchInput.value;
    currentDiet = dietFilter.value;
    currentCuisine = cuisineFilter.value;
    currentOffset = 0;
    totalResults = 0;
    resultsContainer.innerHTML = '';
    loadMoreButton.classList.add('hidden');
    if (!currentQuery) return;
    fetchRecipes();
}
async function fetchRecipes(): Promise<void> {
    if (!searchButton || !loadMoreButton || !errorMessage || !loadingSpinner) { // what i still don't understand is without this bit, the rest of the code has errors
        console.error("Some elements are missing");
        return;
    }
    searchButton.disabled = true;
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = 'Loading...';
    errorMessage.classList.add('hidden');
    if (currentOffset === 0) {
        loadingSpinner.classList.remove('hidden');
    }
    try {
        let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${currentQuery}&apiKey=${API_KEY}&addRecipeInformation=true&number=${RESULTS_PER_PAGE}&offset=${currentOffset}`;
        if (currentDiet) {
            apiUrl += `&diet=${currentDiet}`;
        }
        if (currentCuisine) {
            apiUrl += `&cuisine=${currentCuisine}`;
        }
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: SpoonacularSearchResponse = await response.json();
        totalResults = data.totalResults;
        displayRecipes(data.results);
        if (currentOffset + RESULTS_PER_PAGE < totalResults) {
            loadMoreButton.classList.remove('hidden');
        } else {
            loadMoreButton.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof Error) {
            errorMessage.textContent = `Error: ${error.message}. Please try again.`;
        } else {
            errorMessage.textContent = 'An unknown error occurred. Please try again.';
        }
        errorMessage.classList.remove('hidden');
        } finally {
        searchButton.disabled = false;
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = 'Load More';
        loadingSpinner.classList.add('hidden');
        }
    }
function displayRecipes(recipes: Recipe[]): void {
    if (!resultsContainer) return;
    if (recipes.length === 0 && currentOffset === 0) {
        resultsContainer.innerHTML = '<p>No recipes found :( Try something else</p>';
        return;
    }
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-summary">
                    ${recipe.summary.substring(0, 150)}...
                </div>
                <a href="${recipe.sourceUrl}" target="_blank" rel="noopener noreferrer" class="recipe-link">View Recipe</a>
            </div>
            `;
        resultsContainer.appendChild(card);
    })
}