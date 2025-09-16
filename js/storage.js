const StorageManager = (() => {
    const STORAGE_KEYS = {
        USER_PREFERENCES: 'textToMidi_userPreferences',
        RECENT_CREATIONS: 'textToMidi_recentCreations',
        FAVORITE_CONFIGS: 'textToMidi_favoriteConfigs'
    };

    const MAX_RECENT_ITEMS = 10;
    const MAX_FAVORITE_CONFIGS = 20;

    // Save user preferences
    function saveUserPreferences(preferences) {
        try {
            localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
            console.log('Preferências do usuário salvas:', preferences);
            return true;
        } catch (error) {
            console.error('Erro ao salvar preferências:', error);
            return false;
        }
    }

    // Load user preferences
    function loadUserPreferences() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
            if (stored) {
                const preferences = JSON.parse(stored);
                console.log('Preferências do usuário carregadas:', preferences);
                return preferences;
            }
        } catch (error) {
            console.error('Erro ao carregar preferências:', error);
        }
        return null;
    }

    // Save recent creation
    function saveRecentCreation(creation) {
        try {
            const recentCreations = loadRecentCreations() || [];
            
            // Add timestamp if not present
            creation.timestamp = creation.timestamp || Date.now();
            creation.id = creation.id || generateId();
            
            // Remove duplicate if exists (same text and scale)
            const existingIndex = recentCreations.findIndex(item => 
                item.text === creation.text && item.scale === creation.scale
            );
            if (existingIndex !== -1) {
                recentCreations.splice(existingIndex, 1);
            }
            
            // Add to beginning
            recentCreations.unshift(creation);
            
            // Keep only MAX_RECENT_ITEMS
            if (recentCreations.length > MAX_RECENT_ITEMS) {
                recentCreations.splice(MAX_RECENT_ITEMS);
            }
            
            localStorage.setItem(STORAGE_KEYS.RECENT_CREATIONS, JSON.stringify(recentCreations));
            console.log('Criação recente salva:', creation);
            return true;
        } catch (error) {
            console.error('Erro ao salvar criação recente:', error);
            return false;
        }
    }

    // Load recent creations
    function loadRecentCreations() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.RECENT_CREATIONS);
            if (stored) {
                const creations = JSON.parse(stored);
                console.log('Criações recentes carregadas:', creations.length, 'itens');
                return creations;
            }
        } catch (error) {
            console.error('Erro ao carregar criações recentes:', error);
        }
        return [];
    }

    // Clear recent creations
    function clearRecentCreations() {
        try {
            localStorage.removeItem(STORAGE_KEYS.RECENT_CREATIONS);
            console.log('Criações recentes limpas');
            return true;
        } catch (error) {
            console.error('Erro ao limpar criações recentes:', error);
            return false;
        }
    }

    // Save favorite configuration
    function saveFavoriteConfig(config) {
        try {
            const favorites = loadFavoriteConfigs() || [];
            
            config.timestamp = config.timestamp || Date.now();
            config.id = config.id || generateId();
            config.name = config.name || `Config ${new Date(config.timestamp).toLocaleDateString()}`;
            
            // Remove duplicate if exists
            const existingIndex = favorites.findIndex(item => item.name === config.name);
            if (existingIndex !== -1) {
                favorites.splice(existingIndex, 1);
            }
            
            // Add to beginning
            favorites.unshift(config);
            
            // Keep only MAX_FAVORITE_CONFIGS
            if (favorites.length > MAX_FAVORITE_CONFIGS) {
                favorites.splice(MAX_FAVORITE_CONFIGS);
            }
            
            localStorage.setItem(STORAGE_KEYS.FAVORITE_CONFIGS, JSON.stringify(favorites));
            console.log('Configuração favorita salva:', config);
            return true;
        } catch (error) {
            console.error('Erro ao salvar configuração favorita:', error);
            return false;
        }
    }

    // Load favorite configurations
    function loadFavoriteConfigs() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.FAVORITE_CONFIGS);
            if (stored) {
                const configs = JSON.parse(stored);
                console.log('Configurações favoritas carregadas:', configs.length, 'itens');
                return configs;
            }
        } catch (error) {
            console.error('Erro ao carregar configurações favoritas:', error);
        }
        return [];
    }

    // Delete favorite configuration
    function deleteFavoriteConfig(configId) {
        try {
            const favorites = loadFavoriteConfigs() || [];
            const filteredFavorites = favorites.filter(config => config.id !== configId);
            
            localStorage.setItem(STORAGE_KEYS.FAVORITE_CONFIGS, JSON.stringify(filteredFavorites));
            console.log('Configuração favorita removida:', configId);
            return true;
        } catch (error) {
            console.error('Erro ao remover configuração favorita:', error);
            return false;
        }
    }

    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // Get current app state for saving
    function getCurrentAppState(textValue, scale, instrument, eq, mod, tempo) {
        return {
            text: textValue,
            scale: scale,
            instrument: instrument,
            eq: { ...eq },
            mod: { ...mod },
            tempo: tempo,
            timestamp: Date.now()
        };
    }

    // Check if localStorage is available
    function isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage não está disponível:', error);
            return false;
        }
    }

    // Auto-save user preferences (debounced)
    let preferenceSaveTimeout;
    function autoSavePreferences(preferences) {
        clearTimeout(preferenceSaveTimeout);
        preferenceSaveTimeout = setTimeout(() => {
            saveUserPreferences(preferences);
        }, 1000); // Save after 1 second of inactivity
    }

    // Export storage statistics
    function getStorageStats() {
        const recent = loadRecentCreations();
        const favorites = loadFavoriteConfigs();
        const preferences = loadUserPreferences();
        
        return {
            recentCreations: recent.length,
            favoriteConfigs: favorites.length,
            hasPreferences: !!preferences,
            storageAvailable: isLocalStorageAvailable()
        };
    }

    // Public interface
    return {
        // User Preferences
        saveUserPreferences,
        loadUserPreferences,
        autoSavePreferences,
        
        // Recent Creations
        saveRecentCreation,
        loadRecentCreations,
        clearRecentCreations,
        
        // Favorite Configurations
        saveFavoriteConfig,
        loadFavoriteConfigs,
        deleteFavoriteConfig,
        
        // Utilities
        getCurrentAppState,
        isLocalStorageAvailable,
        getStorageStats,
        generateId
    };
})();