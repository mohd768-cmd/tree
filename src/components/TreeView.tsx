import React, { useState, useMemo } from 'react';
import { FamilyMember } from '../types';
import {
  getParents,
  getSpouse,
  getSpouses,
  getChildren,
  getSiblings,
  getGrandparents,
  getGrandchildren,
  getAncestryPath,
  getDescendantGenerations,
} from '../utils/genealogy';
import { KinshipModal } from './KinshipModal';
import { LineageRootHighway } from './LineageRootHighway';
import { TreeRelationEditorModal } from './TreeRelationEditorModal';
import { useLanguage } from '../context/LanguageContext';

interface TreeViewProps {
  members: FamilyMember[];
  selectedMember: FamilyMember;
  onSelectMember: (member: FamilyMember) => void;
  onOpenDossier: (member: FamilyMember) => void;
  onNavigateToAdminEdit: (member: FamilyMember) => void;
  onUpdateMembers?: (updatedMembers: FamilyMember[]) => void;
  onOpenAddMember?: (relationType?: 'child' | 'spouse' | 'parent' | 'independent', connectedMemberId?: string) => void;
  onOpenKinship?: (memberA?: FamilyMember, memberB?: FamilyMember) => void;
}

type TreePerspectiveMode =
  | 'couple_children'
  | 'generation_grid'
  | 'clan_panorama'
  | 'ancestry_trail'
  | 'focal'
  | 'descendants';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTeTGurBSbfgFFCZlmuHiYiCV2dklzswenq3bcmeqpqVPmkiWcLXsrOLnHR6D3kX3W8j0KIZLuC7jsS6IiO_4fcxHVCz3kOQzZR_04NQX2klxYVbU--PBMsVIZggBdJYNelxi5Y8eJSZb4MGS6PvzbkTW9evpsiYAliLRsHsSJ3X6R-CE2cnQWroVyJ--ho977JA0GIeoqLWDEye_ClxdVkPLVEMm6ewWhPGJIuAWd_vcdsjsBaY';

