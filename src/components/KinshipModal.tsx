import React, { useState, useMemo } from 'react';
import { FamilyMember } from '../types';
import { calculateKinship, KinshipResult } from '../utils/genealogy';
import { useLanguage } from '../context/LanguageContext';

export interface KinshipModalProps {
  initialMember?: FamilyMember | null;
  initialTargetMember?: FamilyMember | null;
  allMembers: FamilyMember[];
  onClose: () => void;
  onSelectMemberForTree: (member: FamilyMember) => void;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

export const KinshipModal: React.FC<KinshipModalProps> = ({
  initialMember,
  initialTargetMember,
  allMembers,
  onClose,
  onSelectMemberForTree,
}) => {
  const { language, getName, getBranch } = useLanguage();

  const [personAId, setPersonAId] = useState<string>(() => {
    if (initialMember) return initialMember.id;
    return allMembers[0]?.id || 'mayan_kutty';
  });

  const [personBId, setPersonBId] = useState<string>(() => {
    if (initialTargetMember && initialTargetMember.id !== (initialMember?.id || allMembers[0]?.id)) {
      return initialTargetMember.id;
    }
    const aId = initialMember?.id || allMembers[0]?.id;
    // Pick a sensible second person (e.g. spouse, child, or another elder)
    const second = allMembers.find((m) => m.id !== aId && (m.id === 'paathu' || m.id === 'kasim' || m.id === 'pocker' || m.id === 'mammu'));
    return second?.id || allMembers.find((m) => m.id !== aId)?.id || aId;
  });

  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  const personA = allMembers.find((m) => m.id === personAId) || allMembers[0];
  const personB = allMembers.find((m) => m.id === personBId) || allMembers[1] || allMembers[0];

  const kinship: KinshipResult = calculateKinship(personA, personB, allMembers);

  const swapPersons = () => {
    setPersonAId(personBId);
    setPersonBId(personAId);
  };

  const filteredMembersA = useMemo(() => {
    if (!searchA.trim()) return allMembers;
    const q = searchA.toLowerCase();
    return allMembers.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        (m.firstNameMl && m.firstNameMl.includes(q)) ||
        (m.lastNameMl && m.lastNameMl.includes(q))
    );
  }, [allMembers, searchA]);

