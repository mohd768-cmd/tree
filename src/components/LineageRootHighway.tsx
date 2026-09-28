import React from 'react';
import { FamilyMember } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getAncestryPath } from '../utils/genealogy';

interface LineageRootHighwayProps {
  selectedMember: FamilyMember;
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  onGoToRoot: () => void;
}

export const LineageRootHighway: React.FC<LineageRootHighwayProps> = ({
  selectedMember,
  members,
  onSelectMember,
  onGoToRoot,
}) => {
  const { language, t, getShortName } = useLanguage();

  // Primary Patriarch & Matriarch
  const patriarch = members.find((m) => m.id === 'mayan_kutty') || members[0];
  const matriarch = members.find((m) => m.id === 'paathu');

  // Ancestry path from root down to selected member
  let path = getAncestryPath(selectedMember.id, members);

  // If member has no parents (like spouse Mammu or Mafeeda), connect through spouse
  if (path.length <= 1 && selectedMember.spouseId) {
    const spousePath = getAncestryPath(selectedMember.spouseId, members);
    if (spousePath.length > 0) {
      path = [...spousePath, selectedMember];
    }
  }

  // Ensure patriarch is at the root of the path if not already
  if (path.length > 0 && path[0].id !== patriarch.id && patriarch.id !== selectedMember.id) {
    path = [patriarch, ...path];
  }

  const isAtRoot = selectedMember.id === patriarch.id || selectedMember.id === matriarch?.id;

  // Eight branches of Mayan Kutty & Paathu
  const eightBranches = members.filter(
    (m) => m.generation === 2 && m.parentIds.includes('mayan_kutty')
  );

  return (
    <div className="w-full bg-white rounded-2xl p-4 md:p-5 border border-[#e7e2d8] shadow-xs mb-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e2d8]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0d2419] text-[#fdcd7b] flex items-center justify-center shadow-xs flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">account_tree</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-base md:text-lg text-[#0d2419] flex items-center gap-2">
              <span>{t.rootPath}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fdcd7b]/30 text-[#7b5810] uppercase tracking-wider">
                {language === 'ml' ? `തലമുറ ${selectedMember.generation}` : `Gen ${selectedMember.generation}`}
              </span>
            </h3>
            <p className="text-xs text-[#7b5810] font-medium">
              {language === 'ml'
                ? isAtRoot
                  ? 'കുടുംബത്തിന്റെ പ്രധാന വേരുകൾ: ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തു (8 ശാഖകളുടെ തുടക്കം)'
                  : `${getShortName(selectedMember)}-ലേക്ക് എത്തുന്ന കുടുംബ വേരുകൾ:`
                : isAtRoot
                ? 'Primary Family Roots: Aayinikunnathth Maayan Kutty & Paathu (Founders of the 8 Branches)'
                : `Direct ancestry route to ${getShortName(selectedMember)}:`}
            </p>
          </div>
        </div>

        {/* Reset to Root Button */}
        {!isAtRoot && (
          <button
            onClick={onGoToRoot}
            className="w-full sm:w-auto justify-center sm:justify-start px-3.5 py-2 sm:py-1.5 rounded-xl bg-[#f8f3e9] text-[#0d2419] hover:bg-[#ede8de] active:scale-95 text-xs font-bold flex items-center gap-1.5 transition-all border border-[#e7e2d8] shadow-xs min-h-[38px]"
            title={t.goToRoot}
          >
            <span className="material-symbols-outlined text-[16px] text-[#7b5810]">vertical_align_top</span>
            <span>{t.goToRoot}</span>
          </button>
        )}
      </div>

      {/* Visual Step-by-Step Route */}
      <div className="py-3">
        {isAtRoot ? (
          <div className="bg-[#fcfaf6] p-3.5 rounded-xl border border-[#e7e2d8] flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={patriarch.avatarUrl}
                alt={patriarch.firstName}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#7b5810]/40"
              />
              <div>
                <span className="text-xs font-bold uppercase text-[#7b5810] tracking-wider block">
                  {language === 'ml' ? 'കുടുംബ കാരണവർ (പ്രധാന വേര്)' : 'Patriarch & Root Founder'}
                </span>
                <span className="font-display font-bold text-sm sm:text-base text-[#0d2419] block">
                  {language === 'ml' ? 'ആയിനികുന്നത്ത് മായൻ കുട്ടി & പാത്തു' : 'Aayinikunnathth Maayan Kutty & Paathu'}
                </span>
                <span className="text-[11px] font-semibold text-[#7b5810] block">
                  {language === 'ml'
                    ? 'പൂർണ്ണ നാമം: Aayinikunnathth Maayan Kutty'
                    : 'Patriarch Full Name: Aayinikunnathth Maayan Kutty'}
                </span>
                <p className="text-xs text-[#424844] mt-0.5">
                  {language === 'ml'
                    ? '1928-ൽ സ്ഥാപിതമായ കുടുംബത്തിന്റെ മൂലവേര്. ഇവരിൽ നിന്നാണ് താഴെ കാണുന്ന 8 മക്കളും അവരുടെ കുടുംബ ശാഖകളും രൂപപ്പെട്ടത്.'
                    : 'The foundational roots of the family established in 1928, giving rise to all 8 sibling branches and subsequent generations.'}
                </p>
              </div>
            </div>

            {matriarch && (
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#e7e2d8]">
                <img
                  src={matriarch.avatarUrl}
                  alt={matriarch.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-[#0d2419]">
                  {language === 'ml' ? 'മാതാവ് പാത്തു' : 'Paathu (Matriarch)'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {path.map((member, idx) => {
              const isSelected = member.id === selectedMember.id;
              const isFirst = idx === 0;
              const spouse = member.spouseId ? members.find((m) => m.id === member.spouseId) : null;

              return (
                <React.Fragment key={member.id}>
                  {idx > 0 && (
                    <div className="flex items-center text-[#7b5810] flex-shrink-0 px-1">
                      <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
                    </div>
                  )}

                  <button
                    onClick={() => onSelectMember(member)}
                    className={`flex-shrink-0 flex items-center gap-2.5 p-2 pr-3 rounded-xl border text-left transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#0d2419] text-white border-[#0d2419] shadow-sm ring-2 ring-[#fdcd7b]'
                        : 'bg-[#faf7f0] text-[#0d2419] border-[#e7e2d8] hover:bg-[#ede8de]'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={member.avatarUrl}
                        alt={member.firstName}
                        className="w-10 h-10 rounded-lg object-cover bg-white"
                      />
                      <span
                        className={`absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full ${
                          isSelected ? 'bg-[#fdcd7b] text-[#78550d]' : 'bg-[#0d2419] text-white'
                        }`}
                      >
                        G{member.generation}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`font-display font-bold text-xs ${member.id === 'mayan_kutty' ? 'whitespace-nowrap' : 'truncate max-w-[130px]'}`}>
                          {getShortName(member)}
                        </span>
                        {spouse && (
                          <span className={`text-[10px] truncate max-w-[90px] ${isSelected ? 'text-[#fdcd7b]' : 'text-[#7b5810]'}`}>
                            &amp; {getShortName(spouse)}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] block truncate max-w-[140px] ${
                          isSelected ? 'text-[#fdcd7b]' : 'text-[#7b5810] font-medium'
                        }`}
                      >
                        {isFirst
                          ? language === 'ml'
                            ? 'പ്രധാന വേര് (തലമുറ 1)'
                            : 'Root Founders (Gen 1)'
                          : member.generation === 2
                          ? language === 'ml'
                            ? 'ശാഖ (തലമുറ 2)'
                            : 'Branch (Gen 2)'
                          : member.generation === 3
                          ? language === 'ml'
                            ? 'തലമുറ 3'
                            : 'Gen 3'
                          : language === 'ml'
                          ? 'നാലാം തലമുറ (പേരക്കുട്ടി)'
                          : 'Gen 4 (Great-Grandchild)'}
                      </span>
                    </div>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Eight Branches Quick Access Rail */}
      <div className="pt-2.5 border-t border-[#e7e2d8]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-[#7b5810] flex-shrink-0 mr-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">park</span>
          <span>{language === 'ml' ? '8 ശാഖകൾ:' : '8 Branches:'}</span>
        </span>

        {eightBranches.map((branchMember) => {
          const isCurrentBranch =
            selectedMember.branch === branchMember.branch || selectedMember.id === branchMember.id;
          const spouse = branchMember.spouseId ? members.find((m) => m.id === branchMember.spouseId) : null;

          return (
            <button
              key={branchMember.id}
              onClick={() => onSelectMember(branchMember)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
                isCurrentBranch
                  ? 'bg-[#0d2419] text-[#fdcd7b] font-bold shadow-xs'
                  : 'bg-[#f4efe4] text-[#424844] hover:bg-[#ede8de]'
              }`}
            >
              <span>{getShortName(branchMember)}</span>
              {spouse && <span className="text-[10px] opacity-80">&amp; {getShortName(spouse)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
