import React, { useState, useEffect, useMemo } from 'react';
import { FamilyMember } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getChildren } from '../utils/genealogy';

interface TreeRelationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  initialMemberId?: string;
  onSaveRelations: (updatedMembers: FamilyMember[], successMessage: string) => void;
  onOpenAddMember?: (relationType?: 'child' | 'spouse' | 'parent' | 'independent', connectedMemberId?: string) => void;
}

export const TreeRelationEditorModal: React.FC<TreeRelationEditorModalProps> = ({
  isOpen,
  onClose,
  members,
  initialMemberId,
  onSaveRelations,
  onOpenAddMember,
}) => {
  const { language, t, getName, getBranch } = useLanguage();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    initialMemberId || (members[0]?.id ?? 'mayan_kutty')
  );

  // Form states for the selected member
  const [fatherId, setFatherId] = useState<string>('');
  const [motherId, setMotherId] = useState<string>('');
  const [spouseId, setSpouseId] = useState<string>('');
  const [spouseIds, setSpouseIds] = useState<string[]>([]);
  const [selectedSpouseToAdd, setSelectedSpouseToAdd] = useState<string>('');
  const [childrenIds, setChildrenIds] = useState<string[]>([]);
  const [generation, setGeneration] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [branch, setBranch] = useState<string>('');

  // Quick Add Child drawer/form state
  const [isAddingNewChild, setIsAddingNewChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildNameMl, setNewChildNameMl] = useState('');
  const [newChildBirthYear, setNewChildBirthYear] = useState(1995);
  const [newChildRole, setNewChildRole] = useState<'Son' | 'Daughter'>('Son');

  // Quick Add Wife drawer/form state
  const [isAddingNewWife, setIsAddingNewWife] = useState(false);
  const [newWifeName, setNewWifeName] = useState('');
  const [newWifeNameMl, setNewWifeNameMl] = useState('');
  const [newWifeBirthYear, setNewWifeBirthYear] = useState(1980);
  const [newWifeRole, setNewWifeRole] = useState('ഭാര്യ (Wife)');

  // Search filter for picking members
  const [searchMember, setSearchMember] = useState('');

  // Synchronize when modal opens or initialMemberId changes
  useEffect(() => {
    if (initialMemberId && members.some((m) => m.id === initialMemberId)) {
      setSelectedMemberId(initialMemberId);
    }
  }, [initialMemberId, members, isOpen]);

  // Load target member details whenever selectedMemberId changes
  const targetMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || members[0];
  }, [selectedMemberId, members]);

  useEffect(() => {
    if (!targetMember) return;

    // Load parents by detecting father and mother roles/gender
    const pIds = targetMember.parentIds || [];
    let resolvedFatherId = '';
    let resolvedMotherId = '';

    for (const pId of pIds) {
      const p = members.find((m) => m.id === pId);
      if (p) {
        const isFemale =
          p.role.toLowerCase().includes('wife') ||
          p.role.toLowerCase().includes('mother') ||
          p.role.toLowerCase().includes('matriarch') ||
          p.id === 'paathu';
        if (isFemale && !resolvedMotherId) {
          resolvedMotherId = p.id;
        } else if (!isFemale && !resolvedFatherId) {
          resolvedFatherId = p.id;
        }
      }
    }
    // Fallback if not classified
    if (!resolvedFatherId && pIds[0] && pIds[0] !== resolvedMotherId) resolvedFatherId = pIds[0];
    if (!resolvedMotherId && pIds[1] && pIds[1] !== resolvedFatherId) resolvedMotherId = pIds[1];

    setFatherId(resolvedFatherId);
    setMotherId(resolvedMotherId);

    // Load spouses (support multiple spouses)
    const existingSpouses = targetMember.spouseIds && targetMember.spouseIds.length > 0
      ? targetMember.spouseIds
      : (targetMember.spouseId ? [targetMember.spouseId] : []);
    setSpouseIds(existingSpouses);
    setSpouseId(existingSpouses[0] || '');

    // Load verified children using the refined genealogy engine
    const currentChildren = getChildren(targetMember, members);
    setChildrenIds(currentChildren.map((c) => c.id));

    // Generation & branch
    setGeneration(targetMember.generation);
    setBranch(targetMember.branch || 'Family Lineage');
    setIsAddingNewWife(false);
    setIsAddingNewChild(false);
  }, [targetMember, members]);

  if (!isOpen || !targetMember) return null;

  // Potential Fathers (excluding self and own children)
  const potentialFathers = members.filter(
    (m) => m.id !== targetMember.id && !childrenIds.includes(m.id)
  );

  // Potential Mothers (excluding self and own children)
  const potentialMothers = members.filter(
    (m) => m.id !== targetMember.id && !childrenIds.includes(m.id)
  );

  // Potential Spouses (excluding self and parents/children and already linked spouses)
  const potentialSpouses = members.filter(
    (m) =>
      m.id !== targetMember.id &&
      m.id !== fatherId &&
      m.id !== motherId &&
      !childrenIds.includes(m.id) &&
      !spouseIds.includes(m.id)
  );

  // Potential Children (excluding self, parents, and spouses)
  const potentialChildren = members.filter(
    (m) =>
      m.id !== targetMember.id &&
      m.id !== fatherId &&
      m.id !== motherId &&
      !spouseIds.includes(m.id)
  );

  // Toggle child selection
  const handleToggleChild = (childId: string) => {
    setChildrenIds((prev) =>
      prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId]
    );
  };

  // Add existing member as spouse
  const handleAddSpouseFromList = () => {
    if (!selectedSpouseToAdd) return;
    if (!spouseIds.includes(selectedSpouseToAdd)) {
      setSpouseIds((prev) => [...prev, selectedSpouseToAdd]);
      if (!spouseId) setSpouseId(selectedSpouseToAdd);
    }
    setSelectedSpouseToAdd('');
  };

  // Remove a spouse
  const handleRemoveSpouse = (sId: string) => {
    setSpouseIds((prev) => {
      const next = prev.filter((id) => id !== sId);
      if (spouseId === sId) {
        setSpouseId(next[0] || '');
      }
      return next;
    });
  };

  // Quick Add Wife handler (supports adding more than one wife!)
  const handleQuickAddWife = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWifeName.trim()) return;

    const wifeId = `wife_${Date.now()}`;
    const wifeNum = spouseIds.length + 1;
    const newWife: FamilyMember = {
      id: wifeId,
      firstName: newWifeName.trim(),
      lastName: '',
      firstNameMl: newWifeNameMl.trim() || undefined,
      birthYear: newWifeBirthYear,
      birthDate: `${newWifeBirthYear}-01-01`,
      birthplace: targetMember.birthplace || 'Family Homestead',
      generation: targetMember.generation,
      role: newWifeRole.trim() || (language === 'ml' ? `ഭാര്യ ${wifeNum}` : `Wife ${wifeNum}`),
      roleMl: language === 'ml' ? `ഭാര്യ ${wifeNum}` : undefined,
      bio: `Wife of ${getName(targetMember)}.`,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      parentIds: [],
      spouseIds: [targetMember.id],
      spouseId: targetMember.id,
      childrenCount: 0,
      branch: branch || targetMember.branch,
      isDirectLine: false,
      isLiving: true,
      cataloguedRecordsCount: 1,
    };

    const updatedMembersList = [...members, newWife];
    setSpouseIds((prev) => [...prev, wifeId]);
    if (!spouseId) setSpouseId(wifeId);
    setIsAddingNewWife(false);
    setNewWifeName('');
    setNewWifeNameMl('');

    onSaveRelations(
      updatedMembersList,
      language === 'ml'
        ? `${newWifeName} എന്ന ഭാര്യയെ വിജയകരമായി ചേർത്തു! ആവശ്യമെങ്കിൽ ഇനിയും ഭാര്യമാരെ ചേർക്കാം.`
        : `Added and linked wife ${newWifeName}!`
    );
  };

  // Quick Add Child handler
  const handleQuickAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;

    const childId = `child_${Date.now()}`;
    const newChild: FamilyMember = {
      id: childId,
      firstName: newChildName.trim(),
      lastName: '',
      firstNameMl: newChildNameMl.trim() || undefined,
      birthYear: newChildBirthYear,
      birthDate: `${newChildBirthYear}-01-01`,
      birthplace: targetMember.birthplace || 'Family Homestead',
      generation: Math.min((targetMember.generation + 1), 5) as 1 | 2 | 3 | 4 | 5,
      role: newChildRole === 'Son' ? (language === 'ml' ? 'മകൻ' : 'Son') : (language === 'ml' ? 'മകൾ' : 'Daughter'),
      bio: `Child of ${getName(targetMember)}.`,
      avatarUrl:
        newChildRole === 'Son'
          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      parentIds: [targetMember.id, spouseId].filter(Boolean) as string[],
      childrenCount: 0,
      branch: branch || targetMember.branch,
      isDirectLine: true,
      isLiving: true,
      cataloguedRecordsCount: 1,
    };

    // Add to members list and select as child
    const updatedMembersList = [...members, newChild];
    setChildrenIds((prev) => [...prev, childId]);
    setIsAddingNewChild(false);
    setNewChildName('');
    setNewChildNameMl('');

    // Pre-save into members array so user sees child immediately
    onSaveRelations(
      updatedMembersList,
      language === 'ml'
        ? `${newChildName} എന്ന കുട്ടിയെ പുതിയതായി ചേർത്തു!`
        : `Added ${newChildName} as a child!`
    );
  };

  // Save all relation edits
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare updated parentIds for target member
    const newParentIds = [fatherId, motherId].filter(Boolean);

    // Primary spouse and spouse names
    const primarySpouse = members.find((s) => s.id === spouseIds[0]);
    const spouseNames = members
      .filter((s) => spouseIds.includes(s.id))
      .map((s) => `${s.firstName} ${s.lastName}`.trim());

    // Deep copy members to safely update
    const updatedMembers: FamilyMember[] = members.map((m) => {
      // 1. Target member update
      if (m.id === targetMember.id) {
        return {
          ...m,
          parentIds: newParentIds,
          spouseIds: spouseIds,
          spouseId: spouseIds[0] || undefined,
          spouseNames: spouseNames.length > 0 ? spouseNames : undefined,
          spouseName: primarySpouse ? `${primarySpouse.firstName} ${primarySpouse.lastName}`.trim() : undefined,
          generation,
          branch,
          childrenCount: childrenIds.length,
        };
      }

      // 2. All linked wives / spouses (reciprocal link)
      if (spouseIds.includes(m.id)) {
        const currentSpouses = m.spouseIds || (m.spouseId ? [m.spouseId] : []);
        const combined = Array.from(new Set([...currentSpouses, targetMember.id]));
        return {
          ...m,
          spouseIds: combined,
          spouseId: combined[0] || targetMember.id,
          branch: branch || m.branch,
        };
      }

      // 3. Previously linked spouses that were unlinked
      const wasLinked =
        (targetMember.spouseIds && targetMember.spouseIds.includes(m.id)) ||
        targetMember.spouseId === m.id;
      if (wasLinked && !spouseIds.includes(m.id)) {
        const remaining = (m.spouseIds || []).filter((id) => id !== targetMember.id);
        return {
          ...m,
          spouseIds: remaining,
          spouseId: remaining[0] || undefined,
        };
      }

      // 4. Children updates
      if (childrenIds.includes(m.id)) {
        const existingPIds = m.parentIds || [];
        const combined = Array.from(
          new Set([...existingPIds, targetMember.id, ...(spouseIds.length > 0 ? [spouseIds[0]] : [])])
        );
        return {
          ...m,
          parentIds: combined,
          generation: Math.min((generation + 1), 5) as 1 | 2 | 3 | 4 | 5,
        };
      }

      // 5. Children unlinked
      const hadTargetAsParent = m.parentIds?.includes(targetMember.id);
      if (hadTargetAsParent && !childrenIds.includes(m.id)) {
        return {
          ...m,
          parentIds: (m.parentIds || []).filter((id) => id !== targetMember.id),
        };
      }

      return m;
    });

    onSaveRelations(
      updatedMembers,
      language === 'ml'
        ? `${getName(targetMember)} ന്റെ കുടുംബ ബന്ധങ്ങൾ തിരുത്തി സൂക്ഷിച്ചു!`
        : `Updated family relations for ${getName(targetMember)}!`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#fbf8f0] rounded-2xl shadow-2xl border border-[#e7e2d8] overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0d2419] text-white px-5 py-4 flex items-center justify-between border-b border-[#233a2e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fdcd7b] text-[#78550d] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">account_tree</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#b2cdbc] tracking-widest block">
                {language === 'ml' ? 'അഡ്മിൻ: കുടുംബ വൃക്ഷ ബന്ധങ്ങൾ ക്രമീകരിക്കുക' : 'Admin: Edit Tree Relations'}
              </span>
              <h2 className="font-display font-bold text-lg text-white">
                {getName(targetMember)}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-[#1d1c16]">
          {/* Member Picker Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#e7e2d8] shadow-xs">
            <label className="block text-xs font-bold text-[#7b5810] uppercase tracking-wider mb-1.5">
              {language === 'ml' ? 'തിരുത്തേണ്ട കുടുംബാംഗത്തെ മാറ്റുക:' : 'Select Member to Edit:'}
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="flex-1 bg-[#f8f3e9] border border-[#d6cfbe] rounded-lg px-3 py-2 text-sm font-semibold text-[#0d2419] focus:outline-hidden focus:ring-2 focus:ring-[#7b5810]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    Gen {m.generation} • {getName(m)} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PARENTS SECTION */}
          <div className="bg-white p-4 rounded-xl border border-[#e7e2d8] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-[#0d2419] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#7b5810]">family_restroom</span>
                <span>{language === 'ml' ? 'മാതാപിതാക്കൾ (Parents)' : 'Direct Parents'}</span>
              </h3>
              <span className="text-[11px] text-[#727974]">
                {language === 'ml' ? 'ഈ വ്യക്തിയുടെ പിതാവും മാതാവും' : 'Ascendants in tree'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Father */}
              <div>
                <label className="block text-xs font-semibold text-[#424844] mb-1">
                  {language === 'ml' ? 'പിതാവ് (Father / ഉപ്പ):' : 'Father:'}
                </label>
                <select
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  className="w-full bg-[#f8f3e9] border border-[#d6cfbe] rounded-lg px-3 py-2 text-xs font-medium text-[#0d2419]"
                >
                  <option value="">{language === 'ml' ? '-- പിതാവിനെ തിരഞ്ഞെടുക്കുക --' : '-- No Father Linked (Root) --'}</option>
                  {potentialFathers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {getName(m)} (Gen {m.generation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mother */}
              <div>
                <label className="block text-xs font-semibold text-[#424844] mb-1">
                  {language === 'ml' ? 'മാതാവ് (Mother / ഉമ്മ):' : 'Mother:'}
                </label>
                <select
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  className="w-full bg-[#f8f3e9] border border-[#d6cfbe] rounded-lg px-3 py-2 text-xs font-medium text-[#0d2419]"
                >
                  <option value="">{language === 'ml' ? '-- മാതാവിനെ തിരഞ്ഞെടുക്കുക --' : '-- No Mother Linked (Root) --'}</option>
                  {potentialMothers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {getName(m)} (Gen {m.generation})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SPOUSE SECTION - SUPPORTS MULTIPLE WIVES & INLINE CREATION */}
          <div className="bg-white p-4 rounded-xl border border-[#e7e2d8] shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#e04f64]">favorite</span>
                <h3 className="font-display font-bold text-sm text-[#0d2419]">
                  {language === 'ml' ? 'ഭാര്യമാർ / പങ്കാളികൾ (Spouses)' : 'Spouses / Wives (ഭാര്യമാർ)'}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#fdcd7b] text-[#78550d]">
                  {spouseIds.length} {language === 'ml' ? 'ഭാര്യമാർ' : 'Linked'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingNewWife(!isAddingNewWife)}
                className="px-2.5 py-1 rounded-lg bg-[#0d2419] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#233a2e] transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isAddingNewWife ? 'remove' : 'add'}
                </span>
                <span>{isAddingNewWife ? (language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel') : (language === 'ml' ? '+ പുതിയ ഭാര്യയെ ചേർക്കുക' : '+ Create New Wife')}</span>
              </button>
            </div>

            <p className="text-[11px] text-[#727974]">
              {language === 'ml'
                ? 'ഒന്നിൽ കൂടുതൽ ഭാര്യമാരെ ചേർക്കാം. ഭാര്യ ലിസ്റ്റിലില്ലെങ്കിൽ "+ പുതിയ ഭാര്യയെ ചേർക്കുക" ക്ലിക്ക് ചെയ്യുക.'
                : 'Supports multiple wives. If wife is not in tree yet, use "+ Create New Wife".'}
            </p>

            {/* List of currently linked wives */}
            {spouseIds.length > 0 ? (
              <div className="space-y-1.5">
                {spouseIds.map((sId, index) => {
                  const sMember = members.find((m) => m.id === sId);
                  return (
                    <div
                      key={sId}
                      className="flex items-center justify-between bg-[#fbf3f5] px-3 py-2 rounded-lg border border-[#f0c5ce]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#e04f64] text-white text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-[#0d2419]">
                          {sMember ? getName(sMember) : sId}
                        </span>
                        {sMember && (
                          <span className="text-[10px] text-[#727974]">
                            (Gen {sMember.generation} • {sMember.role})
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSpouse(sId)}
                        className="text-xs text-[#ba1a1a] hover:bg-[#ffdad6] px-2 py-0.5 rounded font-semibold flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[13px]">delete</span>
                        <span>{language === 'ml' ? 'ഒഴിവാക്കുക' : 'Remove'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-2.5 bg-[#f8f3e9] rounded-lg text-center text-xs text-[#727974] border border-dashed border-[#d6cfbe]">
                {language === 'ml'
                  ? 'നിലവിൽ ഭാര്യമാരില്ല (അവിവാഹിതൻ).'
                  : 'No spouses linked currently (Unmarried or None).'}
              </div>
            )}

            {/* Select existing member to link as spouse */}
            <div className="flex items-center gap-2 pt-1">
              <select
                value={selectedSpouseToAdd}
                onChange={(e) => setSelectedSpouseToAdd(e.target.value)}
                className="flex-1 bg-[#f8f3e9] border border-[#d6cfbe] rounded-lg px-3 py-1.5 text-xs font-medium text-[#0d2419]"
              >
                <option value="">{language === 'ml' ? '-- നിലവിലുള്ള അംഗങ്ങളിൽ നിന്ന് തിരഞ്ഞെടുക്കുക --' : '-- Select from existing members --'}</option>
                {potentialSpouses.map((m) => (
                  <option key={m.id} value={m.id}>
                    {getName(m)} (Gen {m.generation} • {m.role})
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!selectedSpouseToAdd}
                onClick={handleAddSpouseFromList}
                className="px-3 py-1.5 rounded-lg bg-[#fdcd7b] text-[#78550d] disabled:opacity-50 text-xs font-bold hover:bg-[#fcc362] transition-colors"
              >
                {language === 'ml' ? '+ ലിങ്ക് ചെയ്യുക' : '+ Link'}
              </button>
            </div>

            {/* Inline Quick Add Wife Form */}
            {isAddingNewWife && (
              <div className="bg-[#fef7f8] p-3.5 rounded-xl border border-[#f0c5ce] space-y-2.5 animate-fade-in">
                <span className="text-xs font-bold text-[#e04f64] block uppercase tracking-wider">
                  {language === 'ml' ? `പുതിയ ഭാര്യയെ ചേർക്കുക (ഭാര്യ ${spouseIds.length + 1}):` : `Register New Wife (Wife ${spouseIds.length + 1}):`}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name (English) e.g. Paathu, Amina"
                    value={newWifeName}
                    onChange={(e) => setNewWifeName(e.target.value)}
                    className="bg-white border border-[#f0c5ce] rounded-lg px-2.5 py-1.5 text-xs text-[#0d2419]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="മലയാളം പേര് (ഉദാ: പാത്തു, ആമിന)"
                    value={newWifeNameMl}
                    onChange={(e) => setNewWifeNameMl(e.target.value)}
                    className="bg-white border border-[#f0c5ce] rounded-lg px-2.5 py-1.5 text-xs text-[#0d2419]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-[#424844]">
                      {language === 'ml' ? 'സ്ഥാനം:' : 'Role:'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ml' ? `ഭാര്യ ${spouseIds.length + 1}` : `Wife ${spouseIds.length + 1}`}
                      value={newWifeRole}
                      onChange={(e) => setNewWifeRole(e.target.value)}
                      className="bg-white border border-[#f0c5ce] rounded-lg px-2 py-1 text-xs text-[#0d2419] w-28"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-[#424844]">
                      {language === 'ml' ? 'ജനന വർഷം:' : 'Birth Year:'}
                    </label>
                    <input
                      type="number"
                      value={newWifeBirthYear}
                      onChange={(e) => setNewWifeBirthYear(Number(e.target.value))}
                      className="bg-white border border-[#f0c5ce] rounded-lg px-2 py-1 text-xs text-[#0d2419] w-20"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickAddWife}
                    className="ml-auto px-3.5 py-1.5 bg-[#e04f64] text-white text-xs font-bold rounded-lg hover:bg-[#c93f54] transition-colors"
                  >
                    {language === 'ml' ? 'ഭാര്യയെ ചേർക്കുക' : 'Save & Link Wife'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CHILDREN SECTION */}
          <div className="bg-white p-4 rounded-xl border border-[#e7e2d8] shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#0d2419]">child_care</span>
                <h3 className="font-display font-bold text-sm text-[#0d2419]">
                  {language === 'ml' ? 'മക്കൾ (Children in Tree)' : 'Children Linked in Tree'}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#fdcd7b] text-[#78550d]">
                  {childrenIds.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onOpenAddMember) {
                    onOpenAddMember('child', selectedMemberId);
                  } else {
                    setIsAddingNewChild(!isAddingNewChild);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-[#0d2419] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#233a2e] transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">person_add</span>
                <span>{language === 'ml' ? 'അംഗത്തെ ചേർക്കുക' : '+ Add Member'}</span>
              </button>
            </div>

            {/* Inline Quick Add Form */}
            {isAddingNewChild && (
              <div className="bg-[#f2ede3] p-3.5 rounded-xl border border-[#d6cfbe] space-y-2.5">
                <span className="text-xs font-bold text-[#7b5810] block uppercase tracking-wider">
                  {language === 'ml' ? 'പുതിയ മകനെ / മകളെ ചേർക്കുക:' : 'Register New Child into this Branch:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name (English) e.g. Ansar"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    className="bg-white border border-[#d6cfbe] rounded-lg px-2.5 py-1.5 text-xs text-[#0d2419]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="മലയാളം പേര് (ഉദാ: അൻസാർ)"
                    value={newChildNameMl}
                    onChange={(e) => setNewChildNameMl(e.target.value)}
                    className="bg-white border border-[#d6cfbe] rounded-lg px-2.5 py-1.5 text-xs text-[#0d2419]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-[#424844]">
                      {language === 'ml' ? 'ലിംഗം:' : 'Gender:'}
                    </label>
                    <select
                      value={newChildRole}
                      onChange={(e) => setNewChildRole(e.target.value as 'Son' | 'Daughter')}
                      className="bg-white border border-[#d6cfbe] rounded-lg px-2 py-1 text-xs text-[#0d2419]"
                    >
                      <option value="Son">{language === 'ml' ? 'മകൻ (Son)' : 'Son'}</option>
                      <option value="Daughter">{language === 'ml' ? 'മകൾ (Daughter)' : 'Daughter'}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-[#424844]">
                      {language === 'ml' ? 'ജനന വർഷം:' : 'Birth Year:'}
                    </label>
                    <input
                      type="number"
                      value={newChildBirthYear}
                      onChange={(e) => setNewChildBirthYear(parseInt(e.target.value, 10) || 1995)}
                      className="w-20 bg-white border border-[#d6cfbe] rounded-lg px-2 py-1 text-xs text-[#0d2419]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickAddChild}
                    className="ml-auto px-3 py-1.5 rounded-lg bg-[#7b5810] text-white text-xs font-bold hover:bg-[#5f430c]"
                  >
                    {language === 'ml' ? 'ചേർക്കുക' : 'Save & Link'}
                  </button>
                </div>
              </div>
            )}

            {/* Checklist of Existing Members */}
            <div className="border border-[#e7e2d8] rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-[#ede8de]">
              {potentialChildren.map((m) => {
                const isSelected = childrenIds.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#f4efe4]' : 'hover:bg-[#faf7f0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleChild(m.id)}
                        className="w-4 h-4 rounded text-[#0d2419] accent-[#0d2419]"
                      />
                      <img
                        src={m.avatarUrl}
                        alt={m.firstName}
                        className="w-7 h-7 rounded-lg object-cover bg-[#f2ede3]"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-[#0d2419] block truncate">
                          {getName(m)}
                        </span>
                        <span className="text-[10px] text-[#727974] block">
                          Gen {m.generation} • {m.role}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-[#0d2419] text-white'
                          : 'bg-[#ede8de] text-[#5c5446]'
                      }`}
                    >
                      {isSelected
                        ? language === 'ml' ? 'മകൻ/മകൾ' : 'Linked Child'
                        : language === 'ml' ? 'ചേർക്കുക +' : 'Not linked'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* GENERATION & BRANCH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-[#e7e2d8] shadow-xs">
            <div>
              <label className="block text-xs font-bold text-[#424844] mb-1">
                {language === 'ml' ? 'തലമുറ (Generation Tier):' : 'Generation Level:'}
              </label>
              <select
                value={generation}
                onChange={(e) => setGeneration(parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 | 5)}
                className="w-full bg-[#f8f3e9] border border-[#d6cfbe] rounded-lg px-3 py-2 text-xs font-bold text-[#0d2419]"
              >
                <option value={1}>{language === 'ml' ? 'തലമുറ 1 (കാരണവർ / സ്ഥാപകർ)' : 'Generation 1 (Founders / Root)'}</option>
                <option value={2}>{language === 'ml' ? 'തലമുറ 2 (8 മക്കൾ & ശാഖകൾ)' : 'Generation 2 (8 Children Branches)'}</option>
                <option value={3}>{language === 'ml' ? 'തലമുറ 3 (പേരക്കുട്ടികൾ)' : 'Generation 3 (Grandchildren)'}</option>
                <option value={4}>{language === 'ml' ? 'തലമുറ 4 (കൊച്ചുമക്കൾ - ലായിഖ്)' : 'Generation 4 (Great-grandchildren)'}</option>
                <option value={5}>{language === 'ml' ? 'തലമുറ 5' : 'Generation 5'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#424844] mb-1">
                {language === 'ml' ? 'കുടുംബ ശാഖ (Branch):' : 'Branch Name:'}
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Jameela Branch, Kasim Branch..."
                className="w-full bg-[#f8f3e9] border border-[#d6cfbe] rounded-lg px-3 py-2 text-xs text-[#0d2419]"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e7e2d8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#ede8de] hover:bg-[#e2dccf] text-[#424844] text-xs font-bold transition-colors"
            >
              {language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0d2419] hover:bg-[#163827] text-[#fdcd7b] text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>{language === 'ml' ? 'ബന്ധങ്ങൾ സൂക്ഷിക്കുക (Save Relations)' : 'Save Tree Relations'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
