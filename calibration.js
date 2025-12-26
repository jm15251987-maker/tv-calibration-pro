// Calibration functionality
class CalibrationService {
    constructor() {
        this.currentFlow = null;
        this.currentTV = null;
        this.currentStep = 0;
        this.calibrationSteps = [];
    }

    // Show brand selector modal
    async showBrandSelector() {
        const content = await this.renderBrandSelector();
        const modal = this.createModal('Select TV Brand', content);
        document.body.appendChild(modal);
        
        // Attach event listeners
        setTimeout(() => {
            document.querySelectorAll('.brand-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const brandId = e.currentTarget.dataset.brandId;
                    this.showModelSelector(brandId);
                });
            });
        }, 100);
    }

    async renderBrandSelector() {
        const brands = await API.getAllBrands();
        
        // Brand-specific colors for better visual distinction
        const brandColors = {
            'samsung': 'from-blue-600 to-blue-700',
            'lg': 'from-red-600 to-pink-600',
            'sony': 'from-gray-800 to-gray-900',
            'tcl': 'from-blue-500 to-indigo-600',
            'vizio': 'from-orange-500 to-orange-600',
            'hisense': 'from-red-500 to-red-600',
            'panasonic': 'from-blue-700 to-blue-800',
            'philips': 'from-blue-600 to-cyan-600'
        };
        
        let html = '<div class="grid grid-cols-2 gap-3 p-4">';
        
        brands.forEach(brand => {
            const logoId = `brand-logo-${brand.id}`;
            const gradientColor = brandColors[brand.id] || 'from-indigo-500 to-purple-600';
            
            html += `
                <button class="brand-card bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition text-center" 
                    data-brand-id="${brand.id}">
                    <div class="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-gradient-to-br ${gradientColor} rounded-lg shadow-md" id="${logoId}">
                        ${brand.logo_url ? `
                            <img src="${brand.logo_url}" 
                                 alt="${brand.name}" 
                                 class="w-12 h-12 object-contain"
                                 style="filter: brightness(0) invert(1);"
                                 onerror="this.style.display='none'; document.getElementById('${logoId}').innerHTML='<span class=\\'text-white text-2xl font-bold\\'>${brand.name.substring(0, 2).toUpperCase()}</span>';">
                        ` : `
                            <span class="text-white text-2xl font-bold">${brand.name.substring(0, 2).toUpperCase()}</span>
                        `}
                    </div>
                    <h3 class="font-semibold text-gray-800">${brand.name}</h3>
                    ${brand.supports_smart_calibration ? `
                        <span class="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            <i class="fas fa-magic"></i> Smart
                        </span>
                    ` : ''}
                </button>
            `;
        });
        
        html += '</div>';
        return html;
    }

    async showModelSelector(brandId) {
        const brand = await API.getTVBrand(brandId);
        const models = await API.getModelsByBrand(brandId);
        
        const content = this.renderModelSelector(models, brandId);
        const modal = this.createModal(
            `Select ${brand.name} Model`, 
            content
        );
        
        // Replace existing modal
        const existingModal = document.querySelector('.calibration-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.appendChild(modal);
        
        // Attach event listeners
        setTimeout(() => {
            // Search functionality
            const searchInput = document.getElementById('modelSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterModels(e.target.value, brandId);
                });
            }
            
            // Model selection
            document.querySelectorAll('.model-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const modelId = e.currentTarget.dataset.modelId;
                    this.showTVDetailsForm(modelId);
                });
            });
            
            // Back button
            const backBtn = document.getElementById('backToBrands');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.showBrandSelector();
                });
            }
        }, 100);
    }

    renderModelSelector(models, brandId) {
        let html = `
            <div class="p-4">
                <button id="backToBrands" class="mb-4 text-indigo-600 hover:text-indigo-700 font-medium">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Brands
                </button>
                
                <div class="mb-4">
                    <input type="text" id="modelSearch" placeholder="Search models..." 
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none">
                </div>
                
                <div id="modelList" class="space-y-3 max-h-96 overflow-y-auto">
        `;
        
        if (models && models.length > 0) {
            models.forEach(model => {
                html += `
                    <button class="model-card w-full bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition text-left" 
                        data-model-id="${model.id}">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-semibold text-gray-800">${model.model_name}</h3>
                                <p class="text-sm text-gray-600">${model.model_number} (${model.year})</p>
                                <p class="text-xs text-gray-500 mt-1">${model.panel_type} • ${model.hdr_support}</p>
                            </div>
                            ${model.automated_calibration ? `
                                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    <i class="fas fa-magic"></i>
                                </span>
                            ` : ''}
                        </div>
                    </button>
                `;
            });
        } else {
            html += `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-search text-4xl mb-3"></i>
                    <p>No models found</p>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    async filterModels(query, brandId) {
        const models = await API.getModelsByBrand(brandId);
        const filtered = query ? 
            models.filter(m => 
                m.model_name.toLowerCase().includes(query.toLowerCase()) ||
                m.model_number.toLowerCase().includes(query.toLowerCase())
            ) : models;
        
        const modelList = document.getElementById('modelList');
        if (modelList) {
            modelList.innerHTML = this.renderModelList(filtered);
            
            // Re-attach event listeners
            document.querySelectorAll('.model-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const modelId = e.currentTarget.dataset.modelId;
                    this.showTVDetailsForm(modelId);
                });
            });
        }
    }

    renderModelList(models) {
        if (!models || models.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-search text-4xl mb-3"></i>
                    <p>No models found</p>
                </div>
            `;
        }
        
        let html = '';
        models.forEach(model => {
            html += `
                <button class="model-card w-full bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition text-left" 
                    data-model-id="${model.id}">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="font-semibold text-gray-800">${model.model_name}</h3>
                            <p class="text-sm text-gray-600">${model.model_number} (${model.year})</p>
                            <p class="text-xs text-gray-500 mt-1">${model.panel_type} • ${model.hdr_support}</p>
                        </div>
                        ${model.automated_calibration ? `
                            <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                <i class="fas fa-magic"></i>
                            </span>
                        ` : ''}
                    </div>
                </button>
            `;
        });
        
        return html;
    }

    async showTVDetailsForm(modelId) {
        const model = await API.getTVModel(modelId);
        const brand = await API.getTVBrand(model.brand_id);
        
        const screenSizes = model.screen_size.split(',');
        
        let html = `
            <form id="tvDetailsForm" class="p-4">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Add TV Details</h3>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">TV Model</label>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <p class="font-semibold">${brand.name} ${model.model_name}</p>
                        <p class="text-sm text-gray-600">${model.model_number}</p>
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nickname (Optional)</label>
                    <input type="text" id="tvNickname" placeholder="e.g., Living Room TV" 
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none">
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Room Location</label>
                    <select id="tvRoom" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none">
                        <option>Living Room</option>
                        <option>Bedroom</option>
                        <option>Gaming Room</option>
                        <option>Home Theater</option>
                        <option>Office</option>
                        <option>Other</option>
                    </select>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Screen Size</label>
                    <select id="tvScreenSize" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none">
                        ${screenSizes.map(size => `<option value="${size.trim()}">${size.trim()}"</option>`).join('')}
                    </select>
                </div>
                
                ${model.automated_calibration ? `
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">TV IP Address (Optional - for Smart Calibration)</label>
                        <input type="text" id="tvIpAddress" placeholder="192.168.1.xxx" 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none">
                        <p class="text-xs text-gray-500 mt-1">Find this in TV Settings > Network > Network Status</p>
                    </div>
                ` : ''}
                
                <div class="flex space-x-3">
                    <button type="button" id="cancelAddTV" class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                        Cancel
                    </button>
                    <button type="submit" class="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                        Add TV
                    </button>
                </div>
            </form>
        `;
        
        const modal = this.createModal('', html);
        
        // Replace existing modal
        const existingModal = document.querySelector('.calibration-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.appendChild(modal);
        
        // Attach event listeners
        setTimeout(() => {
            const form = document.getElementById('tvDetailsForm');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.saveTVDetails(modelId);
                });
            }
            
            const cancelBtn = document.getElementById('cancelAddTV');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeModal();
                });
            }
        }, 100);
    }

    async saveTVDetails(modelId) {
        const nickname = document.getElementById('tvNickname')?.value;
        const room = document.getElementById('tvRoom')?.value;
        const screenSize = document.getElementById('tvScreenSize')?.value;
        const ipAddress = document.getElementById('tvIpAddress')?.value;
        
        const tvData = {
            tv_model_id: modelId,
            nickname: nickname || '',
            room: room,
            screen_size: screenSize,
            calibrated: false,
            ip_address: ipAddress || '',
            custom_settings: '{}'
        };
        
        app.showLoading();
        const result = await API.addUserTV(tvData);
        app.hideLoading();
        
        if (result) {
            app.showToast('TV added successfully!', 'success');
            this.closeModal();
            app.switchView('mytvs');
        } else {
            app.showToast('Error adding TV. Please try again.', 'error');
        }
    }

    // Smart Calibration with QR Code
    async startSmartCalibration(tvId) {
        const tv = await API.getUserTV(tvId);
        const model = await API.getTVModel(tv.tv_model_id);
        const brand = await API.getTVBrand(model.brand_id);
        
        let html = `
            <div class="p-6 text-center">
                <div class="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i class="fas fa-qrcode text-3xl text-indigo-600"></i>
                </div>
                
                <h3 class="text-xl font-bold text-gray-800 mb-2">Smart Calibration Ready</h3>
                <p class="text-gray-600 mb-6">Scan the QR code on your TV to begin automated calibration</p>
                
                <div class="bg-white p-4 rounded-lg border-2 border-gray-200 mb-6 inline-block">
                    <div id="qrcode" class="mx-auto"></div>
                </div>
                
                <div class="bg-indigo-50 rounded-lg p-4 mb-6 text-left">
                    <h4 class="font-semibold text-indigo-900 mb-2">Instructions:</h4>
                    <ol class="text-sm text-indigo-800 space-y-2 list-decimal list-inside">
                        <li>Open ${brand.name} SmartThings app on your TV</li>
                        <li>Navigate to Smart Calibration feature</li>
                        <li>Select "Connect via QR Code"</li>
                        <li>Scan this QR code with your TV</li>
                        <li>Follow on-screen instructions</li>
                    </ol>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="Calibration.closeModal()" class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                        Cancel
                    </button>
                    <button onclick="Calibration.startManualCalibration('${tvId}')" class="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                        Manual Instead
                    </button>
                </div>
            </div>
        `;
        
        const modal = this.createModal('', html);
        document.body.appendChild(modal);
        
        // Generate QR code
        setTimeout(() => {
            const qrContainer = document.getElementById('qrcode');
            if (qrContainer && typeof QRCode !== 'undefined') {
                const calibrationUrl = `tvcalibration://connect?tvid=${tvId}&ip=${tv.ip_address || 'auto'}`;
                new QRCode(qrContainer, {
                    text: calibrationUrl,
                    width: 200,
                    height: 200
                });
            }
        }, 100);
    }

    // Manual Calibration
    async startManualCalibration(tvId) {
        this.currentTV = await API.getUserTV(tvId);
        const model = await API.getTVModel(this.currentTV.tv_model_id);
        
        // Show content type selector first
        this.showContentTypeSelector(tvId, model);
    }

    showContentTypeSelector(tvId, model) {
        const contentTypes = API.getContentTypes();
        
        let html = `
            <div class="p-4">
                <h3 class="text-xl font-bold text-gray-800 mb-2">Choose Content Type</h3>
                <p class="text-gray-600 mb-6">Select what you'll be watching most</p>
                
                <div class="space-y-3">
        `;
        
        contentTypes.forEach(type => {
            html += `
                <button onclick="Calibration.loadCalibrationGuide('${tvId}', '${type.id}')" 
                    class="w-full bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition text-left">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                            <i class="fas ${type.icon} text-indigo-600 text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">${type.name}</h4>
                            <p class="text-sm text-gray-600">${type.description}</p>
                        </div>
                    </div>
                </button>
            `;
        });
        
        html += `
                </div>
                
                <button onclick="Calibration.closeModal()" 
                    class="w-full mt-4 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                    Cancel
                </button>
            </div>
        `;
        
        const existingModal = document.querySelector('.calibration-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = this.createModal('', html);
        document.body.appendChild(modal);
    }

    async loadCalibrationGuide(tvId, contentType) {
        const tv = await API.getUserTV(tvId);
        const model = await API.getTVModel(tv.tv_model_id);
        const brand = await API.getTVBrand(model.brand_id);
        
        // Convert content type ID to database format
        const contentTypeMap = {
            'movies_sdr': 'Movies (SDR)',
            'movies_hdr10': 'Movies (HDR10)',
            'movies_dolby': 'Movies (Dolby Vision)',
            'gaming': 'Gaming',
            'sports': 'Sports',
            'tv_shows': 'TV Shows'
        };
        
        const dbContentType = contentTypeMap[contentType] || contentType;
        const settings = await API.getCalibrationByType(tv.tv_model_id, dbContentType);
        
        // Get step-by-step calibration guides
        const guides = await API.getCalibrationGuides(tv.tv_model_id);
        
        // Filter guides for this content type if available
        const contentGuides = guides.filter(g => 
            !g.content_type || g.content_type === dbContentType
        );
        
        this.closeModal();
        
        // If we have step-by-step guides, use those (preferred)
        if (contentGuides && contentGuides.length > 0) {
            await this.showStepByStepGuide(tv, model, brand, contentGuides, settings, dbContentType);
            return;
        }
        
        // Otherwise, if we have settings, show them
        if (settings) {
            await this.showCalibrationSteps(tv, model, settings, dbContentType);
            return;
        }
        
        // Last resort: show generic guidance
        await this.showGenericCalibrationGuide(tv, model, dbContentType);
    }

    async showGenericCalibrationGuide(tv, model, contentType) {
        const mainContent = document.getElementById('mainContent');
        
        // Generic optimal settings for any TV
        const genericSettings = {
            'Movies (SDR)': { brightness: 50, contrast: 90, color: 45, sharpness: 0, colorTemp: 'Warm', gamma: '2.4' },
            'Movies (HDR10)': { brightness: 50, contrast: 100, color: 50, sharpness: 0, colorTemp: 'Warm', gamma: 'ST.2084' },
            'Movies (Dolby Vision)': { brightness: 50, contrast: 100, color: 50, sharpness: 0, colorTemp: 'Warm', gamma: 'ST.2084' },
            'Gaming': { brightness: 52, contrast: 95, color: 48, sharpness: 0, colorTemp: 'Normal', gamma: '2.2' },
            'Sports': { brightness: 55, contrast: 95, color: 52, sharpness: 5, colorTemp: 'Normal', gamma: '2.2' },
            'TV Shows': { brightness: 50, contrast: 90, color: 50, sharpness: 0, colorTemp: 'Normal', gamma: '2.2' }
        };
        
        const settings = genericSettings[contentType] || genericSettings['Movies (SDR)'];
        
        let html = `
            <div class="fade-in">
                <div class="bg-indigo-600 text-white p-4 -mt-4 -mx-4 mb-6">
                    <button onclick="app.loadView('calibrate')" class="mb-3 text-white hover:text-indigo-100">
                        <i class="fas fa-arrow-left mr-2"></i>Back
                    </button>
                    <h2 class="text-2xl font-bold">${contentType.toUpperCase()}</h2>
                    <p class="text-indigo-100">${model.model_name}</p>
                </div>

                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div class="flex">
                        <i class="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
                        <div>
                            <p class="text-sm text-blue-800">
                                <strong>Generic Settings:</strong> We don't have model-specific settings for your TV yet, 
                                but these universal settings will significantly improve your picture quality!
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Main Settings -->
                <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Recommended Picture Settings</h3>
                    
                    ${this.renderSettingStep('Picture Mode', 'Filmmaker or Cinema', 'Navigate to: Menu > Picture > Picture Mode')}
                    ${this.renderSettingStep('Brightness', settings.brightness, 'Adjust to: ' + settings.brightness)}
                    ${this.renderSettingStep('Contrast', settings.contrast, 'Adjust to: ' + settings.contrast)}
                    ${this.renderSettingStep('Color', settings.color, 'Adjust to: ' + settings.color)}
                    ${this.renderSettingStep('Sharpness', settings.sharpness, 'Adjust to: ' + settings.sharpness + ' (0 is best for most TVs)')}
                    ${this.renderSettingStep('Color Temperature', settings.colorTemp, 'Set to: ' + settings.colorTemp)}
                    ${this.renderSettingStep('Gamma', settings.gamma, 'Set to: ' + settings.gamma + ' if available')}
                </div>

                <!-- Universal Tips -->
                <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Universal Tips</h3>
                    ${this.renderSettingStep('Motion Smoothing', 'OFF', 'Turn off Auto Motion Plus, TruMotion, MotionFlow, etc.')}
                    ${this.renderSettingStep('Eco Mode', 'OFF', 'Disable power saving features for consistent picture')}
                    ${this.renderSettingStep('Dynamic Contrast', 'OFF', 'Turn off for more accurate picture')}
                    ${this.renderSettingStep('Noise Reduction', 'OFF or Low', 'Only use for low quality sources')}
                </div>

                <!-- Test Pattern Button -->
                <button onclick="Calibration.showTestPatterns()" 
                    class="w-full bg-purple-100 text-purple-700 py-4 rounded-lg font-semibold hover:bg-purple-200 transition mb-4">
                    <i class="fas fa-palette mr-2"></i>View Test Patterns
                </button>

                <!-- Mark as Calibrated -->
                <button onclick="Calibration.markAsCalibrated('${tv.id}')" 
                    class="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    <i class="fas fa-check-circle mr-2"></i>Mark as Calibrated
                </button>
            </div>
        `;
        
        mainContent.innerHTML = html;
    }
    
    async showCalibrationSteps(tv, model, settings, contentType) {
        const mainContent = document.getElementById('mainContent');
        
        if (!settings) {
            await this.showGenericCalibrationGuide(tv, model, contentType);
            return;
        }
        
        // Parse additional settings
        let additionalSettings = {};
        try {
            additionalSettings = JSON.parse(settings.additional_settings || '{}');
        } catch (e) {
            console.error('Error parsing additional settings:', e);
        }
        
        let html = `
            <div class="fade-in">
                <div class="bg-indigo-600 text-white p-4 -mt-4 -mx-4 mb-6">
                    <button onclick="app.loadView('calibrate')" class="mb-3 text-white hover:text-indigo-100">
                        <i class="fas fa-arrow-left mr-2"></i>Back
                    </button>
                    <h2 class="text-2xl font-bold">${contentType.replace(/_/g, ' ').toUpperCase()}</h2>
                    <p class="text-indigo-100">${model.model_name}</p>
                </div>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div class="flex">
                        <i class="fas fa-lightbulb text-yellow-600 mt-1 mr-3"></i>
                        <div>
                            <p class="text-sm text-yellow-800">
                                <strong>Tip:</strong> These settings are optimized by professional calibrators. 
                                Adjust your TV settings one by one following the steps below.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Main Settings -->
                <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Main Picture Settings</h3>
                    
                    ${this.renderSettingStep('Picture Mode', settings.picture_mode, 'Navigate to: Menu > Picture > Picture Mode')}
                    ${this.renderSettingStep('Brightness', settings.brightness, 'Adjust to: ' + settings.brightness)}
                    ${this.renderSettingStep('Contrast', settings.contrast, 'Adjust to: ' + settings.contrast)}
                    ${this.renderSettingStep('Color', settings.color, 'Adjust to: ' + settings.color)}
                    ${this.renderSettingStep('Sharpness', settings.sharpness, 'Adjust to: ' + settings.sharpness)}
                    ${this.renderSettingStep('Backlight', settings.backlight, 'Adjust to: ' + settings.backlight)}
                    ${this.renderSettingStep('Color Temperature', settings.color_temperature, 'Set to: ' + settings.color_temperature)}
                    ${this.renderSettingStep('Gamma', settings.gamma, 'Set to: ' + settings.gamma)}
                </div>

                <!-- Additional Settings -->
                ${Object.keys(additionalSettings).length > 0 ? `
                    <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-4">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">Advanced Settings</h3>
                        ${Object.entries(additionalSettings).map(([key, value]) => 
                            this.renderSettingStep(key, value, '')
                        ).join('')}
                    </div>
                ` : ''}

                <!-- Motion Settings -->
                <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Motion Settings</h3>
                    ${this.renderSettingStep('Motion Smoothing', settings.motion_settings, 'Turn off motion smoothing for film content')}
                </div>

                <!-- Test Pattern Button -->
                <button onclick="Calibration.showTestPatterns()" 
                    class="w-full bg-purple-100 text-purple-700 py-4 rounded-lg font-semibold hover:bg-purple-200 transition mb-4">
                    <i class="fas fa-palette mr-2"></i>View Test Patterns
                </button>

                <!-- Mark as Calibrated -->
                <button onclick="Calibration.markAsCalibrated('${tv.id}')" 
                    class="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    <i class="fas fa-check-circle mr-2"></i>Mark as Calibrated
                </button>
            </div>
        `;
        
        mainContent.innerHTML = html;
    }

    renderSettingStep(name, value, instruction) {
        return `
            <div class="calibration-step flex items-start py-3 border-b border-gray-100 last:border-0">
                <div class="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-3">
                    <i class="fas fa-chevron-right text-indigo-600 text-xs"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800">${name}</h4>
                    <p class="text-lg text-indigo-600 font-bold">${value}</p>
                    ${instruction ? `<p class="text-sm text-gray-600 mt-1">${instruction}</p>` : ''}
                </div>
            </div>
        `;
    }

    async showStepByStepGuide(tv, model, brand, guides, settings, contentType) {
        // Store the current guide state
        this.currentTV = tv;
        this.currentGuides = guides;
        this.currentSettings = settings;
        this.currentContentType = contentType;
        this.currentStepIndex = 0;
        this.currentModel = model;
        this.currentBrand = brand;
        
        // Show the first step
        this.renderGuidedStep();
    }
    
    renderGuidedStep() {
        const mainContent = document.getElementById('mainContent');
        const guide = this.currentGuides[this.currentStepIndex];
        const totalSteps = this.currentGuides.length;
        const progress = ((this.currentStepIndex + 1) / totalSteps * 100).toFixed(0);
        
        let html = `
            <div class="fade-in">
                <!-- Header with progress -->
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 -mt-4 -mx-4 mb-6">
                    <button onclick="Calibration.confirmExit()" class="mb-3 text-white hover:text-indigo-100 flex items-center">
                        <i class="fas fa-arrow-left mr-2"></i>Exit Calibration
                    </button>
                    <div class="flex items-center justify-between mb-2">
                        <div>
                            <h2 class="text-2xl font-bold">${this.currentContentType}</h2>
                            <p class="text-indigo-100 text-sm">${this.currentBrand.name} ${this.currentModel.model_name}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-3xl font-bold">${this.currentStepIndex + 1}/${totalSteps}</div>
                            <div class="text-xs text-indigo-200">Steps</div>
                        </div>
                    </div>
                    
                    <!-- Progress bar -->
                    <div class="w-full bg-indigo-800 rounded-full h-2 mt-3">
                        <div class="bg-white h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                    </div>
                </div>

                <!-- Current Step Card -->
                <div class="bg-white rounded-xl shadow-lg border-2 border-indigo-200 p-6 mb-6">
                    <div class="flex items-start mb-4">
                        <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                            <span class="text-2xl font-bold text-indigo-600">${this.currentStepIndex + 1}</span>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-gray-800 mb-2">${guide.title}</h3>
                            ${guide.setting_name ? `
                                <div class="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full mb-3">
                                    <i class="fas fa-cog mr-1"></i>${guide.setting_name}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="text-gray-700 leading-relaxed mb-4">
                        ${guide.description || 'Follow the instructions below.'}
                    </div>
                    
                    ${guide.button_sequence ? `
                        <div class="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-4">
                            <h4 class="font-semibold text-indigo-900 mb-2 flex items-center">
                                <i class="fas fa-gamepad mr-2"></i>Remote Button Sequence:
                            </h4>
                            <div class="font-mono text-indigo-800 text-lg">
                                ${guide.button_sequence.split('>').map(btn => 
                                    `<span class="inline-block bg-white px-3 py-1 rounded shadow-sm mx-1">${btn.trim()}</span>`
                                ).join('<i class="fas fa-chevron-right text-indigo-400 mx-1"></i>')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${guide.recommended_value ? `
                        <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                            <h4 class="font-semibold text-green-900 mb-2 flex items-center">
                                <i class="fas fa-star mr-2"></i>Recommended Setting:
                            </h4>
                            <div class="text-2xl font-bold text-green-800">
                                ${guide.recommended_value}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${guide.tips ? `
                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <h4 class="font-semibold text-yellow-900 mb-2 flex items-center">
                                <i class="fas fa-lightbulb mr-2"></i>Pro Tip:
                            </h4>
                            <p class="text-yellow-800 text-sm">${guide.tips}</p>
                        </div>
                    ` : ''}
                    
                    ${guide.image_url ? `
                        <div class="mt-4">
                            <img src="${guide.image_url}" alt="${guide.title}" class="w-full rounded-lg shadow-md">
                        </div>
                    ` : ''}
                </div>

                <!-- Quick Reference Card (if settings available) -->
                ${this.currentSettings ? `
                    <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4 mb-6">
                        <h4 class="font-semibold text-purple-900 mb-3 flex items-center">
                            <i class="fas fa-list-check mr-2"></i>Quick Reference - All Recommended Settings
                        </h4>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            ${this.currentSettings.brightness ? `
                                <div class="bg-white rounded p-2">
                                    <div class="text-gray-600 text-xs">Brightness</div>
                                    <div class="font-bold text-purple-700">${this.currentSettings.brightness}</div>
                                </div>
                            ` : ''}
                            ${this.currentSettings.contrast ? `
                                <div class="bg-white rounded p-2">
                                    <div class="text-gray-600 text-xs">Contrast</div>
                                    <div class="font-bold text-purple-700">${this.currentSettings.contrast}</div>
                                </div>
                            ` : ''}
                            ${this.currentSettings.color ? `
                                <div class="bg-white rounded p-2">
                                    <div class="text-gray-600 text-xs">Color</div>
                                    <div class="font-bold text-purple-700">${this.currentSettings.color}</div>
                                </div>
                            ` : ''}
                            ${this.currentSettings.sharpness !== null && this.currentSettings.sharpness !== undefined ? `
                                <div class="bg-white rounded p-2">
                                    <div class="text-gray-600 text-xs">Sharpness</div>
                                    <div class="font-bold text-purple-700">${this.currentSettings.sharpness}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Navigation Buttons -->
                <div class="flex space-x-3">
                    ${this.currentStepIndex > 0 ? `
                        <button onclick="Calibration.previousStep()" 
                            class="flex-1 bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center">
                            <i class="fas fa-chevron-left mr-2"></i>Previous
                        </button>
                    ` : `
                        <button onclick="Calibration.confirmExit()" 
                            class="flex-1 bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold hover:bg-gray-300 transition">
                            Cancel
                        </button>
                    `}
                    
                    ${this.currentStepIndex < totalSteps - 1 ? `
                        <button onclick="Calibration.nextStep()" 
                            class="flex-1 bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center">
                            Next<i class="fas fa-chevron-right ml-2"></i>
                        </button>
                    ` : `
                        <button onclick="Calibration.showCompletionScreen()" 
                            class="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center">
                            <i class="fas fa-check-circle mr-2"></i>Complete
                        </button>
                    `}
                </div>
                
                <!-- Test Patterns Link -->
                <button onclick="Calibration.showTestPatterns()" 
                    class="w-full mt-3 bg-purple-50 text-purple-700 py-3 rounded-lg font-semibold hover:bg-purple-100 transition border border-purple-200">
                    <i class="fas fa-palette mr-2"></i>View Test Patterns
                </button>
            </div>
        `;
        
        mainContent.innerHTML = html;
    }
    
    nextStep() {
        if (this.currentStepIndex < this.currentGuides.length - 1) {
            this.currentStepIndex++;
            this.renderGuidedStep();
            window.scrollTo(0, 0);
        }
    }
    
    previousStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.renderGuidedStep();
            window.scrollTo(0, 0);
        }
    }
    
    confirmExit() {
        if (confirm('Are you sure you want to exit? Your progress will not be saved.')) {
            this.currentGuides = null;
            this.currentStepIndex = 0;
            app.loadView('calibrate');
        }
    }
    
    showCompletionScreen() {
        const mainContent = document.getElementById('mainContent');
        
        let html = `
            <div class="fade-in text-center">
                <div class="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 -mt-4 -mx-4 mb-6 rounded-b-3xl">
                    <div class="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                        <i class="fas fa-check-circle text-6xl text-green-600"></i>
                    </div>
                    <h2 class="text-3xl font-bold mb-2">Calibration Complete!</h2>
                    <p class="text-green-100">Great job optimizing your TV picture</p>
                </div>

                <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">What's Next?</h3>
                    
                    <div class="space-y-3 text-left">
                        <div class="flex items-start p-3 bg-blue-50 rounded-lg">
                            <i class="fas fa-palette text-blue-600 text-xl mr-3 mt-1"></i>
                            <div>
                                <h4 class="font-semibold text-gray-800">Verify with Test Patterns</h4>
                                <p class="text-sm text-gray-600">Use our test patterns to check brightness, contrast, and color accuracy</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start p-3 bg-purple-50 rounded-lg">
                            <i class="fas fa-tv text-purple-600 text-xl mr-3 mt-1"></i>
                            <div>
                                <h4 class="font-semibold text-gray-800">Watch Real Content</h4>
                                <p class="text-sm text-gray-600">Test with your favorite movies or shows to see the improvement</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start p-3 bg-green-50 rounded-lg">
                            <i class="fas fa-sliders text-green-600 text-xl mr-3 mt-1"></i>
                            <div>
                                <h4 class="font-semibold text-gray-800">Fine-tune if Needed</h4>
                                <p class="text-sm text-gray-600">Make small adjustments based on your room lighting and preferences</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <button onclick="Calibration.showTestPatterns()" 
                        class="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center">
                        <i class="fas fa-palette mr-2"></i>View Test Patterns
                    </button>
                    
                    <button onclick="Calibration.markAsCalibrated('${this.currentTV.id}')" 
                        class="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center">
                        <i class="fas fa-check-circle mr-2"></i>Mark TV as Calibrated
                    </button>
                    
                    <button onclick="app.loadView('mytvs')" 
                        class="w-full bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold hover:bg-gray-300 transition">
                        Return to My TVs
                    </button>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
    }

    async markAsCalibrated(tvId) {
        app.showLoading();
        const result = await API.updateUserTV(tvId, {
            calibrated: true,
            calibration_date: new Date().toISOString()
        });
        app.hideLoading();
        
        if (result) {
            app.showToast('TV marked as calibrated!', 'success');
            setTimeout(() => {
                app.switchView('mytvs');
            }, 1500);
        } else {
            app.showToast('Error updating TV status', 'error');
        }
    }

    // Test Patterns
    showTestPatterns() {
        const patterns = [
            { name: 'Brightness Test', description: 'Check black levels', icon: 'fa-moon' },
            { name: 'Contrast Test', description: 'Check white levels', icon: 'fa-sun' },
            { name: 'Color Bars', description: 'Check color accuracy', icon: 'fa-palette' },
            { name: 'Sharpness Test', description: 'Check image sharpness', icon: 'fa-border-all' },
            { name: 'Gray Scale', description: 'Check grayscale accuracy', icon: 'fa-adjust' },
            { name: 'Uniformity Test', description: 'Check screen uniformity', icon: 'fa-square' }
        ];
        
        let html = `
            <div class="p-4">
                <h3 class="text-xl font-bold text-gray-800 mb-2">Test Patterns</h3>
                <p class="text-gray-600 mb-6">Use these patterns to verify your calibration</p>
                
                <div class="space-y-3">
        `;
        
        patterns.forEach(pattern => {
            html += `
                <button onclick="Calibration.showPattern('${pattern.name}')" 
                    class="w-full bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition text-left">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <i class="fas ${pattern.icon} text-purple-600 text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">${pattern.name}</h4>
                            <p class="text-sm text-gray-600">${pattern.description}</p>
                        </div>
                    </div>
                </button>
            `;
        });
        
        html += `
                </div>
                
                <button onclick="Calibration.closeModal()" 
                    class="w-full mt-4 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                    Close
                </button>
            </div>
        `;
        
        const modal = this.createModal('', html);
        document.body.appendChild(modal);
    }

    showPattern(patternName) {
        // Create fullscreen pattern display
        const patternModal = document.createElement('div');
        patternModal.className = 'fixed inset-0 bg-black z-[100] flex flex-col';
        patternModal.id = 'pattern-display';
        
        let patternHTML = '';
        let instructions = '';
        
        switch(patternName) {
            case 'Brightness Test':
                patternHTML = this.createBrightnessPattern();
                instructions = 'You should be able to see all 16 shades from pure black (left) to dark gray (right). Adjust brightness if you can\'t distinguish the darkest bars.';
                break;
            case 'Contrast Test':
                patternHTML = this.createContrastPattern();
                instructions = 'You should see all bars from white to light gray. Whites should be bright but not glowing. Adjust contrast if bars blend together.';
                break;
            case 'Color Bars':
                patternHTML = this.createColorBars();
                instructions = 'Colors should look natural and distinct. White should be white (not blue or yellow). Check that reds, greens, and blues are vibrant but not oversaturated.';
                break;
            case 'Sharpness Test':
                patternHTML = this.createSharpnessPattern();
                instructions = 'Lines should be crisp and clear without halos or ringing. If you see white borders around the lines, reduce sharpness.';
                break;
            case 'Gray Scale':
                patternHTML = this.createGrayScale();
                instructions = 'All bars should be neutral gray with no color tint. If you see blue, yellow, red, or green tints, adjust color temperature or tint settings.';
                break;
            case 'Uniformity Test':
                patternHTML = this.createUniformityPattern();
                instructions = 'The screen should have even brightness and color across the entire display. Look for darker edges, bright spots, or color shifts.';
                break;
        }
        
        patternModal.innerHTML = `
            <div class="absolute top-4 left-4 right-4 z-10">
                <div class="bg-black bg-opacity-80 text-white p-4 rounded-lg">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-bold">${patternName}</h3>
                        <button onclick="document.getElementById('pattern-display').remove()" 
                            class="text-white hover:text-gray-300 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <p class="text-sm text-gray-300">${instructions}</p>
                    <button onclick="document.getElementById('instructions').classList.toggle('hidden')" 
                        class="mt-2 text-xs text-indigo-400 hover:text-indigo-300">
                        <i class="fas fa-eye-slash mr-1"></i>Hide Instructions
                    </button>
                </div>
            </div>
            <div class="flex-1 flex items-center justify-center">
                ${patternHTML}
            </div>
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button onclick="document.getElementById('pattern-display').remove()" 
                    class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    Close Pattern
                </button>
            </div>
        `;
        
        document.body.appendChild(patternModal);
        
        // Add keyboard listener to close on ESC
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                patternModal.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);
    }
    
    createBrightnessPattern() {
        let bars = '';
        for (let i = 0; i < 16; i++) {
            const shade = Math.floor(i * 16);
            bars += `<div style="width: 6.25%; height: 100%; background-color: rgb(${shade}, ${shade}, ${shade}); display: inline-block;"></div>`;
        }
        return `<div style="width: 80%; height: 60%;">${bars}</div>`;
    }
    
    createContrastPattern() {
        let bars = '';
        for (let i = 0; i < 16; i++) {
            const shade = 255 - Math.floor(i * 16);
            bars += `<div style="width: 6.25%; height: 100%; background-color: rgb(${shade}, ${shade}, ${shade}); display: inline-block;"></div>`;
        }
        return `<div style="width: 80%; height: 60%;">${bars}</div>`;
    }
    
    createColorBars() {
        const colors = [
            { r: 255, g: 255, b: 255, name: 'White' },
            { r: 255, g: 255, b: 0, name: 'Yellow' },
            { r: 0, g: 255, b: 255, name: 'Cyan' },
            { r: 0, g: 255, b: 0, name: 'Green' },
            { r: 255, g: 0, b: 255, name: 'Magenta' },
            { r: 255, g: 0, b: 0, name: 'Red' },
            { r: 0, g: 0, b: 255, name: 'Blue' },
            { r: 0, g: 0, b: 0, name: 'Black' }
        ];
        
        let bars = '';
        colors.forEach(color => {
            bars += `<div style="width: 12.5%; height: 100%; background-color: rgb(${color.r}, ${color.g}, ${color.b}); display: inline-block; position: relative;">
                <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); color: ${color.name === 'Black' ? 'white' : 'black'}; font-size: 12px; text-align: center; font-weight: bold;">${color.name}</div>
            </div>`;
        });
        
        return `<div style="width: 90%; height: 70%;">${bars}</div>`;
    }
    
    createSharpnessPattern() {
        return `
            <div style="width: 80%; height: 70%; background: white; display: flex; flex-direction: column; justify-content: space-around; align-items: center; padding: 20px;">
                <div style="width: 100%; height: 2px; background: black;"></div>
                <div style="width: 100%; height: 4px; background: black;"></div>
                <div style="width: 100%; height: 8px; background: black;"></div>
                <div style="width: 100%; display: flex; justify-content: space-around;">
                    <div style="width: 2px; height: 200px; background: black;"></div>
                    <div style="width: 4px; height: 200px; background: black;"></div>
                    <div style="width: 8px; height: 200px; background: black;"></div>
                </div>
                <svg width="400" height="150" viewBox="0 0 400 150">
                    <line x1="10" y1="75" x2="390" y2="75" stroke="black" stroke-width="2"/>
                    <line x1="200" y1="10" x2="200" y2="140" stroke="black" stroke-width="2"/>
                    <circle cx="200" cy="75" r="50" fill="none" stroke="black" stroke-width="2"/>
                </svg>
            </div>
        `;
    }
    
    createGrayScale() {
        let bars = '';
        const steps = 10;
        for (let i = 0; i <= steps; i++) {
            const shade = Math.floor((i / steps) * 255);
            bars += `<div style="width: ${100/(steps+1)}%; height: 100%; background-color: rgb(${shade}, ${shade}, ${shade}); display: inline-block;"></div>`;
        }
        return `
            <div style="width: 90%; height: 70%;">
                ${bars}
                <div style="text-align: center; color: white; margin-top: 20px; font-size: 14px;">
                    All bars should be neutral gray with no color tint
                </div>
            </div>
        `;
    }
    
    createUniformityPattern() {
        const grays = [
            { percent: 5, label: '5% Gray' },
            { percent: 50, label: '50% Gray' },
            { percent: 100, label: 'White' }
        ];
        
        let patterns = '';
        grays.forEach(gray => {
            const shade = Math.floor((gray.percent / 100) * 255);
            patterns += `
                <div class="pattern-option" style="width: 90%; height: 70%; background-color: rgb(${shade}, ${shade}, ${shade}); margin: 10px auto; display: none; position: relative;" data-pattern="${gray.label}">
                    <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); color: ${gray.percent < 50 ? 'white' : 'black'}; font-size: 18px; font-weight: bold;">
                        ${gray.label}
                    </div>
                </div>
            `;
        });
        
        return `
            <div style="width: 100%; height: 100%;">
                ${patterns}
                <script>
                    const patterns = document.querySelectorAll('.pattern-option');
                    let currentPattern = 0;
                    patterns[currentPattern].style.display = 'block';
                    
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'ArrowRight' || e.key === ' ') {
                            patterns[currentPattern].style.display = 'none';
                            currentPattern = (currentPattern + 1) % patterns.length;
                            patterns[currentPattern].style.display = 'block';
                        } else if (e.key === 'ArrowLeft') {
                            patterns[currentPattern].style.display = 'none';
                            currentPattern = (currentPattern - 1 + patterns.length) % patterns.length;
                            patterns[currentPattern].style.display = 'block';
                        }
                    });
                </script>
                <div style="position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); color: white; text-align: center; background: rgba(0,0,0,0.7); padding: 10px 20px; border-radius: 8px;">
                    Press SPACE or → to cycle through patterns
                </div>
            </div>
        `;
    }

    // Start full calibration flow
    async startCalibrationFlow(tvId) {
        this.startManualCalibration(tvId);
    }

    // Utility methods
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'calibration-modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                ${title ? `
                    <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                        <h2 class="text-xl font-bold text-gray-800">${title}</h2>
                        <button onclick="Calibration.closeModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                ` : ''}
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        return modal;
    }

    closeModal() {
        const modal = document.querySelector('.calibration-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Create global Calibration instance
const Calibration = new CalibrationService();
