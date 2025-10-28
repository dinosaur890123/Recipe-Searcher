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
const searchForm = document.getElementById('search-form') as HTMLFormElement | null;
const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
const searchButton = document.getElementById('search-button') as HTMLButtonElement | null;
const resultsContainer = document.getElementById('results-container') as HTMLDivElement | null;
const loadingSpinner = document.getElementById('loading-spinner') as HTMLDivElement | null;
const errorMessage = document.getElementById('error-message') as HTMLDivElement | null;
if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
} else {
    console.error('Search form not found');
}
async function handleSearch(e: Event): Promise<void> {
    e.preventDefault();
    if (!searchInput || !searchButton || !loadingSpinner || !errorMessage || !resultsContainer) { // I got this thing from a book that said to add these checks for elements lol
        console.error('Elements are not present');
        return;
    }
    const query = searchInput.value;
    if (!query) return;
    searchButton.disabled = true;
    searchButton.textContent = 'Searching...';
    loadingSpinner.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    resultsContainer.innerHTML = '';
    try {
        const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${API_KEY}&addRecipeInformation=true&number=10`;
        const reponse = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`there was the error ${response.status}`);
        }
        const data: SpoonacularSearchResponse = await response.json();
        displayRecipes(data.results);
    } catch (error) {
        console.error('Error fetching recipes', error);
        errorMessage.textContent = `Error ${error.message}`;
        errorMessage.classList.remove('hidden');
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = 'Search';
        loadingSpinner.classList.add('hidden');
    }
}
function displayRecipes(recipes: Recipe[]): void {
    if (!resultsContainer) return;
    if (recipes.length === 0) {
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