export interface WeaponPlatform {
  id: string;
  name: string;
  category: 'Aircraft' | 'Ground Vehicle' | 'Naval' | 'Missile System' | 'Electronic System';
  manufacturer: string;
  fscCode: string;
  naicsCode: string;
  description: string;
  firstDeployed?: number;
  totalFunding?: number;
  status: 'Active' | 'Development' | 'Retired';
}

export const weaponsPlatforms: WeaponPlatform[] = [
  {
    id: 'f35-lightning-ii',
    name: 'F-35 Lightning II',
    category: 'Aircraft',
    manufacturer: 'Lockheed Martin',
    fscCode: '1510',
    naicsCode: '336411',
    description: 'Fifth-generation multirole stealth fighter aircraft',
    firstDeployed: 2015,
    totalFunding: 412000000000,
    status: 'Active'
  },
  {
    id: 'f22-raptor',
    name: 'F-22 Raptor',
    category: 'Aircraft',
    manufacturer: 'Lockheed Martin',
    fscCode: '1510',
    naicsCode: '336411',
    description: 'Fifth-generation air superiority fighter',
    firstDeployed: 2005,
    totalFunding: 67300000000,
    status: 'Active'
  },
  {
    id: 'm1-abrams',
    name: 'M1 Abrams Tank',
    category: 'Ground Vehicle',
    manufacturer: 'General Dynamics',
    fscCode: '2350',
    naicsCode: '336992',
    description: 'Main battle tank',
    firstDeployed: 1980,
    totalFunding: 8900000000,
    status: 'Active'
  },
  {
    id: 'virginia-class',
    name: 'Virginia-class Submarine',
    category: 'Naval',
    manufacturer: 'General Dynamics/Huntington Ingalls',
    fscCode: '1925',
    naicsCode: '336611',
    description: 'Nuclear-powered attack submarine',
    firstDeployed: 2004,
    totalFunding: 109000000000,
    status: 'Active'
  },
  {
    id: 'patriot-missile',
    name: 'Patriot Missile System',
    category: 'Missile System',
    manufacturer: 'Raytheon',
    fscCode: '1410',
    naicsCode: '336414',
    description: 'Surface-to-air missile defense system',
    firstDeployed: 1981,
    totalFunding: 24000000000,
    status: 'Active'
  },
  {
    id: 'apache-helicopter',
    name: 'AH-64 Apache',
    category: 'Aircraft',
    manufacturer: 'Boeing',
    fscCode: '1520',
    naicsCode: '336411',
    description: 'Attack helicopter',
    firstDeployed: 1986,
    totalFunding: 32000000000,
    status: 'Active'
  },
  {
    id: 'bradley-fighting',
    name: 'M2 Bradley Fighting Vehicle',
    category: 'Ground Vehicle',
    manufacturer: 'BAE Systems',
    fscCode: '2350',
    naicsCode: '336992',
    description: 'Infantry fighting vehicle',
    firstDeployed: 1981,
    totalFunding: 5700000000,
    status: 'Active'
  },
  {
    id: 'nimitz-carrier',
    name: 'Nimitz-class Aircraft Carrier',
    category: 'Naval',
    manufacturer: 'Newport News Shipbuilding',
    fscCode: '1925',
    naicsCode: '336611',
    description: 'Nuclear-powered aircraft carrier',
    firstDeployed: 1975,
    totalFunding: 44300000000,
    status: 'Active'
  },
  {
    id: 'aegis-destroyer',
    name: 'Arleigh Burke-class Destroyer',
    category: 'Naval',
    manufacturer: 'General Dynamics/Huntington Ingalls',
    fscCode: '1925',
    naicsCode: '336611',
    description: 'Guided missile destroyer',
    firstDeployed: 1991,
    totalFunding: 103000000000,
    status: 'Active'
  },
  {
    id: 'javelin-missile',
    name: 'FGM-148 Javelin',
    category: 'Missile System',
    manufacturer: 'Raytheon/Lockheed Martin',
    fscCode: '1410',
    naicsCode: '336414',
    description: 'Anti-tank missile system',
    firstDeployed: 1996,
    totalFunding: 4900000000,
    status: 'Active'
  },
  {
    id: 'b2-spirit',
    name: 'B-2 Spirit',
    category: 'Aircraft',
    manufacturer: 'Northrop Grumman',
    fscCode: '1510',
    naicsCode: '336411',
    description: 'Stealth strategic bomber',
    firstDeployed: 1997,
    totalFunding: 44750000000,
    status: 'Active'
  },
  {
    id: 'c130-hercules',
    name: 'C-130 Hercules',
    category: 'Aircraft',
    manufacturer: 'Lockheed Martin',
    fscCode: '1510',
    naicsCode: '336411',
    description: 'Military transport aircraft',
    firstDeployed: 1956,
    totalFunding: 47700000000,
    status: 'Active'
  },
  {
    id: 'chinook-helicopter',
    name: 'CH-47 Chinook',
    category: 'Aircraft',
    manufacturer: 'Boeing',
    fscCode: '1520',
    naicsCode: '336411',
    description: 'Heavy-lift helicopter',
    firstDeployed: 1962,
    totalFunding: 15800000000,
    status: 'Active'
  },
  {
    id: 'humvee',
    name: 'High Mobility Multipurpose Wheeled Vehicle (HMMWV)',
    category: 'Ground Vehicle',
    manufacturer: 'AM General',
    fscCode: '2320',
    naicsCode: '336120',
    description: 'Light tactical vehicle',
    firstDeployed: 1985,
    totalFunding: 5200000000,
    status: 'Active'
  },
  {
    id: 'stryker-vehicle',
    name: 'Stryker Armored Vehicle',
    category: 'Ground Vehicle',
    manufacturer: 'General Dynamics',
    fscCode: '2350',
    naicsCode: '336992',
    description: 'Eight-wheeled armored fighting vehicle',
    firstDeployed: 2002,
    totalFunding: 12700000000,
    status: 'Active'
  },
  {
    id: 'thaad-system',
    name: 'Terminal High Altitude Area Defense (THAAD)',
    category: 'Missile System',
    manufacturer: 'Lockheed Martin',
    fscCode: '1410',
    naicsCode: '336414',
    description: 'Anti-ballistic missile defense system',
    firstDeployed: 2008,
    totalFunding: 17600000000,
    status: 'Active'
  },
  {
    id: 'osprey-aircraft',
    name: 'V-22 Osprey',
    category: 'Aircraft',
    manufacturer: 'Bell/Boeing',
    fscCode: '1520',
    naicsCode: '336411',
    description: 'Tiltrotor aircraft',
    firstDeployed: 2007,
    totalFunding: 27200000000,
    status: 'Active'
  },
  {
    id: 'littoral-combat',
    name: 'Littoral Combat Ship (LCS)',
    category: 'Naval',
    manufacturer: 'Lockheed Martin/Austal USA',
    fscCode: '1925',
    naicsCode: '336611',
    description: 'Small surface vessel',
    firstDeployed: 2008,
    totalFunding: 23700000000,
    status: 'Active'
  },
  {
    id: 'global-hawk',
    name: 'RQ-4 Global Hawk',
    category: 'Aircraft',
    manufacturer: 'Northrop Grumman',
    fscCode: '1550',
    naicsCode: '336411',
    description: 'High-altitude unmanned aircraft',
    firstDeployed: 2001,
    totalFunding: 12200000000,
    status: 'Active'
  },
  {
    id: 'predator-drone',
    name: 'MQ-1 Predator',
    category: 'Aircraft',
    manufacturer: 'General Atomics',
    fscCode: '1550',
    naicsCode: '336411',
    description: 'Unmanned combat aerial vehicle',
    firstDeployed: 1995,
    totalFunding: 2400000000,
    status: 'Retired'
  }
];

export const weaponCategories = [
  'Aircraft',
  'Ground Vehicle', 
  'Naval',
  'Missile System',
  'Electronic System'
] as const;

export const getWeaponsByCategory = (category: string) => {
  return weaponsPlatforms.filter(weapon => weapon.category === category);
};

export const searchWeapons = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return weaponsPlatforms.filter(weapon => 
    weapon.name.toLowerCase().includes(lowercaseQuery) ||
    weapon.manufacturer.toLowerCase().includes(lowercaseQuery) ||
    weapon.description.toLowerCase().includes(lowercaseQuery)
  );
};