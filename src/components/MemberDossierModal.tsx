import React from 'react';
import { FamilyMember, ArchivalDocument } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MemberDossierModalProps {
  member: FamilyMember | null;
  allMembers: FamilyMember[];
  documents: ArchivalDocument[];
  onClose: () => void;
  onSelectRelative: (relative: FamilyMember) => void;
  onEditInAdmin: (member: FamilyMember) => void;
  onViewTree?: (member: FamilyMember) => void;
  onOpenKinship?: (member: FamilyMember) => void;
}

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTeTGurBSbfgFFCZlmuHiYiCV2dklzswenq3bcmeqpqVPmkiWcLXsrOLnHR6D3kX3W8j0KIZLuC7jsS6IiO_4fcxHVCz3kOQzZR_04NQX2klxYVbU--PBMsVIZggBdJYNelxi5Y8eJSZb4MGS6PvzbkTW9evpsiYAliLRsHsSJ3X6R-CE2cnQWroVyJ--ho977JA0GIeoqLWDEye_ClxdVkPLVEMm6ewWhPGJIuAWd_vcdsjsBaY';

export const MemberDossierModal: React.FC<MemberDossierModalProps> = ({
  member,
  allMembers,
  documents,
  onClose,
  onSelectRelative,
  onEditInAdmin,
  onViewTree,
  onOpenKinship,
}) => {
  const { language, t, getName, getShortName, getRole, getBranch } = useLanguage();
  if (!member) return null;

  const parents = allMembers.filter((m) => member.parentIds?.includes(m.id));
  const children = allMembers.filter((m) => m.parentIds?.includes(member.id));
  const spouse = member.spouseId
    ? allMembers.find((m) => m.id === member.spouseId)
    : member.spouseName
    ? { firstName: member.spouseName, lastName: '', id: 'spouse_temp' }
    : null;

  const memberDocs = documents.filter(
    (d) => d.memberId === member.id || (d.memberName && d.memberName.includes(member.firstName))
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#1d1c16]/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-xl bg-[#fef9ef] rounded-2xl shadow-2xl border border-[#e7e2d8] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="bg-[#0d2419] text-white p-4 flex items-center justify-between relative overflow-hidden flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#fdcd7b] text-[20px]">
              local_library
            </span>
            <div>
              <span className="text-[10px] text-[#b2cdbc] uppercase font-bold tracking-widest block leading-none">
                {language === 'ml' ? 'കുടുംബാംഗ ചരിത്ര രേഖ' : 'Archival Lineage Dossier'}
              </span>
              <h2 className="font-display text-base sm:text-lg font-bold text-white mt-1 leading-tight">
                {getName(member)}
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

        {/* Scrollable Dossier Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-xs sm:text-sm">
          {/* Top Profile Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white p-4 rounded-xl border border-[#e7e2d8] shadow-xs">
            <div className="relative flex-shrink-0">
              <img
                src={member.avatarUrl || DEFAULT_AVATAR}
                alt={member.firstName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-sm bg-[#f2ede3] border border-[#e7e2d8]"
              />
              <span className="absolute -bottom-2 right-1 bg-[#0d2419] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {language === 'ml' ? `തലമുറ ${member.generation}` : `Gen ${member.generation}`}
              </span>
            </div>

            <div className="flex flex-col text-center sm:text-left min-w-0 flex-1">
              <span className="text-[11px] text-[#7b5810] font-bold uppercase tracking-wider">
                {getRole(member)}
              </span>
              <h3 className="font-display font-bold text-lg sm:text-xl text-[#0d2419] mt-0.5 break-words">
                {member.id === 'mayan_kutty' ? (
                  <div>
                    <span className="block text-lg sm:text-2xl font-extrabold text-[#0d2419]">
                      {language === 'ml' ? 'ആയിനികുന്നത്ത് മായൻ കുട്ടി' : 'Aayinikunnathth Maayan Kutty'}
                    </span>
                    <span className="block text-xs sm:text-sm text-[#7b5810] font-bold mt-1">
                      {language === 'ml'
                        ? 'പൂർണ്ണ നാമം: Aayinikunnathth Maayan Kutty (കുടുംബ കാരണവർ)'
                        : 'Full Name: Aayinikunnathth Maayan Kutty (Patriarch)'}
                    </span>
                  </div>
                ) : (
                  <>
                    {getName(member)}
                    {member.maidenName && (
                      <span className="text-xs font-normal text-[#727974] ml-1.5">
                        (née {member.maidenName})
                      </span>
                    )}
                  </>
                )}
              </h3>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-1 text-xs text-[#424844]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#7b5810]">
                    calendar_today
                  </span>
                  <span>
                    {member.isLiving
                      ? `b. ${member.birthYear} (Living)`
                      : `${member.birthYear} – ${member.deathYear || 'Unknown'}`}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#7b5810]">
                    location_on
                  </span>
                  <span>{member.birthplace}</span>
                </span>
              </div>

              {member.tradeOrProfession && (
                <div className="mt-2 text-[11px] text-[#0d2419] font-medium bg-[#f8f3e9] px-2.5 py-1 rounded-md border border-[#e7e2d8] inline-flex items-center gap-1 self-center sm:self-start">
                  <span className="material-symbols-outlined text-[13px] text-[#7b5810]">
                    work_outline
                  </span>
                  <span>{member.tradeOrProfession}</span>
                </div>
              )}
            </div>
          </div>

          {/* Biography */}
          <div className="bg-white p-4 rounded-xl border border-[#e7e2d8] shadow-xs flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b5810] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">history_edu</span>
              Historical Biography
            </span>
            <p className="text-xs sm:text-sm text-[#1d1c16] leading-relaxed">
              {member.bio}
            </p>
          </div>

          {/* Family Kinship Connections */}
          <div className="bg-white p-4 rounded-xl border border-[#e7e2d8] shadow-xs flex flex-col gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b5810] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">family_restroom</span>
              Verified Lineage Ties
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Parents */}
              <div className="p-2.5 bg-[#f8f3e9] rounded-lg border border-[#e7e2d8] flex flex-col gap-1">
                <span className="text-[10px] text-[#727974] font-bold uppercase">Parents</span>
                {parents.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {parents.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onSelectRelative(p)}
                        className="text-left font-semibold text-[#0d2419] hover:text-[#7b5810] flex items-start gap-1 break-words"
                      >
                        <span className="material-symbols-outlined text-[14px] flex-shrink-0 mt-0.5">arrow_outward</span>
                        <span className="break-words leading-tight">{getName(p)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-[#727974] italic">Root Ancestor (Origin)</span>
                )}
              </div>

              {/* Spouse */}
              <div className="p-2.5 bg-[#f8f3e9] rounded-lg border border-[#e7e2d8] flex flex-col gap-1">
                <span className="text-[10px] text-[#727974] font-bold uppercase">Spouse / Partner</span>
                {spouse ? (
                  <div className="font-semibold text-[#0d2419] flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[14px] text-[#fdcd7b]">
                      favorite
                    </span>
                    <span className="truncate">{[spouse.firstName, spouse.lastName].filter(Boolean).join(' ')}</span>
                  </div>
                ) : (
                  <span className="text-[#727974] italic">None recorded</span>
                )}
              </div>
            </div>

            {/* Descendants / Children */}
            {children.length > 0 && (
              <div className="p-2.5 bg-[#f8f3e9] rounded-lg border border-[#e7e2d8] flex flex-col gap-1.5">
                <span className="text-[10px] text-[#727974] font-bold uppercase">
                  Children &amp; Descendants ({children.length})
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onSelectRelative(child)}
                      className="p-1.5 bg-white rounded text-left font-semibold text-[#0d2419] hover:text-[#7b5810] flex items-center gap-1.5 border border-[#e7e2d8] truncate"
                    >
                      <img
                        src={child.avatarUrl || DEFAULT_AVATAR}
                        alt={child.firstName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="truncate text-xs">{child.firstName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Catalogued Documents / Heirlooms */}
          {memberDocs.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-[#e7e2d8] shadow-xs flex flex-col gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7b5810] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                Associated Archival Records ({memberDocs.length})
              </span>

              <div className="space-y-2">
                {memberDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-lg bg-[#f8f3e9] border border-[#e7e2d8] flex items-center gap-3"
                  >
                    <img
                      src={doc.previewUrl}
                      alt={doc.title}
                      className="w-12 h-12 rounded object-cover border border-[#c2c8c2] flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-xs text-[#0d2419] truncate">
                        {doc.title}
                      </span>
                      <span className="text-[10px] text-[#727974]">{doc.archiveLocation}</span>
                      <span className="text-[10px] text-[#424844] line-clamp-1">{doc.notes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-3 sm:p-4 bg-[#f2ede3] border-t border-[#e7e2d8] flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {onViewTree && (
              <button
                onClick={() => {
                  onViewTree(member);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#0d2419] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#233a2e] active:scale-95 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px] text-[#fdcd7b]">
                  account_tree
                </span>
                <span>{language === 'ml' ? 'ട്രീ കാണുക' : 'View Their Tree'}</span>
              </button>
            )}

            {onOpenKinship && (
              <button
                onClick={() => {
                  onClose();
                  onOpenKinship(member);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#fdcd7b] text-[#78550d] font-bold text-xs flex items-center gap-1.5 hover:bg-[#fcc362] active:scale-95 shadow-2xs"
                title={language === 'ml' ? 'മറ്റൊരു വ്യക്തിയുമായുള്ള ബന്ധം കാണുക' : 'See relation with another member'}
              >
                <span className="material-symbols-outlined text-[16px]">diversity_1</span>
                <span>{language === 'ml' ? 'ബന്ധം കാണുക' : 'See Relation'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onEditInAdmin(member);
              }}
              className="px-3.5 py-2 rounded-xl bg-white text-[#0d2419] font-bold text-xs flex items-center gap-1.5 border border-[#e7e2d8] hover:bg-[#ede8de] active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-[#7b5810]">
                edit_note
              </span>
              <span>{language === 'ml' ? 'തിരുത്തുക' : 'Admin Edit'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#ede8de] text-[#0d2419] font-bold text-xs hover:bg-[#e7e2d8] active:scale-95 ml-auto"
          >
            {language === 'ml' ? 'അടയ്ക്കുക' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
