import React, { useState, useEffect, useMemo } from 'react';
import { FamilyMember } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onAddMember: (newMember: FamilyMember, updatedRelatedMembers: FamilyMember[]) => void;
  initialRelationType?: 'child' | 'spouse' | 'parent' | 'independent';
  initialConnectedMemberId?: string;
}

const PRESET_AVATARS = {
  male: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  ],
  female: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  ],
};

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
  initialRelationType = 'child',
  initialConnectedMemberId,
}) => {
  const { language, getName } = useLanguage();

  // Connection Preset Mode
  const [relationMode, setRelationMode] = useState<'child' | 'spouse' | 'parent' | 'independent'>(initialRelationType);

  // Connection selections
  const [fatherId, setFatherId] = useState<string>('');
  const [motherId, setMotherId] = useState<string>('');
  const [selectedSpouseIds, setSelectedSpouseIds] = useState<string[]>([]);
  const [spouseCandidateId, setSpouseCandidateId] = useState<string>('');
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);

  // Personal attributes
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNameMl, setFirstNameMl] = useState('');
  const [lastNameMl, setLastNameMl] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [role, setRole] = useState('Son');
  const [roleMl, setRoleMl] = useState('മകൻ');
  const [birthYear, setBirthYear] = useState<number>(new Date().getFullYear() - 25);
  const [deathYear, setDeathYear] = useState<number | undefined>(undefined);
  const [isLiving, setIsLiving] = useState(true);
  const [birthplace, setBirthplace] = useState('Ancestral Homestead');
  const [generation, setGeneration] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [branch, setBranch] = useState('Ancestral Root');
  const [tradeOrProfession, setTradeOrProfession] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS.male[0]);
  const [bio, setBio] = useState('');

  // Initial setup when modal opens
  useEffect(() => {
    if (isOpen) {
      setRelationMode(initialRelationType);

      // Default values
      setFirstName('');
      setLastName('');
      setFirstNameMl('');
      setLastNameMl('');
      setTradeOrProfession('');
      setDeathYear(undefined);
      setIsLiving(true);
      setBirthplace('Ancestral Homestead');

      const connected = initialConnectedMemberId
        ? members.find((m) => m.id === initialConnectedMemberId)
        : members[0];

      if (connected) {
        if (initialRelationType === 'child') {
          // If connected is male, assume father; if female, assume mother
          if (connected.role.toLowerCase().includes('wife') || connected.role.toLowerCase().includes('mother') || connected.role.toLowerCase().includes('daughter')) {
            setMotherId(connected.id);
            setFatherId(connected.spouseId || connected.spouseIds?.[0] || '');
          } else {
            setFatherId(connected.id);
            setMotherId(connected.spouseId || connected.spouseIds?.[0] || '');
          }
          const nextGen = Math.min(5, (connected.generation || 1) + 1) as 1 | 2 | 3 | 4 | 5;
          setGeneration(nextGen);
          setBranch(connected.branch || 'Ancestral Root');
          setGender('male');
          setRole('Son');
          setRoleMl('മകൻ');
          setAvatarUrl(PRESET_AVATARS.male[0]);
          setSelectedSpouseIds([]);
          setSelectedChildIds([]);
        } else if (initialRelationType === 'spouse') {
          setSelectedSpouseIds([connected.id]);
          setGeneration(connected.generation as 1 | 2 | 3 | 4 | 5);
          setBranch(connected.branch || 'Ancestral Root');
          // If connected is male, this new spouse is female wife
          const isConnectedFemale = connected.role.toLowerCase().includes('wife') || connected.role.toLowerCase().includes('mother');
          if (isConnectedFemale) {
            setGender('male');
            setRole('Husband');
            setRoleMl('ഭർത്താവ്');
            setAvatarUrl(PRESET_AVATARS.male[0]);
          } else {
            setGender('female');
            setRole('Wife');
            setRoleMl('ഭാര്യ');
            setAvatarUrl(PRESET_AVATARS.female[0]);
          }
          setFatherId('');
          setMotherId('');
          setSelectedChildIds([]);
        } else {
          setFatherId('');
          setMotherId('');
          setSelectedSpouseIds([]);
          setSelectedChildIds([]);
          setGeneration(2);
          setGender('male');
          setRole('Member');
          setRoleMl('അംഗം');
        }
      } else {
        setFatherId('');
        setMotherId('');
        setSelectedSpouseIds([]);
        setSelectedChildIds([]);
        setGeneration(2);
        setGender('male');
        setRole('Member');
        setRoleMl('അംഗം');
      }
    }
  }, [isOpen, initialRelationType, initialConnectedMemberId, members]);

  // Handle changing relation presets
  const handleSelectRelationMode = (mode: 'child' | 'spouse' | 'parent' | 'independent') => {
    setRelationMode(mode);
    if (mode === 'child') {
      const connected = initialConnectedMemberId
        ? members.find((m) => m.id === initialConnectedMemberId)
        : (fatherId ? members.find((m) => m.id === fatherId) : members[0]);

      if (connected) {
        const isConnFemale =
          connected.role.toLowerCase().includes('wife') ||
          connected.role.toLowerCase().includes('mother') ||
          connected.role.toLowerCase().includes('matriarch') ||
          connected.id === 'paathu';

        const connSpouses = connected.spouseIds && connected.spouseIds.length > 0
          ? connected.spouseIds
          : (connected.spouseId ? [connected.spouseId] : []);

        if (isConnFemale) {
          setMotherId(connected.id);
          setFatherId(connSpouses[0] || '');
        } else {
          setFatherId(connected.id);
          setMotherId(connSpouses[0] || '');
        }
        const nextGen = Math.min(5, (connected.generation || 1) + 1) as 1 | 2 | 3 | 4 | 5;
        setGeneration(nextGen);
        setBranch(connected.branch || 'Ancestral Root');
      }
      setSelectedSpouseIds([]);
      setSelectedChildIds([]);
      setRole(gender === 'female' ? 'Daughter' : 'Son');
      setRoleMl(gender === 'female' ? 'മകൾ' : 'മകൻ');
    } else if (mode === 'spouse') {
      const target = initialConnectedMemberId
        ? members.find((m) => m.id === initialConnectedMemberId)
        : members[0];
      if (target) {
        setSelectedSpouseIds([target.id]);
        setGeneration(target.generation as 1 | 2 | 3 | 4 | 5);
        setBranch(target.branch || 'Ancestral Root');
      }
      setFatherId('');
      setMotherId('');
      setGender('female');
      setRole('Wife');
      setRoleMl('ഭാര്യ');
      setAvatarUrl(PRESET_AVATARS.female[0]);
    } else if (mode === 'parent') {
      const target = initialConnectedMemberId
        ? members.find((m) => m.id === initialConnectedMemberId)
        : members[0];
      if (target) {
        setSelectedChildIds([target.id]);
        setGeneration(Math.max(1, (target.generation || 2) - 1) as 1 | 2 | 3 | 4 | 5);
      }
      setFatherId('');
      setMotherId('');
      setSelectedSpouseIds([]);
      setRole(gender === 'female' ? 'Mother' : 'Father');
      setRoleMl(gender === 'female' ? 'മാതാവ്' : 'പിതാവ്');
    } else {
      setFatherId('');
      setMotherId('');
      setSelectedSpouseIds([]);
      setSelectedChildIds([]);
      setGeneration(1);
      setRole('Patriarch / Ancestor');
      setRoleMl('കാരണവർ');
    }
  };

  // Gender toggle
  const handleGenderChange = (newGender: 'male' | 'female') => {
    setGender(newGender);
    setAvatarUrl(PRESET_AVATARS[newGender][0]);
    if (relationMode === 'child') {
      setRole(newGender === 'female' ? 'Daughter' : 'Son');
      setRoleMl(newGender === 'female' ? 'മകൾ' : 'മകൻ');
    } else if (relationMode === 'spouse') {
      setRole(newGender === 'female' ? 'Wife' : 'Husband');
      setRoleMl(newGender === 'female' ? 'ഭാര്യ' : 'ഭർത്താവ്');
    }
  };

  // Update generation when father or mother changes
  const handleFatherChange = (fId: string) => {
    setFatherId(fId);
    if (!fId) return;

    const parent = members.find((m) => m.id === fId);
    if (parent) {
      const nextGen = Math.min(5, (parent.generation || 1) + 1) as 1 | 2 | 3 | 4 | 5;
      setGeneration(nextGen);
      if (parent.branch) setBranch(parent.branch);

      // Check spouses of the selected father
      const fatherSpouses = parent.spouseIds && parent.spouseIds.length > 0
        ? parent.spouseIds
        : (parent.spouseId ? [parent.spouseId] : []);

      // If current motherId is NOT a spouse of this selected father, update or clear!
      // This ensures selecting Pocker never leaves Mayan Kutty's wife Paathu as mother
      if (!motherId || !fatherSpouses.includes(motherId)) {
        setMotherId(fatherSpouses[0] || '');
      }
    }
  };

  const handleMotherChange = (mId: string) => {
    setMotherId(mId);
    if (!mId) return;

    const parent = members.find((m) => m.id === mId);
    if (parent) {
      const nextGen = Math.min(5, (parent.generation || 1) + 1) as 1 | 2 | 3 | 4 | 5;
      setGeneration(nextGen);
      if (parent.branch && !fatherId) setBranch(parent.branch);

      // Check spouses of the selected mother
      const motherSpouses = parent.spouseIds && parent.spouseIds.length > 0
        ? parent.spouseIds
        : (parent.spouseId ? [parent.spouseId] : []);

      if (!fatherId || !motherSpouses.includes(fatherId)) {
        setFatherId(motherSpouses[0] || '');
      }
    }
  };

  // Spouse linking
  const handleAddSpouse = (spId: string) => {
    if (!spId || selectedSpouseIds.includes(spId)) return;
    const sp = members.find((m) => m.id === spId);
    setSelectedSpouseIds((prev) => [...prev, spId]);
    if (sp) {
      setGeneration(sp.generation as 1 | 2 | 3 | 4 | 5);
      if (sp.branch) setBranch(sp.branch);
    }
    setSpouseCandidateId('');
  };

  const handleRemoveSpouse = (spId: string) => {
    setSelectedSpouseIds((prev) => prev.filter((id) => id !== spId));
  };

  // Child selection toggling
  const handleToggleChild = (cId: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(cId) ? prev.filter((id) => id !== cId) : [...prev, cId]
    );
  };

  // Auto-generate bio if empty
  const computedBio = useMemo(() => {
    if (bio.trim()) return bio;
    const parts: string[] = [];
    const father = members.find((m) => m.id === fatherId);
    const mother = members.find((m) => m.id === motherId);
    const spouses = members.filter((m) => selectedSpouseIds.includes(m.id));

    if (father && mother) {
      parts.push(`${gender === 'female' ? 'Daughter' : 'Son'} of ${getName(father)} and ${getName(mother)}.`);
    } else if (father) {
      parts.push(`${gender === 'female' ? 'Daughter' : 'Son'} of ${getName(father)}.`);
    } else if (mother) {
      parts.push(`${gender === 'female' ? 'Daughter' : 'Son'} of ${getName(mother)}.`);
    }

    if (spouses.length > 0) {
      const spNames = spouses.map((s) => getName(s)).join(', ');
      parts.push(`Married to ${spNames}.`);
    }

    if (selectedChildIds.length > 0) {
      parts.push(`Parent of ${selectedChildIds.length} children in this branch.`);
    }

    return parts.length > 0
      ? parts.join(' ')
      : `Authenticated member of the family lineage, belonging to ${branch}.`;
  }, [bio, fatherId, motherId, selectedSpouseIds, selectedChildIds, gender, members, getName, branch]);

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    const newId = `member_${Date.now()}`;
    const parentIds: string[] = [];
    if (fatherId) parentIds.push(fatherId);
    if (motherId && !parentIds.includes(motherId)) parentIds.push(motherId);

    const spouses = members.filter((m) => selectedSpouseIds.includes(m.id));
    const primarySpouse = spouses[0];

    const newMember: FamilyMember = {
      id: newId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      firstNameMl: firstNameMl.trim() || undefined,
      lastNameMl: lastNameMl.trim() || undefined,
      birthYear: Number(birthYear) || 1990,
      deathYear: isLiving ? undefined : (Number(deathYear) || undefined),
      birthplace: birthplace.trim() || 'Ancestral Homestead',
      generation,
      role: role.trim() || (gender === 'female' ? 'Daughter' : 'Son'),
      roleMl: roleMl.trim() || (gender === 'female' ? 'മകൾ' : 'മകൻ'),
      bio: bio.trim() || computedBio,
      avatarUrl: avatarUrl || PRESET_AVATARS[gender][0],
      parentIds,
      spouseId: primarySpouse ? primarySpouse.id : undefined,
      spouseName: primarySpouse ? `${primarySpouse.firstName} ${primarySpouse.lastName}`.trim() : undefined,
      spouseIds: selectedSpouseIds,
      spouseNames: spouses.map((s) => `${s.firstName} ${s.lastName}`.trim()),
      childrenCount: selectedChildIds.length,
      branch: branch || 'Ancestral Root',
      isDirectLine: parentIds.length > 0 || relationMode === 'child',
      isLiving,
      cataloguedRecordsCount: 2,
      tradeOrProfession: tradeOrProfession.trim() || undefined,
    };

    // Reciprocal updates for all connected members in the directory
    const updatedDirectory = members.map((member) => {
      let updated = { ...member };

      // 1. If this member is the Father
      if (member.id === fatherId) {
        updated.childrenCount = (updated.childrenCount || 0) + 1;
      }

      // 2. If this member is the Mother
      if (member.id === motherId) {
        updated.childrenCount = (updated.childrenCount || 0) + 1;
      }

      // 3. If this member is a Spouse/Wife
      if (selectedSpouseIds.includes(member.id)) {
        const existingSpouses = updated.spouseIds || (updated.spouseId ? [updated.spouseId] : []);
        const nextSpouses = Array.from(new Set([...existingSpouses, newId]));
        updated.spouseIds = nextSpouses;
        if (!updated.spouseId) {
          updated.spouseId = newId;
          updated.spouseName = `${newMember.firstName} ${newMember.lastName}`.trim();
        }
      }

      // 4. If this member is one of the Children
      if (selectedChildIds.includes(member.id)) {
        const existingParents = updated.parentIds || [];
        if (!existingParents.includes(newId)) {
          updated.parentIds = [...existingParents, newId];
        }
      }

      return updated;
    });

    onAddMember(newMember, updatedDirectory);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="bg-[#fef9ef] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#d6cfbe] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0d2419] px-4 sm:px-6 py-4 flex items-center justify-between text-[#fef9ef] border-b border-[#233a2e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fdcd7b]/20 border border-[#fdcd7b]/40 flex items-center justify-center text-[#fdcd7b]">
              <span className="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white leading-tight">
                {language === 'ml' ? 'പുതിയ കുടുംബാംഗത്തെ ചേർക്കുക' : 'Add New Family Member'}
              </h2>
              <p className="text-xs text-[#b0bbb4] mt-0.5">
                {language === 'ml'
                  ? 'വ്യക്തിഗത വിവരങ്ങളും കുടുംബ ബന്ധങ്ങളും (Connections) തിരഞ്ഞെടുക്കുക'
                  : 'Register person and select all lineage connections'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#fef9ef] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ========================================================================= */}
          {/* SECTION 1: SELECT CONNECTIONS (MANDATORY & HIGHLIGHTED)                   */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#7b5810]/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#e7e2d8] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7b5810] text-[22px]">hub</span>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#0d2419] uppercase tracking-wide">
                    {language === 'ml' ? '1. കുടുംബ ബന്ധങ്ങൾ തിരഞ്ഞെടുക്കുക (Select Connections)' : '1. Select Kinship Connections'}
                  </h3>
                  <p className="text-[11px] text-[#727974]">
                    {language === 'ml'
                      ? 'ഈ വ്യക്തി വൃക്ഷത്തിൽ ആരോടൊക്കെ ബന്ധപ്പെട്ടിരിക്കുന്നു എന്ന് തിരഞ്ഞെടുക്കുക:'
                      : 'Define how this person links to existing members in the lineage:'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#ffdeaa] text-[#78550d]">
                {language === 'ml' ? 'പ്രധാനം' : 'Required Connections'}
              </span>
            </div>

            {/* Quick Relationship Mode Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  id: 'child',
                  icon: 'child_care',
                  labelEn: 'Child of...',
                  labelMl: 'മകൻ / മകൾ',
                  descEn: 'Son or Daughter',
                  descMl: 'മാതാപിതാക്കളുടെ കുട്ടി',
                },
                {
                  id: 'spouse',
                  icon: 'favorite',
                  labelEn: 'Spouse / Wife of...',
                  labelMl: 'ഭാര്യ / പങ്കാളി',
                  descEn: 'Wife or Husband',
                  descMl: 'വിവാഹ പങ്കാളി',
                },
                {
                  id: 'parent',
                  icon: 'elderly',
                  labelEn: 'Parent of...',
                  labelMl: 'മാതാപിതാക്കൾ',
                  descEn: 'Father or Mother',
                  descMl: 'നിലവിലെ അംഗത്തിന്റെ ഉപ്പ/ഉമ്മ',
                },
                {
                  id: 'independent',
                  icon: 'park',
                  labelEn: 'New Branch / Root',
                  labelMl: 'സ്വതന്ത്ര ശാഖ',
                  descEn: 'Root Elder',
                  descMl: 'പുതിയ പരമ്പര ശാഖ',
                },
              ].map((mode) => {
                const isActive = relationMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleSelectRelationMode(mode.id as any)}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-[#0d2419] text-[#fdcd7b] border-[#0d2419] shadow-sm scale-[1.02]'
                        : 'bg-[#f8f5ee] hover:bg-[#ede7da] text-[#0d2419] border-[#d6cfbe]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px] mb-1">{mode.icon}</span>
                    <span className="text-xs font-bold leading-tight">
                      {language === 'ml' ? mode.labelMl : mode.labelEn}
                    </span>
                    <span className={`text-[10px] mt-0.5 opacity-80 ${isActive ? 'text-[#fef9ef]' : 'text-[#727974]'}`}>
                      {language === 'ml' ? mode.descMl : mode.descEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Connection Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Father Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0d2419] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#7b5810]">man</span>
                  <span>{language === 'ml' ? 'പിതാവ് (Father / ഉപ്പ):' : 'Father (പിതാവ്):'}</span>
                </label>
                <select
                  value={fatherId}
                  onChange={(e) => handleFatherChange(e.target.value)}
                  className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419] font-medium focus:ring-2 focus:ring-[#7b5810] focus:outline-none"
                >
                  <option value="">{language === 'ml' ? '-- പിതാവിനെ തിരഞ്ഞെടുക്കുക (None) --' : '-- Select Father (None) --'}</option>
                  {members.map((m) => (
                    <option key={`f_${m.id}`} value={m.id}>
                      {getName(m)} (Gen {m.generation} • {m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mother Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0d2419] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#e04f64]">woman</span>
                  <span>{language === 'ml' ? 'മാതാവ് (Mother / ഉമ്മ):' : 'Mother (മാതാവ്):'}</span>
                </label>
                <select
                  value={motherId}
                  onChange={(e) => handleMotherChange(e.target.value)}
                  className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419] font-medium focus:ring-2 focus:ring-[#7b5810] focus:outline-none"
                >
                  <option value="">{language === 'ml' ? '-- മാതാവിനെ തിരഞ്ഞെടുക്കുക (None / Unspecified) --' : '-- Select Mother (None / Unspecified) --'}</option>
                  {members.map((m) => (
                    <option key={`m_${m.id}`} value={m.id}>
                      {getName(m)} (Gen {m.generation} • {m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Lineage Target Banner */}
              <div className="sm:col-span-2 p-3 rounded-xl bg-[#f4efe4] border border-[#e0d9c8] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#7b5810]">family_restroom</span>
                  <div className="text-xs">
                    <span className="text-[#727974]">{language === 'ml' ? 'കുട്ടി ആരുടെ മകൻ/മകൾ:' : 'Child of:'} </span>
                    <span className="font-bold text-[#0d2419]">
                      {fatherId ? getName(members.find((m) => m.id === fatherId)!) : (language === 'ml' ? 'പിതാവ് തിരഞ്ഞെടുത്തിട്ടില്ല' : 'No Father Selected')}
                    </span>
                    {motherId ? (
                      <>
                        <span className="text-[#727974]"> & </span>
                        <span className="font-bold text-[#0d2419]">
                          {getName(members.find((m) => m.id === motherId)!)}
                        </span>
                      </>
                    ) : (
                      <span className="text-[#727974] text-[11px] ml-1">
                        ({language === 'ml' ? 'മാതാവ് ചേർത്തിട്ടില്ല' : 'Mother unspecified'})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0d2419] text-[#fdcd7b]">
                    Gen {generation}
                  </span>
                  <span className="text-[10px] font-medium text-[#727974]">
                    {branch}
                  </span>
                </div>
              </div>

              {/* Spouse / Wives Connector */}
              <div className="sm:col-span-2 flex flex-col gap-2 p-3 bg-[#fdf5f6]/80 rounded-xl border border-[#f5ccd2]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#b82d45] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">favorite</span>
                    <span>{language === 'ml' ? 'ഭാര്യമാർ / പങ്കാളികൾ (Spouse / Wives):' : 'Spouse(s) / Wives (ഭാര്യമാർ):'}</span>
                  </label>
                  <span className="text-[10px] text-[#727974]">
                    {language === 'ml' ? 'ഒന്നിൽ കൂടുതൽ ഭാര്യമാരെയും ബന്ധിപ്പിക്കാം' : 'Supports multiple wives in lineage'}
                  </span>
                </div>

                {/* Add Spouse control */}
                <div className="flex gap-2">
                  <select
                    value={spouseCandidateId}
                    onChange={(e) => setSpouseCandidateId(e.target.value)}
                    className="flex-1 bg-white border border-[#e7c2c8] rounded-lg px-2.5 py-1.5 text-xs text-[#0d2419] focus:outline-none"
                  >
                    <option value="">{language === 'ml' ? '-- ലിങ്ക് ചെയ്യാൻ പങ്കാളിയെ തിരഞ്ഞെടുക്കുക --' : '-- Select member to link as spouse --'}</option>
                    {members
                      .filter((m) => !selectedSpouseIds.includes(m.id) && m.id !== fatherId && m.id !== motherId)
                      .map((m) => (
                        <option key={`sp_cand_${m.id}`} value={m.id}>
                          {getName(m)} (Gen {m.generation} • {m.role})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddSpouse(spouseCandidateId)}
                    disabled={!spouseCandidateId}
                    className="px-3 py-1.5 bg-[#e04f64] disabled:opacity-50 text-white rounded-lg text-xs font-bold hover:bg-[#c93f54] transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>{language === 'ml' ? 'ബന്ധിപ്പിക്കുക' : 'Link Spouse'}</span>
                  </button>
                </div>

                {/* Currently linked spouses tags */}
                {selectedSpouseIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedSpouseIds.map((spId, idx) => {
                      const sp = members.find((m) => m.id === spId);
                      return (
                        <span
                          key={`sp_tag_${spId}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#e04f64]/40 text-xs font-bold text-[#0d2419] shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#e04f64]">favorite</span>
                          <span>{sp ? getName(sp) : spId}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#fdf2f4] text-[#b82d45]">
                            {language === 'ml' ? `ഭാര്യ/പങ്കാളി ${idx + 1}` : `Wife/Spouse ${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpouse(spId)}
                            className="text-[#9e273b] hover:text-red-700 ml-1"
                            title="Remove"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[11px] text-[#727974] italic">
                    {language === 'ml' ? 'പങ്കാളിയെ ഇതുവരെ തിരഞ്ഞെടുത്തിട്ടില്ല' : 'No spouse linked yet.'}
                  </span>
                )}
              </div>

              {/* Children Selection (if adding a parent with existing children) */}
              <div className="sm:col-span-2 flex flex-col gap-1.5 p-3 bg-[#f8f5ee] rounded-xl border border-[#d6cfbe]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0d2419] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#7b5810]">family_restroom</span>
                    <span>{language === 'ml' ? 'ഈ വ്യക്തിയുടെ മക്കൾ (Children in Tree):' : 'Existing Children of this Person:'}</span>
                  </label>
                  <span className="text-[10px] text-[#727974]">
                    {language === 'ml' ? 'വൃക്ഷത്തിൽ ഇതിനകം ഉള്ള മക്കളെ തിരഞ്ഞെടുക്കുക' : 'Check if their children are already in the directory'}
                  </span>
                </div>

                {members.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-white rounded-lg border border-[#e7e2d8]">
                    {members
                      .filter((m) => m.id !== fatherId && m.id !== motherId && !selectedSpouseIds.includes(m.id))
                      .map((m) => {
                        const isChecked = selectedChildIds.includes(m.id);
                        return (
                          <label
                            key={`child_chk_${m.id}`}
                            className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer text-xs transition-colors ${
                              isChecked ? 'bg-[#ffdeaa]/50 font-bold text-[#78550d]' : 'hover:bg-[#f4efe4] text-[#424844]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleChild(m.id)}
                              className="rounded border-[#d6cfbe] text-[#7b5810] focus:ring-[#7b5810]"
                            />
                            <span className="truncate">{getName(m)}</span>
                          </label>
                        );
                      })}
                  </div>
                ) : (
                  <span className="text-[11px] text-[#727974] italic">
                    {language === 'ml' ? 'ലിസ്റ്റ് ചെയ്യാൻ മറ്റ് അംഗങ്ങളില്ല' : 'No other members to select as children.'}
                  </span>
                )}
              </div>

              {/* Generation and Branch */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0d2419]">
                  {language === 'ml' ? 'തലമുറ (Generation):' : 'Generation (തലമുറ):'}
                </label>
                <select
                  value={generation}
                  onChange={(e) => setGeneration(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="bg-white border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419] font-medium"
                >
                  <option value={1}>{language === 'ml' ? 'തലമുറ 1 (കാരണവർ / മാതാവ്)' : 'Gen 1: Patriarch / Matriarch'}</option>
                  <option value={2}>{language === 'ml' ? 'തലമുറ 2 (മക്കൾ & പങ്കാളികൾ)' : 'Gen 2: Children & Spouses'}</option>
                  <option value={3}>{language === 'ml' ? 'തലമുറ 3 (പേരക്കുട്ടികൾ)' : 'Gen 3: Grandchildren'}</option>
                  <option value={4}>{language === 'ml' ? 'തലമുറ 4 (കൊച്ചുമക്കൾ)' : 'Gen 4: Great-Grandchildren'}</option>
                  <option value={5}>{language === 'ml' ? 'തലമുറ 5 (അഞ്ചാം തലമുറ)' : 'Gen 5: Generation V'}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0d2419]">
                  {language === 'ml' ? 'കുടുംബ ശാഖ (Family Branch):' : 'Family Branch (കുടുംബ ശാഖ):'}
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Ancestral Root or Kasim Branch"
                  className="bg-white border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419] font-medium"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: PERSONAL DETAILS & IDENTITY                                   */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e7e2d8] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e7e2d8] pb-3">
              <span className="material-symbols-outlined text-[#0d2419] text-[20px]">badge</span>
              <h3 className="font-display font-bold text-sm text-[#0d2419] uppercase tracking-wide">
                {language === 'ml' ? '2. വ്യക്തി വിവരങ്ങൾ (Personal Details)' : '2. Personal Details'}
              </h3>
            </div>

            {/* Gender Selection */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#0d2419]">{language === 'ml' ? 'ലിംഗം (Gender):' : 'Gender:'}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleGenderChange('male')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    gender === 'male'
                      ? 'bg-[#0d2419] text-[#fdcd7b] shadow-2xs'
                      : 'bg-[#f4efe4] text-[#424844] hover:bg-[#ede7da]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">male</span>
                  <span>{language === 'ml' ? 'പുരുഷൻ (Male)' : 'Male'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange('female')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    gender === 'female'
                      ? 'bg-[#e04f64] text-white shadow-2xs'
                      : 'bg-[#f4efe4] text-[#424844] hover:bg-[#ede7da]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">female</span>
                  <span>{language === 'ml' ? 'സ്ത്രീ (Female)' : 'Female'}</span>
                </button>
              </div>
            </div>

            {/* Names (English & Malayalam) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0d2419]">
                  {language === 'ml' ? 'പേര് (First Name in English) *' : 'First Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasim"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0d2419]">
                  {language === 'ml' ? 'മലയാളത്തിൽ പേര് (Malayalam Name)' : 'Name in Malayalam (മലയാളത്തിൽ)'}
                </label>
                <input
                  type="text"
                  placeholder="ഉദാ: കാസിം"
                  value={firstNameMl}
                  onChange={(e) => setFirstNameMl(e.target.value)}
                  className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#424844]">
                  {language === 'ml' ? 'കുടുംബപ്പേര് / ലാസ്റ്റ് നെയിം' : 'Last Name / Title'}
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#424844]">
                  {language === 'ml' ? 'സ്ഥാനം / റോൾ (Role / Title)' : 'Role / Title'}
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Son, Daughter, Wife, Elder"
                  className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419]"
                />
              </div>
            </div>

            {/* Birth, Living Status, Profession */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0d2419]">
                  {language === 'ml' ? 'ജനന വർഷം (Birth Year) *' : 'Birth Year *'}
                </label>
                <input
                  type="number"
                  required
                  min={1850}
                  max={2030}
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0d2419]">
                  {language === 'ml' ? 'ജീവിച്ചിരിക്കുന്നുണ്ടോ?' : 'Vital Status:'}
                </label>
                <select
                  value={isLiving ? 'living' : 'deceased'}
                  onChange={(e) => setIsLiving(e.target.value === 'living')}
                  className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419]"
                >
                  <option value="living">{language === 'ml' ? 'ജീവിച്ചിരിക്കുന്നു (Living)' : 'Living'}</option>
                  <option value="deceased">{language === 'ml' ? 'മൺമറഞ്ഞു (Deceased)' : 'Deceased'}</option>
                </select>
              </div>

              {!isLiving && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#0d2419]">
                    {language === 'ml' ? 'വഫാത്തായ വർഷം (Death Year)' : 'Death Year:'}
                  </label>
                  <input
                    type="number"
                    min={1850}
                    max={2030}
                    value={deathYear || ''}
                    onChange={(e) => setDeathYear(e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#424844]">
                  {language === 'ml' ? 'തൊഴിൽ (Profession)' : 'Profession / Trade'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Merchant, Educator"
                  value={tradeOrProfession}
                  onChange={(e) => setTradeOrProfession(e.target.value)}
                  className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419]"
                />
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0d2419] flex items-center justify-between">
                <span>{language === 'ml' ? 'പ്രൊഫൈൽ ചിത്രം (Profile Photo):' : 'Profile Photo / Portrait:'}</span>
                <span className="text-[10px] text-[#727974]">{language === 'ml' ? 'ചിത്രം തിരഞ്ഞെടുക്കുക' : 'Click to select avatar'}</span>
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS[gender].map((url, i) => (
                  <button
                    key={`av_${i}`}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                      avatarUrl === url
                        ? 'border-[#7b5810] ring-2 ring-[#fdcd7b] scale-105'
                        : 'border-[#d6cfbe] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Bio / Summary Notes */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#424844]">
                  {language === 'ml' ? 'ലഘു കുറിപ്പ് (Bio / Heritage Notes):' : 'Brief Bio / Lineage Record:'}
                </label>
                <span className="text-[10px] text-[#7b5810] italic">
                  {language === 'ml' ? 'ബന്ധങ്ങൾ അനുസരിച്ച് സ്വയമേവ എഴുതിയത്' : 'Auto-generated from connections'}
                </span>
              </div>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={computedBio}
                className="bg-[#fcfaf6] border border-[#d6cfbe] rounded-xl px-3 py-2 text-xs text-[#0d2419] focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#e7e2d8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#d6cfbe] text-xs font-bold text-[#424844] hover:bg-[#f4efe4] transition-colors"
            >
              {language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0d2419] text-[#fdcd7b] text-xs font-bold hover:bg-[#1b3a2a] shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
              <span>{language === 'ml' ? 'അംഗത്തെ ചേർത്ത് ബന്ധിപ്പിക്കുക' : 'Save & Link Member to Tree'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
