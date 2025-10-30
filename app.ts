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
interface ExtendedIngredient {
    id: number;
    original: string;
}
interface Step {
    number: number;
    step: string;
}
interface AnalysedInstruction {
    name: string;
    steps: Step[];
}
interface RecipeDetails {
    id: number;
    title: string;
    image: string;
    summary: string;
    extendedIngredients: ExtendedIngredient[];
    analysedInstructions: AnalysedInstruction[];
}
const API_KEY = 'b0cad93a1b1b4b4fb64f8c6a6c046211';
const RESULTS_PER_PAGE = 10;
const FAVOURITES_KEY = 'recipeFavourites';
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
const recipeModal = document.getElementById('recipe-modal') as HTMLDivElement | null;
const modalBackdrop = document.getElementById('modal-backdrop') as HTMLDivElement | null;
const modalCloseButton = document.getElementById('modal-close-button') as HTMLButtonElement | null;
const modalLoader = document.getElementById('modal-loader') as HTMLDivElement | null;
const modalDataContainer = document.getElementById('modal-data-container') as HTMLDivElement | null;
const myFavouritesButton = document.getElementById('my-favourites-button') as HTMLButtonElement | null;
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
if (myFavouritesButton) {
    myFavouritesButton.addEventListener('click', handleShowFavourites);
} else {
    console.error('Favourites button not found');
}
if (modalCloseButton) {
    modalCloseButton.addEventListener('click', closeModal);
}
if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
}
if (resultsContainer) {
    resultsContainer.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('view-details-button')) {
            const recipeId = target.dataset.id;
            if (recipeId) {
                fetchRecipeDetails(recipeId);
            }
        }
        if (target.classList.contains('save-favourite-button')) {
            const recipeId = target.dataset.id;
            if (recipeId) {
                handleToggleFavourite(recipeId, target);
            }
        }
    });
}
function getFavourites(): number[] {
    const favouritesJson = localStorage.getItem(FAVOURITES_KEY);
    if (favouritesJson) {
        try {
            return JSON.parse(favouritesJson) as number[];
        } catch (error) {
            console.error('Error getting favourites from localStorage:', error);
            return [];
        }
    }
    return [];
}
function saveFavourites(favourites: number[]): void {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favourites));
}
function handleToggleFavourite(id: string, buttonElement: HTMLElement): void {
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) return;
    let favourites = getFavourites();
    const button = buttonElement as HTMLButtonElement;
    if (favourites.indexOf(recipeId) !== -1) {
        favourites = favourites.filter(favId => favId !== recipeId);
        button.textContent = 'Save to favourites';
        button.classList.remove('saved');
    } else {
        favourites.push(recipeId);
        button.textContent = 'Saved!';
        button.classList.add('saved');
    }
    saveFavourites(favourites);
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
function fetchRecipes(): void {
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
    let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${currentQuery}&apiKey=${API_KEY}&addRecipeInformation=true&number=${RESULTS_PER_PAGE}&offset=${currentOffset}`;
    if (currentDiet) {
        apiUrl += `&diet=${currentDiet}`;
    }
    if (currentCuisine) {
        apiUrl += `&cuisine=${currentCuisine}`;
    }
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json() as Promise<SpoonacularSearchResponse>;
        })
        .then(data => {
            totalResults = data.totalResults;
            displayRecipes(data.results);
            if (currentOffset + RESULTS_PER_PAGE < totalResults) {
                loadMoreButton.classList.remove('hidden');
            } else {
                loadMoreButton.classList.add('hidden');
            }
            if (searchButton && loadMoreButton && loadingSpinner) {
                searchButton.disabled = false;
                loadMoreButton.disabled = false;
                loadMoreButton.textContent = 'Load More';
                loadingSpinner.classList.add('hidden');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (errorMessage) {
                if (error instanceof Error) {
                    errorMessage.textContent = `Error: ${error.message}. Please try again.`;
                } else {
                    errorMessage.textContent = 'Please try again.';
                }
                errorMessage.classList.remove('hidden');
            }
            if (searchButton && loadMoreButton && loadingSpinner) {
                searchButton.disabled = false;
                loadMoreButton.disabled = false;
                loadMoreButton.textContent = 'Load More';
                loadingSpinner.classList.add('hidden');
            }
        });
}
function handleShowFavourites(): void {
    if (!resultsContainer || !loadMoreButton || !errorMessage || !loadingSpinner) {
        console.error('Elements missing, cannot show favourites.');
        return;
    }
    const favourites = getFavourites();
    resultsContainer.innerHTML = '';
    loadMoreButton.classList.add('hidden');
    errorMessage.classList.add('hidden');
    if (favourites.length === 0) {
        resultsContainer.innerHTML = '<p>You have no saved favourites yet. Find a recipe and click "Save to Favuorites" to add one</p>';
        return;
    }
    loadingSpinner.classList.remove('hidden');
    const ids = favourites.join(',');
    const apiUrl = `https://api.spoonacular.com/recipes/informationBulk?ids=${ids}&apiKey=${API_KEY}`;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }
            return response.json() as Promise<Recipe[]>;
        })
        .then(data => {
            currentOffset = 0;
            totalResults = data.length;
            displayRecipes(data);
            loadingSpinner.classList.add('hidden');
        })
        .catch(error => {
            console.error('Error fetching favourites:', error);
            loadingSpinner.classList.add('hidden');
            if (errorMessage) {
                const message = error instanceof Error ? error.message : String(error);
                errorMessage.textContent = `Error fetching favourites: ${message}`;
                errorMessage.classList.remove('hidden');
            }
        });
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
                <button class="view-details-button" data-id="${recipe.id}">
                    View Details
                </button>
            </div>
            `;
        resultsContainer.appendChild(card);
    })
}
function openModal(): void {
    if (!recipeModal) return;
    recipeModal.classList.remove('hidden');
}
function closeModal(): void {
    if (!recipeModal || !modalDataContainer) return;
    recipeModal.classList.add('hidden');
    modalDataContainer.innerHTML = '';
}
function fetchRecipeDetails(id: string): void {
    if (!modalLoader || !modalDataContainer || !errorMessage) return;
    openModal();
    modalDataContainer.innerHTML = '';
    modalLoader.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    const apiUrl = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            return response.json() as Promise<RecipeDetails>;
        })
        .then(data => {
            displayRecipeDetails(data);
            if (modalLoader) {
                modalLoader.classList.add('hidden');
            }
        })
        .catch(error => {
            const message = error instanceof Error ? error.message : String(error);
            if (modalDataContainer) {
                modalDataContainer.innerHTML = `<p>Error fetching details: ${message}</p>`;
            }
            if (modalLoader) {
                modalLoader.classList.add('hidden');
            }
        });
}
function displayRecipeDetails(data: RecipeDetails): void {
    if (!modalDataContainer) return;
    const ingredientsHtml = data.extendedIngredients
        .map(ingredient => `<li>${ingredient.original}</li>`)
        .join('');
    const instructionSteps = data.analysedInstructions[0]?.steps || [];
    const instructionsHtml = instructionSteps
        .map(step => `<li>${step.step}</li>`)
        .join('');
    modalDataContainer.innerHTML = `
        <h2>${data.title}</h2>
        <img src="${data.image}" alt="${data.title}">
        <h3>Summary</h3>
        <div>${data.summary}</div>
        <h3>Ingredients</h3>
        <ul>
            ${ingredientsHtml}
        </ul>
        <h3>Instructions</h3>
        <ol>
            ${instructionsHtml || '<p>Instructions not available.</p>'}
        </ol>
    `;
}
