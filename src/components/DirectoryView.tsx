import React, { useState, useMemo } from 'react';
import { FamilyMember } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DirectoryViewProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  onOpenDossier: (member: FamilyMember) => void;
  onViewTree?: (member: FamilyMember) => void;
  onOpenAddMember?: (relationType?: 'child' | 'spouse' | 'parent' | 'independent', connectedMemberId?: string) => void;
  onOpenKinship?: (memberA?: FamilyMember, memberB?: FamilyMember) => void;
  onNavigateToAdminEdit?: (member: FamilyMember) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  members,
  onSelectMember,
  onOpenDossier,
  onViewTree,
  onOpenAddMember,
  onOpenKinship,
  onNavigateToAdminEdit,
}) => {
  const { language, t, getName, getShortName, getRole, getBranch } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBranch, setActiveBranch] = useState('all');
  const [activeTab, setActiveTab] = useState<'generation' | 'alpha' | 'bloodline'>('generation');
  const [expandedMemberIds, setExpandedMemberIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMemberIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Distinct branches present
  const availableBranches = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.branch).filter(Boolean)));
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Branch / Vital status filter
      if (activeBranch === 'living' && !m.isLiving) return false;
      if (activeBranch === 'deceased' && m.isLiving) return false;
      if (activeBranch !== 'all' && activeBranch !== 'living' && activeBranch !== 'deceased' && m.branch !== activeBranch) {
        return false;
      }

      // Tab filter
      if (activeTab === 'bloodline' && !m.isDirectLine) return false;

      // Search query filter (support English & Malayalam)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const fullName = `${m.firstName} ${m.lastName} ${m.firstNameMl || ''} ${m.lastNameMl || ''} ${m.maidenName || ''}`.toLowerCase();
        const place = m.birthplace.toLowerCase();
        const bio = m.bio.toLowerCase();
        const year = `${m.birthYear} ${m.deathYear || ''}`;
        const trade = `${m.tradeOrProfession || ''} ${m.tradeOrProfessionMl || ''}`.toLowerCase();
        return (
          fullName.includes(query) ||
          place.includes(query) ||
          bio.includes(query) ||
          year.includes(query) ||
          trade.includes(query)
        );
      }
      return true;
    });
  }, [members, activeBranch, activeTab, searchQuery]);

  // Sorted members
  const sortedMembers = useMemo(() => {
    const list = [...filteredMembers];
    if (activeTab === 'alpha') {
      return list.sort((a, b) => {
        const nameA = a.lastName || a.firstName;
        const nameB = b.lastName || b.firstName;
        return nameA.localeCompare(nameB) || a.firstName.localeCompare(b.firstName);
      });
    }
    // Default by generation and birth year
    return list.sort((a, b) => a.generation - b.generation || a.birthYear - b.birthYear);
  }, [filteredMembers, activeTab]);

  const gen1List = sortedMembers.filter((m) => m.generation === 1);
  const gen2List = sortedMembers.filter((m) => m.generation === 2);
  const gen3And4List = sortedMembers.filter((m) => m.generation >= 3);

  const livingCount = members.filter((m) => m.isLiving).length;
  const deceasedCount = members.length - livingCount;

  return (
    <div className="flex flex-col w-full pb-28 max-w-4xl mx-auto">
      {/* Search & Filter Controls */}
      <div className="px-4 md:px-6 pt-2 pb-2 flex flex-col gap-3">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex items-center flex-1">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#7b5810]">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, maiden name, birthplace, or year..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#f2ede3] rounded-xl text-sm text-[#1d1c16] placeholder:text-[#727974] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#7b5810] transition-all border border-[#e7e2d8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-[#727974] hover:text-[#0d2419]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveBranch('all')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-transform active:scale-95 ${
              activeBranch === 'all'
                ? 'bg-[#0d2419] text-white shadow-xs'
                : 'bg-[#ede8de] text-[#424844] hover:bg-[#e7e2d8]'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">park</span>
            <span>{language === 'ml' ? 'എല്ലാ ശാഖകളും' : 'All Branches'}</span>
          </button>

          {availableBranches.map((br) => (
            <button
              key={br}
              onClick={() => setActiveBranch(br)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                activeBranch === br
                  ? 'bg-[#0d2419] text-white shadow-xs'
                  : 'bg-[#ede8de] text-[#424844] hover:bg-[#e7e2d8]'
              }`}
            >
              <span>{br}</span>
            </button>
          ))}

          <button
            onClick={() => setActiveBranch('living')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
              activeBranch === 'living'
                ? 'bg-[#0d2419] text-white shadow-xs'
                : 'bg-[#ede8de] text-[#424844] hover:bg-[#e7e2d8]'
            }`}
          >
            <span>{language === 'ml' ? `ജീവിച്ചിരിക്കുന്നവർ (${livingCount})` : `Living (${livingCount})`}</span>
          </button>

          <button
            onClick={() => setActiveBranch('deceased')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
              activeBranch === 'deceased'
                ? 'bg-[#0d2419] text-white shadow-xs'
                : 'bg-[#ede8de] text-[#424844] hover:bg-[#e7e2d8]'
            }`}
          >
            <span>{language === 'ml' ? `മരണപ്പെട്ടവർ (${deceasedCount})` : `Deceased (${deceasedCount})`}</span>
          </button>
        </div>
      </div>

      {/* Generational Chronicle Metric Banner */}
      <div className="px-4 md:px-6 py-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#233a2e] via-[#1b3b2b] to-[#0d2419] text-white p-4 shadow-md border border-[#0d2419]/40">
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ffdeaa] text-[16px]">
                  menu_book
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#ffdeaa]">
                  Lineage Census
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-[#cee9d7] font-semibold">
                Verified Record
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center sm:text-left">
              <div className="flex flex-col">
                <span className="font-display text-2xl sm:text-3xl text-white font-bold leading-tight">
                  {Math.max(...members.map((m) => m.generation || 1), 4)}
                </span>
                <span className="text-[10px] text-[#b2cdbc] tracking-wide">
                  {language === 'ml' ? 'തലമുറകൾ' : 'Generations'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl sm:text-3xl text-white font-bold leading-tight">
                  {members.length}
                </span>
                <span className="text-[10px] text-[#b2cdbc] tracking-wide">
                  {language === 'ml' ? 'അംഗങ്ങൾ' : 'Members'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl sm:text-3xl text-white font-bold leading-tight">
                  {availableBranches.length}
                </span>
                <span className="text-[10px] text-[#b2cdbc] tracking-wide">
                  {language === 'ml' ? 'ശാഖകൾ' : 'Branches'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl sm:text-3xl text-[#ffdeaa] font-bold leading-tight">
                  {Math.min(...members.map((m) => m.birthYear || 1928))}
                </span>
                <span className="text-[10px] text-[#b2cdbc] tracking-wide">
                  {language === 'ml' ? 'ആദ്യ വർഷം' : 'Oldest Date'}
                </span>
              </div>
            </div>

            <div className="mt-1 pt-2 bg-white/10 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs">
              <span className="text-white/90 flex items-center gap-1 text-[11px]">
                <span className="material-symbols-outlined text-[13px] text-[#ffdeaa]">
                  history_toggle_off
                </span>
                {language === 'ml' ? 'കുടുംബ കാരണവർ:' : 'Patriarch Origin:'}
              </span>
              <span className="text-[#ffdeaa] font-semibold text-[11px] truncate">
                {(() => {
                  const rootMember = members.find((m) => m.id === 'mayan_kutty') || members.find((m) => m.generation === 1) || members[0];
                  return rootMember ? `${getName(rootMember)} (${rootMember.birthplace})` : 'Aayinikunnathth Maayan Kutty';
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Directory Mode Controls */}
      <div className="px-4 md:px-6 py-2">
        <div className="p-1 bg-[#f2ede3] rounded-xl flex items-center justify-between text-center gap-1 border border-[#e7e2d8]">
          <button
            onClick={() => setActiveTab('generation')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'generation'
                ? 'bg-white text-[#0d2419] shadow-xs'
                : 'text-[#424844] hover:text-[#0d2419]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">layers</span>
            <span>By Gen</span>
          </button>

          <button
            onClick={() => setActiveTab('alpha')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'alpha'
                ? 'bg-white text-[#0d2419] shadow-xs'
                : 'text-[#424844] hover:text-[#0d2419]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">sort_by_alpha</span>
            <span>A – Z</span>
          </button>

          <button
            onClick={() => setActiveTab('bloodline')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'bloodline'
                ? 'bg-white text-[#0d2419] shadow-xs'
                : 'text-[#424844] hover:text-[#0d2419]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">family_restroom</span>
            <span>Direct Line</span>
          </button>
        </div>
      </div>

      {/* Main Directory Stream */}
      <div className="flex flex-col px-4 md:px-6 gap-6 pt-2 relative">
        {/* If Alphabetical Tab is active, render flat alphabetical list */}
        {activeTab === 'alpha' ? (
          <div className="flex flex-col gap-3">
            {sortedMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onSelectMember={onSelectMember}
                onOpenDossier={onOpenDossier}
                onViewTree={onViewTree}
                onOpenKinship={onOpenKinship}
                onNavigateToAdminEdit={onNavigateToAdminEdit}
                isExpanded={!!expandedMemberIds[member.id]}
                onToggleExpand={(e) => toggleExpand(member.id, e)}
              />
            ))}
          </div>
        ) : (
          <>
            {/* GENERATION I: Patriarch & Matriarch */}
            {gen1List.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between sticky top-20 bg-[#fef9ef]/95 backdrop-blur-md py-2 z-10 border-b border-[#e7e2d8]/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#7b5810]"></div>
                    <h2 className="font-display font-semibold text-base text-[#0d2419]">
                      Generation I
                    </h2>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ffdeaa] text-[#271900] font-bold">
                    Patriarch &amp; Matriarch
                  </span>
                </div>

                {gen1List.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onSelectMember={onSelectMember}
                    onOpenDossier={onOpenDossier}
                    onViewTree={onViewTree}
                    onOpenKinship={onOpenKinship}
                    onNavigateToAdminEdit={onNavigateToAdminEdit}
                    isExpanded={!!expandedMemberIds[member.id]}
                    onToggleExpand={(e) => toggleExpand(member.id, e)}
                  />
                ))}
              </section>
            )}

            {/* GENERATION II: Children */}
            {gen2List.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between sticky top-20 bg-[#fef9ef]/95 backdrop-blur-md py-2 z-10 border-b border-[#e7e2d8]/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#233a2e]"></div>
                    <h2 className="font-display font-semibold text-base text-[#0d2419]">
                      {language === 'ml' ? 'തലമുറ II' : 'Generation II'}
                    </h2>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ede8de] text-[#424844] font-bold">
                    {language === 'ml'
                      ? `ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തുവിന്റെ മക്കൾ (${gen2List.length})`
                      : `Children of Aayinikunnathth Maayan Kutty & Paathu (${gen2List.length})`}
                  </span>
                </div>

                {gen2List.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onSelectMember={onSelectMember}
                    onOpenDossier={onOpenDossier}
                    onViewTree={onViewTree}
                    onOpenKinship={onOpenKinship}
                    onNavigateToAdminEdit={onNavigateToAdminEdit}
                    isExpanded={!!expandedMemberIds[member.id]}
                    onToggleExpand={(e) => toggleExpand(member.id, e)}
                  />
                ))}
              </section>
            )}

            {/* GENERATION III & IV */}
            {gen3And4List.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between sticky top-20 bg-[#fef9ef]/95 backdrop-blur-md py-2 z-10 border-b border-[#e7e2d8]/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4c6456]"></div>
                    <h2 className="font-display font-semibold text-base text-[#0d2419]">
                      Generation III &amp; IV
                    </h2>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ede8de] text-[#424844] font-bold">
                    Descendants ({gen3And4List.length})
                  </span>
                </div>

                {gen3And4List.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onSelectMember={onSelectMember}
                    onOpenDossier={onOpenDossier}
                    onViewTree={onViewTree}
                    onOpenKinship={onOpenKinship}
                    onNavigateToAdminEdit={onNavigateToAdminEdit}
                    isExpanded={!!expandedMemberIds[member.id]}
                    onToggleExpand={(e) => toggleExpand(member.id, e)}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {/* Floating Alphabetical Quick Jump Side Scrub */}
      <aside className="fixed right-1 sm:right-3 top-36 hidden sm:flex flex-col items-center justify-center gap-0.5 bg-[#ede8de]/85 backdrop-blur-md py-2 px-1 rounded-full shadow-sm z-30 select-none border border-[#c2c8c2]/50">
        {Array.from(new Set(members.map((m) => m.firstName[0]?.toUpperCase()).filter(Boolean)))
          .sort()
          .map((letter) => (
            <button
              key={letter}
              onClick={() => setSearchQuery(letter)}
              className="text-[10px] font-bold text-[#0d2419] hover:text-[#7b5810] hover:scale-110 cursor-pointer py-0.5 px-1 transition-transform"
            >
              {letter}
            </button>
          ))}
      </aside>
    </div>
  );
};

// Reusable Sub-Component for Member Card in Directory
interface MemberCardProps {
  member: FamilyMember;
  onSelectMember: (member: FamilyMember) => void;
  onOpenDossier: (member: FamilyMember) => void;
  onViewTree?: (member: FamilyMember) => void;
  onOpenKinship?: (member: FamilyMember) => void;
  onNavigateToAdminEdit?: (member: FamilyMember) => void;
  isExpanded: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onSelectMember,
  onOpenDossier,
  onViewTree,
  onOpenKinship,
  onNavigateToAdminEdit,
  isExpanded,
  onToggleExpand,
}) => {
  const { language, t, getName, getRole, getBranch } = useLanguage();
  const isJulian = member.id === 'kasim';
  const hasExpandableChildren = (member.childrenCount || 0) > 0;

  return (
    <div
      onClick={() => onSelectMember(member)}
      className={`relative bg-white rounded-xl p-4 shadow-xs hover:shadow-md transition-all border ${
        isJulian
          ? 'border-[#ffdeaa] bg-gradient-to-r from-[#ffdeaa]/20 via-white to-white'
          : 'border-[#e7e2d8]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={
              member.avatarUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTeTGurBSbfgFFCZlmuHiYiCV2dklzswenq3bcmeqpqVPmkiWcLXsrOLnHR6D3kX3W8j0KIZLuC7jsS6IiO_4fcxHVCz3kOQzZR_04NQX2klxYVbU--PBMsVIZggBdJYNelxi5Y8eJSZb4MGS6PvzbkTW9evpsiYAliLRsHsSJ3X6R-CE2cnQWroVyJ--ho977JA0GIeoqLWDEye_ClxdVkPLVEMm6ewWhPGJIuAWd_vcdsjsBaY'
            }
            alt={member.firstName}
            className="w-14 h-14 rounded-xl object-cover shadow-xs bg-[#f2ede3]"
          />
          {member.role.toLowerCase().includes('patriarch') && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0d2419] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[12px]">lock</span>
            </span>
          )}
          {member.role.toLowerCase().includes('matriarch') && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0d2419] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[12px]">favorite</span>
            </span>
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] text-[#7b5810] font-bold uppercase tracking-wider">
              {member.generation === 1
                ? getRole(member)
                : language === 'ml'
                ? `തലമുറ ${member.generation}`
                : `Gen ${member.generation}`}
            </span>
            <span className="text-[11px] text-[#424844]">
              {member.isLiving
                ? `b. ${member.birthYear}`
                : `${member.birthYear} – ${member.deathYear}`}
            </span>
          </div>

          <div className="flex flex-col mt-0.5">
            <h3 className="font-display font-semibold text-sm sm:text-base text-[#0d2419] leading-snug break-words">
              {getName(member)}
            </h3>
            {member.id === 'mayan_kutty' && (
              <span className="text-xs font-semibold text-[#7b5810] mt-0.5 break-words">
                {language === 'ml'
                  ? `${member.firstName || 'Aayinikunnathth Maayan Kutty'} (കുടുംബ കാരണവർ)`
                  : `${member.firstNameMl || 'ആയിനികുന്നത്ത് മായൻ കുട്ടി'} (Patriarch)`}
              </span>
            )}
          </div>

          <span className="text-xs text-[#424844] flex items-center gap-1 mt-0.5 truncate">
            <span className="material-symbols-outlined text-[14px] text-[#7b5810]">
              family_history
            </span>
            <span className="truncate">{getRole(member)}</span>
          </span>
        </div>

        {hasExpandableChildren && (
          <button
            onClick={onToggleExpand}
            aria-label="Expand branches"
            className="p-1.5 rounded-lg text-[#0d2419] bg-[#f8f3e9] hover:bg-[#ede8de] transition-transform duration-200"
          >
            <span
              className={`material-symbols-outlined text-[20px] transition-transform ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            >
              expand_more
            </span>
          </button>
        )}
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-1">
        <span className="px-2 py-0.5 rounded-full bg-[#f2ede3] text-[#424844] text-[11px] flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-[#7b5810]">location_on</span>
          <span>{member.birthplace}</span>
        </span>
        {member.childrenCount !== undefined && member.childrenCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[#f2ede3] text-[#424844] text-[11px]">
            {member.childrenCount} {language === 'ml' ? 'മക്കൾ' : 'Children'}
          </span>
        )}
        <span className="px-2 py-0.5 rounded-full bg-[#ffdeaa] text-[#271900] text-[11px] font-semibold">
          {getBranch(member)}
        </span>
      </div>

      {/* Collapsible Descendant Lineage Preview */}
      {hasExpandableChildren && isExpanded && (
        <div className="pt-2 mt-2 border-t border-dashed border-[#c2c8c2]/50 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between bg-[#f8f3e9] p-2 rounded-lg">
            <span className="text-[#424844]">{language === 'ml' ? 'നേരിട്ടുള്ള പിൻതലമുറ:' : 'Direct Descendants:'}</span>
            <span className="font-bold text-[#0d2419]">
              {member.childrenCount || 0} {language === 'ml' ? 'മക്കൾ രേഖപ്പെടുത്തിയിട്ടുണ്ട്' : 'Children Registered'}
            </span>
          </div>
          <div className="flex items-center justify-between bg-[#f8f3e9] p-2 rounded-lg">
            <span className="text-[#424844]">{language === 'ml' ? 'കുടുംബ ശാഖ:' : 'Family Branch:'}</span>
            <span className="text-[#7b5810] font-bold">{getBranch(member)}</span>
          </div>
        </div>
      )}

      {/* Action Strip */}
      <div className="flex items-center justify-between pt-2.5 mt-2 bg-[#f8f3e9]/60 rounded-lg px-3 py-1.5 border border-[#e7e2d8]/60">
        <div className="flex items-center gap-1.5 text-[#424844] text-[11px]">
          <span className="material-symbols-outlined text-[15px] text-[#0d2419]">auto_stories</span>
          <span>{member.cataloguedRecordsCount} {language === 'ml' ? 'രേഖകൾ' : 'Records'}</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenKinship && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenKinship(member);
              }}
              className="text-xs text-[#7b5810] font-bold flex items-center gap-1 hover:text-[#0d2419] transition-colors py-1 px-2 rounded-md hover:bg-[#ede8de]"
              title={language === 'ml' ? 'ഈ വ്യക്തിയുമായുള്ള ബന്ധം കാണുക' : 'Check kinship with this person'}
            >
              <span className="material-symbols-outlined text-[15px]">diversity_1</span>
              <span className="hidden sm:inline">{language === 'ml' ? 'ബന്ധം' : 'Relation'}</span>
            </button>
          )}

          {onViewTree && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewTree(member);
              }}
              className="text-xs text-[#7b5810] font-bold flex items-center gap-1 hover:text-[#0d2419] transition-colors py-1 px-2 rounded-md hover:bg-[#ede8de] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">account_tree</span>
              <span>{t.viewTree}</span>
            </button>
          )}

          {onNavigateToAdminEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToAdminEdit(member);
              }}
              className="text-xs text-[#0d2419] font-bold flex items-center gap-1 bg-[#ede8de] hover:bg-[#0d2419] hover:text-[#fdcd7b] transition-all py-1 px-2.5 rounded-lg border border-[#c2c8c2] cursor-pointer active:scale-95 shadow-2xs"
              title={language === 'ml' ? 'അഡ്മിൻ പാനലിൽ വിവരങ്ങൾ തിരുത്തുക' : 'Edit profile in Admin panel'}
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              <span>{language === 'ml' ? 'തിരുത്തുക' : 'Edit'}</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDossier(member);
            }}
            className="text-xs text-[#0d2419] font-bold flex items-center gap-0.5 hover:text-[#7b5810] transition-colors py-1 px-2 rounded-md hover:bg-[#ede8de]"
          >
            <span>{t.viewDetails}</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
