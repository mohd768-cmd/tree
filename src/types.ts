export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  firstNameMl?: string;
  lastNameMl?: string;
  maidenName?: string;
  birthYear: number;
  deathYear?: number;
  birthDate?: string;
  deathDate?: string;
  birthplace: string;
  birthplaceMl?: string;
  generation: 1 | 2 | 3 | 4 | 5;
  role: string;
  roleMl?: string;
  bio: string;
  bioMl?: string;
  avatarUrl: string;
  parentIds: string[];
  spouseId?: string;
  spouseName?: string;
  spouseNameMl?: string;
  spouseIds?: string[];
  spouseNames?: string[];
  childrenCount?: number;
  branch: string;
  branchMl?: string;
  isDirectLine: boolean;
  isLiving: boolean;
  cataloguedRecordsCount: number;
  tradeOrProfession?: string;
  tradeOrProfessionMl?: string;
  burialPlace?: string;
  tags?: string[];
  isLocked?: boolean;
}

export interface TimelineMilestone {
  id: string;
  year: number | string;
  title: string;
  location: string;
  generationTag: string;
  category: string; // "births", "photos", "relocation", "all"
  imageUrl?: string;
  imageCaption?: string;
  description: string;
  tradeTag?: string;
  quote?: string;
  quoteAuthor?: string;
  isCandleTribute?: boolean;
  candlesLit?: number;
  passengerManifest?: {
    shipName: string;
    folio: string;
    passengers: { name: string; age: number; occupation: string }[];
  };
}

export interface ArchivalDocument {
  id: string;
  title: string;
  year: number;
  memberId: string;
  memberName: string;
  category: 'Manuscript' | 'Registry' | 'Portrait' | 'Certificate' | 'Ledger';
  previewUrl?: string;
  archiveLocation: string;
  notes: string;
}

export interface ContributionSubmission {
  id: string;
  title: string;
  year: number;
  generation: string;
  narrative: string;
  contributorName: string;
  timestamp: string;
  status: 'Pending Verification' | 'Archived';
}

export type TabType = 'tree' | 'directory' | 'admin' | 'timeline';
