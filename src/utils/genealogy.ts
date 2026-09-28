import { FamilyMember } from '../types';

export interface KinshipResult {
  relationship: string;
  relationshipMl: string;
  narrative: string;
  narrativeMl: string;
  commonAncestor?: FamilyMember;
  generationalDifference: number;
  isDirectDescendant: boolean;
  isDirectAncestor: boolean;
  isSpouse: boolean;
  degreeText: string;
  degreeTextMl: string;
  connectionPath?: FamilyMember[];
}

/**
 * Finds all direct parents of a member.
 */
export function getParents(member: FamilyMember, members: FamilyMember[]): FamilyMember[] {
  if (!member.parentIds || member.parentIds.length === 0) return [];
  return members.filter((m) => member.parentIds.includes(m.id));
}

/**
 * Finds all direct spouses (wives/husbands) of a member, supporting multiple marriages.
 */
export function getSpouses(member: FamilyMember, members: FamilyMember[]): FamilyMember[] {
  const spouseSet = new Set<string>();
  const spouses: FamilyMember[] = [];

  const addSpouse = (sId?: string) => {
    if (!sId || sId === member.id || spouseSet.has(sId)) return;
    const found = members.find((m) => m.id === sId);
    if (found) {
      spouseSet.add(sId);
      spouses.push(found);
    }
  };

  // 1. Check array of spouseIds
  if (Array.isArray(member.spouseIds)) {
    member.spouseIds.forEach(addSpouse);
  }

  // 2. Check legacy single spouseId
  if (member.spouseId) {
    addSpouse(member.spouseId);
  }

  // 3. Check spouseName match if not found by id
  if (member.spouseName) {
    const found = members.find(
      (m) =>
        m.id !== member.id &&
        `${m.firstName} ${m.lastName}`.trim().toLowerCase() === member.spouseName?.trim().toLowerCase()
    );
    if (found) addSpouse(found.id);
  }

  // 4. Check reverse links: other members listing this member in their spouseIds or spouseId
  members.forEach((m) => {
    if (m.id === member.id) return;
    if (m.spouseIds && m.spouseIds.includes(member.id)) {
      addSpouse(m.id);
    } else if (m.spouseId === member.id) {
      addSpouse(m.id);
    }
  });

  return spouses;
}

/**
 * Finds primary direct spouse of a member if recorded.
 */
export function getSpouse(member: FamilyMember, members: FamilyMember[]): FamilyMember | null {
  const allSpouses = getSpouses(member, members);
  return allSpouses.length > 0 ? allSpouses[0] : null;
}

/**
 * Finds direct children of a member (or any of their spouses).
 */
export function getChildren(member: FamilyMember, members: FamilyMember[]): FamilyMember[] {
  return members.filter((m) => {
    if (!m.parentIds || m.parentIds.length === 0) return false;

    // Direct match: child explicitly lists this member as a parent
    if (m.parentIds.includes(member.id)) return true;

    // Spousal match fallback: only if the child does NOT have another conflicting parent of the same gender
    const spouses = getSpouses(member, members);
    const spouseIdList = spouses.map((s) => s.id);
    const listsSpouseAsParent = spouseIdList.some((sId) => m.parentIds.includes(sId));
    if (!listsSpouseAsParent) return false;

    // Find other parents of this child who are not member's spouses
    const otherParentIds = m.parentIds.filter((pId) => !spouseIdList.includes(pId) && pId !== member.id);
    const otherParents = members.filter((p) => otherParentIds.includes(p.id));

    const isMemberFemale =
      member.role.toLowerCase().includes('wife') ||
      member.role.toLowerCase().includes('mother') ||
      member.role.toLowerCase().includes('matriarch') ||
      member.id === 'paathu';

    if (!isMemberFemale) {
      // Member is male (e.g. Mayan Kutty): if child lists another father (e.g. Pocker), member is NOT the father!
      const hasAnotherFather = otherParents.some(
        (p) =>
          !p.role.toLowerCase().includes('wife') &&
          !p.role.toLowerCase().includes('mother') &&
          !p.role.toLowerCase().includes('matriarch')
      );
      if (hasAnotherFather) return false;
    } else {
      // Member is female: if child lists another mother, member is NOT the mother!
      const hasAnotherMother = otherParents.some(
        (p) =>
          p.role.toLowerCase().includes('wife') ||
          p.role.toLowerCase().includes('mother') ||
          p.role.toLowerCase().includes('matriarch')
      );
      if (hasAnotherMother) return false;
    }

    return true;
  });
}

