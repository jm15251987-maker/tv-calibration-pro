// Local database utilities and helpers
class DatabaseHelper {
    constructor() {
        this.cache = {
            brands: null,
            models: null,
            settings: null
        };
    }

    // Cache management
    clearCache() {
        this.cache = {
            brands: null,
            models: null,
            settings: null
        };
    }

    async getCachedBrands() {
        if (!this.cache.brands) {
            this.cache.brands = await API.getAllBrands();
        }
        return this.cache.brands;
    }

    async getCachedModels() {
        if (!this.cache.models) {
            this.cache.models = await API.getAllModels();
        }
        return this.cache.models;
    }

    // TV Model search with fuzzy matching
    searchModels(query, models) {
        if (!query || !models) return models;
        
        const lowerQuery = query.toLowerCase();
        const words = lowerQuery.split(' ');
        
        return models.filter(model => {
            const searchText = `${model.model_name} ${model.model_number} ${model.year}`.toLowerCase();
            return words.every(word => searchText.includes(word));
        }).sort((a, b) => {
            // Prioritize exact matches
            const aExact = a.model_number.toLowerCase() === lowerQuery;
            const bExact = b.model_number.toLowerCase() === lowerQuery;
            
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            
            // Then by year (newer first)
            return b.year - a.year;
        });
    }

    // Recommend TVs based on criteria
    async recommendTVs(criteria = {}) {
        const models = await this.getCachedModels();
        let filtered = [...models];
        
        if (criteria.panelType) {
            filtered = filtered.filter(m => m.panel_type === criteria.panelType);
        }
        
        if (criteria.hdrSupport) {
            filtered = filtered.filter(m => m.hdr_support.includes(criteria.hdrSupport));
        }
        
        if (criteria.smartCalibration) {
            filtered = filtered.filter(m => m.automated_calibration === true);
        }
        
        if (criteria.minYear) {
            filtered = filtered.filter(m => m.year >= criteria.minYear);
        }
        
        return filtered.sort((a, b) => b.year - a.year);
    }

    // Get popular TV models (most commonly added)
    async getPopularModels(limit = 5) {
        const userTVs = await API.getUserTVs();
        const models = await this.getCachedModels();
        
        if (!userTVs || userTVs.length === 0) {
            // Return latest models if no user data
            return models
                .sort((a, b) => b.year - a.year)
                .slice(0, limit);
        }
        
        // Count model frequencies
        const modelCounts = {};
        userTVs.forEach(tv => {
            modelCounts[tv.tv_model_id] = (modelCounts[tv.tv_model_id] || 0) + 1;
        });
        
        // Sort by frequency
        const sortedModelIds = Object.entries(modelCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([id]) => id);
        
        return sortedModelIds
            .map(id => models.find(m => m.id === id))
            .filter(Boolean);
    }

