export interface CAC40Stock {
  ticker: string;
  yahooTicker: string;
  name: string;
  sector: string;
}

export const CAC40_STOCKS: CAC40Stock[] = [
  { ticker: 'AI', yahooTicker: 'AI.PA', name: 'Air Liquide', sector: 'Chimie' },
  { ticker: 'AIR', yahooTicker: 'AIR.PA', name: 'Airbus', sector: 'Aéronautique' },
  { ticker: 'ALO', yahooTicker: 'ALO.PA', name: 'Alstom', sector: 'Industrie' },
  { ticker: 'MT', yahooTicker: 'MT.AS', name: 'ArcelorMittal', sector: 'Acier' },
  { ticker: 'CS', yahooTicker: 'CS.PA', name: 'AXA', sector: 'Assurance' },
  { ticker: 'BNP', yahooTicker: 'BNP.PA', name: 'BNP Paribas', sector: 'Banque' },
  { ticker: 'EN', yahooTicker: 'EN.PA', name: 'Bouygues', sector: 'Construction' },
  { ticker: 'CAP', yahooTicker: 'CAP.PA', name: 'Capgemini', sector: 'Technologie' },
  { ticker: 'CA', yahooTicker: 'CA.PA', name: 'Carrefour', sector: 'Distribution' },
  { ticker: 'ACA', yahooTicker: 'ACA.PA', name: 'Crédit Agricole', sector: 'Banque' },
  { ticker: 'BN', yahooTicker: 'BN.PA', name: 'Danone', sector: 'Agroalimentaire' },
  { ticker: 'DSY', yahooTicker: 'DSY.PA', name: 'Dassault Systèmes', sector: 'Technologie' },
  { ticker: 'ENGI', yahooTicker: 'ENGI.PA', name: 'Engie', sector: 'Énergie' },
  { ticker: 'EL', yahooTicker: 'EL.PA', name: 'EssilorLuxottica', sector: 'Optique' },
  { ticker: 'ERF', yahooTicker: 'ERF.PA', name: 'Eurofins Scientific', sector: 'Services' },
  { ticker: 'RMS', yahooTicker: 'RMS.PA', name: 'Hermès', sector: 'Luxe' },
  { ticker: 'KER', yahooTicker: 'KER.PA', name: 'Kering', sector: 'Luxe' },
  { ticker: 'LR', yahooTicker: 'LR.PA', name: 'Legrand', sector: 'Électrique' },
  { ticker: 'OR', yahooTicker: 'OR.PA', name: "L'Oréal", sector: 'Cosmétiques' },
  { ticker: 'MC', yahooTicker: 'MC.PA', name: 'LVMH', sector: 'Luxe' },
  { ticker: 'ML', yahooTicker: 'ML.PA', name: 'Michelin', sector: 'Automobile' },
  { ticker: 'ORA', yahooTicker: 'ORA.PA', name: 'Orange', sector: 'Télécommunications' },
  { ticker: 'RI', yahooTicker: 'RI.PA', name: 'Pernod Ricard', sector: 'Spiritueux' },
  { ticker: 'PUB', yahooTicker: 'PUB.PA', name: 'Publicis', sector: 'Publicité' },
  { ticker: 'RNO', yahooTicker: 'RNO.PA', name: 'Renault', sector: 'Automobile' },
  { ticker: 'SAF', yahooTicker: 'SAF.PA', name: 'Safran', sector: 'Aéronautique' },
  { ticker: 'SGO', yahooTicker: 'SGO.PA', name: 'Saint-Gobain', sector: 'Matériaux' },
  { ticker: 'SAN', yahooTicker: 'SAN.PA', name: 'Sanofi', sector: 'Pharmacie' },
  { ticker: 'SU', yahooTicker: 'SU.PA', name: 'Schneider Electric', sector: 'Électrique' },
  { ticker: 'GLE', yahooTicker: 'GLE.PA', name: 'Société Générale', sector: 'Banque' },
  { ticker: 'STLAP', yahooTicker: 'STLAP.PA', name: 'Stellantis', sector: 'Automobile' },
  { ticker: 'STMPA', yahooTicker: 'STMPA.PA', name: 'STMicroelectronics', sector: 'Semi-conducteurs' },
  { ticker: 'TEP', yahooTicker: 'TEP.PA', name: 'Teleperformance', sector: 'Services' },
  { ticker: 'HO', yahooTicker: 'HO.PA', name: 'Thales', sector: 'Défense' },
  { ticker: 'TTE', yahooTicker: 'TTE.PA', name: 'TotalEnergies', sector: 'Énergie' },
  { ticker: 'URW', yahooTicker: 'URW.AS', name: 'Unibail-Rodamco-Westfield', sector: 'Immobilier' },
  { ticker: 'VIE', yahooTicker: 'VIE.PA', name: 'Veolia', sector: 'Services' },
  { ticker: 'DG', yahooTicker: 'DG.PA', name: 'Vinci', sector: 'Construction' },
  { ticker: 'VIV', yahooTicker: 'VIV.PA', name: 'Vivendi', sector: 'Médias' },
  { ticker: 'WLN', yahooTicker: 'WLN.PA', name: 'Worldline', sector: 'Paiements' },
];

export const YAHOO_FINANCE_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'default_jwt_secret_change_me',
  expirySeconds: 86400, // 24 hours in seconds
};

export const BCRYPT_ROUNDS = 12;

export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
};