/**
 * Finds children born specifically to a member and a given spouse.
 */
export function getChildrenBySpouse(
  member: FamilyMember,
  spouse: FamilyMember,
  members: FamilyMember[]
): FamilyMember[] {
  return members.filter((m) => {
    if (!m.parentIds || m.parentIds.length === 0) return false;
    return m.parentIds.includes(member.id) && m.parentIds.includes(spouse.id);
  });
}

/**
 * Finds siblings of a member (sharing at least one parent).
 */
export function getSiblings(member: FamilyMember, members: FamilyMember[]): FamilyMember[] {
  if (!member.parentIds || member.parentIds.length === 0) return [];

  return members.filter((m) => {
    if (m.id === member.id) return false;
    if (!m.parentIds || m.parentIds.length === 0) return false;
    return m.parentIds.some((pId) => member.parentIds.includes(pId));
  });
}

/**
 * Traces grandparents of a member.
 */
export function getGrandparents(member: FamilyMember, members: FamilyMember[]): FamilyMember[] {
  const parents = getParents(member, members);
  const grandParentsSet = new Set<string>();
  const grandParents: FamilyMember[] = [];

  for (const parent of parents) {
    const pParents = getParents(parent, members);
    for (const gp of pParents) {
      if (!grandParentsSet.has(gp.id)) {
        grandParentsSet.add(gp.id);
        grandParents.push(gp);
      }
    }
  }
  return grandParents;
}

/**
 * Traces grandchildren of a member.
 */
export function getGrandchildren(member: FamilyMember, members: FamilyMember[]): FamilyMember[] {
  const children = getChildren(member, members);
  const grandChildrenSet = new Set<string>();
  const grandChildren: FamilyMember[] = [];

  for (const child of children) {
    const cChildren = getChildren(child, members);
    for (const gc of cChildren) {
      if (!grandChildrenSet.has(gc.id)) {
        grandChildrenSet.add(gc.id);
        grandChildren.push(gc);
      }
    }
  }
  return grandChildren;
}

/**
 * Builds the unbroken ancestral chain from root founders down to this member.
 */
export function getAncestryPath(memberId: string, members: FamilyMember[]): FamilyMember[] {
  const member = members.find((m) => m.id === memberId);
  if (!member) return [];

  const path: FamilyMember[] = [member];
  let curr = member;

  while (curr.parentIds && curr.parentIds.length > 0) {
    const parent = members.find((m) => curr.parentIds.includes(m.id));
    if (parent) {
      path.unshift(parent);
      curr = parent;
    } else {
      break;
    }
  }

  return path;
}

/**
 * Recursively collects all descendants of a member into generational buckets.
 */
export function getDescendantGenerations(
  memberId: string,
  members: FamilyMember[]
): { generationRank: number; members: FamilyMember[] }[] {
  const member = members.find((m) => m.id === memberId);
  if (!member) return [];

  const result: { generationRank: number; members: FamilyMember[] }[] = [];
  let currentGen: FamilyMember[] = getChildren(member, members);
  let rank = 1;

  while (currentGen.length > 0 && rank <= 5) {
    result.push({ generationRank: rank, members: currentGen });
    const nextGen: FamilyMember[] = [];
    const seen = new Set<string>();

    for (const parent of currentGen) {
      const kids = getChildren(parent, members);
      for (const k of kids) {
        if (!seen.has(k.id)) {
          seen.add(k.id);
          nextGen.push(k);
        }
      }
    }
    currentGen = nextGen;
    rank++;
  }

  return result;
}

/**
 * Computes ancestors with distances (generation steps up).
 */
function getAncestorsWithDistance(
  memberId: string,
  members: FamilyMember[],
  currentDist = 0,
  result = new Map<string, number>()
): Map<string, number> {
  const member = members.find((m) => m.id === memberId);
  if (!member) return result;

  if (currentDist > 0 && !result.has(memberId)) {
    result.set(memberId, currentDist);
  }

  if (member.parentIds && member.parentIds.length > 0) {
    for (const pId of member.parentIds) {
      if (!result.has(pId) || (result.get(pId) || 99) > currentDist + 1) {
        result.set(pId, currentDist + 1);
        getAncestorsWithDistance(pId, members, currentDist + 1, result);
      }
    }
  }

  return result;
}

/**
 * Helper to check if a member is female based on role, branch, or known names.
 */
