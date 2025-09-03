export const csvFiles: Record<string, string> = {
  "2022": "/NAWCAD_FY_2022.csv",
  "2023": "/NAWCAD_FY_2023.csv",
  "2024": "/NAWCAD_FY_2024.csv",
  "2025": "/NAWCAD_FY_2025.csv",
};


export interface Contract {
  id: string;
  title: string;
  contractNumber: string;
  agency: string;
  subAgency?: string;
  awardDate: string;
  startDate: string;
  endDate: string;
  contractor: string;
  contractorDuns?: string;
  totalValue: number;
  obligatedAmount: number;
  contractType: 'Firm Fixed Price' | 'Cost Plus' | 'Time and Materials' | 'Indefinite Delivery';
  competitionType: 'Full and Open Competition' | 'Not Competed' | 'Limited Sources' | 'Set Aside';
  setAsideType?: 'Small Business' | 'SDVOSB' | 'WOSB' | 'HUBZone' | '8(a)' | 'None';
  naicsCode: string;
  naicsDescription: string;
  fscCode: string;
  fscDescription: string;
  placeOfPerformance: {
    city: string;
    state: string;
    country: string;
  };
  description: string;
  modifications: ContractModification[];
  status: 'Active' | 'Completed' | 'Terminated' | 'Cancelled';
  weaponSystem?: string;
}

export interface ContractModification {
  id: string;
  modificationNumber: string;
  effectiveDate: string;
  description: string;
  changeInValue: number;
  newTotalValue: number;
  reason: string;
}

