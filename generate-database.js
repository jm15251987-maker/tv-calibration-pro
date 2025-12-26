/**
 * Database Generation Script
 * 
 * Merges data from multiple sources (RTINGS, AVS Forum, etc.) into a unified
 * calibration database that can be consumed by the TV Calibration Pro app.
 */

const fs = require('fs');
const path = require('path');

// File paths
const RTINGS_FILE = path.join(__dirname, '..', 'data', 'rtings-raw.json');
const AVS_FORUM_FILE = path.join(__dirname, '..', 'data', 'avs-forum-raw.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'calibrations.json');

/**
 * Main database generation function
 */
function generateDatabase() {
  console.log('📊 Starting database generation...');
  
  try {
    // Load data from all sources
    const rtingsData = loadJSON(RTINGS_FILE, 'RTINGS');
    const avsForumData = loadJSON(AVS_FORUM_FILE, 'AVS Forum');
    
    // Initialize unified database
    const database = {
      version: '1.0.0',
      last_updated: new Date().toISOString(),
      sources: ['RTINGS', 'AVS Forum'],
      tv_models: [],
      calibration_settings: [],
      statistics: {}
    };

    // Process RTINGS data (primary source)
    if (rtingsData) {
      console.log(`📥 Processing ${rtingsData.tv_models?.length || 0} models from RTINGS...`);
      
      // Add TV models from RTINGS
      if (rtingsData.tv_models) {
        database.tv_models.push(...rtingsData.tv_models);
      }
      
      // Add calibration settings from RTINGS
      if (rtingsData.calibration_settings) {
        database.calibration_settings.push(...rtingsData.calibration_settings);
      }
    }

    // Process AVS Forum data (supplementary source)
    if (avsForumData && avsForumData.calibrations) {
      console.log(`📥 Processing ${avsForumData.calibrations.length} calibrations from AVS Forum...`);
      
      avsForumData.calibrations.forEach(calibration => {
        // Check if we need to add this model
        const modelExists = database.tv_models.find(m => m.id === calibration.tv_model_id);
        
        if (!modelExists) {
          // Add new TV model
          database.tv_models.push({
            id: calibration.tv_model_id,
            brand_id: calibration.brand,
            model_name: calibration.model_name,
            model_number: calibration.model_number || 'Unknown',
            year: extractYear(calibration.model_name),
            panel_type: 'LED',
            hdr_support: 'HDR10',
            source: 'AVS Forum'
          });
        }
        
        // Add calibration setting
        database.calibration_settings.push({
          id: `avs-${calibration.tv_model_id}-${calibration.content_type.toLowerCase().replace(/\s+/g, '-')}`,
          tv_model_id: calibration.tv_model_id,
          content_type: calibration.content_type,
          picture_mode: calibration.settings.picture_mode,
          brightness: calibration.settings.brightness,
          contrast: calibration.settings.contrast,
          color: calibration.settings.color,
          sharpness: calibration.settings.sharpness,
          backlight: calibration.settings.backlight,
          color_temperature: calibration.settings.colorTemp,
          gamma: calibration.settings.gamma,
          motion_settings: calibration.settings.motion,
          source: calibration.source,
          rating: calibration.rating,
          verified_date: new Date().toISOString()
        });
      });
    }

    // Remove duplicates and sort
    database.tv_models = deduplicateModels(database.tv_models);
    database.calibration_settings = deduplicateSettings(database.calibration_settings);

    // Calculate statistics
    database.statistics = calculateStatistics(database);

    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save unified database
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(database, null, 2));
    
    console.log('✅ Database generation completed successfully!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total TV Models: ${database.tv_models.length}`);
    console.log(`   - Total Calibration Presets: ${database.calibration_settings.length}`);
    console.log(`   - Coverage by Brand:`);
    Object.entries(database.statistics.models_by_brand).forEach(([brand, count]) => {
      console.log(`     • ${brand}: ${count} models`);
    });
    console.log(`💾 Database saved to: ${OUTPUT_FILE}`);
    
    return database;
    
  } catch (error) {
    console.error('❌ Error generating database:', error.message);
    throw error;
  }
}

/**
 * Load JSON file with error handling
 */
function loadJSON(filePath, sourceName) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } else {
      console.warn(`⚠️  ${sourceName} data file not found: ${filePath}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error loading ${sourceName} data:`, error.message);
    return null;
  }
}

