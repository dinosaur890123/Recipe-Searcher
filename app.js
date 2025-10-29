var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!searchButton || !loadMoreButton || !errorMessage || !loadingSpinner) { // what i still don't understand is without this bit, the rest of the code has errors
                        console.error("Some elements are missing");
                        return [2 /*return*/];
                    }
                    searchButton.disabled = true;
                    loadMoreButton.disabled = true;
                    loadMoreButton.textContent = 'Loading...';
                    errorMessage.classList.add('hidden');
                    if (currentOffset === 0) {
                        loadingSpinner.classList.remove('hidden');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    apiUrl = "https://api.spoonacular.com/recipes/complexSearch?query=".concat(currentQuery, "&apiKey=").concat(API_KEY, "&addRecipeInformation=true&number=").concat(RESULTS_PER_PAGE, "&offset=").concat(currentOffset);
                    if (currentDiet) {
                        apiUrl += "&diet=".concat(currentDiet);
                    }
                    if (currentCuisine) {
                        apiUrl += "&cuisine=".concat(currentCuisine);
                    }
                    return [4 /*yield*/, fetch(apiUrl)];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! Status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    totalResults = data.totalResults;
                    displayRecipes(data.results);
                    if (currentOffset + RESULTS_PER_PAGE < totalResults) {
                        loadMoreButton.classList.remove('hidden');
                    }
                    else {
                        loadMoreButton.classList.add('hidden');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error:', error_1);
                    if (error_1 instanceof Error) {
                        errorMessage.textContent = "Error: ".concat(error_1.message, ". Please try again.");
                    }
                    else {
                        errorMessage.textContent = 'An unknown error occurred. Please try again.';
                    }
                    errorMessage.classList.remove('hidden');
                    return [3 /*break*/, 6];
                case 5:
                    searchButton.disabled = false;
                    loadMoreButton.disabled = false;
                    loadMoreButton.textContent = 'Load More';
                    loadingSpinner.classList.add('hidden');
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
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
        card.innerHTML = "\n            <img src=\"".concat(recipe.image, "\" alt=\"").concat(recipe.title, "\" class=\"recipe-image\">\n            <div class=\"recipe-content\">\n                <h3 class=\"recipe-title\">").concat(recipe.title, "</h3>\n                <div class=\"recipe-summary\">\n                    ").concat(recipe.summary.substring(0, 150), "...\n                </div>\n                <a href=\"").concat(recipe.sourceUrl, "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"recipe-link\">View Recipe</a>\n            </div>\n            ");
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
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!modalLoader || !modalDataContainer || !errorMessage)
                        return [2 /*return*/];
                    openModal();
                    modalDataContainer.innerHTML = '';
                    modalLoader.classList.remove('hidden');
                    errorMessage.classList.add('hidden');
                    apiUrl = "https://api.spoonacular.com/recipes/".concat(id, "/information?apiKey=").concat(API_KEY);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch(apiUrl)];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Error: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    displayRecipeDetails(data);
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    modalDataContainer.innerHTML = "<p>Error fetching details ".concat(error_2.message, "</p>");
                    return [3 /*break*/, 6];
                case 5:
                    modalLoader.classList.add('hidden');
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
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
    modalDataContainer.innerHTML = "\n        <h2>".concat(data.title, "</h2>\n        <img src=\"").concat(data.image, "\" alt=\"").concat(data.title, "\">\n        <h3>Summary</h3>\n        <div>").concat(data.summary, "</div>\n        <h3>Ingredients</h3>\n        <ul>\n            ").concat(ingredientsHtml, "\n        </ul>\n        <h3>Instructions</h3>\n        <ol>\n            ").concat(instructionsHtml || '<p>Instructions not available.</p>', "\n        </ol>\n        ");
}
