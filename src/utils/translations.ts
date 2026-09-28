export type Language = 'en' | 'ml';

export interface Translations {
  appTitle: string;
  familySubtitle: string;
  treeTab: string;
  directoryTab: string;
  adminTab: string;
  timelineTab: string;
  search: string;
  searchPlaceholder: string;
  calculateRelation: string;
  rootPath: string;
  rootExplanation: string;
  goToRoot: string;
  familyRootsTitle: string;
  ancestryTrail: string;
  memberTree: string;
  descendantBranch: string;
  clanPanorama: string;
  generation: string;
  gen1Label: string;
  gen2Label: string;
  gen3Label: string;
  gen4Label: string;
  parents: string;
  father: string;
  mother: string;
  spouse: string;
  husband: string;
  wife: string;
  children: string;
  son: string;
  daughter: string;
  grandchildren: string;
  grandson: string;
  granddaughter: string;
  greatGrandchild: string;
  siblings: string;
  showSiblings: string;
  living: string;
  deceased: string;
  allMembers: string;
  jumpTo: string;
  viewDetails: string;
  viewTree: string;
  editDetails: string;
  close: string;
  resetZoom: string;
  zoomIn: string;
  zoomOut: string;
  compactView: string;
  detailedView: string;
  eightBranches: string;
  rootFounders: string;
  directLine: string;
  branchBadge: string;
  recordsCount: string;
  relationWith: string;
  selectMember: string;
  clear: string;
  save: string;
  coupleAndChildrenTree: string;
  browseByGeneration: string;
  editRelationsInTree: string;
  generateChildTree: string;
  backToParentTree: string;
  backToPatriarchTree: string;
  generationFilter: string;
  allGenerations: string;
  noChildrenRecorded: string;
  addChild: string;
  addMember: string;
  saveRelations: string;
  relationsUpdatedSuccess: string;
}

