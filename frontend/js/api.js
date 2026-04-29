const API_URL = '/api';

class ApiService {
    static getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (includeAuth) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }
        }
        return headers;
    }

    static async request(endpoint, method = 'GET', body = null, includeAuth = true) {
        const options = {
            method,
            headers: this.getHeaders(includeAuth)
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            const data = await response.json().catch(() => ({}));
            
            if (!response.ok) {
                throw new Error(data.detail || data.non_field_errors || Object.values(data)[0] || 'Something went wrong');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static login(email, password) {
        return this.request('/user/token/', 'POST', { email, password }, false);
    }

    static register(email, password, name) {
        return this.request('/user/create/', 'POST', { email, password, name }, false);
    }

    static getRecipes() {
        return this.request('/recipe/recipes/');
    }

    static createRecipe(recipeData) {
        return this.request('/recipe/recipes/', 'POST', recipeData);
    }

    static getTags() {
        return this.request('/recipe/tags/');
    }

    static getIngredients() {
        return this.request('/recipe/ingredients/');
    }
}