/**
 * Extract year from model name
 */
function extractYear(modelName) {
  const yearMatch = modelName.match(/\((\d{4})\)/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  // Default to current year if not found
  return new Date().getFullYear();
}

/**
 * Remove duplicate TV models
 */
function deduplicateModels(models) {
  const seen = new Set();
  return models.filter(model => {
    if (seen.has(model.id)) {
      return false;
    }
    seen.add(model.id);
    return true;
  }).sort((a, b) => {
    // Sort by brand, then year (newest first), then model name
    if (a.brand_id !== b.brand_id) {
      return a.brand_id.localeCompare(b.brand_id);
    }
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return a.model_name.localeCompare(b.model_name);
  });
}

/**
 * Remove duplicate calibration settings
 * If duplicates exist, prioritize RTINGS over community sources
 */
function deduplicateSettings(settings) {
  const seen = new Map();
  
  settings.forEach(setting => {
    const key = `${setting.tv_model_id}-${setting.content_type}`;
    
    if (!seen.has(key)) {
      seen.set(key, setting);
    } else {
      // If duplicate, keep RTINGS data over community data
      const existing = seen.get(key);
      if (setting.source === 'RTINGS' && existing.source !== 'RTINGS') {
        seen.set(key, setting);
      }
    }
  });
  
  return Array.from(seen.values()).sort((a, b) => {
    // Sort by TV model, then content type
    if (a.tv_model_id !== b.tv_model_id) {
      return a.tv_model_id.localeCompare(b.tv_model_id);
    }
    return a.content_type.localeCompare(b.content_type);
  });
}

/**
 * Calculate database statistics
 */
function calculateStatistics(database) {
  const stats = {
    total_models: database.tv_models.length,
    total_settings: database.calibration_settings.length,
    models_by_brand: {},
    models_by_year: {},
    settings_by_content_type: {},
    settings_by_source: {},
    coverage_percentage: 0
  };

  // Count models by brand
  database.tv_models.forEach(model => {
    stats.models_by_brand[model.brand_id] = (stats.models_by_brand[model.brand_id] || 0) + 1;
    stats.models_by_year[model.year] = (stats.models_by_year[model.year] || 0) + 1;
  });

  // Count settings by content type and source
  database.calibration_settings.forEach(setting => {
    stats.settings_by_content_type[setting.content_type] = 
      (stats.settings_by_content_type[setting.content_type] || 0) + 1;
    
    const source = setting.source.includes('RTINGS') ? 'RTINGS' : 'Community';
    stats.settings_by_source[source] = (stats.settings_by_source[source] || 0) + 1;
  });

  // Calculate coverage (models with at least one calibration setting)
  const modelsWithSettings = new Set(
    database.calibration_settings.map(s => s.tv_model_id)
  );
  stats.coverage_percentage = Math.round(
    (modelsWithSettings.size / database.tv_models.length) * 100
  );

  return stats;
}

/**
 * Validate database integrity
 */
function validateDatabase(database) {
  console.log('🔍 Validating database integrity...');
  
  const errors = [];
  const warnings = [];

  // Check for orphaned calibration settings
  const modelIds = new Set(database.tv_models.map(m => m.id));
  database.calibration_settings.forEach(setting => {
    if (!modelIds.has(setting.tv_model_id)) {
      errors.push(`Orphaned calibration setting for model: ${setting.tv_model_id}`);
    }
  });

  // Check for models without any calibration settings
  database.tv_models.forEach(model => {
    const hasSettings = database.calibration_settings.some(
      s => s.tv_model_id === model.id
    );
    if (!hasSettings) {
      warnings.push(`Model without calibrations: ${model.model_name}`);
    }
  });

  // Report results
  if (errors.length > 0) {
    console.error('❌ Database validation failed:');
    errors.forEach(err => console.error(`   - ${err}`));
    throw new Error('Database validation failed');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Database validation warnings:');
    warnings.forEach(warn => console.warn(`   - ${warn}`));
  } else {
    console.log('✅ Database validation passed');
  }
}

// Run generator if executed directly
if (require.main === module) {
  generateDatabase()
    .then(database => {
      validateDatabase(database);
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateDatabase, validateDatabase };