export const translations: Record<Language, Translations> = {
  ml: {
    appTitle: 'ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തു കുടുംബ പരമ്പര',
    familySubtitle: 'കുടുംബ വൃക്ഷവും വേരുകളും',
    treeTab: 'കുടുംബ വൃക്ഷം',
    directoryTab: 'അംഗങ്ങൾ',
    adminTab: 'അഡ്മിൻ',
    timelineTab: 'ചരിത്രം',
    search: 'തിരയുക',
    searchPlaceholder: 'പേര്, ശാഖ അല്ലെങ്കിൽ ബന്ധം തിരയുക...',
    calculateRelation: 'ബന്ധം കണ്ടെത്തുക',
    rootPath: 'കുടുംബ വേരുകൾ (പരമ്പര വഴി)',
    rootExplanation: 'ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തുവിൽ നിന്നുള്ള നേരിട്ടുള്ള പരമ്പര വഴി താഴെ കാണാം:',
    goToRoot: 'പ്രധാന വേരിലേക്ക് (ആയിനികുന്നത്ത് മായൻ കുട്ടി) മടങ്ങുക',
    familyRootsTitle: 'കുടുംബ വേരുകൾ & ശാഖകൾ',
    ancestryTrail: 'പരമ്പര വഴി (റൂട്ട്)',
    memberTree: 'വ്യക്തിഗത വൃക്ഷം',
    descendantBranch: 'തുടർ ശാഖകൾ',
    clanPanorama: 'പൂർണ്ണ കുടുംബ രൂപം',
    generation: 'തലമുറ',
    gen1Label: 'തലമുറ 1 (പ്രധാന വേര് - കാരണവർ)',
    gen2Label: 'തലമുറ 2 (8 ശാഖകൾ)',
    gen3Label: 'തലമുറ 3 (മക്കൾ / കൊച്ചുമക്കൾ)',
    gen4Label: 'തലമുറ 4 (പേരക്കുട്ടികൾ - ലായിഖ്)',
    parents: 'മാതാപിതാക്കൾ',
    father: 'പിതാവ് (ഉപ്പ)',
    mother: 'മാതാവ് (ഉമ്മ)',
    spouse: 'ഭാര്യ / ഭർത്താവ്',
    husband: 'ഭർത്താവ്',
    wife: 'ഭാര്യ',
    children: 'മക്കൾ',
    son: 'മകൻ',
    daughter: 'മകൾ',
    grandchildren: 'കൊച്ചുമക്കൾ',
    grandson: 'കൊച്ചുമകൻ',
    granddaughter: 'കൊച്ചുമകൾ',
    greatGrandchild: 'പേരക്കുട്ടി (നാലാം തലമുറ)',
    siblings: 'സഹോദരങ്ങൾ',
    showSiblings: 'സഹോദരങ്ങൾ',
    living: 'ജീവിച്ചിരിക്കുന്നു',
    deceased: 'മൺമറഞ്ഞു',
    allMembers: 'എല്ലാ അംഗങ്ങളും',
    jumpTo: 'തിരഞ്ഞെടുക്കുക:',
    viewDetails: 'പൂർണ്ണ വിവരങ്ങൾ കാണുക',
    viewTree: 'വൃക്ഷം കാണുക',
    editDetails: 'വിവരങ്ങൾ തിരുത്തുക',
    close: 'അടയ്ക്കുക',
    resetZoom: 'യഥാർത്ഥ വലിപ്പം',
    zoomIn: 'വലുതാക്കുക',
    zoomOut: 'ചെറുതാക്കുക',
    compactView: 'ചുരുങ്ങിയ രൂപം',
    detailedView: 'വിശദ രൂപം',
    eightBranches: '8 പ്രധാന ശാഖകൾ',
    rootFounders: 'കുടുംബത്തിന്റെ പ്രധാന വേരുകൾ',
    directLine: 'നേരിട്ടുള്ള പരമ്പര',
    branchBadge: 'ശാഖ',
    recordsCount: 'രേഖകൾ',
    relationWith: 'കുടുംബ ബന്ധം',
    selectMember: 'വ്യക്തിയെ തിരഞ്ഞെടുക്കുക',
    clear: 'മായ്ക്കുക',
    save: 'സൂക്ഷിക്കുക',
    coupleAndChildrenTree: 'മാതാപിതാക്കളും മക്കളും',
    browseByGeneration: 'തലമുറകൾ അനുസരിച്ച് കാണുക',
    editRelationsInTree: 'ബന്ധങ്ങൾ തിരുത്തുക (Admin)',
    generateChildTree: 'കുടുംബ വൃക്ഷം കാണുക',
    backToParentTree: 'ഒരു പടി മുകളിലേക്ക്',
    backToPatriarchTree: 'പ്രധാന വേരിലേക്ക് (ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തു)',
    generationFilter: 'തലമുറ തിരഞ്ഞെടുക്കുക',
    allGenerations: 'എല്ലാ തലമുറകളും',
    noChildrenRecorded: 'മക്കളെ ഇതുവരെ രേഖപ്പെടുത്തിയിട്ടില്ല',
    addChild: 'അംഗത്തെ ചേർക്കുക',
    addMember: 'അംഗത്തെ ചേർക്കുക',
    saveRelations: 'ബന്ധങ്ങൾ സൂക്ഷിക്കുക',
    relationsUpdatedSuccess: 'കുടുംബ ബന്ധങ്ങൾ വിജയകരമായി തിരുത്തി!',
  },
  en: {
    appTitle: 'Aayinikunnathth Maayan Kutty & Paathu Lineage',
    familySubtitle: 'Family Tree & Lineage Roots',
    treeTab: 'Family Tree',
    directoryTab: 'Directory',
    adminTab: 'Admin',
    timelineTab: 'Timeline',
    search: 'Search',
    searchPlaceholder: 'Search name, branch, or relation...',
    calculateRelation: 'Calculate Relation',
    rootPath: 'Family Root Pathway (Lineage Route)',
    rootExplanation: 'Direct ancestry pathway from Aayinikunnathth Maayan Kutty & Paathu to this person:',
    goToRoot: 'Go to Primary Root (Aayinikunnathth Maayan Kutty)',
    familyRootsTitle: 'Family Roots & Branches',
    ancestryTrail: 'Lineage Route',
    memberTree: 'Member Tree',
    descendantBranch: 'Descendant Branch',
    clanPanorama: 'Full Clan Panorama',
    generation: 'Generation',
    gen1Label: 'Generation 1 (Primary Roots)',
    gen2Label: 'Generation 2 (8 Branches)',
    gen3Label: 'Generation 3 (Grandchildren)',
    gen4Label: 'Generation 4 (Great-Grandchildren)',
    parents: 'Parents',
    father: 'Father',
    mother: 'Mother',
    spouse: 'Spouse / Partner',
    husband: 'Husband',
    wife: 'Wife',
    children: 'Children',
    son: 'Son',
    daughter: 'Daughter',
    grandchildren: 'Grandchildren',
    grandson: 'Grandson',
    granddaughter: 'Granddaughter',
    greatGrandchild: 'Great-Grandchild',
    siblings: 'Siblings',
    showSiblings: 'Siblings',
    living: 'Living',
    deceased: 'Deceased',
    allMembers: 'All Members',
    jumpTo: 'Jump to:',
    viewDetails: 'View Full Dossier',
    viewTree: 'View Tree',
    editDetails: 'Edit Details',
    close: 'Close',
    resetZoom: 'Reset Zoom',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    compactView: 'Compact View',
    detailedView: 'Detailed View',
    eightBranches: '8 Main Branches',
    rootFounders: 'Root Ancestors',
    directLine: 'Direct Lineage',
    branchBadge: 'Branch',
    recordsCount: 'Records',
    relationWith: 'Relation',
    selectMember: 'Select Member',
    clear: 'Clear',
    save: 'Save',
    coupleAndChildrenTree: 'Parents & Children Tree',
    browseByGeneration: 'Browse by Generation',
    editRelationsInTree: 'Edit Relations (Admin)',
    generateChildTree: 'Generate Family Tree',
    backToParentTree: 'Back to Parent Tree',
    backToPatriarchTree: 'Reset to Patriarch & Wife',
    generationFilter: 'Filter by Generation',
    allGenerations: 'All Generations',
    noChildrenRecorded: 'No children recorded yet',
    addChild: 'Add Member',
    addMember: 'Add Member',
    saveRelations: 'Save Relations',
    relationsUpdatedSuccess: 'Family relations updated successfully!',
  },
};