  const filteredMembersB = useMemo(() => {
    if (!searchB.trim()) return allMembers;
    const q = searchB.toLowerCase();
    return allMembers.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        (m.firstNameMl && m.firstNameMl.includes(q)) ||
        (m.lastNameMl && m.lastNameMl.includes(q))
    );
  }, [allMembers, searchB]);

  // Quick comparison presets
  const presetMembers = useMemo(() => {
    return allMembers.filter((m) =>
      ['mayan_kutty', 'paathu', 'kasim', 'kadeeja', 'ayoob', 'rafeeq', 'pocker', 'mammu'].includes(m.id)
    );
  }, [allMembers]);

  return (
    <div className="fixed inset-0 z-50 bg-[#1d1c16]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-[#fef9ef] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e7e2d8] overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#e7e2d8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d2419] text-[#fdcd7b] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">diversity_1</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-[#0d2419] leading-tight">
                {language === 'ml'
                  ? 'രണ്ട് വ്യക്തികൾ തമ്മിലുള്ള ബന്ധം'
                  : 'Relationship Between Two Persons'}
              </h2>
              <p className="text-xs text-[#7b5810] font-semibold">
                {language === 'ml'
                  ? 'കുടുംബത്തിലെ ഏതെങ്കിലും രണ്ട് വ്യക്തികളെ തിരഞ്ഞെടുത്ത് രക്തബന്ധം കണ്ടെത്തുക'
                  : 'Compare any two family members to calculate exact kinship'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f2ede3] flex items-center justify-center text-[#424844] hover:bg-[#ede8de] hover:text-[#0d2419] transition-colors"
            title={language === 'ml' ? 'അടയ്ക്കുക' : 'Close'}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Two-Person Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
            {/* Person A Card */}
            <div className="bg-white p-3.5 rounded-xl border border-[#e7e2d8] shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-[#7b5810] uppercase flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#0d2419] text-white text-[10px] flex items-center justify-center font-mono">
                    1
                  </span>
                  {language === 'ml' ? 'ആദ്യ വ്യക്തി (Person 1)' : 'Person 1 (Reference)'}
                </span>
              </div>

              {/* Selector */}
              <select
                value={personAId}
                onChange={(e) => setPersonAId(e.target.value)}
                aria-label="Select first person"
                className="w-full text-xs font-semibold text-[#0d2419] bg-[#f8f3e9] p-2 rounded-lg border border-[#e7e2d8] focus:outline-none focus:ring-1 focus:ring-[#7b5810] cursor-pointer"
              >
                {filteredMembersA.map((m) => (
                  <option key={m.id} value={m.id}>
                    {getName(m)} ({language === 'ml' ? `തലമുറ ${m.generation}` : `Gen ${m.generation}`} • {m.birthYear})
                  </option>
                ))}
              </select>

              {/* Profile Card A */}
              <div className="flex items-center gap-2.5 pt-1 bg-[#fcfaf6] p-2 rounded-lg border border-[#e7e2d8]/60">
                <img
                  src={personA.avatarUrl || DEFAULT_AVATAR}
                  alt={personA.firstName}
                  className="w-11 h-11 rounded-lg object-cover bg-[#f2ede3] ring-1 ring-[#7b5810]/30"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#0d2419] truncate">
                    {getName(personA)}
                  </div>
                  <div className="text-[11px] text-[#7b5810] font-medium">
                    {language === 'ml' ? `തലമുറ ${personA.generation}` : `Gen ${personA.generation}`} • {getBranch(personA)}
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-10 flex justify-center">
              <button
                onClick={swapPersons}
                className="w-9 h-9 rounded-full bg-[#0d2419] text-white flex items-center justify-center shadow-md hover:bg-[#233a2e] transition-all active:scale-90"
                title={language === 'ml' ? 'പരസ്പരം മാറ്റുക' : 'Swap individuals'}
              >
                <span className="material-symbols-outlined text-[18px]">sync_alt</span>
              </button>
            </div>

            {/* Person B Card */}
            <div className="bg-white p-3.5 rounded-xl border border-[#e7e2d8] shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-[#7b5810] uppercase flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#7b5810] text-white text-[10px] flex items-center justify-center font-mono">
                    2
                  </span>
                  {language === 'ml' ? 'രണ്ടാമത്തെ വ്യക്തി (Person 2)' : 'Person 2 (Relative)'}
                </span>
              </div>

              {/* Selector */}
              <select
                value={personBId}
                onChange={(e) => setPersonBId(e.target.value)}
                aria-label="Select second person"
                className="w-full text-xs font-semibold text-[#0d2419] bg-[#f8f3e9] p-2 rounded-lg border border-[#e7e2d8] focus:outline-none focus:ring-1 focus:ring-[#7b5810] cursor-pointer"
              >
                {filteredMembersB.map((m) => (
                  <option key={m.id} value={m.id}>
                    {getName(m)} ({language === 'ml' ? `തലമുറ ${m.generation}` : `Gen ${m.generation}`} • {m.birthYear})
                  </option>
                ))}
              </select>

              {/* Profile Card B */}
              <div className="flex items-center gap-2.5 pt-1 bg-[#fcfaf6] p-2 rounded-lg border border-[#e7e2d8]/60">
                <img
                  src={personB.avatarUrl || DEFAULT_AVATAR}
                  alt={personB.firstName}
                  className="w-11 h-11 rounded-lg object-cover bg-[#f2ede3] ring-1 ring-[#7b5810]/30"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#0d2419] truncate">
                    {getName(personB)}
                  </div>
                  <div className="text-[11px] text-[#7b5810] font-medium">
                    {language === 'ml' ? `തലമുറ ${personB.generation}` : `Gen ${personB.generation}`} • {getBranch(personB)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Comparison Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#5c5446]">
              {language === 'ml' ? 'വേഗത്തിൽ തിരഞ്ഞെടുക്കാൻ:' : 'Quick Compare with:'}
            </span>
            {presetMembers.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setPersonBId(preset.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  personBId === preset.id
                    ? 'bg-[#0d2419] text-white shadow-xs'
                    : 'bg-[#ede8de] text-[#0d2419] hover:bg-[#e7e2d8]'
                }`}
              >
                {getName(preset)}
              </button>
            ))}
          </div>

          {/* Relationship Result Hero Card */}
          <div className="bg-gradient-to-br from-[#0d2419] via-[#143223] to-[#1e4530] text-white p-5 rounded-2xl shadow-lg border border-[#2d4d3c] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[110px]">family_history</span>
            </div>

            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#fdcd7b] text-[#78550d] text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                  {language === 'ml' ? 'കുടുംബബന്ധം' : 'Verified Kinship'}
                </span>
                <span className="text-xs text-[#cee9d7] font-medium">
                  {language === 'ml' ? kinship.degreeTextMl : kinship.degreeText}
                </span>
              </div>

              {/* Main Relationship Headline */}
              <div className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                {language === 'ml' ? kinship.relationshipMl : kinship.relationship}
              </div>

              {/* Detailed Narrative */}
              <p className="text-xs sm:text-sm text-[#e7e2d8] leading-relaxed mt-1 max-w-xl">
                {language === 'ml' ? kinship.narrativeMl : kinship.narrative}
              </p>

              {/* Generational Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-white/15 text-xs">
                <div className="bg-white/10 rounded-xl p-2.5">
                  <span className="text-[10px] text-[#cee9d7] uppercase font-semibold block">
                    {language === 'ml' ? 'തലമുറ വ്യത്യാസം' : 'Generation Span'}
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {Math.abs(kinship.generationalDifference)}{' '}
                    {language === 'ml'
                      ? kinship.generationalDifference > 0
                        ? 'തലമുറ താഴെ (Junior)'
                        : kinship.generationalDifference < 0
                        ? 'തലമുറ മുകളിൽ (Senior)'
                        : 'ഒരേ തലമുറ'
                      : kinship.generationalDifference > 0
                      ? 'Gen Junior'
                      : kinship.generationalDifference < 0
                      ? 'Gen Senior'
                      : 'Same Generation'}
                  </span>
                </div>

                <div className="bg-white/10 rounded-xl p-2.5">
                  <span className="text-[10px] text-[#cee9d7] uppercase font-semibold block">
                    {language === 'ml' ? 'ബന്ധത്തിന്റെ സ്വഭാവം' : 'Kinship Type'}
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5 block truncate">
                    {kinship.isDirectAncestor
                      ? language === 'ml'
                        ? 'നേരിട്ടുള്ള പൂർവികൻ'
                        : 'Direct Ascendant'
                      : kinship.isDirectDescendant
                      ? language === 'ml'
                        ? 'നേരിട്ടുള്ള പിൻഗാമി'
                        : 'Direct Progeny'
                      : kinship.isSpouse
                      ? language === 'ml'
                        ? 'വിവാഹ പങ്കാളി'
                        : 'Spouse'
                      : language === 'ml'
                      ? 'കുടുംബ ശാഖാ ബന്ധു'
                      : 'Collateral Kinsman'}
                  </span>
                </div>

                {kinship.commonAncestor && (
                  <div className="bg-white/10 rounded-xl p-2.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#cee9d7] uppercase font-semibold block">
                      {language === 'ml' ? 'പൊതുവായ പൂർവികൻ' : 'Common Ancestor'}
                    </span>
                    <span className="text-sm font-bold text-[#fdcd7b] truncate block mt-0.5">
                      {getName(kinship.commonAncestor)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Connection Chain Visualization */}
          {kinship.connectionPath && kinship.connectionPath.length > 1 && (
            <div className="bg-white p-4 rounded-xl border border-[#e7e2d8] shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b5810] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">route</span>
                  <span>
                    {language === 'ml'
                      ? 'ബന്ധിപ്പിക്കുന്ന കണ്ണികൾ (Connection Path)'
                      : 'Step-by-Step Kinship Path'}
                  </span>
                </span>
                <span className="text-[10px] text-[#727974] font-semibold">
                  {kinship.connectionPath.length} {language === 'ml' ? 'വ്യക്തികൾ' : 'Members'}
                </span>
              </div>

              {/* Path Flow */}
              <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
                {kinship.connectionPath.map((stepMember, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === (kinship.connectionPath?.length || 0) - 1;
                  const isApex = kinship.commonAncestor?.id === stepMember.id;

                  return (
                    <React.Fragment key={stepMember.id}>
                      <button
                        onClick={() => onSelectMemberForTree(stepMember)}
                        className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center min-w-[90px] max-w-[110px] flex-shrink-0 ${
                          isFirst || isLast
                            ? 'bg-[#f4efe4] border-[#7b5810] shadow-xs'
                            : isApex
                            ? 'bg-[#fdcd7b]/25 border-[#c49232]'
                            : 'bg-white border-[#e7e2d8] hover:border-[#7b5810]'
                        }`}
                        title={language === 'ml' ? `${getName(stepMember)}ന്റെ ട്രീ കാണുക` : `View ${stepMember.firstName}'s tree`}
                      >
                        <img
                          src={stepMember.avatarUrl || DEFAULT_AVATAR}
                          alt={stepMember.firstName}
                          className={`w-9 h-9 rounded-full object-cover mb-1 bg-[#ede8de] ${
                            isApex ? 'ring-2 ring-[#c49232]' : 'ring-1 ring-[#d6cfbe]'
                          }`}
                        />
                        <span className="text-[11px] font-bold text-[#0d2419] truncate w-full">
                          {getName(stepMember)}
                        </span>
                        <span className="text-[9px] text-[#7b5810] font-semibold truncate w-full">
                          {isApex
                            ? language === 'ml'
                              ? 'പൊതു വേര്'
                              : 'Root Apex'
                            : isFirst
                            ? language === 'ml'
                              ? 'വ്യക്തി 1'
                              : 'Person 1'
                            : isLast
                            ? language === 'ml'
                              ? 'വ്യക്തി 2'
                              : 'Person 2'
                            : language === 'ml'
                            ? `തലമുറ ${stepMember.generation}`
                            : `Gen ${stepMember.generation}`}
                        </span>
                      </button>

                      {idx < (kinship.connectionPath?.length || 0) - 1 && (
                        <div className="flex items-center text-[#7b5810] px-0.5">
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons: Open Tree for Selected Persons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                onSelectMemberForTree(personA);
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0d2419] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#233a2e] transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span className="truncate">
                {language === 'ml' ? `${getName(personA)}ന്റെ ട്രീ` : `Open ${personA.firstName}'s Tree`}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectMemberForTree(personB);
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#ede8de] text-[#0d2419] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#e7e2d8] transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span className="truncate">
                {language === 'ml' ? `${getName(personB)}ന്റെ ട്രീ` : `Open ${personB.firstName}'s Tree`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
