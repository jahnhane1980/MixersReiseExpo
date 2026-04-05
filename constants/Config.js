// constants/Config.js

const DEBUG_MODE = false; 

export const Config = {
  DEFAULT_USERNAME: 'Entdecker',
  DEBUG_MODE: DEBUG_MODE,
  MOCK_LOCATION: false, 
  
  NIGHT_MODE_START: '22:00',
  NIGHT_MODE_END: '06:00',

  NEED_CONFIG: DEBUG_MODE ? {
    FULL_POINTS_UNTIL: 2000, 
    DECAY_UNTIL: 5000, 
    PENALTY_AFTER: 10000, 
    NEXT_NEED_DELAY_MIN: 5000,
    NEXT_NEED_DELAY_MAX: 5000,
    MIN_MULTIPLIER: 0.2,
  } : {
    FULL_POINTS_UNTIL: 15 * 60 * 1000,     // 1 * 60 * 1000 Nach 1 Min fangen Punkte an zu sinken
    DECAY_UNTIL: 60 * 60 * 1000,           // Sinkflug geht bis Min 2 (2 * 60 * 1000)
    // DIE STRAFE:
    PENALTY_AFTER: 120 * 60 * 1000,         // Nach exakt 2 Minuten kommt die Strafe (2 * 60 * 1000)
    
    // DIE WARTEZEIT BIS ZUM NÄCHSTEN BEDÜRFNIS:
    // FIX: Auf 10 Sekunden gesetzt (10 * 1000), damit das Bedürfnis fast sofort startet!
    NEXT_NEED_DELAY_MIN: 20 * 60 * 1000,       
    NEXT_NEED_DELAY_MAX: 60 * 60 * 1000,
    MIN_MULTIPLIER: 0.2,
    }
};