    // Validate calibration settings
    validateSettings(settings) {
        const errors = [];
        
        if (settings.brightness < 0 || settings.brightness > 100) {
            errors.push('Brightness must be between 0 and 100');
        }
        
        if (settings.contrast < 0 || settings.contrast > 100) {
            errors.push('Contrast must be between 0 and 100');
        }
        
        if (settings.color < 0 || settings.color > 100) {
            errors.push('Color must be between 0 and 100');
        }
        
        if (settings.sharpness < 0 || settings.sharpness > 100) {
            errors.push('Sharpness must be between 0 and 100');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Compare two calibration settings
    compareSettings(settings1, settings2) {
        const differences = [];
        
        const fields = ['brightness', 'contrast', 'color', 'sharpness', 'backlight', 'gamma', 'color_temperature'];
        
        fields.forEach(field => {
            if (settings1[field] !== settings2[field]) {
                differences.push({
                    field,
                    old: settings1[field],
                    new: settings2[field]
                });
            }
        });
        
        return differences;
    }

    // Generate calibration report
    async generateCalibrationReport(tvId) {
        const tv = await API.getUserTV(tvId);
        const model = await API.getTVModel(tv.tv_model_id);
        const settings = await API.getCalibrationSettings(tv.tv_model_id);
        
        return {
            tv: {
                nickname: tv.nickname,
                room: tv.room,
                screenSize: tv.screen_size
            },
            model: {
                brand: model.brand_id,
                name: model.model_name,
                year: model.year,
                panelType: model.panel_type
            },
            calibration: {
                status: tv.calibrated,
                date: tv.calibration_date,
                availableSettings: settings.length
            },
            settings: settings
        };
    }

    // Export calibration settings
    exportSettings(settings) {
        const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            settings: settings
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    // Import calibration settings
    importSettings(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.version || !data.settings) {
                throw new Error('Invalid import format');
            }
            
            return {
                success: true,
                settings: data.settings
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get calibration statistics
    async getCalibrationStats() {
        const userTVs = await API.getUserTVs();
        
        if (!userTVs || userTVs.length === 0) {
            return {
                totalTVs: 0,
                calibratedTVs: 0,
                uncalibratedTVs: 0,
                calibrationRate: 0
            };
        }
        
        const calibratedCount = userTVs.filter(tv => tv.calibrated).length;
        
        return {
            totalTVs: userTVs.length,
            calibratedTVs: calibratedCount,
            uncalibratedTVs: userTVs.length - calibratedCount,
            calibrationRate: Math.round((calibratedCount / userTVs.length) * 100)
        };
    }

    // Room lighting recommendations
    getRoomLightingRecommendations(room) {
        const recommendations = {
            'Living Room': {
                brightness: 'Medium to High',
                backlight: '60-80%',
                tips: [
                    'Increase backlight for daytime viewing',
                    'Consider bias lighting behind TV',
                    'Close curtains for HDR content'
                ]
            },
            'Bedroom': {
                brightness: 'Low to Medium',
                backlight: '40-60%',
                tips: [
                    'Lower settings for night viewing',
                    'Enable eye comfort mode',
                    'Use warm color temperature'
                ]
            },
            'Home Theater': {
                brightness: 'Low',
                backlight: '30-50%',
                tips: [
                    'Optimize for dark room viewing',
                    'Disable all processing features',
                    'Use filmmaker mode'
                ]
            },
            'Gaming Room': {
                brightness: 'Medium',
                backlight: '70-90%',
                tips: [
                    'Enable game mode',
                    'Reduce input lag settings',
                    'Turn off motion smoothing'
                ]
            }
        };
        
        return recommendations[room] || recommendations['Living Room'];
    }

    // Content type recommendations
    getContentTypeInfo() {
        return {
            'Movies (SDR)': {
                idealConditions: 'Dark room',
                keySettings: 'Filmmaker mode, motion smoothing off',
                gamma: '2.4',
                colorTemp: 'Warm'
            },
            'Movies (HDR10)': {
                idealConditions: 'Dark room',
                keySettings: 'High backlight, local dimming on',
                gamma: 'ST.2084',
                colorTemp: 'Warm'
            },
            'Movies (Dolby Vision)': {
                idealConditions: 'Dark room',
                keySettings: 'Dynamic tone mapping, peak brightness',
                gamma: 'ST.2084',
                colorTemp: 'Warm'
            },
            'Gaming': {
                idealConditions: 'Any lighting',
                keySettings: 'Game mode, VRR, low input lag',
                gamma: '2.2',
                colorTemp: 'Normal to Warm'
            },
            'Sports': {
                idealConditions: 'Bright room',
                keySettings: 'Vivid mode, motion smoothing optional',
                gamma: '2.2',
                colorTemp: 'Cool to Normal'
            },
            'TV Shows': {
                idealConditions: 'Any lighting',
                keySettings: 'Standard mode, moderate settings',
                gamma: '2.2',
                colorTemp: 'Normal'
            }
        };
    }
}

// Create global database helper instance
const DB = new DatabaseHelper();
