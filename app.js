var API_KEY = 'b0cad93a1b1b4b4fb64f8c6a6c046211';
var RESULTS_PER_PAGE = 10;
var currentQuery = '';
var currentDiet = '';
var currentCuisine = '';
var currentOffset = 0;
var totalResults = 0;
var searchForm = document.getElementById('search-form');
var searchInput = document.getElementById('search-input');
var searchButton = document.getElementById('search-button');
var resultsContainer = document.getElementById('results-container');
var loadingSpinner = document.getElementById('loading-spinner');
var errorMessage = document.getElementById('error-message');
var dietFilter = document.getElementById('diet-filter');
var cuisineFilter = document.getElementById('cuisine-filter');
var loadMoreButton = document.getElementById('load-more-button');
var recipeModal = document.getElementById('recipe-modal');
var modalBackdrop = document.getElementById('modal-backdrop');
var modalCloseButton = document.getElementById('modal-close-button');
var modalLoader = document.getElementById('modal-loader');
var modalDataContainer = document.getElementById('modal-data-container');
if (searchForm) {
    searchForm.addEventListener('submit', handleNewSearch);
}
else {
    console.error('Search form not found');
}
if (loadMoreButton) {
    loadMoreButton.addEventListener('click', handleLoadMore);
}
else {
    console.error('Load more button not found');
}
if (modalCloseButton) {
    modalCloseButton.addEventListener('click', closeModal);
}
if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
}
if (resultsContainer) {
    resultsContainer.addEventListener('click', function (e) {
        var target = e.target;
        if (target.classList.contains('view-details-button')) {
            var recipeId = target.dataset.id;
            if (recipeId) {
                fetchRecipeDetails(recipeId);
            }
        }
    });
}
function handleLoadMore() {
    currentOffset += RESULTS_PER_PAGE;
    fetchRecipes();
}
function handleNewSearch(e) {
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
    if (!currentQuery)
        return;
    fetchRecipes();
}
function fetchRecipes() {
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
    var apiUrl = "https://api.spoonacular.com/recipes/complexSearch?query=".concat(currentQuery, "&apiKey=").concat(API_KEY, "&addRecipeInformation=true&number=").concat(RESULTS_PER_PAGE, "&offset=").concat(currentOffset);
    if (currentDiet) {
        apiUrl += "&diet=".concat(currentDiet);
    }
    if (currentCuisine) {
        apiUrl += "&cuisine=".concat(currentCuisine);
    }
    fetch(apiUrl)
        .then(function (response) {
        if (!response.ok) {
            throw new Error("HTTP error! Status: ".concat(response.status));
        }
        return response.json();
    })
        .then(function (data) {
        totalResults = data.totalResults;
        displayRecipes(data.results);
        if (currentOffset + RESULTS_PER_PAGE < totalResults) {
            loadMoreButton.classList.remove('hidden');
        }
        else {
            loadMoreButton.classList.add('hidden');
        }
        if (searchButton && loadMoreButton && loadingSpinner) {
            searchButton.disabled = false;
            loadMoreButton.disabled = false;
            loadMoreButton.textContent = 'Load More';
            loadingSpinner.classList.add('hidden');
        }
    })
        .catch(function (error) {
        console.error('Error:', error);
        if (errorMessage) {
            if (error instanceof Error) {
                errorMessage.textContent = "Error: ".concat(error.message, ". Please try again.");
            }
            else {
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
function displayRecipes(recipes) {
    if (!resultsContainer)
        return;
    if (recipes.length === 0 && currentOffset === 0) {
        resultsContainer.innerHTML = '<p>No recipes found :( Try something else</p>';
        return;
    }
    recipes.forEach(function (recipe) {
        var card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = "\n            <img src=\"".concat(recipe.image, "\" alt=\"").concat(recipe.title, "\" class=\"recipe-image\">\n            <div class=\"recipe-content\">\n                <h3 class=\"recipe-title\">").concat(recipe.title, "</h3>\n                <button class=\"view-details-button\" data-id=\"").concat(recipe.id, "\">\n                    View Details\n                </button>\n            </div>\n            ");
        resultsContainer.appendChild(card);
    });
}
function openModal() {
    if (!recipeModal)
        return;
    recipeModal.classList.remove('hidden');
}
function closeModal() {
    if (!recipeModal || !modalDataContainer)
        return;
    recipeModal.classList.add('hidden');
    modalDataContainer.innerHTML = '';
}
function fetchRecipeDetails(id) {
    if (!modalLoader || !modalDataContainer || !errorMessage)
        return;
    openModal();
    modalDataContainer.innerHTML = '';
    modalLoader.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    var apiUrl = "https://api.spoonacular.com/recipes/".concat(id, "/information?apiKey=").concat(API_KEY);
    fetch(apiUrl)
        .then(function (response) {
        if (!response.ok) {
            throw new Error("Error: ".concat(response.status));
        }
        return response.json();
    })
        .then(function (data) {
        displayRecipeDetails(data);
        if (modalLoader) {
            modalLoader.classList.add('hidden');
        }
    })
        .catch(function (error) {
        var message = error instanceof Error ? error.message : String(error);
        if (modalDataContainer) {
            modalDataContainer.innerHTML = "<p>Error fetching details: ".concat(message, "</p>");
        }
        if (modalLoader) {
            modalLoader.classList.add('hidden');
        }
    });
}
function displayRecipeDetails(data) {
    var _a;
    if (!modalDataContainer)
        return;
    var ingredientsHtml = data.extendedIngredients
        .map(function (ingredient) { return "<li>".concat(ingredient.original, "</li>"); })
        .join('');
    var instructionSteps = ((_a = data.analysedInstructions[0]) === null || _a === void 0 ? void 0 : _a.steps) || [];
    var instructionsHtml = instructionSteps
        .map(function (step) { return "<li>".concat(step.step, "</li>"); })
        .join('');
    modalDataContainer.innerHTML = "\n        <h2>".concat(data.title, "</h2>\n        <img src=\"").concat(data.image, "\" alt=\"").concat(data.title, "\">\n        <h3>Summary</h3>\n        <div>").concat(data.summary, "</div>\n        <h3>Ingredients</h3>\n        <ul>\n            ").concat(ingredientsHtml, "\n        </ul>\n        <h3>Instructions</h3>\n        <ol>\n            ").concat(instructionsHtml || '<p>Instructions not available.</p>', "\n        </ol>\n    ");
}
