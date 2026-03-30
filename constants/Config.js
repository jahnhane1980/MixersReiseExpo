// constants/Config.js
export const Config = {
  DEFAULT_USERNAME: 'Entdecker',
  DEBUG_MODE: true,
  MOCK_LOCATION: false, 
  
  NIGHT_MODE_START: '22:00',
  NIGHT_MODE_END: '06:00',

  // NEU: Sperrzeiten für die Tools (in Millisekunden)
  TOOL_COOLDOWS: {
    1: 10 * 60 * 1000, // Essen: 10 Min
    2: 8 * 60 * 1000,  // Trinken: 8 Min
    3: 2 * 60 * 1000,  // Streicheln: 2 Min
    4: 15 * 60 * 1000, // Waschen: 15 Min
    5: 5 * 60 * 1000   // Reden: 5 Min
  }
};