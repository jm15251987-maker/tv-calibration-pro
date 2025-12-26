// API Service for handling data operations
class APIService {
    constructor() {
        this.baseUrl = 'tables';
    }

    // Generic API methods
    async get(table, id = null) {
        try {
            const url = id ? `${this.baseUrl}/${table}/${id}` : `${this.baseUrl}/${table}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return id ? data : data.data;
        } catch (error) {
            console.error(`Error fetching from ${table}:`, error);
            return null;
        }
    }

    async create(table, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${table}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error creating in ${table}:`, error);
            return null;
        }
    }

    async update(table, id, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${table}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error updating ${table}:`, error);
            return null;
        }
    }

    async delete(table, id) {
        try {
            const response = await fetch(`${this.baseUrl}/${table}/${id}`, {
                method: 'DELETE'
            });
            
            return response.ok;
        } catch (error) {
            console.error(`Error deleting from ${table}:`, error);
            return false;
        }
    }

    // TV Brands
    async getAllBrands() {
        return await this.get('tv_brands');
    }

    async getTVBrand(id) {
        const brands = await this.getAllBrands();
        return brands?.find(b => b.id === id);
    }

    // TV Models
    async getAllModels() {
        return await this.get('tv_models');
    }

    async getTVModel(id) {
        const models = await this.getAllModels();
        return models?.find(m => m.id === id);
    }

    async getModelsByBrand(brandId) {
        const models = await this.getAllModels();
        return models?.filter(m => m.brand_id === brandId) || [];
    }

    // Calibration Settings
    async getCalibrationSettings(modelId) {
        const settings = await this.get('calibration_settings');
        return settings?.filter(s => s.tv_model_id === modelId) || [];
    }

    async getCalibrationByType(modelId, contentType) {
        const settings = await this.getCalibrationSettings(modelId);
        return settings?.find(s => s.content_type === contentType);
    }

    // Calibration Guides
    async getCalibrationGuides(modelId) {
        const guides = await this.get('calibration_guides');
        return guides?.filter(g => g.tv_model_id === modelId || g.brand_id)
            .sort((a, b) => a.step_number - b.step_number) || [];
    }

    // User TVs
    async getUserTVs() {
        return await this.get('user_tvs');
    }

    async getUserTV(id) {
        return await this.get('user_tvs', id);
    }

    async addUserTV(tvData) {
        return await this.create('user_tvs', tvData);
    }

    async updateUserTV(id, tvData) {
        return await this.update('user_tvs', id, tvData);
    }

    async deleteUserTV(id) {
        return await this.delete('user_tvs', id);
    }

    // Search functionality
    async searchTVModels(query) {
        const models = await this.getAllModels();
        const brands = await this.getAllBrands();
        
        if (!query || !models) return [];
        
        const lowerQuery = query.toLowerCase();
        
        return models.filter(model => {
            const brand = brands?.find(b => b.id === model.brand_id);
            const brandName = brand?.name?.toLowerCase() || '';
            const modelName = model.model_name?.toLowerCase() || '';
            const modelNumber = model.model_number?.toLowerCase() || '';
            
            return brandName.includes(lowerQuery) || 
                   modelName.includes(lowerQuery) || 
                   modelNumber.includes(lowerQuery);
        });
    }

    // Content type optimization modes
    getContentTypes() {
        return [
            { id: 'movies_sdr', name: 'Movies (SDR)', icon: 'fa-film', description: 'Standard dynamic range movies' },
            { id: 'movies_hdr10', name: 'Movies (HDR10)', icon: 'fa-sun', description: 'HDR10 content' },
            { id: 'movies_dolby', name: 'Movies (Dolby Vision)', icon: 'fa-certificate', description: 'Dolby Vision content' },
            { id: 'gaming', name: 'Gaming', icon: 'fa-gamepad', description: 'Video games and console' },
            { id: 'sports', name: 'Sports', icon: 'fa-futbol', description: 'Live sports and fast action' },
            { id: 'tv_shows', name: 'TV Shows', icon: 'fa-tv', description: 'Regular TV programming' }
        ];
    }
}

// Create global API instance
const API = new APIService();
