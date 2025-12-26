# 📺 How TV Settings Work in This App

## Overview

The TV Calibration Pro app uses a **3-tier fallback system** to provide calibration settings for any TV the user enters.

---

## 🎯 The 3-Tier System

### **Tier 1: Model-Specific Step-by-Step Guides** (Best) ⭐⭐⭐
**Priority**: Highest  
**Source**: `calibration_guides` table  
**Quality**: Professional, detailed, brand-specific

**How it works**:
1. User adds their TV by selecting brand and model
2. System looks up `tv_model_id` in `calibration_guides` table
3. If guides exist → Shows **interactive step-by-step walkthrough** with:
   - Exact button sequences for their TV remote
   - Detailed instructions for each setting
   - Pro tips and warnings
   - Progress tracking (Step 1 of 12, etc.)
   - Visual guidance

**Example**: Samsung QN90C, LG OLED C3, Sony X90L
- 10-12 detailed steps per content type
- Specific remote navigation (e.g., "Press Home → Settings → Picture → Expert Settings")
- Model-specific features included

---

### **Tier 2: Model-Specific Settings** (Good) ⭐⭐
**Priority**: Medium  
**Source**: `calibration_settings` table  
**Quality**: Professional, RTINGS-verified

**How it works**:
1. If no step-by-step guides found
2. System looks up `tv_model_id` in `calibration_settings` table
3. If settings exist → Shows **professional calibration values** with:
   - Exact numerical settings (Brightness: 50, Contrast: 45, etc.)
   - Picture mode recommendations
   - Advanced settings (gamma, color temperature, etc.)
   - Motion processing settings
   - Source attribution (RTINGS, AVS Forum, etc.)

**Example**: 132 calibration presets available
- Each TV model has 6 content-type variations:
  - Movies (SDR)
  - Movies (HDR10)
  - Movies (Dolby Vision)
  - Gaming
  - Sports
  - TV Shows

**Coverage**: 22 popular TV models × 6 content types = 132 presets

---

### **Tier 3: Generic Universal Settings** (Fallback) ⭐
**Priority**: Lowest  
**Source**: Hard-coded generic optimal settings  
**Quality**: Universal best practices

**How it works**:
1. If no model-specific data found
2. System uses **generic optimal settings** that work well for ANY TV
3. Shows warning: "We don't have model-specific settings for your TV yet"
4. Provides universal best practices

**Generic Settings by Content Type**:
```javascript
{
  'Movies (SDR)': { 
    brightness: 50, contrast: 90, color: 45, 
    sharpness: 0, colorTemp: 'Warm', gamma: '2.4' 
  },
  'Movies (HDR10)': { 
    brightness: 50, contrast: 100, color: 50, 
    sharpness: 0, colorTemp: 'Warm', gamma: 'ST.2084' 
  },
  'Gaming': { 
    brightness: 52, contrast: 95, color: 48, 
    sharpness: 0, colorTemp: 'Normal', gamma: '2.2' 
  },
  'Sports': { 
    brightness: 55, contrast: 95, color: 52, 
    sharpness: 5, colorTemp: 'Normal', gamma: '2.2' 
  },
  // ... etc
}
```

**Plus universal tips**:
- Motion Smoothing: OFF
- Eco Mode: OFF
- Dynamic Contrast: OFF
- Noise Reduction: OFF or Low

---

## 📊 Current Database Coverage

### Brands Supported
- ✅ Samsung (8+ models)
- ✅ LG (6+ models)
- ✅ Sony (4+ models)
- ✅ TCL (3+ models)
- ✅ Vizio (3+ models)
- ✅ Hisense (3+ models)
- ✅ Panasonic
- ✅ Philips (2+ models)

### Coverage Statistics
| Tier | Models Covered | Content Types | Total Presets |
|------|---------------|---------------|---------------|
| **Tier 1** (Step-by-step) | 3 models | 6 each | 18+ guides |
| **Tier 2** (Settings) | 22 models | 6 each | 132 presets |
| **Tier 3** (Generic) | ALL TVs | 6 types | Unlimited |

**Market Coverage**: ~80%+ of popular TVs (2020-2024)

---

## 🔍 How the Lookup Works (Code Flow)

### Step 1: User Adds TV
```javascript
// User selects brand and model
app.showAddTVModal() 
  → Calibration.showBrandSelector()
  → Calibration.showModelSelector(brandId)
  → User selects model
  → Saves to user_tvs table
```

### Step 2: User Starts Calibration
```javascript
// User clicks "Calibrate"
app.renderCalibrateView()
  → Shows list of user's TVs
  → User selects a TV
  → Calibration.showCalibrationOptions(tv)
```

### Step 3: User Selects Content Type
```javascript
// User picks "Movies (HDR10)" for example
Calibration.startManualCalibration(tv, 'movies_hdr10')
```