export function isFemaleMember(m: FamilyMember): boolean {
  const role = (m.role || '').toLowerCase();
  const name = `${m.firstName} ${m.lastName} ${m.firstNameMl || ''}`.toLowerCase();
  if (
    role.includes('mother') ||
    role.includes('wife') ||
    role.includes('daughter') ||
    role.includes('matriarch') ||
    role.includes('മാതാവ്') ||
    role.includes('ഭാര്യ') ||
    role.includes('മകൾ')
  ) {
    return true;
  }
  return ['paathu', 'kadeeja', 'ayisha', 'fathima', 'khadeeja', 'suhara', 'mariyam', 'zainaba', 'aamina', 'asiya', 'ruqiyya'].some(
    (fn) => name.includes(fn)
  );
}

/**
 * Uses Breadth-First Search (BFS) over biological and marital edges to trace
 * the step-by-step connection path between any two individuals.
 */
export function findKinshipPath(
  startMember: FamilyMember,
  targetMember: FamilyMember,
  members: FamilyMember[]
): FamilyMember[] {
  if (startMember.id === targetMember.id) return [startMember];

  const memberMap = new Map<string, FamilyMember>();
  members.forEach((m) => memberMap.set(m.id, m));

  // Build adjacency list (parents, children, spouses)
  const adj = new Map<string, Set<string>>();
  members.forEach((m) => {
    if (!adj.has(m.id)) adj.set(m.id, new Set());
  });

  members.forEach((m) => {
    // Parents
    if (m.parentIds) {
      m.parentIds.forEach((pId) => {
        if (memberMap.has(pId)) {
          adj.get(m.id)?.add(pId);
          adj.get(pId)?.add(m.id);
        }
      });
    }
    // Spouses
    const sps = getSpouses(m, members);
    sps.forEach((sp) => {
      adj.get(m.id)?.add(sp.id);
      adj.get(sp.id)?.add(m.id);
    });
  });

  const queue: string[] = [startMember.id];
  const visited = new Set<string>([startMember.id]);
  const parentMap = new Map<string, string>();

  let found = false;
  while (queue.length > 0) {
    const currId = queue.shift()!;
    if (currId === targetMember.id) {
      found = true;
      break;
    }
    const neighbors = adj.get(currId);
    if (neighbors) {
      for (const nId of neighbors) {
        if (!visited.has(nId)) {
          visited.add(nId);
          parentMap.set(nId, currId);
          queue.push(nId);
        }
      }
    }
  }

  if (!found) return [startMember, targetMember];

  // Reconstruct path
  const path: FamilyMember[] = [];
  let curr: string | undefined = targetMember.id;
  while (curr) {
    const mem = memberMap.get(curr);
    if (mem) path.unshift(mem);
    curr = parentMap.get(curr);
  }

  return path;
}

/**
 * Calculates the exact genealogical kinship between any two family members.
 */
