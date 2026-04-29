document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Elements
    const logoutBtn = document.getElementById('logout-btn');
    const recipeList = document.getElementById('recipe-list');
    const loadingEl = document.getElementById('loading');
    const noRecipesEl = document.getElementById('no-recipes');
    const dashboardError = document.getElementById('dashboard-error');
    
    // Modal Elements
    const modal = document.getElementById('recipe-modal');
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    const addFirstRecipeBtn = document.getElementById('add-first-recipe-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const recipeForm = document.getElementById('recipe-form');
    const saveRecipeBtn = document.getElementById('save-recipe-btn');
    const modalError = document.getElementById('modal-error');

    // Fetch Recipes
    async function loadRecipes() {
        try {
            loadingEl.style.display = 'block';
            recipeList.style.display = 'none';
            noRecipesEl.style.display = 'none';
            dashboardError.style.display = 'none';

            const recipes = await ApiService.getRecipes();
            
            loadingEl.style.display = 'none';
            
            if (recipes.length === 0) {
                noRecipesEl.style.display = 'block';
            } else {
                renderRecipes(recipes);
                recipeList.style.display = 'grid';
            }
        } catch (err) {
            loadingEl.style.display = 'none';
            dashboardError.textContent = 'Failed to load recipes. ' + err.message;
            dashboardError.style.display = 'block';
            
            // If unauthorized, redirect to login
            if (err.message.includes('Authentication credentials were not provided')) {
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            }
        }
    }

    function renderRecipes(recipes) {
        recipeList.innerHTML = '';
        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'glass-panel recipe-card';
            
            const imageUrl = recipe.image ? recipe.image : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="200" style="background:%232d2d3a"><text x="50%" y="50%" fill="%2394a3b8" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20">No Image</text></svg>';

            let tagsHtml = '';
            if (recipe.tags && recipe.tags.length > 0) {
                tagsHtml = `<div class="recipe-tags">
                    ${recipe.tags.map(tag => `<span class="tag">${tag.name || tag}</span>`).join('')}
                </div>`;
            }

            card.innerHTML = `
                <img src="${imageUrl}" alt="${recipe.title}" class="recipe-image">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <span>⏱ ${recipe.time_minutes} mins</span>
                    <span>💰 $${recipe.price}</span>
                </div>
                ${tagsHtml}
            `;
            recipeList.appendChild(card);
        });
    }

    // Modal Logic
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        modalError.style.display = 'none';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        recipeForm.reset();
    }

    addRecipeBtn.addEventListener('click', openModal);
    addFirstRecipeBtn.addEventListener('click', openModal);
    
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Save Recipe
    recipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveRecipeBtn.disabled = true;
        saveRecipeBtn.innerHTML = '<div class="loader"></div>';
        modalError.style.display = 'none';

        const newRecipe = {
            title: document.getElementById('recipe-title-input').value,
            time_minutes: parseInt(document.getElementById('recipe-time').value),
            price: document.getElementById('recipe-price').value,
            link: document.getElementById('recipe-link').value,
            description: document.getElementById('recipe-desc').value
        };

        try {
            await ApiService.createRecipe(newRecipe);
            closeModal();
            loadRecipes(); // Reload list
        } catch (err) {
            modalError.textContent = err.message || 'Failed to create recipe.';
            modalError.style.display = 'block';
        } finally {
            saveRecipeBtn.disabled = false;
            saveRecipeBtn.textContent = 'Save Recipe';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Initial Load
    loadRecipes();
});
