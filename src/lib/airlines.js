// ATLAS · airlines (with fleet families for aircraft schematics + comfort baselines)

export const AIRLINES = [
  { code:'EK', name:'Emirates',           hub:'DXB', tier:1.10, baseComfort: 9.0, baseReliability: 8.8, fleet:['A380','B777'] },
  { code:'EY', name:'Etihad Airways',     hub:'AUH', tier:1.05, baseComfort: 8.8, baseReliability: 8.5, fleet:['B787','A380'] },
  { code:'QR', name:'Qatar Airways',      hub:'DOH', tier:1.10, baseComfort: 9.2, baseReliability: 9.0, fleet:['A350','B777'] },
  { code:'BA', name:'British Airways',    hub:'LHR', tier:1.00, baseComfort: 7.8, baseReliability: 7.6, fleet:['B777','A350'] },
  { code:'LH', name:'Lufthansa',          hub:'FRA', tier:1.00, baseComfort: 8.2, baseReliability: 8.3, fleet:['A350','B747'] },
  { code:'AF', name:'Air France',         hub:'CDG', tier:0.98, baseComfort: 8.0, baseReliability: 7.8, fleet:['B777','A350'] },
  { code:'KL', name:'KLM',                hub:'AMS', tier:0.98, baseComfort: 8.1, baseReliability: 8.4, fleet:['B787','A330'] },
  { code:'TK', name:'Turkish Airlines',   hub:'IST', tier:0.92, baseComfort: 8.3, baseReliability: 7.9, fleet:['B787','A330'] },
  { code:'SQ', name:'Singapore Airlines', hub:'SIN', tier:1.12, baseComfort: 9.4, baseReliability: 9.2, fleet:['A350','A380'] },
  { code:'CX', name:'Cathay Pacific',     hub:'HKG', tier:1.05, baseComfort: 9.0, baseReliability: 8.7, fleet:['A350','B777'] },
  { code:'JL', name:'Japan Airlines',     hub:'NRT', tier:1.05, baseComfort: 8.9, baseReliability: 9.1, fleet:['B787','B777'] },
  { code:'AA', name:'American Airlines',  hub:'JFK', tier:0.95, baseComfort: 7.2, baseReliability: 7.4, fleet:['B777','B787'] },
  { code:'UA', name:'United Airlines',    hub:'EWR', tier:0.95, baseComfort: 7.4, baseReliability: 7.5, fleet:['B777','B787'] },
  { code:'DL', name:'Delta Air Lines',    hub:'JFK', tier:0.97, baseComfort: 7.8, baseReliability: 8.2, fleet:['A350','B767'] },
  { code:'AI', name:'Air India',          hub:'DEL', tier:0.90, baseComfort: 7.0, baseReliability: 6.8, fleet:['B777','B787'] },
];

export const AIRLINE_BY_CODE = Object.fromEntries(AIRLINES.map(a => [a.code, a]));

// Aircraft families with comfort defaults — used for schematics + insights
export const AIRCRAFT = {
  A380: { family: 'widebody', layout: '3-4-3', rows: 64, exits: [10, 38, 56], wing: [22, 32], noiseRear: true, label: 'Airbus A380'  },
  A350: { family: 'widebody', layout: '3-3-3', rows: 48, exits: [10, 30, 44], wing: [18, 28], noiseRear: false, label: 'Airbus A350' },
  A330: { family: 'widebody', layout: '2-4-2', rows: 42, exits: [10, 28, 38], wing: [16, 24], noiseRear: false, label: 'Airbus A330' },
  B777: { family: 'widebody', layout: '3-4-3', rows: 50, exits: [10, 32, 46], wing: [20, 30], noiseRear: true,  label: 'Boeing 777'  },
  B787: { family: 'widebody', layout: '3-3-3', rows: 44, exits: [10, 28, 40], wing: [18, 26], noiseRear: false, label: 'Boeing 787'  },
  B767: { family: 'widebody', layout: '2-3-2', rows: 38, exits: [8, 24, 34],  wing: [14, 22], noiseRear: false, label: 'Boeing 767'  },
  B747: { family: 'jumbo',    layout: '3-4-3', rows: 58, exits: [10, 36, 52], wing: [22, 32], noiseRear: true,  label: 'Boeing 747'  },
};
