// constants/Config.js
export const Config = {
  DEFAULT_USERNAME: 'Entdecker',
  DEBUG_MODE: true,
  MOCK_LOCATION: false, 
  
  NIGHT_MODE_START: '22:00', //
  NIGHT_MODE_END: '06:00',   //

  NEED_CONFIG: {
    FULL_POINTS_UNTIL: 15 * 60 * 1000,  // 15 Min: Volle Belohnung
    DECAY_UNTIL: 60 * 60 * 1000,       // Bis 60 Min: Sinkende Belohnung
    PENALTY_AFTER: 120 * 60 * 1000,    // Nach 120 Min: Punktabzug
    MIN_MULTIPLIER: 0.2,               
    
    // Intervalle für den produktiven Betrieb
    NEXT_NEED_DELAY_MIN: 5000, //1 * 60 * 60 * 1000, // 1 Std.
    NEXT_NEED_DELAY_MAX: 5000 //5 * 60 * 60 * 1000  // 5 Std.
  }
};