/**
 * Member names in Malayalam mapping
 */
export const MEMBER_NAMES_ML: Record<string, { nameMl: string; roleMl: string; branchMl: string; rootSummaryMl: string }> = {
  mayan_kutty: {
    nameMl: 'ആയിനികുന്നത്ത് മായൻ കുട്ടി',
    roleMl: 'കുടുംബ കാരണവർ (പ്രധാന വേര്)',
    branchMl: 'പ്രധാന വേര് (Ancestral Root)',
    rootSummaryMl: 'കുടുംബത്തിന്റെ പ്രധാന കാരണവരും വേരും. ഭാര്യ: പാത്തു.',
  },
  paathu: {
    nameMl: 'പാത്തു',
    roleMl: 'കുടുംബ മാതാവ് & ഭാര്യ',
    branchMl: 'പ്രധാന വേര് (Ancestral Root)',
    rootSummaryMl: 'കുടുംബത്തിന്റെ സ്നേഹനിധിയായ മാതാവ്. ഭർത്താവ്: ആയിനികുന്നത്ത് മായൻ കുട്ടി.',
  },
  kasim: {
    nameMl: 'കാസിം',
    roleMl: 'മൂത്ത മകൻ (ഒന്നാമത്തെ മകൻ)',
    branchMl: 'കാസിം ശാഖ',
    rootSummaryMl: 'ആയിനികുന്നത്ത് മായൻ കുട്ടിയുടെയും പാത്തുവിന്റെയും മൂത്ത മകൻ (തലമുറ 2).',
  },
  kadeeja: {
    nameMl: 'ഖദീജ',
    roleMl: 'മൂത്ത മകൾ',
    branchMl: 'ഖദീജ ശാഖ',
    rootSummaryMl: 'ആയിനികുന്നത്ത് മായൻ കുട്ടിയുടെയും പാത്തുവിന്റെയും മൂത്ത മകൾ (തലമുറ 2).',
  },
  jameela: {
    nameMl: 'ജമീല',
    roleMl: 'രണ്ടാമത്തെ മകൾ (മമ്മുവിന്റെ ഭാര്യ)',
    branchMl: 'ജമീല ശാഖ',
    rootSummaryMl: 'ആയിനികുന്നത്ത് മായൻ കുട്ടിയുടെയും പാത്തുവിന്റെയും മകൾ. ഭർത്താവ്: മമ്മു. 4 മക്കൾ: സുബൈൽ, അൻസാർ, സഫീറ, മുഹമ്മദ്. പേരക്കുട്ടി: ലായിഖ്.',
  },
  mammu: {
    nameMl: 'മമ്മു',
    roleMl: 'ജമീലയുടെ ഭർത്താവ്',
    branchMl: 'ജമീല ശാഖ',
    rootSummaryMl: 'ജമീലയുടെ ഭർത്താവ്. സുബൈൽ, അൻസാർ, സഫീറ, മുഹമ്മദ് എന്നിവരുടെ പിതാവ്. ലായിഖിന്റെ മുത്തശ്ശൻ.',
  },
  subail: {
    nameMl: 'സുബൈൽ',
    roleMl: 'ജമീലയുടെയും മമ്മുവിന്റെയും മൂത്ത മകൻ',
    branchMl: 'ജമീല ശാഖ',
    rootSummaryMl: 'ജമീലയുടെയും മമ്മുവിന്റെയും മൂത്ത മകൻ. ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തുവിന്റെ കൊച്ചുമകൻ (തലമുറ 3).',
  },
  ansar: {
    nameMl: 'അൻസാർ',
    roleMl: 'ജമീലയുടെയും മമ്മുവിന്റെയും രണ്ടാമത്തെ മകൻ',
    branchMl: 'ജമീല ശാഖ',
    rootSummaryMl: 'ജമീലയുടെയും മമ്മുവിന്റെയും രണ്ടാമത്തെ മകൻ. ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തുവിന്റെ കൊച്ചുമകൻ (തലമുറ 3).',
  },
  safeera: {
    nameMl: 'സഫീറ',
    roleMl: 'ജമീലയുടെയും മമ്മുവിന്റെയും മകൾ',
    branchMl: 'ജമീല ശാഖ',
    rootSummaryMl: 'ജമീലയുടെയും മമ്മുവിന്റെയും മകൾ. ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തുവിന്റെ കൊച്ചുമകൾ (തലമുറ 3).',
  },
  muhammad: {
    nameMl: 'മുഹമ്മദ്',
    roleMl: 'ജമീലയുടെയും മമ്മുവിന്റെയും മകൻ (മഫീദയുടെ ഭർത്താവ്)',
    branchMl: 'ജമീല ശാഖ',
    rootSummaryMl: 'ജമീലയുടെയും മമ്മുവിന്റെയും മകൻ. ഭാര്യ: മഫീദ. മകൻ: ലായിഖ് (നാലാം തലമുറ). ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തുവിന്റെ കൊച്ചുമകൻ.',
  },
  mafeeda: {
    nameMl: 'മഫീദ',
    roleMl: 'മുഹമ്മദിന്റെ ഭാര്യ (ലായിഖിന്റെ ഉമ്മ)',
    branchMl: 'ജമീല ശാഖ',
    rootSummaryMl: 'മുഹമ്മദിന്റെ ഭാര്യ. ലായിഖിന്റെ ഉമ്മ. ജമീലയുടെയും മമ്മുവിന്റെയും മരുമകൾ.',
  },
  laaiq: {
    nameMl: 'ലായിഖ്',
    roleMl: 'മുഹമ്മദിന്റെയും മഫീദയുടെയും മകൻ (നാലാം തലമുറ)',
    branchMl: 'ജമീല ശാഖ',
    rootSummaryMl: 'മുഹമ്മദിന്റെയും മഫീദയുടെയും മകൻ. ജമീലയുടെയും മമ്മുവിന്റെയും കൊച്ചുമകൻ. ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തുവിന്റെ നേരിട്ടുള്ള നാലാം തലമുറ പേരക്കുട്ടി.',
  },
  sainaba: {
    nameMl: 'സൈനബ',
    roleMl: 'മൂന്നാമത്തെ മകൾ',
    branchMl: 'സൈനബ ശാഖ',
    rootSummaryMl: 'ആയിനികുന്നത്ത് മായൻ കുട്ടിയുടെയും പാത്തുവിന്റെയും മകൾ (തലമുറ 2).',
  },
  ayoob: {
    nameMl: 'അയ്യൂബ്',
    roleMl: 'രണ്ടാമത്തെ മകൻ',
    branchMl: 'അയ്യൂബ് ശാഖ',
    rootSummaryMl: 'ആയിനികുന്നത്ത് മായൻ കുട്ടിയുടെയും പാത്തുവിന്റെയും മകൻ (തലമുറ 2).',
  },
  maimoona: {
    nameMl: 'മൈമൂന',
    roleMl: 'നാലാമത്തെ മകൾ',
    branchMl: 'മൈമൂന ശാഖ',
    rootSummaryMl: 'ആയിനികുന്നത്ത് മായൻ കുട്ടിയുടെയും പാത്തുവിന്റെയും മകൾ (തലമുറ 2).',
  },
  ramla: {
    nameMl: 'റംല',
    roleMl: 'അഞ്ചാമത്തെ മകൾ',
    branchMl: 'റംല ശാഖ',
    rootSummaryMl: 'ആയിനികുന്നത്ത് മായൻ കുട്ടിയുടെയും പാത്തുവിന്റെയും മകൾ (തലമുറ 2).',
  },
  rafeeq: {
    nameMl: 'റഫീഖ്',
    roleMl: 'ഏറ്റവും ഇളയ മകൻ',
    branchMl: 'റഫീഖ് ശാഖ',
    rootSummaryMl: 'ആയിനികുന്നത്ത് മായൻ കുട്ടിയുടെയും പാത്തുവിന്റെയും ഇളയ മകൻ (തലമുറ 2).',
  },
};