export function calculateKinship(
  personA: FamilyMember,
  personB: FamilyMember,
  members: FamilyMember[]
): KinshipResult {
  const path = findKinshipPath(personA, personB, members);
  const isBFemale = isFemaleMember(personB);
  const nameA = personA.firstName;
  const nameAMl = personA.firstNameMl || personA.firstName;
  const nameB = personB.firstName;
  const nameBMl = personB.firstNameMl || personB.firstName;

  if (personA.id === personB.id) {
    return {
      relationship: 'Same Individual',
      relationshipMl: 'ഒരേ വ്യക്തി (Self)',
      narrative: `${personA.firstName} is the selected reference member.`,
      narrativeMl: `${nameAMl} ആണ് തിരഞ്ഞെടുത്ത റഫറൻസ് വ്യക്തി.`,
      generationalDifference: 0,
      isDirectDescendant: false,
      isDirectAncestor: false,
      isSpouse: false,
      degreeText: 'Self',
      degreeTextMl: 'സ്വന്തം (Self)',
      connectionPath: [personA],
    };
  }

  // Check spouse
  const spouseOfA = getSpouse(personA, members);
  const spousesOfA = getSpouses(personA, members);
  const isSpouseMatch =
    spouseOfA?.id === personB.id ||
    personA.spouseId === personB.id ||
    spousesOfA.some((s) => s.id === personB.id) ||
    (personB.spouseId === personA.id) ||
    getSpouses(personB, members).some((s) => s.id === personA.id);

  if (isSpouseMatch) {
    const rel = isBFemale ? 'Wife (Spouse)' : 'Husband (Spouse)';
    const relMl = isBFemale ? 'ഭാര്യ (Wife)' : 'ഭർത്താവ് (Husband)';
    return {
      relationship: rel,
      relationshipMl: relMl,
      narrative: `${nameB} is the married partner/spouse of ${nameA}.`,
      narrativeMl: `${nameBMl}, ${nameAMl}-ന്റെ വിവാഹിത പങ്കാളിയാണ് (${relMl}).`,
      generationalDifference: 0,
      isDirectDescendant: false,
      isDirectAncestor: false,
      isSpouse: true,
      degreeText: 'Affinity (Marriage)',
      degreeTextMl: 'വിവാഹബന്ധം (Affinity)',
      connectionPath: path,
    };
  }

  // Check Direct Parent
  if (personA.parentIds && personA.parentIds.includes(personB.id)) {
    const rel = isBFemale ? 'Mother' : 'Father';
    const relMl = isBFemale ? 'മാതാവ് (Mother)' : 'പിതാവ് (Father)';
    return {
      relationship: rel,
      relationshipMl: relMl,
      narrative: `${nameB} is the direct biological or legal ${rel.toLowerCase()} of ${nameA}.`,
      narrativeMl: `${nameBMl}, ${nameAMl}-ന്റെ നേരിട്ടുള്ള ${relMl} ആണ്.`,
      generationalDifference: -1,
      isDirectDescendant: false,
      isDirectAncestor: true,
      isSpouse: false,
      degreeText: '1st Degree Ancestor',
      degreeTextMl: 'ഒന്നാം തലമുറ പിതാവ്/മാതാവ്',
      connectionPath: path,
    };
  }

  // Check Direct Child
  if (personB.parentIds && personB.parentIds.includes(personA.id)) {
    const rel = isBFemale ? 'Daughter' : 'Son';
    const relMl = isBFemale ? 'മകൾ (Daughter)' : 'മകൻ (Son)';
    return {
      relationship: rel,
      relationshipMl: relMl,
      narrative: `${nameB} is the direct ${rel.toLowerCase()} of ${nameA}.`,
      narrativeMl: `${nameBMl}, ${nameAMl}-ന്റെ നേരിട്ടുള്ള ${relMl} ആണ്.`,
      generationalDifference: 1,
      isDirectDescendant: true,
      isDirectAncestor: false,
      isSpouse: false,
      degreeText: '1st Degree Descendant',
      degreeTextMl: 'ഒന്നാം തലമുറ മകൻ/മകൾ',
      connectionPath: path,
    };
  }

  // Trace ancestors for both
  const ancestorsA = getAncestorsWithDistance(personA.id, members);
  const ancestorsB = getAncestorsWithDistance(personB.id, members);

  // Check if B is an ancestor of A
  if (ancestorsA.has(personB.id)) {
    const dist = ancestorsA.get(personB.id)!;
    let rel = isBFemale ? 'Grandmother' : 'Grandfather';
    let relMl = isBFemale ? 'മുത്തശ്ശി (Grandmother)' : 'മുത്തശ്ശൻ (Grandfather)';
    if (dist === 3) {
      rel = isBFemale ? 'Great-Grandmother' : 'Great-Grandfather';
      relMl = isBFemale ? 'മുതുമുത്തശ്ശി (Great-Grandmother)' : 'മുതുമുത്തശ്ശൻ (Great-Grandfather)';
    } else if (dist >= 4) {
      rel = isBFemale ? `${dist - 2}x Great-Grandmother` : `${dist - 2}x Great-Grandfather`;
      relMl = isBFemale ? `തലമുറ ${dist} പൂർവിക മുത്തശ്ശി` : `തലമുറ ${dist} പൂർവിക മുത്തശ്ശൻ`;
    }

    return {
      relationship: rel,
      relationshipMl: relMl,
      narrative: `${nameB} is ${nameA}'s direct ${rel.toLowerCase()} (${dist} generations above).`,
      narrativeMl: `${nameBMl}, ${nameAMl}-ന്റെ ${dist} തലമുറ മുകളിലുള്ള നേരിട്ടുള്ള ${relMl} ആണ്.`,
      generationalDifference: -dist,
      isDirectDescendant: false,
      isDirectAncestor: true,
      isSpouse: false,
      degreeText: `${dist} Generations Up`,
      degreeTextMl: `${dist} തലമുറ മുകളിൽ`,
      connectionPath: path,
    };
  }

  // Check if A is an ancestor of B
  if (ancestorsB.has(personA.id)) {
    const dist = ancestorsB.get(personA.id)!;
    let rel = isBFemale ? 'Granddaughter' : 'Grandson';
    let relMl = isBFemale ? 'പേരമകൾ (Granddaughter)' : 'പേരമകൻ (Grandson)';
    if (dist === 3) {
      rel = isBFemale ? 'Great-Granddaughter' : 'Great-Grandson';
      relMl = isBFemale ? 'മഹത്തായ പേരമകൾ (Great-Granddaughter)' : 'മഹത്തായ പേരമകൻ (Great-Grandson)';
    } else if (dist >= 4) {
      rel = isBFemale ? `${dist - 2}x Great-Granddaughter` : `${dist - 2}x Great-Grandson`;
      relMl = isBFemale ? `തലമുറ ${dist} പിൻഗാമി (പെൺകുട്ടി)` : `തലമുറ ${dist} പിൻഗാമി (ആൺകുട്ടി)`;
    }

    return {
      relationship: rel,
      relationshipMl: relMl,
      narrative: `${nameB} is ${nameA}'s direct ${rel.toLowerCase()} (${dist} generations down).`,
      narrativeMl: `${nameBMl}, ${nameAMl}-ന്റെ ${dist} തലമുറ താഴെയുള്ള നേരിട്ടുള്ള ${relMl} ആണ്.`,
      generationalDifference: dist,
      isDirectDescendant: true,
      isDirectAncestor: false,
      isSpouse: false,
      degreeText: `${dist} Generations Down`,
      degreeTextMl: `${dist} തലമുറ താഴെ`,
      connectionPath: path,
    };
  }

  // Find Lowest Common Ancestor
  let bestAncestorId: string | null = null;
  let minTotalDist = Infinity;

  ancestorsA.forEach((distA, aId) => {
    if (ancestorsB.has(aId)) {
      const distB = ancestorsB.get(aId)!;
      const total = distA + distB;
      if (total < minTotalDist) {
        minTotalDist = total;
        bestAncestorId = aId;
      }
    }
  });

  if (bestAncestorId) {
    const commonAncestor = members.find((m) => m.id === bestAncestorId);
    const distA = ancestorsA.get(bestAncestorId)!;
    const distB = ancestorsB.get(bestAncestorId)!;

    let relationName = 'Kinsman / Relative';
    let relationMl = 'കുടുംബാംഗം (Relative)';
    let degreeText = `${minTotalDist} Degrees of Consanguinity`;
    let degreeTextMl = `${minTotalDist}-ാം ഡിഗ്രി രക്തബന്ധം`;

    if (distA === 1 && distB === 1) {
      relationName = isBFemale ? 'Sister' : 'Brother';
      relationMl = isBFemale ? 'സഹോദരി (Sister)' : 'സഹോദരൻ (Brother)';
      degreeText = '1st Degree Collateral (Sibling)';
      degreeTextMl = 'നേരിട്ടുള്ള സഹോദരബന്ധം';
    } else if (distA === 1 && distB === 2) {
      relationName = isBFemale ? 'Niece' : 'Nephew';
      relationMl = isBFemale ? 'സഹോദരന്റെ/സഹോദരിയുടെ മകൾ (Niece)' : 'സഹോദരന്റെ/സഹോദരിയുടെ മകൻ (Nephew)';
      degreeText = '2nd Degree Collateral';
      degreeTextMl = 'രണ്ടാം ഡിഗ്രി രക്തബന്ധം';
    } else if (distA === 2 && distB === 1) {
      relationName = isBFemale ? 'Aunt' : 'Uncle';
      relationMl = isBFemale ? 'അമ്മായി / ഇളയമ്മ / മൂത്തമ്മ (Aunt)' : 'അമ്മാവൻ / ഇളയച്ഛൻ / മൂത്തച്ഛൻ (Uncle)';
      degreeText = '2nd Degree Collateral';
      degreeTextMl = 'രണ്ടാം ഡിഗ്രി രക്തബന്ധം';
    } else if (distA === 2 && distB === 2) {
      relationName = 'First Cousin';
      relationMl = 'ഒന്നാം കസിൻ (First Cousin)';
      degreeText = '2nd Degree Cousin';
      degreeTextMl = 'ഒന്നാം തലമുറ കസിൻ';
    } else if (distA === 1 && distB === 3) {
      relationName = isBFemale ? 'Grand-Niece' : 'Grand-Nephew';
      relationMl = isBFemale ? 'സഹോദരന്റെ പേരക്കുട്ടി (Grand-Niece)' : 'സഹോദരന്റെ പേരക്കുട്ടി (Grand-Nephew)';
      degreeText = '3rd Degree Collateral';
      degreeTextMl = 'മൂന്നാം ഡിഗ്രി രക്തബന്ധം';
    } else if (distA === 3 && distB === 1) {
      relationName = isBFemale ? 'Great-Aunt' : 'Great-Uncle';
      relationMl = isBFemale ? 'വലിയ അമ്മായി (Great-Aunt)' : 'വലിയ അമ്മാവൻ (Great-Uncle)';
      degreeText = '3rd Degree Collateral';
      degreeTextMl = 'മൂന്നാം ഡിഗ്രി രക്തബന്ധം';
    } else if ((distA === 2 && distB === 3) || (distA === 3 && distB === 2)) {
      relationName = 'First Cousin Once Removed';
      relationMl = 'കസിൻ (First Cousin Once Removed)';
      degreeText = '3rd Degree Cousin';
      degreeTextMl = 'മൂന്നാം ഡിഗ്രി കസിൻ';
    } else if (distA === 3 && distB === 3) {
      relationName = 'Second Cousin';
      relationMl = 'രണ്ടാം കസിൻ (Second Cousin)';
      degreeText = '3rd Degree Cousin';
      degreeTextMl = 'രണ്ടാം തലമുറ കസിൻ';
    } else if ((distA === 3 && distB === 4) || (distA === 4 && distB === 3)) {
      relationName = 'Second Cousin Once Removed';
      relationMl = 'രണ്ടാം കസിൻ (Once Removed)';
      degreeText = '4th Degree Cousin';
      degreeTextMl = 'നാലാം ഡിഗ്രി കസിൻ';
    }

    const caName = commonAncestor
      ? `${commonAncestor.firstName} ${commonAncestor.lastName}`
      : 'Clan Founder';
    const caNameMl = commonAncestor
      ? `${commonAncestor.firstNameMl || commonAncestor.firstName} ${commonAncestor.lastNameMl || commonAncestor.lastName || ''}`
      : 'കുടുംബ കാരണവർ';

    return {
      relationship: relationName,
      relationshipMl: relationMl,
      narrative: `${nameA} and ${nameB} share a common lineage through ${caName}.`,
      narrativeMl: `${nameAMl} ഒപ്പം ${nameBMl} എന്നിവർ ${caNameMl} വഴിയുള്ള രക്തബന്ധത്തിൽ ബന്ധപ്പെട്ടിരിക്കുന്നു.`,
      commonAncestor,
      generationalDifference: personB.generation - personA.generation,
      isDirectDescendant: false,
      isDirectAncestor: false,
      isSpouse: false,
      degreeText,
      degreeTextMl,
      connectionPath: path,
    };
  }

  // Check if they are related through marriage / affinity path
  if (path.length > 1) {
    return {
      relationship: 'In-Law / Allied Branch Relative',
      relationshipMl: 'വിവാഹബന്ധു / കുടുംബ ശാഖ ബന്ധു (In-Law / Allied Branch)',
      narrative: `${nameA} and ${nameB} are connected through marriage or allied branches across ${path.length - 1} family connections.`,
      narrativeMl: `${nameAMl} ഒപ്പം ${nameBMl} എന്നിവർ കുടുംബത്തിലെ വിവാഹബന്ധങ്ങൾ വഴി പരസ്പരം ബന്ധപ്പെട്ടിരിക്കുന്നു (${path.length - 1} ഘട്ടങ്ങൾ).`,
      generationalDifference: personB.generation - personA.generation,
      isDirectDescendant: false,
      isDirectAncestor: false,
      isSpouse: false,
      degreeText: 'Affinity / Allied Lineage',
      degreeTextMl: 'വിവാഹബന്ധം / കുടുംബ ശാഖ',
      connectionPath: path,
    };
  }

  // No bloodline connection found
  return {
    relationship: 'Family Member / Allied Kinsman',
    relationshipMl: 'കുടുംബാംഗം (Family Member)',
    narrative: `${nameA} and ${nameB} belong to the family lineage archives.`,
    narrativeMl: `${nameAMl} ഒപ്പം ${nameBMl} കുടുംബ രേഖകളിൽ രേഖപ്പെടുത്തിയിട്ടുള്ള അംഗങ്ങളാണ്.`,
    generationalDifference: personB.generation - personA.generation,
    isDirectDescendant: false,
    isDirectAncestor: false,
    isSpouse: false,
    degreeText: 'Family Archives',
    degreeTextMl: 'കുടുംബ രേഖകൾ',
    connectionPath: path,
  };
}