export interface Contractor {
  id: string;
  name: string;
  duns: string;
  cage: string;
  uei?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessType: 'Large Business' | 'Small Business' | 'SDVOSB' | 'WOSB' | 'HUBZone' | '8(a)';
  employeeCount?: number;
  revenue?: number;
  founded?: number;
  website?: string;
  capabilities: string[];
  pastPerformance: {
    totalContracts: number;
    totalValue: number;
    averageRating?: number;
    onTimeDelivery?: number;
  };
  primaryNaics: string[];
  securityClearance?: 'None' | 'Confidential' | 'Secret' | 'Top Secret';
  facilities: string[];
  certifications: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  solicitationNumber: string;
  agency: string;
  subAgency?: string;
  postedDate: string;
  responseDeadline: string;
  estimatedValue?: number;
  naicsCode: string;
  setAsideType?: string;
  placeOfPerformance: {
    city: string;
    state: string;
    country: string;
  };
  description: string;
  status: 'Open' | 'Closed' | 'Cancelled' | 'Awarded';
  solicitationType: 'RFP' | 'RFQ' | 'RFI' | 'IFB' | 'Sources Sought';
  contactInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

// Mock data for development
export const mockContracts: Contract[] = [
  {
    id: 'cont-001',
    title: 'F-35 Lightning II Production Lot 15',
    contractNumber: 'FA8601-19-C-0001',
    agency: 'Department of Defense',
    subAgency: 'Air Force',
    awardDate: '2023-09-15',
    startDate: '2023-10-01',
    endDate: '2025-09-30',
    contractor: 'Lockheed Martin Corporation',
    contractorDuns: '123456789',
    totalValue: 34000000000,
    obligatedAmount: 12500000000,
    contractType: 'Firm Fixed Price',
    competitionType: 'Limited Sources',
    setAsideType: 'None',
    naicsCode: '336411',
    naicsDescription: 'Aircraft Manufacturing',
    fscCode: '1510',
    fscDescription: 'Fixed Wing Aircraft',
    placeOfPerformance: {
      city: 'Fort Worth',
      state: 'TX',
      country: 'USA'
    },
    description: 'Production and delivery of F-35A aircraft for the U.S. Air Force and international partners',
    modifications: [
      {
        id: 'mod-001',
        modificationNumber: 'P00001',
        effectiveDate: '2024-01-15',
        description: 'Additional aircraft configuration updates',
        changeInValue: 450000000,
        newTotalValue: 34450000000,
        reason: 'Engineering Change Proposal'
      }
    ],
    status: 'Active',
    weaponSystem: 'F-35 Lightning II'
  },
  {
    id: 'cont-002',
    title: 'Virginia-class Submarine Block V Construction',
    contractNumber: 'N00024-20-C-2300',
    agency: 'Department of Defense',
    subAgency: 'Navy',
    awardDate: '2023-07-22',
    startDate: '2023-08-01',
    endDate: '2028-12-31',
    contractor: 'General Dynamics Electric Boat',
    contractorDuns: '987654321',
    totalValue: 22800000000,
    obligatedAmount: 8900000000,
    contractType: 'Cost Plus',
    competitionType: 'Limited Sources',
    setAsideType: 'None',
    naicsCode: '336611',
    naicsDescription: 'Ship Building and Repairing',
    fscCode: '1925',
    fscDescription: 'Submarines',
    placeOfPerformance: {
      city: 'Groton',
      state: 'CT',
      country: 'USA'
    },
    description: 'Design and construction of Virginia-class attack submarines with Virginia Payload Module',
    modifications: [],
    status: 'Active',
    weaponSystem: 'Virginia-class Submarine'
  },
  {
    id: 'cont-003',
    title: 'Patriot Missile System Upgrades',
    contractNumber: 'W31P4Q-22-C-0045',
    agency: 'Department of Defense',
    subAgency: 'Army',
    awardDate: '2023-03-10',
    startDate: '2023-04-01',
    endDate: '2026-03-31',
    contractor: 'Raytheon Technologies',
    contractorDuns: '456789123',
    totalValue: 3200000000,
    obligatedAmount: 1800000000,
    contractType: 'Firm Fixed Price',
    competitionType: 'Limited Sources',
    setAsideType: 'None',
    naicsCode: '336414',
    naicsDescription: 'Guided Missile and Space Vehicle Manufacturing',
    fscCode: '1410',
    fscDescription: 'Guided Missiles',
    placeOfPerformance: {
      city: 'Andover',
      state: 'MA',
      country: 'USA'
    },
    description: 'Patriot Advanced Capability-3 (PAC-3) missile system modernization and sustainment',
    modifications: [
      {
        id: 'mod-002',
        modificationNumber: 'P00001',
        effectiveDate: '2023-12-01',
        description: 'Additional missile interceptors',
        changeInValue: 280000000,
        newTotalValue: 3480000000,
        reason: 'Increased Requirement'
      }
    ],
    status: 'Active',
    weaponSystem: 'Patriot Missile System'
  }
];

export const mockContractors: Contractor[] = [
  {
    id: 'contractor-001',
    name: 'Lockheed Martin Corporation',
    duns: '123456789',
    cage: '94271',
    address: {
      street: '6801 Rockledge Drive',
      city: 'Bethesda',
      state: 'MD',
      zipCode: '20817',
      country: 'USA'
    },
    businessType: 'Large Business',
    employeeCount: 116000,
    revenue: 65400000000,
    founded: 1995,
    website: 'https://www.lockheedmartin.com',
    capabilities: [
      'Aircraft Manufacturing',
      'Missile Systems',
      'Space Systems',
      'Rotary and Mission Systems',
      'Advanced Technology'
    ],
    pastPerformance: {
      totalContracts: 2847,
      totalValue: 412000000000,
      averageRating: 4.7,
      onTimeDelivery: 94.2
    },
    primaryNaics: ['336411', '336414', '541712'],
    securityClearance: 'Top Secret',
    facilities: [
      'Fort Worth, TX - Aircraft Production',
      'Marietta, GA - Aircraft Assembly',
      'Orlando, FL - Missiles and Fire Control',
      'Littleton, CO - Space Systems'
    ],
    certifications: [
      'ISO 9001:2015',
      'AS9100D',
      'ISO 14001:2015',
      'OHSAS 18001'
    ]
  },
  {
    id: 'contractor-002',
    name: 'General Dynamics Corporation',
    duns: '987654321',
    cage: '0XLU3',
    address: {
      street: '2941 Fairview Park Drive',
      city: 'Falls Church',
      state: 'VA',
      zipCode: '22042',
      country: 'USA'
    },
    businessType: 'Large Business',
    employeeCount: 102900,
    revenue: 39400000000,
    founded: 1952,
    website: 'https://www.gd.com',
    capabilities: [
      'Ship Building',
      'Combat Systems',
      'Information Technology',
      'Mission Systems',
      'Aerospace'
    ],
    pastPerformance: {
      totalContracts: 1652,
      totalValue: 189000000000,
      averageRating: 4.5,
      onTimeDelivery: 91.8
    },
    primaryNaics: ['336611', '336992', '541512'],
    securityClearance: 'Top Secret',
    facilities: [
      'Groton, CT - Electric Boat Shipyard',
      'Bath, ME - Bath Iron Works',
      'Sterling Heights, MI - Land Systems',
      'Scottsdale, AZ - Mission Systems'
    ],
    certifications: [
      'ISO 9001:2015',
      'AS9100D',
      'ISO 14001:2015',
      'ISO 45001:2018'
    ]
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-001',
    title: 'Next Generation Fighter Aircraft Program',
    solicitationNumber: 'FA8650-25-R-0001',
    agency: 'Department of Defense',
    subAgency: 'Air Force',
    postedDate: '2024-11-01',
    responseDeadline: '2025-02-15',
    estimatedValue: 85000000000,
    naicsCode: '336411',
    setAsideType: 'None',
    placeOfPerformance: {
      city: 'Wright-Patterson AFB',
      state: 'OH',
      country: 'USA'
    },
    description: 'Development and production of next-generation air superiority fighter aircraft',
    status: 'Open',
    solicitationType: 'RFP',
    contactInfo: {
      name: 'Col. Sarah Johnson',
      email: 'sarah.johnson@us.af.mil',
      phone: '+1-937-555-0123'
    }
  },
  {
    id: 'opp-002',
    title: 'Advanced Naval Combat System',
    solicitationNumber: 'N00024-25-R-5500',
    agency: 'Department of Defense',
    subAgency: 'Navy',
    postedDate: '2024-10-15',
    responseDeadline: '2025-01-30',
    estimatedValue: 12000000000,
    naicsCode: '334511',
    setAsideType: 'Small Business',
    placeOfPerformance: {
      city: 'Norfolk',
      state: 'VA',
      country: 'USA'
    },
    description: 'Development of advanced naval combat management system with AI capabilities',
    status: 'Open',
    solicitationType: 'RFP',
    contactInfo: {
      name: 'CAPT Michael Davis',
      email: 'michael.davis@navy.mil',
      phone: '+1-757-555-0456'
    }
  }
];