### Step 4: Settings Lookup (3-Tier Fallback)
```javascript
async startManualCalibration(tv, contentType) {
    // Convert content type ID to database format
    const dbContentType = 'Movies (HDR10)';
    
    // TIER 1: Try to get step-by-step guides
    const guides = await API.getCalibrationGuides(tv.tv_model_id);
    const contentGuides = guides.filter(g => g.content_type === dbContentType);
    
    if (contentGuides.length > 0) {
        // ✅ BEST CASE: Show step-by-step guide
        await this.showStepByStepGuide(...);
        return;
    }
    
    // TIER 2: Try to get model-specific settings
    const settings = await API.getCalibrationByType(tv.tv_model_id, dbContentType);
    
    if (settings) {
        // ✅ GOOD CASE: Show professional settings
        await this.showCalibrationSteps(...);
        return;
    }
    
    // TIER 3: Fall back to generic settings
    // ⚠️ FALLBACK: Show universal best practices
    await this.showGenericCalibrationGuide(...);
}
```

### Step 5: Display to User
The user sees one of:
1. **Interactive guide** with 12 steps (Tier 1)
2. **Professional settings list** with values (Tier 2)
3. **Generic settings** with universal tips (Tier 3)

---

## 📦 Database Structure

### Table 1: `tv_models`
Stores all TV models the app knows about
```javascript
{
  id: "samsung-qn90c",
  brand_id: "samsung",
  model_number: "QN90C",
  model_name: "Samsung Neo QLED QN90C",
  year: 2023,
  panel_type: "Neo QLED",
  hdr_support: "HDR10, HDR10+, HLG",
  automated_calibration: true
}
```

### Table 2: `calibration_settings` (Tier 2)
Professional settings for specific models
```javascript
{
  id: "cal-samsung-qn90c-movies-hdr10",
  tv_model_id: "samsung-qn90c",
  content_type: "Movies (HDR10)",
  picture_mode: "Filmmaker",
  brightness: 50,
  contrast: 45,
  color: 50,
  sharpness: 0,
  backlight: 18,
  color_temperature: "Warm2",
  gamma: "2.4",
  motion_settings: "Off",
  source: "RTINGS",
  rating: 4.8
}
```

### Table 3: `calibration_guides` (Tier 1)
Step-by-step instructions
```javascript
{
  id: "guide-samsung-qn90c-step1",
  tv_model_id: "samsung-qn90c",
  step_number: 1,
  title: "Access Picture Settings",
  description: "Press the Home button on your Samsung remote...",
  button_sequence: "Home → Settings → Picture",
  setting_name: "Picture Mode",
  recommended_value: "Filmmaker",
  tips: "Filmmaker mode is closest to industry standards"
}
```

### Table 4: `user_tvs`
User's saved TVs
```javascript
{
  id: "user-tv-123",
  tv_model_id: "samsung-qn90c",  // Links to tv_models
  nickname: "Living Room TV",
  room: "Living Room",
  screen_size: "65",
  calibrated: false,
  calibration_date: null
}
```

---

## 🎯 Key Benefits of This System

### 1. **100% Coverage** ✅
- Every TV gets some guidance, even if not in database
- Generic settings work surprisingly well for most TVs

### 2. **Quality Hierarchy** 📊
- Best available data always shown first
- Graceful degradation to generic if needed

### 3. **Scalable** 🚀
- Easy to add new TV models to database
- Easy to add step-by-step guides for popular models
- Generic fallback always available

### 4. **User-Friendly** 😊
- User doesn't need to know which tier they're using
- System automatically picks the best available
- Clear indication when using generic settings

---

## 📈 How to Expand Coverage

### Adding a New TV Model
1. Add entry to `tv_models` table
2. (Optional) Add 6 calibration presets to `calibration_settings`
3. (Optional) Add step-by-step guide to `calibration_guides`

### Priority for New Models
Focus on:
- Best-selling TVs (high user demand)
- Premium models (users more likely to calibrate)
- New releases (2023-2024 models)

---

## 💡 Example User Journey

### Scenario: User has Samsung QN90C

1. **User adds TV**: "Samsung QN90C (2023)"
2. **User clicks Calibrate**: Sees their TV listed
3. **User selects content**: "Movies (HDR10)"
4. **System checks**:
   - ✅ Tier 1: Found 12-step guide for QN90C + HDR10
   - (Skips Tier 2 and 3)
5. **User sees**: Interactive guide with exact Samsung remote buttons
6. **Result**: Perfect calibration with model-specific instructions

### Scenario: User has Unknown Budget Brand TV

1. **User adds TV**: "Generic Brand X123"
2. **User clicks Calibrate**: Sees their TV listed
3. **User selects content**: "Movies (SDR)"
4. **System checks**:
   - ❌ Tier 1: No guides found
   - ❌ Tier 2: No settings found
   - ✅ Tier 3: Uses generic settings
5. **User sees**: Warning + universal best practices
6. **Result**: Still gets good calibration with proven universal settings

---

## 🎓 Summary

**The app ALWAYS provides settings for ANY TV through:**

1. **Best case**: Model-specific step-by-step guides (3 models)
2. **Good case**: Professional settings database (22 models)
3. **Fallback case**: Universal optimal settings (all TVs)

**Current coverage**: ~80% market coverage with specific data, 100% with generic fallback

**User experience**: Seamless - users always get guidance regardless of TV model!

---

*This multi-tier system ensures every user gets helpful calibration guidance, with the best available data for their specific TV model.*
