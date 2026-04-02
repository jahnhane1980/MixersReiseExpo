// constants/Config.js
export const Config = {
  DEFAULT_USERNAME: 'Entdecker',
  DEBUG_MODE: true,
  MOCK_LOCATION: false, 
  
  NIGHT_MODE_START: '22:00',  //Test '08:00', 
  NIGHT_MODE_END: '04:00',   //Test '10:00',   

NEED_CONFIG: {
    FULL_POINTS_UNTIL: 2000, //15 * 60 * 1000,  // 15 Min: Volle Belohnung, Test 2000
    DECAY_UNTIL: 5000, //60 * 60 * 1000,       // Bis 60 Min: Sinkende Belohnung, Test 5000
    PENALTY_AFTER: 10000, //120 * 60 * 1000,    // Nach 120 Min: Punktabzug, Test 10000
    MIN_MULTIPLIER: 0.2,               
    
    // Neue Intervalle: Min 20 Min, Max 1 Std.
    NEXT_NEED_DELAY_MIN: 5000,//20 * 60 * 1000, // 20 Min. Test: 5000 
    NEXT_NEED_DELAY_MAX: 5000 //60 * 60 * 1000   // 1 Std. Test: 5000
  }
};