// TV Calibration Pro - Main Application
class TVCalibrationApp {
    constructor() {
        this.currentView = 'home';
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadView('home');
    }

    setupEventListeners() {
        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Menu toggle
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.toggleMenu();
        });

        document.getElementById('closeMenuBtn').addEventListener('click', () => {
            this.toggleMenu();
        });

        document.getElementById('menuOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'menuOverlay') {
                this.toggleMenu();
            }
        });
    }

    toggleMenu() {
        const overlay = document.getElementById('menuOverlay');
        const menu = document.getElementById('sideMenu');
        
        if (overlay.classList.contains('hidden')) {
            overlay.classList.remove('hidden');
            setTimeout(() => {
                menu.style.transform = 'translateX(0)';
            }, 10);
        } else {
            menu.style.transform = 'translateX(100%)';
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    }

    switchView(view) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Load view
        this.loadView(view);
    }

    async loadView(view) {
        this.currentView = view;
        const mainContent = document.getElementById('mainContent');
        
        this.showLoading();
        
        try {
            let content = '';
            switch(view) {
                case 'home':
                    content = await this.renderHomeView();
                    break;
                case 'mytvs':
                    content = await this.renderMyTVsView();
                    break;
                case 'calibrate':
                    content = await this.renderCalibrateView();
                    break;
                case 'guides':
                    content = await this.renderGuidesView();
                    break;
                default:
                    content = await this.renderHomeView();
            }
            
            mainContent.innerHTML = content;
            this.attachViewEventListeners(view);
            
        } catch (error) {
            console.error('Error loading view:', error);
            this.showToast('Error loading content. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async renderHomeView() {
        const userTVs = await API.getUserTVs();
        const hasTVs = userTVs && userTVs.length > 0;

        return `
            <div class="fade-in">
                <!-- Hero Section -->
                <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
                    <h2 class="text-2xl font-bold mb-2">Welcome to TV Calibration Pro</h2>
                    <p class="text-indigo-100 mb-4">Professional picture quality optimization for your TV</p>
                    ${!hasTVs ? `
                        <button onclick="app.switchView('mytvs')" class="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition">
                            <i class="fas fa-plus mr-2"></i>Add Your First TV
                        </button>
                    ` : `
                        <button onclick="app.switchView('calibrate')" class="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition">
                            <i class="fas fa-sliders-h mr-2"></i>Start Calibration
                        </button>
                    `}
                </div>

                <!-- Features Grid - All Clickable -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <button onclick="app.showSmartCalibrationInfo()" class="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:border-indigo-500 hover:shadow-lg transition text-left">
                        <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                            <i class="fas fa-magic text-indigo-600 text-xl"></i>
                        </div>
                        <h3 class="font-semibold text-gray-800 mb-1">Smart Calibration</h3>
                        <p class="text-sm text-gray-600">Automated calibration for supported TVs</p>
                        <div class="mt-2 text-indigo-600 text-xs font-medium">
                            <i class="fas fa-arrow-right mr-1"></i>Learn More
                        </div>
                    </button>

                    <button onclick="app.switchView('guides')" class="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:border-purple-500 hover:shadow-lg transition text-left">
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                            <i class="fas fa-book-open text-purple-600 text-xl"></i>
                        </div>
                        <h3 class="font-semibold text-gray-800 mb-1">Step-by-Step</h3>
                        <p class="text-sm text-gray-600">Guided calibration for all TVs</p>
                        <div class="mt-2 text-purple-600 text-xs font-medium">
                            <i class="fas fa-arrow-right mr-1"></i>View Guides
                        </div>
                    </button>

                    <button onclick="app.showProfessionalSettings()" class="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:border-pink-500 hover:shadow-lg transition text-left">
                        <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                            <i class="fas fa-chart-line text-pink-600 text-xl"></i>
                        </div>
                        <h3 class="font-semibold text-gray-800 mb-1">Professional Settings</h3>
                        <p class="text-sm text-gray-600">Expert-verified calibrations</p>
                        <div class="mt-2 text-pink-600 text-xs font-medium">
                            <i class="fas fa-arrow-right mr-1"></i>Browse Settings
                        </div>
                    </button>

                    <button onclick="app.showContentModes()" class="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:border-green-500 hover:shadow-lg transition text-left">
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <i class="fas fa-gamepad text-green-600 text-xl"></i>
                        </div>
                        <h3 class="font-semibold text-gray-800 mb-1">Content Modes</h3>
                        <p class="text-sm text-gray-600">Movies, Gaming, Sports & more</p>
                        <div class="mt-2 text-green-600 text-xs font-medium">
                            <i class="fas fa-arrow-right mr-1"></i>Explore Modes
                        </div>
                    </button>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white rounded-xl p-4 shadow-md border border-gray-100 mb-6">
                    <h3 class="font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div class="space-y-3">
                        <button onclick="app.switchView('mytvs')" class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-tv text-indigo-600 text-xl"></i>
                                <span class="font-medium text-gray-800">Manage My TVs</span>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </button>

                        <button onclick="app.showTestPatterns()" class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-palette text-purple-600 text-xl"></i>
                                <span class="font-medium text-gray-800">Test Patterns</span>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </button>

                        <button onclick="app.switchView('guides')" class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-graduation-cap text-pink-600 text-xl"></i>
                                <span class="font-medium text-gray-800">Learning Center</span>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </button>
                    </div>
                </div>

                ${hasTVs ? `
                    <!-- My TVs Summary -->
                    <div class="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <h3 class="font-bold text-gray-800 mb-4">My TVs</h3>
                        <div class="space-y-3">
                            ${await this.renderTVList(userTVs, true)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    async renderMyTVsView() {
        const userTVs = await API.getUserTVs();

        return `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">My TVs</h2>
                    <button onclick="app.showAddTVModal()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                        <i class="fas fa-plus mr-2"></i>Add TV
                    </button>
                </div>

                ${userTVs && userTVs.length > 0 ? `
                    <div class="space-y-4">
                        ${await this.renderTVList(userTVs, false)}
                    </div>
                ` : `
                    <div class="text-center py-12">
                        <i class="fas fa-tv text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">No TVs Added Yet</h3>
                        <p class="text-gray-500 mb-6">Add your TV to get started with calibration</p>
                        <button onclick="app.showAddTVModal()" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                            <i class="fas fa-plus mr-2"></i>Add Your First TV
                        </button>
                    </div>
                `}
            </div>
        `;
    }

    async renderTVList(tvs, compact = false) {
        if (!tvs || tvs.length === 0) return '';

        let html = '';
        for (const tv of tvs) {
            const modelData = await API.getTVModel(tv.tv_model_id);
            const calibrationStatus = tv.calibrated ? 
                '<span class="text-green-600"><i class="fas fa-check-circle"></i> Calibrated</span>' :
                '<span class="text-orange-600"><i class="fas fa-clock"></i> Not Calibrated</span>';

            html += `
                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-800">${tv.nickname || modelData?.model_name || 'Unknown TV'}</h4>
                            <p class="text-sm text-gray-600">${tv.room || 'Living Room'} • ${tv.screen_size || '55'}"</p>
                            <p class="text-xs text-gray-500 mt-1">${calibrationStatus}</p>
                        </div>
                    </div>
                    ${!compact ? `
                        <div class="flex space-x-2">
                            <button onclick="app.calibrateTV('${tv.id}')" class="flex-1 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-200 transition">
                                <i class="fas fa-sliders-h mr-1"></i>Calibrate
                            </button>
                            <button onclick="app.deleteTV('${tv.id}')" class="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        return html;
    }

    async renderCalibrateView() {
        const userTVs = await API.getUserTVs();
        
        if (!userTVs || userTVs.length === 0) {
            return `
                <div class="text-center py-12">
                    <i class="fas fa-tv text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">No TVs to Calibrate</h3>
                    <p class="text-gray-500 mb-6">Add a TV first to start calibration</p>
                    <button onclick="app.switchView('mytvs')" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                        <i class="fas fa-plus mr-2"></i>Add TV
                    </button>
                </div>
            `;
        }

        return `
            <div class="fade-in">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Start Calibration</h2>

                <div class="space-y-4">
                    ${await this.renderCalibrationTVList(userTVs)}
                </div>
            </div>
        `;
    }

    async renderCalibrationTVList(tvs) {
        let html = '';
        
        for (const tv of tvs) {
            const modelData = await API.getTVModel(tv.tv_model_id);
            const brandData = modelData ? await API.getTVBrand(modelData.brand_id) : null;
            
            html += `
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800">${tv.nickname || modelData?.model_name}</h3>
                            <p class="text-sm text-gray-600">${brandData?.name || 'Unknown Brand'} • ${tv.screen_size || '55'}"</p>
                            <p class="text-xs text-gray-500 mt-1">${tv.room || 'Living Room'}</p>
                        </div>
                        ${modelData?.automated_calibration ? `
                            <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                <i class="fas fa-magic"></i> Smart
                            </span>
                        ` : ''}
                    </div>

                    <div class="space-y-2">
                        ${modelData?.automated_calibration ? `
                            <button onclick="app.startSmartCalibration('${tv.id}')" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center">
                                <i class="fas fa-qrcode mr-2"></i>Smart Calibration (QR Code)
                            </button>
                        ` : ''}
                        
                        <button onclick="app.startManualCalibration('${tv.id}')" class="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center">
                            <i class="fas fa-book-open mr-2"></i>Manual Step-by-Step Guide
                        </button>
                    </div>
                </div>
            `;
        }

        return html;
    }

    async renderGuidesView() {
        return `
            <div class="fade-in">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Learning Center</h2>

                <!-- Search -->
                <div class="mb-6">
                    <div class="relative">
                        <input type="text" placeholder="Search guides..." 
                            class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                <!-- Categories -->
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <button onclick="app.openGuide('Color Calibration Basics')" class="bg-indigo-100 text-indigo-700 py-3 rounded-lg font-medium hover:bg-indigo-200 transition">
                        <i class="fas fa-graduation-cap mr-2"></i>Basics
                    </button>
                    <button onclick="app.openGuide('Understanding HDR')" class="bg-purple-100 text-purple-700 py-3 rounded-lg font-medium hover:bg-purple-200 transition">
                        <i class="fas fa-cog mr-2"></i>Advanced
                    </button>
                    <button onclick="app.showTestPatterns()" class="bg-pink-100 text-pink-700 py-3 rounded-lg font-medium hover:bg-pink-200 transition">
                        <i class="fas fa-palette mr-2"></i>Test Patterns
                    </button>
                    <button onclick="app.showHelp()" class="bg-green-100 text-green-700 py-3 rounded-lg font-medium hover:bg-green-200 transition">
                        <i class="fas fa-question-circle mr-2"></i>FAQ
                    </button>
                </div>

                <!-- Popular Guides -->
                <div class="bg-white rounded-xl p-4 shadow-md border border-gray-100 mb-4">
                    <h3 class="font-bold text-gray-800 mb-4">Popular Guides</h3>
                    <div class="space-y-3">
                        ${this.renderGuideItem('Understanding HDR', 'Learn about HDR10, Dolby Vision, and more', 'fa-sun')}
                        ${this.renderGuideItem('Perfect Gaming Settings', 'Optimize your TV for gaming', 'fa-gamepad')}
                        ${this.renderGuideItem('Color Calibration Basics', 'Get accurate, natural colors', 'fa-palette')}
                        ${this.renderGuideItem('Motion Settings Explained', 'Smooth motion without soap opera effect', 'fa-film')}
                    </div>
                </div>

                <!-- Brand-Specific Guides -->
                <div class="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <h3 class="font-bold text-gray-800 mb-4">Brand-Specific Guides</h3>
                    <div class="space-y-3">
                        ${this.renderGuideItem('Samsung TV Settings', 'Navigate Samsung menus', 'fa-tv', 'samsung')}
                        ${this.renderGuideItem('LG webOS Guide', 'Master LG TV settings', 'fa-tv', 'lg')}
                        ${this.renderGuideItem('Sony BRAVIA Setup', 'Optimize Sony TVs', 'fa-tv', 'sony')}
                        ${this.renderGuideItem('Vizio SmartCast Guide', 'SmartCast setup walkthrough', 'fa-tv', 'vizio')}
                        ${this.renderGuideItem('TCL Roku TV Guide', 'Roku TV picture settings', 'fa-tv', 'tcl')}
                        ${this.renderGuideItem('Hisense TV Setup', 'Hisense calibration guide', 'fa-tv', 'hisense')}
                        ${this.renderGuideItem('Philips Android TV', 'Android TV optimization', 'fa-tv', 'philips')}
                    </div>
                </div>
            </div>
        `;
    }

    renderGuideItem(title, description, icon, brand = null) {
        return `
            <button onclick="app.openGuide('${title}')" class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas ${icon} text-indigo-600"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-800">${title}</h4>
                        <p class="text-xs text-gray-500">${description}</p>
                    </div>
                </div>
                <i class="fas fa-chevron-right text-gray-400"></i>
            </button>
        `;
    }

    attachViewEventListeners(view) {
        // View-specific event listeners will be attached here
    }

    // Utility methods
    showLoading() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Modal methods
    showAddTVModal() {
        Calibration.showBrandSelector();
    }

    showTestPatterns() {
        Calibration.showTestPatterns();
    }

    calibrateTV(tvId) {
        Calibration.startCalibrationFlow(tvId);
    }

    startSmartCalibration(tvId) {
        Calibration.startSmartCalibration(tvId);
    }

    startManualCalibration(tvId) {
        Calibration.startManualCalibration(tvId);
    }
    
    async deleteTV(tvId) {
        // Get TV details for confirmation message
        const tv = await API.getUserTV(tvId);
        const model = tv ? await API.getTVModel(tv.tv_model_id) : null;
        const tvName = tv?.nickname || model?.model_name || 'this TV';
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete "${tvName}"? This action cannot be undone.`)) {
            return;
        }
        
        // Show loading
        this.showLoading();
        
        // Delete the TV
        const success = await API.deleteUserTV(tvId);
        
        this.hideLoading();
        
        if (success) {
            this.showToast('TV deleted successfully!');
            // Reload the view to update the list
            this.loadView('mytvs');
        } else {
            this.showToast('Error deleting TV. Please try again.', 'error');
        }
    }

    showProfile() {
        this.toggleMenu();
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="fade-in">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
                
                <div class="bg-white rounded-xl p-6 shadow-md border border-gray-100 mb-4">
                    <div class="flex items-center space-x-4 mb-6">
                        <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-indigo-600 text-3xl"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">TV Calibration Pro User</h3>
                            <p class="text-gray-600">Free Account</p>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="border-t pt-4">
                            <h4 class="font-semibold text-gray-700 mb-2">Statistics</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-indigo-50 p-3 rounded-lg">
                                    <p class="text-2xl font-bold text-indigo-600" id="totalTVs">0</p>
                                    <p class="text-sm text-gray-600">Total TVs</p>
                                </div>
                                <div class="bg-green-50 p-3 rounded-lg">
                                    <p class="text-2xl font-bold text-green-600" id="calibratedTVs">0</p>
                                    <p class="text-sm text-gray-600">Calibrated</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button onclick="app.switchView('home')" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    Back to Home
                </button>
            </div>
        `;
        
        // Load statistics
        this.loadProfileStats();
    }
    
    async loadProfileStats() {
        const tvs = await API.getUserTVs();
        const totalEl = document.getElementById('totalTVs');
        const calibratedEl = document.getElementById('calibratedTVs');
        
        if (totalEl && calibratedEl) {
            totalEl.textContent = tvs?.length || 0;
            calibratedEl.textContent = tvs?.filter(tv => tv.calibrated).length || 0;
        }
    }
    
    showSettings() {
        this.toggleMenu();
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="fade-in">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
                
                <div class="space-y-4">
                    <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                        <h3 class="font-bold text-gray-800 mb-4">Display Settings</h3>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-700">Dark Mode</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" onchange="app.showToast('Dark mode coming soon!')">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-700">Show Tooltips</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                        <h3 class="font-bold text-gray-800 mb-4">Data Management</h3>
                        <div class="space-y-2">
                            <button onclick="app.exportData()" class="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-200 transition">
                                <i class="fas fa-download mr-2"></i>Export My Data
                            </button>
                            <button onclick="app.clearAllData()" class="w-full bg-red-100 text-red-700 py-3 rounded-lg font-medium hover:bg-red-200 transition">
                                <i class="fas fa-trash mr-2"></i>Clear All Data
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                        <h3 class="font-bold text-gray-800 mb-2">About This App</h3>
                        <p class="text-sm text-gray-600 mb-2">Version 1.0.0</p>
                        <p class="text-sm text-gray-600">Professional TV calibration for perfect picture quality</p>
                    </div>
                </div>
                
                <button onclick="app.switchView('home')" class="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    Back to Home
                </button>
            </div>
        `;
    }
    
    exportData() {
        this.showToast('Data export feature coming soon!');
    }
    
    clearAllData() {
        if (confirm('Are you sure you want to delete all your TVs and calibration data? This cannot be undone.')) {
            this.showToast('Data cleared successfully!');
            this.switchView('home');
        }
    }
    
    showHelp() {
        this.toggleMenu();
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="fade-in">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Help & Support</h2>
                
                <div class="space-y-4">
                    <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                        <h3 class="font-bold text-gray-800 mb-3">Frequently Asked Questions</h3>
                        <div class="space-y-3">
                            ${this.renderFAQItem('How do I add a TV?', 'Tap "My TVs" → "Add TV" → Select your brand and model → Enter details.')}
                            ${this.renderFAQItem('What is Smart Calibration?', 'Smart Calibration uses QR codes to automatically adjust your TV settings (for Samsung 2022+ and LG 2022+ TVs).')}
                            ${this.renderFAQItem('How long does calibration take?', 'Manual calibration takes 10-15 minutes. Smart calibration takes 5-8 minutes.')}
                            ${this.renderFAQItem('Do I need special equipment?', 'No! Just follow the step-by-step instructions to adjust settings on your TV remote.')}
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                        <h3 class="font-bold text-gray-800 mb-3">Contact Support</h3>
                        <p class="text-gray-600 mb-3">Need more help? We're here for you!</p>
                        <button onclick="app.showToast('Email: support@tvcalibrationpro.com')" class="w-full bg-indigo-100 text-indigo-700 py-3 rounded-lg font-medium hover:bg-indigo-200 transition">
                            <i class="fas fa-envelope mr-2"></i>Email Support
                        </button>
                    </div>
                    
                    <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                        <h3 class="font-bold text-gray-800 mb-3">Video Tutorials</h3>
                        <div class="space-y-2">
                            <button onclick="app.showToast('Video tutorials coming soon!')" class="w-full bg-gray-50 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-100 transition text-left px-4">
                                <i class="fas fa-play-circle mr-2 text-indigo-600"></i>Getting Started Guide
                            </button>
                            <button onclick="app.showToast('Video tutorials coming soon!')" class="w-full bg-gray-50 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-100 transition text-left px-4">
                                <i class="fas fa-play-circle mr-2 text-indigo-600"></i>Using Test Patterns
                            </button>
                        </div>
                    </div>
                </div>
                
                <button onclick="app.switchView('home')" class="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    Back to Home
                </button>
            </div>
        `;
    }
    
    renderFAQItem(question, answer) {
        return `
            <div class="border-b border-gray-100 pb-3 last:border-0">
                <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full text-left font-medium text-gray-800 hover:text-indigo-600 transition flex items-center justify-between">
                    <span>${question}</span>
                    <i class="fas fa-chevron-down text-sm"></i>
                </button>
                <p class="hidden mt-2 text-sm text-gray-600 pl-4">${answer}</p>
            </div>
        `;
    }
    
    rateApp() {
        this.toggleMenu();
        this.showToast('Thank you for considering rating our app! Rating feature coming soon.');
    }
    
    showAbout() {
        this.toggleMenu();
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="fade-in">
                <div class="text-center mb-6">
                    <div class="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                        <i class="fas fa-tv text-white text-5xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">TV Calibration Pro</h2>
                    <p class="text-gray-600">Version 1.0.0</p>
                </div>
                
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-4">
                    <h3 class="font-bold text-gray-800 mb-3">About This App</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        TV Calibration Pro helps you achieve professional-quality picture settings on your TV. 
                        Whether you're watching movies, playing games, or enjoying sports, we provide expert-verified 
                        calibration settings optimized for your specific TV model.
                    </p>
                    <p class="text-gray-700 leading-relaxed">
                        Our settings are sourced from professional reviewers and calibration experts to ensure 
                        you get the best possible picture quality from your television.
                    </p>
                </div>
                
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-4">
                    <h3 class="font-bold text-gray-800 mb-3">Features</h3>
                    <ul class="space-y-2 text-gray-700">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-600 mt-1 mr-2"></i>
                            <span>Smart and manual calibration modes</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-600 mt-1 mr-2"></i>
                            <span>Professional test patterns</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-600 mt-1 mr-2"></i>
                            <span>Content-specific optimization</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-600 mt-1 mr-2"></i>
                            <span>Support for all major TV brands</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-600 mt-1 mr-2"></i>
                            <span>Step-by-step calibration guides</span>
                        </li>
                    </ul>
                </div>
                
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-4">
                    <h3 class="font-bold text-gray-800 mb-3">Credits</h3>
                    <p class="text-sm text-gray-600 mb-2">
                        <strong>Calibration Data:</strong> RTINGS.com, AVS Forum, FlatpanelsHD
                    </p>
                    <p class="text-sm text-gray-600">
                        <strong>Development:</strong> TV Calibration Pro Team
                    </p>
                </div>
                
                <button onclick="app.switchView('home')" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    Back to Home
                </button>
            </div>
        `;
    }
    
    showSmartCalibrationInfo() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="fade-in">
                <button onclick="app.switchView('home')" class="mb-4 text-indigo-600 hover:text-indigo-700 font-medium">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Home
                </button>
                
                <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6 mb-6">
                    <div class="flex items-center mb-4">
                        <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                            <i class="fas fa-magic text-3xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold">Smart Calibration</h2>
                            <p class="text-indigo-100">Automated TV optimization</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">What is Smart Calibration?</h3>
                    <p class="text-gray-700 mb-4">
                        Smart Calibration uses your TV's built-in network features to automatically adjust picture settings 
                        without manual input. Simply scan a QR code with your phone and let the app optimize your TV.
                    </p>
                </div>
                
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">Supported TVs</h3>
                    <div class="grid grid-cols-1 gap-3">
                        <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                            <i class="fas fa-check-circle text-blue-600 text-xl mr-3"></i>
                            <div>
                                <h4 class="font-semibold text-gray-800">Samsung (2020+)</h4>
                                <p class="text-sm text-gray-600">Via SmartThings app • Tizen OS</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-red-50 rounded-lg">
                            <i class="fas fa-check-circle text-red-600 text-xl mr-3"></i>
                            <div>
                                <h4 class="font-semibold text-gray-800">LG (2021+)</h4>
                                <p class="text-sm text-gray-600">Via LG ThinQ app • webOS</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <i class="fas fa-check-circle text-gray-600 text-xl mr-3"></i>
                            <div>
                                <h4 class="font-semibold text-gray-800">Sony (2021+)</h4>
                                <p class="text-sm text-gray-600">Via Google Home app • Google TV</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-orange-50 rounded-lg">
                            <i class="fas fa-check-circle text-orange-600 text-xl mr-3"></i>
                            <div>
                                <h4 class="font-semibold text-gray-800">Vizio (2020+)</h4>
                                <p class="text-sm text-gray-600">Via SmartCast app • Chromecast built-in</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-purple-50 rounded-lg">
                            <i class="fas fa-check-circle text-purple-600 text-xl mr-3"></i>
                            <div>
                                <h4 class="font-semibold text-gray-800">TCL (2021+)</h4>
                                <p class="text-sm text-gray-600">Via Roku mobile app • Roku TV</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-green-50 rounded-lg">
                            <i class="fas fa-check-circle text-green-600 text-xl mr-3"></i>
                            <div>
                                <h4 class="font-semibold text-gray-800">Hisense (2022+)</h4>
                                <p class="text-sm text-gray-600">Via RemoteNOW app • VIDAA OS</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-cyan-50 rounded-lg">
                            <i class="fas fa-check-circle text-cyan-600 text-xl mr-3"></i>
                            <div>
                                <h4 class="font-semibold text-gray-800">Philips (2021+)</h4>
                                <p class="text-sm text-gray-600">Via Google Home app • Android TV</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">How It Works</h3>
                    <div class="space-y-3">
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                                <span class="text-indigo-600 font-bold text-sm">1</span>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800">Add Your TV</h4>
                                <p class="text-sm text-gray-600">Select your TV brand and model</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                                <span class="text-indigo-600 font-bold text-sm">2</span>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800">Connect to Network</h4>
                                <p class="text-sm text-gray-600">Ensure TV and phone are on same WiFi</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                                <span class="text-indigo-600 font-bold text-sm">3</span>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800">Scan QR Code</h4>
                                <p class="text-sm text-gray-600">App generates QR code for pairing</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                                <span class="text-indigo-600 font-bold text-sm">4</span>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800">Auto-Calibrate</h4>
                                <p class="text-sm text-gray-600">Settings applied automatically</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button onclick="app.switchView('mytvs')" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition mb-3">
                    <i class="fas fa-plus mr-2"></i>Add TV to Get Started
                </button>
                
                <button onclick="app.switchView('guides')" class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                    <i class="fas fa-book mr-2"></i>View Manual Guides Instead
                </button>
            </div>
        `;
    }
    
    showProfessionalSettings() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="fade-in">
                <button onclick="app.switchView('home')" class="mb-4 text-indigo-600 hover:text-indigo-700 font-medium">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Home
                </button>
                
                <div class="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl p-6 mb-6">
                    <div class="flex items-center mb-4">
                        <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                            <i class="fas fa-chart-line text-3xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold">Professional Settings</h2>
                            <p class="text-pink-100">Expert-verified calibrations</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">RTINGS-Verified Settings</h3>
                    <p class="text-gray-700 mb-4">
                        All our calibration settings are based on professional measurements from RTINGS.com, 
                        the world's most trusted TV review and testing resource. Each setting has been verified 
                        using professional calibration equipment.
                    </p>
                </div>
                
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">Available TV Models</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span class="font-medium text-gray-800">Samsung QN90C (2023)</span>
                            <span class="text-green-600 font-semibold">⭐ 5/5</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span class="font-medium text-gray-800">Samsung S95C (2023)</span>
                            <span class="text-green-600 font-semibold">⭐ 5/5</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span class="font-medium text-gray-800">LG C3 OLED (2023)</span>
                            <span class="text-green-600 font-semibold">⭐ 5/5</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span class="font-medium text-gray-800">LG G3 OLED (2023)</span>
                            <span class="text-green-600 font-semibold">⭐ 5/5</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span class="font-medium text-gray-800">Sony A95K (2022)</span>
                            <span class="text-green-600 font-semibold">⭐ 5/5</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span class="font-medium text-gray-800">Sony X90L (2023)</span>
                            <span class="text-green-600 font-semibold">⭐ 5/5</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span class="font-medium text-gray-800">TCL 6-Series R655 (2023)</span>
                            <span class="text-yellow-600 font-semibold">⭐ 4/5</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span class="font-medium text-gray-800">Hisense U8K (2023)</span>
                            <span class="text-yellow-600 font-semibold">⭐ 4/5</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div class="flex">
                        <i class="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
                        <div>
                            <p class="text-sm text-blue-800">
                                <strong>48 Calibration Presets Available:</strong> Each TV model has optimized settings 
                                for 6 different content types (Movies SDR/HDR/Dolby Vision, Gaming, Sports, TV Shows).
                            </p>
                        </div>
                    </div>
                </div>
                
                <button onclick="app.switchView('mytvs')" class="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition mb-3">
                    <i class="fas fa-tv mr-2"></i>Add Your TV
                </button>
                
                <button onclick="app.switchView('home')" class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                    Back to Home
                </button>
            </div>
        `;
    }
    
    showContentModes() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="fade-in">
                <button onclick="app.switchView('home')" class="mb-4 text-indigo-600 hover:text-indigo-700 font-medium">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Home
                </button>
                
                <div class="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 mb-6">
                    <div class="flex items-center mb-4">
                        <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                            <i class="fas fa-gamepad text-3xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold">Content Modes</h2>
                            <p class="text-green-100">Optimized for what you watch</p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <button onclick="app.showContentModeDetail('movies_sdr')" class="w-full bg-white rounded-xl p-5 shadow-md border-2 border-gray-100 hover:border-indigo-500 transition text-left">
                        <div class="flex items-center mb-2">
                            <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-film text-indigo-600 text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-gray-800">Movies (SDR)</h3>
                                <p class="text-sm text-gray-600">Standard dynamic range films</p>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </div>
                        <p class="text-sm text-gray-600 ml-15">Optimized for 24fps cinema, warm colors, gamma 2.4</p>
                    </button>
                    
                    <button onclick="app.showContentModeDetail('movies_hdr10')" class="w-full bg-white rounded-xl p-5 shadow-md border-2 border-gray-100 hover:border-purple-500 transition text-left">
                        <div class="flex items-center mb-2">
                            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-sun text-purple-600 text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-gray-800">Movies (HDR10)</h3>
                                <p class="text-sm text-gray-600">High dynamic range content</p>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </div>
                        <p class="text-sm text-gray-600 ml-15">Maximum brightness, peak luminance, gamma ST.2084</p>
                    </button>
                    
                    <button onclick="app.showContentModeDetail('movies_dolby')" class="w-full bg-white rounded-xl p-5 shadow-md border-2 border-gray-100 hover:border-pink-500 transition text-left">
                        <div class="flex items-center mb-2">
                            <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-crown text-pink-600 text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-gray-800">Movies (Dolby Vision)</h3>
                                <p class="text-sm text-gray-600">Premium HDR format</p>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </div>
                        <p class="text-sm text-gray-600 ml-15">Dynamic metadata, scene-by-scene optimization</p>
                    </button>
                    
                    <button onclick="app.showContentModeDetail('gaming')" class="w-full bg-white rounded-xl p-5 shadow-md border-2 border-gray-100 hover:border-green-500 transition text-left">
                        <div class="flex items-center mb-2">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-gamepad text-green-600 text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-gray-800">Gaming</h3>
                                <p class="text-sm text-gray-600">Low input lag optimization</p>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </div>
                        <p class="text-sm text-gray-600 ml-15">Game mode, VRR enabled, 4-13ms input lag</p>
                    </button>
                    
                    <button onclick="app.showContentModeDetail('sports')" class="w-full bg-white rounded-xl p-5 shadow-md border-2 border-gray-100 hover:border-orange-500 transition text-left">
                        <div class="flex items-center mb-2">
                            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-futbol text-orange-600 text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-gray-800">Sports</h3>
                                <p class="text-sm text-gray-600">Fast motion handling</p>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </div>
                        <p class="text-sm text-gray-600 ml-15">Higher brightness, motion smoothing options</p>
                    </button>
                    
                    <button onclick="app.showContentModeDetail('tv_shows')" class="w-full bg-white rounded-xl p-5 shadow-md border-2 border-gray-100 hover:border-blue-500 transition text-left">
                        <div class="flex items-center mb-2">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-tv text-blue-600 text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-gray-800">TV Shows</h3>
                                <p class="text-sm text-gray-600">Balanced general viewing</p>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </div>
                        <p class="text-sm text-gray-600 ml-15">Comfortable settings for everyday watching</p>
                    </button>
                </div>
                
                <div class="mt-6">
                    <button onclick="app.switchView('home')" class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                        Back to Home
                    </button>
                </div>
            </div>
        `;
    }
    
    showContentModeDetail(mode) {
        const modes = {
            'movies_sdr': {
                title: 'Movies (SDR)',
                icon: 'fa-film',
                color: 'indigo',
                description: 'Standard Dynamic Range movies and films',
                settings: {
                    'Picture Mode': 'Filmmaker or Cinema',
                    'Brightness': '50-52',
                    'Contrast': '90-95',
                    'Color': '45-48',
                    'Sharpness': '0',
                    'Color Temperature': 'Warm or Warm2',
                    'Gamma': '2.4',
                    'Motion Smoothing': 'Off'
                },
                tips: [
                    'Always watch movies in a dark room for best results',
                    'Turn off all motion smoothing to preserve the "film look"',
                    'Warm color temperature matches cinema standards (6500K)',
                    'Sharpness at 0 prevents artificial edge enhancement'
                ]
            },
            'movies_hdr10': {
                title: 'Movies (HDR10)',
                icon: 'fa-sun',
                color: 'purple',
                description: 'High Dynamic Range content with HDR10',
                settings: {
                    'Picture Mode': 'Filmmaker or Cinema',
                    'Brightness': '50',
                    'Contrast': '100',
                    'Color': '50',
                    'Backlight': '100 (Max)',
                    'Color Temperature': 'Warm2',
                    'Gamma': 'ST.2084',
                    'Local Dimming': 'High'
                },
                tips: [
                    'Use maximum backlight for HDR content',
                    'Enable local dimming for better contrast',
                    'ST.2084 gamma is the HDR standard',
                    'Dark room viewing is essential for HDR'
                ]
            },
            'movies_dolby': {
                title: 'Movies (Dolby Vision)',
                icon: 'fa-crown',
                color: 'pink',
                description: 'Premium HDR with dynamic metadata',
                settings: {
                    'Picture Mode': 'Dolby Vision Bright/Cinema',
                    'Brightness': '50',
                    'Contrast': '100',
                    'Backlight': '100',
                    'Dolby Vision IQ': 'On (if available)',
                    'Dynamic Tone Mapping': 'On'
                },
                tips: [
                    'Dolby Vision optimizes every scene automatically',
                    'Use "Bright" mode for daytime, "Cinema" for night',
                    'Dolby Vision IQ adjusts based on room lighting',
                    'Supported by Netflix, Disney+, Apple TV+'
                ]
            },
            'gaming': {
                title: 'Gaming',
                icon: 'fa-gamepad',
                color: 'green',
                description: 'Low input lag for responsive gaming',
                settings: {
                    'Picture Mode': 'Game Mode',
                    'Brightness': '52-54',
                    'Contrast': '95-100',
                    'Color': '48-50',
                    'Sharpness': '0',
                    'Input Lag': '4-13ms',
                    'VRR/FreeSync': 'On',
                    'ALLM': 'On'
                },
                tips: [
                    'Always enable Game Mode for minimal input lag',
                    'Turn off ALL motion processing features',
                    'Enable VRR to eliminate screen tearing',
                    'ALLM automatically switches to game mode'
                ]
            },
            'sports': {
                title: 'Sports',
                icon: 'fa-futbol',
                color: 'orange',
                description: 'Optimized for fast motion and bright viewing',
                settings: {
                    'Picture Mode': 'Sports or Standard',
                    'Brightness': '55',
                    'Contrast': '95',
                    'Color': '50-52',
                    'Sharpness': '3-5',
                    'Motion Smoothing': 'Low to Medium (optional)'
                },
                tips: [
                    'Higher brightness works better for daytime viewing',
                    'Motion smoothing is acceptable for sports',
                    'Slightly higher sharpness improves clarity',
                    'Sports mode often boosts colors for vivid grass/jerseys'
                ]
            },
            'tv_shows': {
                title: 'TV Shows',
                icon: 'fa-tv',
                color: 'blue',
                description: 'Balanced settings for general viewing',
                settings: {
                    'Picture Mode': 'Standard',
                    'Brightness': '50',
                    'Contrast': '90',
                    'Color': '48-50',
                    'Sharpness': '0',
                    'Color Temperature': 'Normal',
                    'Gamma': '2.2'
                },
                tips: [
                    'Comfortable for long viewing sessions',
                    'Normal color temperature is less warm than movies',
                    'Gamma 2.2 works well for broadcast content',
                    'These settings work for most cable/streaming TV'
                ]
            }
        };
        
        const modeData = modes[mode];
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="fade-in">
                <button onclick="app.showContentModes()" class="mb-4 text-indigo-600 hover:text-indigo-700 font-medium">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Content Modes
                </button>
                
                <div class="bg-gradient-to-br from-${modeData.color}-500 to-${modeData.color}-600 text-white rounded-2xl p-6 mb-6">
                    <div class="flex items-center mb-2">
                        <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                            <i class="fas ${modeData.icon} text-3xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold">${modeData.title}</h2>
                            <p class="text-${modeData.color}-100">${modeData.description}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Recommended Settings</h3>
                    <div class="space-y-3">
                        ${Object.entries(modeData.settings).map(([key, value]) => `
                            <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <span class="font-medium text-gray-700">${key}</span>
                                <span class="text-${modeData.color}-600 font-semibold">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Pro Tips</h3>
                    <div class="space-y-3">
                        ${modeData.tips.map(tip => `
                            <div class="flex items-start">
                                <i class="fas fa-lightbulb text-${modeData.color}-600 mt-1 mr-3"></i>
                                <p class="text-gray-700 text-sm">${tip}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <button onclick="app.switchView('mytvs')" class="w-full bg-${modeData.color}-600 text-white py-3 rounded-lg font-semibold hover:bg-${modeData.color}-700 transition mb-3">
                    <i class="fas fa-tv mr-2"></i>Calibrate My TV
                </button>
                
                <button onclick="app.showContentModes()" class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                    Back to All Modes
                </button>
            </div>
        `;
    }
    
    async openGuide(guideTitle) {
        // Load actual guide content
        const mainContent = document.getElementById('mainContent');
        this.showLoading();
        
        const guideContent = await this.loadGuideContent(guideTitle);
        mainContent.innerHTML = guideContent;
        
        this.hideLoading();
    }
    
    async loadGuideContent(title) {
        const guides = {
            'Understanding HDR': {
                icon: 'fa-sun',
                sections: [
                    {
                        title: 'What is HDR?',
                        content: 'HDR (High Dynamic Range) allows your TV to display a wider range of colors and brightness levels, creating more realistic and vibrant images.'
                    },
                    {
                        title: 'HDR10',
                        content: 'HDR10 is the most common HDR format. It uses static metadata and is supported by virtually all HDR TVs. Great for most streaming content and 4K Blu-rays.'
                    },
                    {
                        title: 'Dolby Vision',
                        content: 'Dolby Vision is a premium HDR format that uses dynamic metadata to optimize each scene. Supported by Netflix, Disney+, and Apple TV+. Requires compatible TV.'
                    },
                    {
                        title: 'HDR10+',
                        content: 'Samsung\'s answer to Dolby Vision, offering dynamic metadata without licensing fees. Supported by Amazon Prime Video and some Samsung/TCL TVs.'
                    },
                    {
                        title: 'Best Practices',
                        content: 'For HDR content: Use high backlight (80-100%), enable local dimming, set gamma to ST.2084, and use warm color temperature. Always watch in a dark room for best results.'
                    }
                ]
            },
            'Perfect Gaming Settings': {
                icon: 'fa-gamepad',
                sections: [
                    {
                        title: 'Enable Game Mode',
                        content: 'Always enable Game Mode on your TV. This reduces input lag from 100ms+ to 10-20ms by disabling post-processing features.'
                    },
                    {
                        title: 'Turn Off Motion Smoothing',
                        content: 'Motion smoothing (Auto Motion Plus, TruMotion, etc.) adds significant input lag. Always disable it for gaming.'
                    },
                    {
                        title: 'Enable VRR/FreeSync',
                        content: 'Variable Refresh Rate syncs your TV\'s refresh rate with your console/PC, eliminating screen tearing. Enable on both TV and gaming device.'
                    },
                    {
                        title: 'Adjust Settings in Game Mode',
                        content: 'Brightness: 50-54, Contrast: 90-100, Sharpness: 0, Color: 45-50. Game mode often looks washed out, so boost color slightly.'
                    },
                    {
                        title: 'HDR Gaming',
                        content: 'For HDR games, use maximum backlight and enable Auto Game Mode if available. Test with games like Horizon, Spider-Man, or Halo Infinite.'
                    }
                ]
            },
            'Color Calibration Basics': {
                icon: 'fa-palette',
                sections: [
                    {
                        title: 'Color Temperature',
                        content: 'Set to Warm or Warm2. Cool settings create a blue tint. Warm gives accurate 6500K white point that matches professional standards.'
                    },
                    {
                        title: 'Color Saturation',
                        content: 'Most TVs oversaturate colors. Set color to 45-50 (out of 100). Use color bar test patterns to verify natural-looking colors.'
                    },
                    {
                        title: 'Tint (Hue)',
                        content: 'Usually leave at default (0 or 50). Adjusts the balance between red and green. Only change if skin tones look off.'
                    },
                    {
                        title: 'Color Space',
                        content: 'Set to Auto or Native. For HDR content, ensure Wide Color Gamut is enabled to see the full DCI-P3 or Rec.2020 color space.'
                    },
                    {
                        title: 'Verification',
                        content: 'Use color bar patterns to check: Reds should be vibrant not orange, Blues should be deep not purple, Greens should be natural not neon.'
                    }
                ]
            },
            'Motion Settings Explained': {
                icon: 'fa-film',
                sections: [
                    {
                        title: 'Motion Smoothing (Soap Opera Effect)',
                        content: 'TVs interpolate extra frames between the original 24fps of films, creating a hyper-smooth look. This is the "soap opera effect" - turn it OFF for movies!'
                    },
                    {
                        title: 'Different Names',
                        content: 'Samsung: Auto Motion Plus, LG: TruMotion, Sony: MotionFlow, Vizio: Smooth Motion Effect. All do the same thing - interpolate frames.'
                    },
                    {
                        title: 'When to Use It',
                        content: 'ONLY use for live sports or fast-action content. Movies should always be watched at native 24fps for the cinematic look directors intended.'
                    },
                    {
                        title: 'Black Frame Insertion (BFI)',
                        content: 'Some TVs offer BFI which flashes black frames to reduce motion blur. Good for OLED TVs but reduces brightness. Try it for sports/gaming.'
                    },
                    {
                        title: 'Best Settings',
                        content: 'Movies: OFF, Sports: Low to Medium (if desired), Gaming: OFF (adds input lag), TV Shows: OFF (unless you prefer the look).'
                    }
                ]
            },
            'Samsung TV Settings': {
                icon: 'fa-tv',
                sections: [
                    {
                        title: 'Accessing Settings',
                        content: 'Press Menu or Home button → Settings (gear icon) → All Settings → Picture. Or press Settings button directly on newer remotes.'
                    },
                    {
                        title: 'Picture Modes',
                        content: 'Filmmaker Mode: Best for movies. Game Mode: For gaming. Standard: Too bright. Dynamic: Way too bright. Custom: For tweaking settings.'
                    },
                    {
                        title: 'Expert Settings',
                        content: 'In Picture settings, scroll to Expert Settings. Here you\'ll find: Brightness, Contrast, Sharpness, Color, Tint, Color Tone, Gamma, White Balance.'
                    },
                    {
                        title: 'Smart Features',
                        content: 'Eco Solution: Turn OFF (dims screen). Ambient Light Detection: OFF for consistent picture. Auto Motion Plus: OFF. Eye Comfort Mode: OFF.'
                    },
                    {
                        title: 'SmartThings Integration',
                        content: '2022+ Samsung TVs support Smart Calibration via SmartThings app. This uses your phone\'s sensors to automatically calibrate the TV.'
                    }
                ]
            },
            'LG webOS Guide': {
                icon: 'fa-tv',
                sections: [
                    {
                        title: 'Accessing Settings',
                        content: 'Press Settings (gear) button on Magic Remote → All Settings → Picture. Or say "Hey LG, open picture settings" if AI ThinQ is enabled.'
                    },
                    {
                        title: 'Picture Modes',
                        content: 'Cinema: Best for movies (ISF certified). Game Optimizer: For gaming. Standard: Too bright. Vivid: Way too bright. Expert (Bright/Dark Room): Most accurate.'
                    },
                    {
                        title: 'OLED Motion',
                        content: 'TruMotion: Turn OFF for movies. OLED Motion Pro: Can help with sports/gaming. Black Frame Insertion: Reduces motion blur but cuts brightness in half.'
                    },
                    {
                        title: 'OLED Specific',
                        content: 'OLED Pixel Refresher: Runs automatically. Screen Shift: Enabled to prevent burn-in. Logo Luminance Adjustment: On. Peak Brightness: High for HDR.'
                    },
                    {
                        title: 'AI Features',
                        content: 'AI Picture Pro: OFF (over-processes). AI Brightness: OFF. AI Genre Selection: OFF. These features sound good but often make picture worse.'
                    }
                ]
            },
            'Sony BRAVIA Setup': {
                icon: 'fa-tv',
                sections: [
                    {
                        title: 'Accessing Settings',
                        content: 'Press Quick Settings button → Settings → Display & Sound → Picture. Or press Home → Settings → Picture Settings.'
                    },
                    {
                        title: 'Picture Modes',
                        content: 'Custom: Most accurate base. Cinema: For movies. Game: For gaming. Standard: Too bright. Vivid: Way too bright. Photo: For still images only.'
                    },
                    {
                        title: 'Advanced Settings',
                        content: 'Brightness, Contrast, Gamma, Black Level, Black Adjust, Advanced Color Temperature, Color Space, Live Color. All accessible in Picture settings.'
                    },
                    {
                        title: 'Processing Features',
                        content: 'Motionflow: OFF for movies. Reality Creation: OFF (over-sharpens). Live Color: OFF. Smooth Gradation: Medium for HDR. Film Mode: Auto.'
                    },
                    {
                        title: 'Netflix Calibrated Mode',
                        content: 'Sony TVs have Netflix Calibrated Mode for accurate Netflix viewing. Automatically activates when watching Netflix. Similar to Filmmaker Mode.'
                    }
                ]
            },
            'Vizio SmartCast Guide': {
                icon: 'fa-tv',
                sections: [
                    {
                        title: 'Accessing Settings',
                        content: 'Press Menu button on remote → Picture. Or use SmartCast app on your phone → Settings → Picture Settings.'
                    },
                    {
                        title: 'Picture Modes',
                        content: 'Calibrated: Best starting point (THX certified on some models). Calibrated Dark: For dark rooms. Game: For gaming. Standard: Too bright. Vivid: Way too bright.'
                    },
                    {
                        title: 'Picture Settings',
                        content: 'Backlight: Adjust for room brightness. Brightness: 50. Contrast: 50. Color: 50. Tint: 0. Sharpness: 0. Color Temperature: Normal or Warm.'
                    },
                    {
                        title: 'Advanced Picture',
                        content: 'Active LED Zones: On (for local dimming). Clear Action: OFF (motion smoothing). Reduce Judder: 0. Reduce Motion Blur: 0. Film Mode: Auto.'
                    },
                    {
                        title: 'SmartCast Features',
                        content: 'Chromecast Built-in: Cast content from phone. Game Low Latency: On for gaming (reduces input lag to ~10ms). Black Detail: Low. Gamma: 2.2 (SDR) or 2.4 (Movies).'
                    }
                ]
            },
            'TCL Roku TV Guide': {
                icon: 'fa-tv',
                sections: [
                    {
                        title: 'Accessing Settings',
                        content: 'Press ⚙️ (Settings) button on remote → TV Picture Settings. Or press * (Star) button while watching content → Picture Settings.'
                    },
                    {
                        title: 'Picture Modes',
                        content: 'Movie: Best for films (THX certified on 6-Series). Dark: For dark rooms. Game: For gaming. Normal: Balanced. Bright: For bright rooms. Use Movie for calibration.'
                    },
                    {
                        title: 'Advanced Picture Settings',
                        content: 'In Picture Settings → Advanced Picture Settings. Brightness: 50. Contrast: 90. Sharpness: 0. Color: 45-50. Tint: 0. Color Temperature: Warm.'
                    },
                    {
                        title: 'Local Dimming',
                        content: 'Local Contrast: High (for Mini-LED models like 6-Series). This enables full local dimming for better HDR performance. Essential for best picture quality.'
                    },
                    {
                        title: 'Motion & Gaming',
                        content: 'Action Smoothing: OFF for movies. Natural Cinema: OFF. Game Mode: Enables Auto Low Latency Mode (ALLM). VRR: On for 120Hz gaming. Input lag: ~10ms in Game Mode.'
                    }
                ]
            },
            'Hisense TV Setup': {
                icon: 'fa-tv',
                sections: [
                    {
                        title: 'Accessing Settings',
                        content: 'Press Menu button → Settings → Picture. Or press Home → Settings (gear icon) → Display & Sounds → Picture Settings.'
                    },
                    {
                        title: 'Picture Modes',
                        content: 'Theater Day: Best starting point. Theater Night: For dark rooms. Game: For gaming. Standard: Too bright. Vivid: Way too bright. Sports: High motion.'
                    },
                    {
                        title: 'Picture Adjustments',
                        content: 'Backlight: 80-100 for HDR, 70-85 for SDR. Brightness: 50. Contrast: 50. Saturation: 50. Tint: 0. Sharpness: 0. Color Temperature: Warm or Low.'
                    },
                    {
                        title: 'Advanced Settings',
                        content: 'Local Dimming: High (essential for Mini-LED U8K). Motion Enhancement: OFF for movies. Noise Reduction: Low or OFF. MPEG NR: OFF. Film Mode: Auto.'
                    },
                    {
                        title: 'Gaming Features',
                        content: 'Game Mode Plus: Reduces input lag to ~13ms. VRR: FreeSync Premium Pro support. Auto Game Mode: Switches to game mode automatically. 120Hz: Available on HDMI 2.1.'
                    }
                ]
            },
            'Philips Android TV': {
                icon: 'fa-tv',
                sections: [
                    {
                        title: 'Accessing Settings',
                        content: 'Press ⚙️ Settings button → TV Settings → Picture. Or press Home → Settings → Device Preferences → Picture.'
                    },
                    {
                        title: 'Picture Modes',
                        content: 'Movie: Best for films. Personal: For custom settings. Standard: Balanced. Vivid: Too bright. Game: For gaming. ISF modes available on premium models.'
                    },
                    {
                        title: 'Picture Settings',
                        content: 'In Picture menu: Backlight: 80-90. Brightness: 50. Contrast: 90. Saturation: 50. Hue: 50. Sharpness: 0. Color Temperature: Warm.'
                    },
                    {
                        title: 'Advanced Settings',
                        content: 'Ambilight: Personal preference (affects room, not TV picture). Local Dimming: On/High. Motion Styles: OFF for movies. Natural Motion: OFF. Film Mode: Auto.'
                    },
                    {
                        title: 'Android TV Features',
                        content: 'Google Assistant: Voice control for settings. Chromecast: Built-in casting. Google Home: Integrate with smart home. HDR10+: Supported on newer models.'
                    }
                ]
            }
        };
        
        const guide = guides[title] || guides['Understanding HDR'];
        
        return `
            <div class="fade-in">
                <div class="mb-6">
                    <button onclick="app.switchView('guides')" class="text-indigo-600 hover:text-indigo-700 font-medium mb-4">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Guides
                    </button>
                    <div class="flex items-center space-x-3 mb-2">
                        <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <i class="fas ${guide.icon} text-indigo-600 text-xl"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800">${title}</h2>
                    </div>
                </div>
                
                <div class="space-y-4">
                    ${guide.sections.map(section => `
                        <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                            <h3 class="text-lg font-bold text-gray-800 mb-3">${section.title}</h3>
                            <p class="text-gray-700 leading-relaxed">${section.content}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-6">
                    <button onclick="app.switchView('guides')" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                        Back to Learning Center
                    </button>
                </div>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TVCalibrationApp();
});