export const TreeView: React.FC<TreeViewProps> = ({
  members,
  selectedMember,
  onSelectMember,
  onOpenDossier,
  onNavigateToAdminEdit,
  onUpdateMembers,
  onOpenAddMember,
  onOpenKinship,
}) => {
  const { language, t, getName, getShortName, getRole, getBranch } = useLanguage();

  // Mode defaults to requested Parents & Children tree
  const [perspectiveMode, setPerspectiveMode] = useState<TreePerspectiveMode>('couple_children');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [showSiblings, setShowSiblings] = useState<boolean>(true);

  // Modals state
  const [isKinshipOpen, setIsKinshipOpen] = useState<boolean>(false);
  const [isRelationEditorOpen, setIsRelationEditorOpen] = useState<boolean>(false);
  const [relationEditorTargetId, setRelationEditorTargetId] = useState<string>('mayan_kutty');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Safeguard selected member
  const currentMember = selectedMember || members[0];

  // Genealogic links for currentMember
  const parents = useMemo(() => getParents(currentMember, members), [currentMember, members]);
  const grandparents = useMemo(() => getGrandparents(currentMember, members), [currentMember, members]);
  const spouse = useMemo(() => getSpouse(currentMember, members), [currentMember, members]);
  const spouses = useMemo(() => getSpouses(currentMember, members), [currentMember, members]);
  const children = useMemo(() => getChildren(currentMember, members), [currentMember, members]);
  const grandchildren = useMemo(() => getGrandchildren(currentMember, members), [currentMember, members]);
  const siblings = useMemo(() => getSiblings(currentMember, members), [currentMember, members]);

  // Ancestry Trail from Root
  const ancestryTrail = useMemo(() => {
    let trail = getAncestryPath(currentMember.id, members);
    if (trail.length <= 1 && currentMember.spouseId) {
      const spouseTrail = getAncestryPath(currentMember.spouseId, members);
      if (spouseTrail.length > 0) {
        trail = [...spouseTrail, currentMember];
      }
    }
    const rootId = 'mayan_kutty';
    if (trail.length > 0 && trail[0].id !== rootId && currentMember.id !== rootId) {
      const rootMember = members.find((m) => m.id === rootId);
      if (rootMember) trail = [rootMember, ...trail];
    }
    return trail;
  }, [currentMember, members]);

  const descendantGens = useMemo(() => getDescendantGenerations(currentMember.id, members), [currentMember, members]);

  // Clan Generations
  const gen1 = useMemo(() => members.filter((m) => m.generation === 1), [members]);
  const gen2 = useMemo(() => members.filter((m) => m.generation === 2), [members]);
  const gen3 = useMemo(() => members.filter((m) => m.generation === 3), [members]);
  const gen4 = useMemo(() => members.filter((m) => m.generation === 4), [members]);

  // Filtered members for Generation Grid Explorer
  const filteredGenerationMembers = useMemo(() => {
    if (selectedGen === 'all') return members;
    const gNum = parseInt(selectedGen, 10);
    return members.filter((m) => m.generation === gNum);
  }, [members, selectedGen]);

  const patriarch = members.find((m) => m.id === 'mayan_kutty') || gen1[0];
  const matriarch = members.find((m) => m.id === 'paathu') || gen1[1];

  // Save relations from Admin modal
  const handleSaveRelations = (updatedMembers: FamilyMember[], message: string) => {
    if (onUpdateMembers) {
      onUpdateMembers(updatedMembers);
    }
    try {
      localStorage.setItem('mayankutty_members_v2', JSON.stringify(updatedMembers));
    } catch {
      // ignore
    }
    setStatusMessage(message);
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  const getRoleBadge = (role: string) => {
    if (role.toLowerCase().includes('patriarch')) {
      return { text: language === 'ml' ? 'കാരണവർ' : 'Patriarch', classes: 'bg-[#fdcd7b] text-[#78550d] font-bold' };
    }
    if (role.toLowerCase().includes('matriarch')) {
      return { text: language === 'ml' ? 'മാതാവ്' : 'Matriarch', classes: 'bg-[#cee9d7] text-[#082015] font-bold' };
    }
    if (role.toLowerCase().includes('custodian') || role.toLowerCase().includes('you')) {
      return { text: language === 'ml' ? 'കസ്റ്റോഡിയൻ' : 'Custodian', classes: 'bg-[#ffdeaa] text-[#271900] font-bold' };
    }
    return null;
  };

  // Reusable member card renderer
  const renderMemberNode = (member: FamilyMember, roleTitle?: string, isFocal: boolean = false) => {
    const isSelected = member.id === currentMember.id;
    const badge = getRoleBadge(member.role);

    return (
      <div
        key={member.id}
        onClick={() => {
          if (isFocal) {
            onOpenDossier(member);
          } else {
            onSelectMember(member);
          }
        }}
        className={`relative flex-1 min-w-[210px] max-w-[280px] bg-white rounded-2xl p-3.5 shadow-md transition-all duration-200 cursor-pointer hover:shadow-xl border ${
          isFocal
            ? 'ring-2 ring-[#7b5810] border-transparent bg-gradient-to-b from-[#fffefc] to-[#fbf8f0] shadow-lg scale-[1.02]'
            : isSelected
            ? 'ring-2 ring-[#0d2419] border-transparent'
            : 'border-[#e7e2d8] hover:border-[#7b5810]/60'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1 mb-2">
          {badge ? (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-2xs ${badge.classes}`}>
              {badge.text}
            </span>
          ) : roleTitle ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#ede8de] text-[#424844]">
              {roleTitle}
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#f8f3e9] text-[#7b5810]">
              Gen {member.generation}
            </span>
          )}
        </div>

        <div className="flex items-start gap-2.5">
          <div className="relative flex-shrink-0">
            <img
              src={member.avatarUrl || DEFAULT_AVATAR}
              alt={member.firstName}
              className={`w-13 h-13 rounded-xl object-cover shadow-xs bg-[#f2ede3] ${
                isFocal ? 'ring-2 ring-[#7b5810]' : ''
              }`}
            />
            {member.isLiving ? (
              <span
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
                title="Living"
              />
            ) : null}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-xs sm:text-sm text-[#0d2419] leading-snug break-words">
              {getName(member)}
            </h4>
            {member.id === 'mayan_kutty' && (
              <span className="block text-[11px] font-semibold text-[#7b5810] mt-0.5 break-words">
                {language === 'ml'
                  ? member.firstName || 'Aayinikunnathth Maayan Kutty'
                  : member.firstNameMl || 'ആയിനികുന്നത്ത് മായൻ കുട്ടി'}
              </span>
            )}
            <p className="text-[11px] text-[#7b5810] font-semibold mt-0.5">
              {member.isLiving ? `b. ${member.birthYear}` : `${member.birthYear} – ${member.deathYear}`}
            </p>
            <p className="text-[10px] text-[#424844] truncate mt-0.5">
              {language === 'ml' ? `തലമുറ ${member.generation}` : `Gen ${member.generation}`} • {getBranch(member)}
            </p>
          </div>
        </div>

        {/* Quick helper action footer */}
        <div className="mt-2.5 pt-2 border-t border-[#e7e2d8]/60 flex items-center justify-between text-[11px] text-[#424844]">
          <span className="truncate">{getRole(member)}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToAdminEdit(member);
              }}
              className="px-2 py-0.5 rounded-md bg-[#ede8de] hover:bg-[#0d2419] hover:text-[#fdcd7b] text-[#0d2419] font-bold text-[10px] flex items-center gap-0.5 border border-[#c2c8c2] transition-all cursor-pointer active:scale-95"
              title={language === 'ml' ? 'വിവരങ്ങൾ തിരുത്തുക' : 'Edit Profile in Admin'}
            >
              <span className="material-symbols-outlined text-[13px]">edit</span>
              <span>{language === 'ml' ? 'തിരുത്തുക' : 'Edit'}</span>
            </button>
            {isFocal ? (
              <span className="text-[#7b5810] font-bold flex items-center gap-0.5 hover:underline flex-shrink-0">
                <span>{t.viewDetails}</span>
                <span className="material-symbols-outlined text-[13px]">menu_book</span>
              </span>
            ) : (
              <span className="text-[#7b5810] font-bold flex items-center gap-0.5 hover:underline flex-shrink-0">
                <span>{perspectiveMode === 'couple_children' ? (language === 'ml' ? 'വൃക്ഷം കാണുക' : 'Generate') : t.viewTree}</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 pb-24 gap-4 max-w-5xl mx-auto">
      {/* Real-time notification banner */}
      {statusMessage && (
        <div className="bg-[#0d2419] text-[#fdcd7b] px-4 py-2.5 rounded-xl shadow-lg border border-[#fdcd7b]/40 flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-white hover:text-[#fdcd7b] text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LINEAGE ROOT HIGHWAY: ROOT & BRANCH ROUTE EXPLANATION                     */}
      {/* ========================================================================= */}
      <LineageRootHighway
        selectedMember={currentMember}
        members={members}
        onSelectMember={onSelectMember}
        onGoToRoot={() => {
          const founder = members.find((m) => m.id === 'mayan_kutty') || members[0];
          if (founder) onSelectMember(founder);
        }}
      />

      {/* ========================================================================= */}
      {/* PRIMARY PERSPECTIVE MODES: COUPLE & CHILDREN, GENERATIONS, PANORAMA, ETC. */}
      {/* ========================================================================= */}
      <div className="w-full overflow-hidden">
        {/* Modes Selector - Clean Touch-Friendly Scrollable Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-1 px-1">
          {/* PRIMARY REQUESTED MODE: Parents & Children Tree */}
          <button
            onClick={() => setPerspectiveMode('couple_children')}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap min-h-[40px] active:scale-95 ${
              perspectiveMode === 'couple_children'
                ? 'bg-[#0d2419] text-[#fdcd7b] ring-2 ring-[#7b5810]'
                : 'bg-white text-[#0d2419] hover:bg-[#ede8de] border border-[#e7e2d8]'
            }`}
            title="First show Patriarch & Wife and Children; click child to generate their family tree"
          >
            <span className="material-symbols-outlined text-[16px]">family_restroom</span>
            <span>{t.coupleAndChildrenTree}</span>
          </button>

          {/* SECOND REQUESTED OPTION: Option to see people in different generation */}
          <button
            onClick={() => setPerspectiveMode('generation_grid')}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[40px] active:scale-95 ${
              perspectiveMode === 'generation_grid'
                ? 'bg-[#0d2419] text-[#fdcd7b] shadow-sm font-bold'
                : 'bg-white text-[#424844] hover:bg-[#ede8de] border border-[#e7e2d8]'
            }`}
            title="Option to see people in different generations (Gen 1, Gen 2, Gen 3, Gen 4)"
          >
            <span className="material-symbols-outlined text-[16px]">layers</span>
            <span>{t.browseByGeneration}</span>
          </button>

          <button
            onClick={() => setPerspectiveMode('clan_panorama')}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[40px] active:scale-95 ${
              perspectiveMode === 'clan_panorama'
                ? 'bg-[#0d2419] text-[#fdcd7b] shadow-sm font-bold'
                : 'bg-[#ede8de] text-[#424844] hover:bg-[#e7e2d8]'
            }`}
            title="Full clan panorama & generation levels"
          >
            <span className="material-symbols-outlined text-[15px]">grid_view</span>
            <span>{t.clanPanorama}</span>
          </button>

          <button
            onClick={() => setPerspectiveMode('ancestry_trail')}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[40px] active:scale-95 ${
              perspectiveMode === 'ancestry_trail'
                ? 'bg-[#0d2419] text-[#fdcd7b] shadow-sm font-bold'
                : 'bg-[#ede8de] text-[#424844] hover:bg-[#e7e2d8]'
            }`}
            title="Direct bloodline path from Aayinikunnathth Maayan Kutty"
          >
            <span className="material-symbols-outlined text-[15px]">route</span>
            <span>{t.ancestryTrail}</span>
          </button>

          <button
            onClick={() => setPerspectiveMode('descendants')}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[40px] active:scale-95 ${
              perspectiveMode === 'descendants'
                ? 'bg-[#0d2419] text-[#fdcd7b] shadow-sm font-bold'
                : 'bg-[#ede8de] text-[#424844] hover:bg-[#e7e2d8]'
            }`}
            title="Descendants subtree"
          >
            <span className="material-symbols-outlined text-[15px]">park</span>
            <span>{t.descendantBranch} ({children.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TREE CANVAS: RENDERS SELECTED PERSPECTIVE                                 */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-2xl bg-[#f8f3e9]/80 border border-[#e7e2d8] shadow-inner overflow-hidden p-3 sm:p-5 min-h-[460px]">
        <div className="flex flex-col items-center w-full transition-transform duration-300 origin-top select-none py-2">
          {/* --------------------------------------------------------------------- */}
          {/* MODE 1: PRIMARY USER REQUEST - COUPLE & CHILDREN TREE                 */}
          {/* First show Patriarch, wife, and children; select child to generate 2nd tree */}
          {/* --------------------------------------------------------------------- */}
          {perspectiveMode === 'couple_children' && (
            <div className="flex flex-col items-center w-full gap-5">
              {/* Breadcrumbs Trail & Up Navigation */}
              <div className="w-full flex items-center justify-between flex-wrap gap-2 px-3 py-2 bg-white rounded-xl border border-[#e7e2d8] shadow-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold py-0.5 no-scrollbar">
                  <span className="text-[#7b5810] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">account_tree</span>
                    <span>{language === 'ml' ? 'വഴി:' : 'Ancestry Route:'}</span>
                  </span>
                  {ancestryTrail.map((ancestor, index) => {
                    const isLast = index === ancestryTrail.length - 1;
                    return (
                      <React.Fragment key={ancestor.id}>
                        {index > 0 && <span className="text-[#727974]">›</span>}
                        <button
                          type="button"
                          onClick={() => onSelectMember(ancestor)}
                          className={`px-2 py-0.5 rounded-md transition-colors ${
                            isLast
                              ? 'bg-[#0d2419] text-[#fdcd7b] font-bold'
                              : 'text-[#424844] hover:bg-[#ede8de]'
                          }`}
                        >
                          {getName(ancestor)}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                {parents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onSelectMember(parents[0])}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0d2419] hover:bg-[#1b3a2a] text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    <span>{t.backToParentTree} ({getShortName(parents[0])})</span>
                  </button>
                )}
              </div>

              {/* APEX TIER: PARENTS / COUPLE */}
              <div className="flex flex-col items-center w-full">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fdcd7b]/30 text-[#78550d] text-[11px] font-bold uppercase tracking-wider mb-3">
                  <span>
                    {language === 'ml'
                      ? `തലമുറ ${currentMember.generation} • ${currentMember.role.toLowerCase().includes('patriarch') ? 'കാരണവരും മാതാവും' : 'ദമ്പതികൾ'}`
                      : `Generation ${currentMember.generation} • Family Unit`}
                  </span>
                </div>

                <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 relative">
                  {/* Person 1: Focal Member (e.g. Mayan Kutty or Jameela) */}
                  <div className="relative">
                    {renderMemberNode(
                      currentMember,
                      currentMember.role.toLowerCase().includes('patriarch')
                        ? (language === 'ml' ? 'കാരണവർ' : 'Patriarch')
                        : currentMember.role.toLowerCase().includes('matriarch')
                        ? (language === 'ml' ? 'മാതാവ്' : 'Matriarch')
                        : (language === 'ml' ? 'കുടുംബനാഥൻ/നാഥ' : 'Parent'),
                      true
                    )}
                  </div>

                  {/* Multiple Spouses or Single Spouse Rendering */}
                  {spouses.length > 0 ? (
                    spouses.map((s, idx) => (
                      <React.Fragment key={s.id}>
                        {/* Marriage Connector / Heart Knot */}
                        <div className="flex flex-col items-center justify-center z-10 px-1 py-1">
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-[#7b5810] text-[#7b5810] flex items-center justify-center shadow-md">
                            <span className="material-symbols-outlined text-[20px] text-[#e04f64]">favorite</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#7b5810] bg-white px-2.5 py-0.5 rounded-full border border-[#e7e2d8] shadow-2xs mt-1">
                            {spouses.length > 1
                              ? (language === 'ml' ? `ഭാര്യ ${idx + 1}` : `Wife ${idx + 1}`)
                              : (language === 'ml' ? 'ദമ്പതികൾ' : 'Union')}
                          </span>
                        </div>

                        {/* Spouse Card */}
                        <div className="relative">
                          {renderMemberNode(
                            s,
                            s.role.toLowerCase().includes('matriarch')
                              ? (language === 'ml' ? 'മാതാവ്' : 'Matriarch')
                              : (language === 'ml'
                                  ? (spouses.length > 1 ? `ഭാര്യ ${idx + 1}` : 'പങ്കാളി')
                                  : (spouses.length > 1 ? `Wife ${idx + 1}` : 'Spouse')),
                            false
                          )}
                        </div>
                      </React.Fragment>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenAddMember) {
                            onOpenAddMember('spouse', currentMember.id);
                          } else {
                            setRelationEditorTargetId(currentMember.id);
                            setIsRelationEditorOpen(true);
                          }
                        }}
                        className="text-[11px] font-bold text-[#7b5810] bg-white px-3 py-1.5 rounded-xl border border-dashed border-[#7b5810] hover:bg-[#f8f3e9] shadow-xs flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[#e04f64]">favorite</span>
                        <span>+ {language === 'ml' ? 'ഭാര്യയെ / പങ്കാളിയെ ചേർക്കുക' : 'Link / Add Wife'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Downward Lineage Connector Trunk */}
                <div className="flex flex-col items-center my-3">
                  <div className="w-[3px] h-8 bg-[#0d2419]"></div>
                  <div className="px-4 py-1.5 rounded-full bg-[#0d2419] text-[#fdcd7b] text-xs font-bold shadow-md flex items-center gap-1.5 text-center break-words max-w-full">
                    <span className="material-symbols-outlined text-[16px] flex-shrink-0">child_care</span>
                    <span>
                      {language === 'ml'
                        ? `${getName(currentMember)} ${spouses.length > 0 ? `& ${spouses.map((s) => getName(s)).join(', ')}` : ''} ന്റെ ${children.length} മക്കൾ`
                        : `${children.length} Children of ${getShortName(currentMember)} ${spouses.length > 0 ? `& ${spouses.map((s) => getShortName(s)).join(', ')}` : ''}`}
                    </span>
                  </div>
                  <div className="w-[3px] h-6 bg-[#0d2419]"></div>
                  <div className="w-3 h-3 rotate-45 border-r-3 border-b-3 border-[#0d2419] -mt-1.5"></div>
                </div>
              </div>

              {/* LEVEL 2: CHILDREN TIER (CLICKING ANY CHILD GENERATES THEIR FAMILY TREE) */}
              {children.length > 0 ? (
                <div className="w-full flex flex-col items-center">
                  <div className="text-center mb-3">
                    <span className="text-xs font-bold text-[#7b5810] uppercase tracking-wider block">
                      {language === 'ml'
                        ? 'മക്കളിൽ ഒരാളെ തിരഞ്ഞെടുത്ത് അവരുടെ കുടുംബ വൃക്ഷം കാണുക:'
                        : 'Select any child below to generate their family tree:'}
                    </span>
                  </div>

                  {/* Children Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 w-full">
                    {children.map((child) => {
                      const childSpouse = getSpouse(child, members);
                      const childKids = getChildren(child, members);

                      return (
                        <div
                          key={child.id}
                          onClick={() => onSelectMember(child)}
                          className="group relative bg-white rounded-2xl p-4 border border-[#e7e2d8] shadow-sm hover:shadow-xl hover:border-[#7b5810] transition-all duration-200 cursor-pointer flex flex-col justify-between"
                        >
                          {/* Generation tag */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede8de] text-[#0d2419]">
                              {language === 'ml' ? `തലമുറ ${child.generation}` : `Gen ${child.generation}`}
                            </span>
                          </div>

                          {/* Avatar & Names */}
                          <div className="flex items-center gap-3">
                            <img
                              src={child.avatarUrl || DEFAULT_AVATAR}
                              alt={child.firstName}
                              className="w-13 h-13 rounded-xl object-cover ring-2 ring-[#e7e2d8] group-hover:ring-[#7b5810] transition-all bg-[#f2ede3]"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-display font-bold text-sm text-[#0d2419] truncate group-hover:text-[#7b5810] transition-colors">
                                {getName(child)}
                              </h4>
                              <p className="text-[11px] text-[#727974]">
                                {child.isLiving ? `b. ${child.birthYear}` : `${child.birthYear} – ${child.deathYear}`}
                              </p>
                              <p className="text-[11px] text-[#7b5810] font-medium truncate">
                                {getRole(child)}
                              </p>
                            </div>
                          </div>

                          {/* Spouse indicator if present */}
                          {childSpouse && (
                            <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-[#f8f3e9] text-[11px] text-[#424844] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px] text-[#e04f64]">favorite</span>
                              <span className="truncate">
                                {language === 'ml' ? `പങ്കാളി: ${getName(childSpouse)}` : `Spouse: ${getName(childSpouse)}`}
                              </span>
                            </div>
                          )}

                          {/* Kids count and Generate Tree action */}
                          <div className="mt-3 pt-2.5 border-t border-[#e7e2d8]/70 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#0d2419] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-[#7b5810]">family_restroom</span>
                              <span>
                                {childKids.length > 0
                                  ? (language === 'ml' ? `${childKids.length} മക്കൾ` : `${childKids.length} Kids`)
                                  : (language === 'ml' ? 'മക്കളില്ല' : '0 Kids')}
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0d2419] group-hover:text-[#7b5810] group-hover:translate-x-0.5 transition-all">
                              <span>{language === 'ml' ? 'വൃക്ഷം കാണുക' : 'Generate'}</span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-white rounded-2xl border border-dashed border-[#d6cfbe] max-w-md">
                  <span className="material-symbols-outlined text-[32px] text-[#7b5810]">child_friendly</span>
                  <h4 className="font-display font-bold text-sm text-[#0d2419] mt-2">
                    {t.noChildrenRecorded}
                  </h4>
                  <p className="text-xs text-[#727974] mt-1">
                    {language === 'ml'
                      ? `${getName(currentMember)} ന്റെ കുടുംബത്തിലേക്ക് പുതിയ അംഗങ്ങളെ ചേർക്കാൻ താഴെ ക്ലിക്ക് ചെയ്യുക.`
                      : `Add members or descendants connected to ${getName(currentMember)}.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAddMember) {
                        onOpenAddMember('child', currentMember.id);
                      } else {
                        setRelationEditorTargetId(currentMember.id);
                        setIsRelationEditorOpen(true);
                      }
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#0d2419] text-[#fdcd7b] text-xs font-bold hover:bg-[#1b3a2a] transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>{t.addMember}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* MODE 2: GENERATIONS EXPLORER                                          */}
          {/* OPTION TO SEE PEOPLE IN DIFFERENT GENERATION                         */}
          {/* --------------------------------------------------------------------- */}
          {perspectiveMode === 'generation_grid' && (
            <div className="flex flex-col items-center w-full gap-5">
              {/* Generation Tabs */}
              <div className="flex items-center justify-center flex-wrap gap-2 w-full">
                {[
                  { id: 'all', label: language === 'ml' ? 'എല്ലാ തലമുറകളും' : 'All Generations', count: members.length },
                  { id: '1', label: language === 'ml' ? 'തലമുറ 1 (കാരണവർ & മാതാവ്)' : 'Gen 1: Patriarch & Wife', count: gen1.length },
                  { id: '2', label: language === 'ml' ? 'തലമുറ 2 (8 മക്കൾ & പങ്കാളികൾ)' : 'Gen 2: 8 Children Branches', count: gen2.length },
                  { id: '3', label: language === 'ml' ? 'തലമുറ 3 (പേരക്കുട്ടികൾ)' : 'Gen 3: Grandchildren', count: gen3.length },
                  { id: '4', label: language === 'ml' ? 'തലമുറ 4 (കൊച്ചുമക്കൾ)' : 'Gen 4: Great-Grandchildren', count: gen4.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedGen(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedGen === tab.id
                        ? 'bg-[#0d2419] text-[#fdcd7b] shadow-md scale-105'
                        : 'bg-white text-[#424844] hover:bg-[#ede8de] border border-[#e7e2d8]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#ede8de] text-[#0d2419]">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Generation Members Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {filteredGenerationMembers.map((member) => {
                  const mParents = getParents(member, members);
                  const mSpouse = getSpouse(member, members);
                  const mChildren = getChildren(member, members);

                  return (
                    <div
                      key={member.id}
                      className="bg-white rounded-2xl p-4 border border-[#e7e2d8] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fdcd7b]/30 text-[#78550d]">
                            {language === 'ml' ? `തലമുറ ${member.generation}` : `Generation ${member.generation}`}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onNavigateToAdminEdit(member)}
                              className="px-2 py-0.5 rounded-md bg-[#ede8de] hover:bg-[#0d2419] hover:text-[#fdcd7b] text-[#0d2419] font-bold text-[10px] flex items-center gap-0.5 border border-[#c2c8c2] transition-all cursor-pointer active:scale-95"
                              title={language === 'ml' ? 'വിവരങ്ങൾ തിരുത്തുക' : 'Edit Profile in Admin'}
                            >
                              <span className="material-symbols-outlined text-[13px]">edit</span>
                              <span>{language === 'ml' ? 'തിരുത്തുക' : 'Edit'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setRelationEditorTargetId(member.id);
                                setIsRelationEditorOpen(true);
                              }}
                              className="w-6 h-6 rounded-md hover:bg-[#ede8de] text-[#727974] flex items-center justify-center transition-colors cursor-pointer"
                              title={language === 'ml' ? 'ബന്ധങ്ങൾ ക്രമീകരിക്കുക' : 'Edit relations'}
                            >
                              <span className="material-symbols-outlined text-[14px]">settings</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <img
                            src={member.avatarUrl || DEFAULT_AVATAR}
                            alt={member.firstName}
                            className="w-14 h-14 rounded-xl object-cover bg-[#f2ede3] ring-2 ring-[#ede8de]"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-display font-bold text-sm text-[#0d2419] leading-snug break-words">
                              {getName(member)}
                            </h4>
                            {member.id === 'mayan_kutty' && (
                              <span className="block text-xs font-semibold text-[#7b5810] mt-0.5 break-words">
                                {language === 'ml'
                                  ? 'Aayinikunnathth Maayan Kutty (Patriarch)'
                                  : 'ആയിനികുന്നത്ത് മായൻ കുട്ടി (കുടുംബ കാരണവർ)'}
                              </span>
                            )}
                            <p className="text-xs text-[#7b5810] font-semibold mt-0.5">
                              {member.isLiving ? `b. ${member.birthYear}` : `${member.birthYear} – ${member.deathYear}`}
                            </p>
                            <p className="text-[11px] text-[#424844] truncate">{member.role}</p>
                          </div>
                        </div>

                        {/* Lineage Info */}
                        <div className="mt-3 space-y-1 text-[11px] bg-[#fbf8f0] p-2.5 rounded-xl border border-[#ede8de]">
                          {mParents.length > 0 && (
                            <div className="truncate text-[#424844]">
                              <span className="font-semibold text-[#0d2419]">
                                {language === 'ml' ? 'മാതാപിതാക്കൾ:' : 'Parents:'}
                              </span>{' '}
                              {mParents.map((p) => getName(p)).join(', ')}
                            </div>
                          )}
                          {mSpouse && (
                            <div className="truncate text-[#424844]">
                              <span className="font-semibold text-[#0d2419]">
                                {language === 'ml' ? 'പങ്കാളി:' : 'Spouse:'}
                              </span>{' '}
                              {getName(mSpouse)}
                            </div>
                          )}
                          <div className="text-[#7b5810] font-semibold">
                            {language === 'ml'
                              ? `${mChildren.length} മക്കൾ രേഖപ്പെടുത്തിയിട്ടുണ്ട്`
                              : `${mChildren.length} Children recorded`}
                          </div>
                        </div>
                      </div>

                      {/* Actions: Generate Tree button */}
                      <div className="mt-3 pt-2.5 border-t border-[#e7e2d8] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenDossier(member)}
                          className="text-xs font-semibold text-[#727974] hover:text-[#0d2419]"
                        >
                          {t.viewDetails}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectMember(member);
                            setPerspectiveMode('couple_children');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#0d2419] text-[#fdcd7b] text-xs font-bold hover:bg-[#1b3a2a] transition-all flex items-center gap-1 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">account_tree</span>
                          <span>{language === 'ml' ? 'കുടുംബ വൃക്ഷം കാണുക' : 'Generate Tree'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* MODE 3: FULL CLAN PANORAMA                                            */}
          {/* --------------------------------------------------------------------- */}
          {perspectiveMode === 'clan_panorama' && (
            <div className="flex flex-col items-center w-full gap-6">
              {/* Generation Quick Selector */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
                {[
                  { id: 'all', label: language === 'ml' ? 'എല്ലാ തലമുറകളും' : 'All Generations', count: members.length },
                  { id: '1', label: language === 'ml' ? 'തലമുറ 1 (വേരുകൾ)' : 'Gen 1 (Founders)', count: gen1.length },
                  { id: '2', label: language === 'ml' ? 'തലമുറ 2 (8 ശാഖകൾ)' : 'Gen 2 (8 Branches)', count: gen2.length },
                  { id: '3', label: language === 'ml' ? 'തലമുറ 3 (പേരക്കുട്ടികൾ)' : 'Gen 3 (Grandchildren)', count: gen3.length },
                  { id: '4', label: language === 'ml' ? 'തലമുറ 4 (കൊച്ചുമക്കൾ)' : 'Gen 4 (Great-Grandchildren)', count: gen4.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedGen(tab.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedGen === tab.id
                        ? 'bg-[#0d2419] text-white shadow-xs'
                        : 'bg-white text-[#424844] hover:bg-[#ede8de] border border-[#e7e2d8]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#ede8de] text-[#0d2419]">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* TIER 1: FOUNDERS */}
              {(selectedGen === 'all' || selectedGen === '1') && (
                <div className="flex flex-col items-center w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fdcd7b]/30 text-[#78550d] text-[10px] font-bold uppercase tracking-wider mb-3">
                    <span className="material-symbols-outlined text-[13px]">military_tech</span>
                    <span>{language === 'ml' ? 'തലമുറ 1: കാരണവരും മാതാവും (Founding Ancestors)' : 'Generation 1: Founding Ancestors'}</span>
                  </div>

                  <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 relative">
                    {patriarch && renderMemberNode(patriarch, 'Patriarch', patriarch.id === currentMember.id)}
                    <div className="w-8 h-8 rounded-full bg-white border border-[#7b5810] text-[#7b5810] flex items-center justify-center font-bold text-xs shadow-xs">
                      <span className="material-symbols-outlined text-[16px] text-[#e04f64]">favorite</span>
                    </div>
                    {matriarch && renderMemberNode(matriarch, 'Matriarch', matriarch.id === currentMember.id)}
                  </div>

                  {/* Trunk connector */}
                  {selectedGen === 'all' && (
                    <div className="flex flex-col items-center my-3">
                      <div className="w-[2px] h-6 bg-[#0d2419]"></div>
                      <div className="px-3 py-0.5 rounded-full bg-[#0d2419] text-[#fdcd7b] text-[10px] font-bold shadow-xs">
                        {language === 'ml' ? '8 മക്കൾ ശാഖകൾ' : '8 Children Branches'}
                      </div>
                      <div className="w-[2px] h-6 bg-[#0d2419]"></div>
                      <div className="w-2.5 h-2.5 rotate-45 border-r-2 border-b-2 border-[#0d2419] -mt-1"></div>
                    </div>
                  )}
                </div>
              )}

              {/* TIER 2: 8 MAIN BRANCH CHILDREN */}
              {(selectedGen === 'all' || selectedGen === '2') && (
                <div className="flex flex-col items-center w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#cee9d7] text-[#082015] text-[10px] font-bold uppercase tracking-wider mb-3">
                    <span className="material-symbols-outlined text-[13px]">hub</span>
                    <span>{language === 'ml' ? 'തലമുറ 2: 8 മക്കൾ ശാഖകൾ & പങ്കാളികൾ' : 'Generation 2: 8 Children Branches & Spouses'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
                    {gen2.map((m) => renderMemberNode(m, getRole(m), m.id === currentMember.id))}
                  </div>

                  {selectedGen === 'all' && (
                    <div className="flex flex-col items-center my-3">
                      <div className="w-[2px] h-6 bg-[#0d2419]"></div>
                      <div className="w-2.5 h-2.5 rotate-45 border-r-2 border-b-2 border-[#0d2419]"></div>
                    </div>
                  )}
                </div>
              )}

              {/* TIER 3: GRANDCHILDREN */}
              {(selectedGen === 'all' || selectedGen === '3') && (
                <div className="flex flex-col items-center w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#f2ede3] text-[#0d2419] text-[10px] font-bold uppercase tracking-wider mb-3">
                    <span className="material-symbols-outlined text-[13px]">groups</span>
                    <span>{language === 'ml' ? 'തലമുറ 3: പേരക്കുട്ടികൾ' : 'Generation 3: Grandchildren'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                    {gen3.map((m) => renderMemberNode(m, getRole(m), m.id === currentMember.id))}
                  </div>

                  {selectedGen === 'all' && (
                    <div className="flex flex-col items-center my-3">
                      <div className="w-[2px] h-6 bg-[#0d2419]"></div>
                      <div className="w-2.5 h-2.5 rotate-45 border-r-2 border-b-2 border-[#0d2419]"></div>
                    </div>
                  )}
                </div>
              )}

              {/* TIER 4: GREAT-GRANDCHILDREN */}
              {(selectedGen === 'all' || selectedGen === '4') && (
                <div className="flex flex-col items-center w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fdcd7b]/30 text-[#78550d] text-[10px] font-bold uppercase tracking-wider mb-3">
                    <span className="material-symbols-outlined text-[13px]">child_care</span>
                    <span>{language === 'ml' ? 'തലമുറ 4: കൊച്ചുമക്കൾ' : 'Generation 4: Great-Grandchildren'}</span>
                  </div>

                  <div className="flex items-center justify-center flex-wrap gap-3">
                    {gen4.map((m) => renderMemberNode(m, getRole(m), m.id === currentMember.id))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* MODE 4: ANCESTRY TRAIL (UNBROKEN BLOODLINE)                           */}
          {/* --------------------------------------------------------------------- */}
          {perspectiveMode === 'ancestry_trail' && (
            <div className="flex flex-col items-center w-full max-w-xl gap-4">
              <div className="text-center">
                <span className="text-xs font-bold text-[#7b5810] uppercase tracking-wider">
                  {language === 'ml' ? 'നേരിട്ടുള്ള പരമ്പര' : 'Direct Lineage Route'}
                </span>
                <h3 className="font-display text-lg font-bold text-[#0d2419]">
                  {(() => {
                    const rootAncestors = members.filter((m) => m.generation === 1);
                    const rootNames = rootAncestors.length > 0
                      ? rootAncestors.map((r) => getName(r)).join(' & ')
                      : (language === 'ml' ? 'ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തു' : 'Aayinikunnathth Maayan Kutty & Paathu');
                    return language === 'ml'
                      ? `${rootNames} മുതൽ ${getName(currentMember)} വരെയുള്ള വഴി`
                      : `Ancestry Path from ${rootNames} to ${getName(currentMember)}`;
                  })()}
                </h3>
              </div>

              <div className="flex flex-col items-center w-full gap-2">
                {ancestryTrail.map((member, idx) => {
                  const isTarget = member.id === currentMember.id;
                  const isFirst = idx === 0;

                  return (
                    <React.Fragment key={member.id}>
                      {idx > 0 && (
                        <div className="flex flex-col items-center my-0.5">
                          <div className="w-[2px] h-6 bg-[#7b5810]"></div>
                          <div className="w-2.5 h-2.5 rotate-45 border-r-2 border-b-2 border-[#7b5810]"></div>
                        </div>
                      )}

                      <div
                        onClick={() => onSelectMember(member)}
                        className={`w-full bg-white rounded-xl p-3.5 border shadow-sm flex items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-md ${
                          isTarget
                            ? 'ring-2 ring-[#7b5810] border-transparent bg-gradient-to-r from-white to-[#fbf8f0]'
                            : 'border-[#e7e2d8]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#0d2419] text-[#fdcd7b] font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {member.generation}
                          </div>

                          <img
                            src={member.avatarUrl || DEFAULT_AVATAR}
                            alt={member.firstName}
                            className="w-12 h-12 rounded-xl object-cover bg-[#f2ede3] flex-shrink-0"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-display font-bold text-sm text-[#0d2419] leading-snug break-words">
                                {getName(member)}
                              </span>
                              {member.id === 'mayan_kutty' && (
                                <span className="text-xs font-semibold text-[#7b5810] block sm:inline break-words">
                                  ({language === 'ml' ? 'Aayinikunnathth Maayan Kutty' : 'ആയിനികുന്നത്ത് മായൻ കുട്ടി'})
                                </span>
                              )}
                              {isTarget && (
                                <span className="px-1.5 py-0.2 rounded bg-[#7b5810] text-white text-[9px] font-bold uppercase">
                                  Focus
                                </span>
                              )}
                              {isFirst && (
                                <span className="px-1.5 py-0.2 rounded bg-[#fdcd7b] text-[#78550d] text-[9px] font-bold uppercase">
                                  {language === 'ml' ? 'കാരണവർ (Patriarch)' : 'Patriarch'}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#7b5810] font-semibold">
                              {member.isLiving ? `b. ${member.birthYear}` : `${member.birthYear} – ${member.deathYear}`} • {member.birthplace}
                            </div>
                            <div className="text-[11px] text-[#424844] truncate">{getRole(member)}</div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-[10px] text-[#7b5810] font-bold block uppercase">
                            {getBranch(member)}
                          </span>
                          <span className="text-[11px] text-[#0d2419] font-medium">
                            Tier {member.generation}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* MODE 5: DESCENDANTS PROGENY SUBTREE                                   */}
          {/* --------------------------------------------------------------------- */}
          {perspectiveMode === 'descendants' && (
            <div className="flex flex-col items-center w-full gap-5">
              <div className="text-center max-w-md">
                <span className="text-xs font-bold text-[#7b5810] uppercase tracking-wider">
                  {language === 'ml' ? 'പിൻഗാമികൾ' : 'Progeny Subtree'}
                </span>
                <h3 className="font-display text-xl font-bold text-[#0d2419]">
                  {language === 'ml' ? `${getName(currentMember)} ന്റെ പിൻതലമുറ` : `Descendants of ${getName(currentMember)}`}
                </h3>
              </div>

              {/* Apex Root: Selected Member */}
              <div className="flex flex-col items-center">
                {renderMemberNode(currentMember, 'Subtree Root', true)}
                <div className="flex flex-col items-center my-2">
                  <div className="w-[2px] h-6 bg-[#0d2419]"></div>
                  <div className="w-2.5 h-2.5 rotate-45 border-r-2 border-b-2 border-[#0d2419]"></div>
                </div>
              </div>

              {descendantGens.length > 0 ? (
                <div className="flex flex-col items-center gap-6 w-full">
                  {descendantGens.map((genGroup) => (
                    <div key={genGroup.generationRank} className="flex flex-col items-center w-full">
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#ede8de] text-[#0d2419] text-[10px] font-bold uppercase tracking-wider mb-2">
                        <span>Generation +{genGroup.generationRank} ({genGroup.members.length} Members)</span>
                      </span>
                      <div className="flex items-center justify-center flex-wrap gap-3 max-w-3xl">
                        {genGroup.members.map((m) => renderMemberNode(m, `Descendant`))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-[#e7e2d8] text-center text-xs text-[#727974] max-w-sm">
                  {t.noChildrenRecorded}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Kinship Modal */}
      {isKinshipOpen && (
        <KinshipModal
          initialMember={currentMember}
          allMembers={members}
          onClose={() => setIsKinshipOpen(false)}
          onSelectMemberForTree={(m) => {
            onSelectMember(m);
            setIsKinshipOpen(false);
          }}
        />
      )}

      {/* Admin Tree Relation Editor Modal */}
      {isRelationEditorOpen && (
        <TreeRelationEditorModal
          isOpen={isRelationEditorOpen}
          onClose={() => setIsRelationEditorOpen(false)}
          members={members}
          initialMemberId={relationEditorTargetId}
          onSaveRelations={handleSaveRelations}
          onOpenAddMember={onOpenAddMember}
        />
      )}
    </div>
  );
};