/**
 * Format member name according to selected language
 */
export function formatMemberName(
  member: { id: string; firstName: string; lastName?: string; firstNameMl?: string; lastNameMl?: string },
  lang: Language
): string {
  if (lang === 'ml') {
    // 1. Dynamic member.firstNameMl is highest priority (reflects user edits in UI/server)
    if (member.firstNameMl && member.firstNameMl.trim()) {
      const mlPart = [member.firstNameMl.trim(), member.lastNameMl?.trim()].filter(Boolean).join(' ');
      const enPart = [member.firstName.trim(), member.lastName?.trim()].filter(Boolean).join(' ');
      return enPart ? `${mlPart} (${enPart})` : mlPart;
    }
    // 2. Static initial translation fallback if present
    const mlInfo = MEMBER_NAMES_ML[member.id];
    if (mlInfo?.nameMl) {
      return `${mlInfo.nameMl} (${member.firstName})`;
    }
    // 3. Fallback to English name
    return [member.firstName, member.lastName].filter(Boolean).join(' ');
  }
  return [member.firstName, member.lastName].filter(Boolean).join(' ');
}

export function formatMemberNameShort(
  member: { id: string; firstName: string; firstNameMl?: string },
  lang: Language
): string {
  if (lang === 'ml') {
    // 1. Dynamic member.firstNameMl takes highest priority
    if (member.firstNameMl && member.firstNameMl.trim()) {
      return member.firstNameMl.trim();
    }
    // 2. Static initial translation fallback
    const mlInfo = MEMBER_NAMES_ML[member.id];
    if (mlInfo?.nameMl) {
      return mlInfo.nameMl;
    }
    return member.firstName;
  }
  return member.firstName;
}

export function formatMemberRole(
  member: { id: string; role: string; roleMl?: string },
  lang: Language
): string {
  if (lang === 'ml') {
    // 1. Dynamic roleMl from member takes highest priority
    if (member.roleMl && member.roleMl.trim()) {
      return member.roleMl.trim();
    }
    // 2. Static fallback
    const mlInfo = MEMBER_NAMES_ML[member.id];
    if (mlInfo?.roleMl) {
      return mlInfo.roleMl;
    }
  }
  return member.role;
}

export function formatMemberBranch(
  member: { id: string; branch: string; branchMl?: string },
  lang: Language
): string {
  if (lang === 'ml') {
    // 1. Dynamic branchMl from member takes highest priority
    if (member.branchMl && member.branchMl.trim()) {
      return member.branchMl.trim();
    }
    // 2. Static fallback
    const mlInfo = MEMBER_NAMES_ML[member.id];
    if (mlInfo?.branchMl) {
      return mlInfo.branchMl;
    }
  }
  return member.branch;
}

export function formatMemberRootSummary(memberId: string, lang: Language): string {
  if (lang === 'ml') {
    return MEMBER_NAMES_ML[memberId]?.rootSummaryMl || '';
  }
  return '';
}
