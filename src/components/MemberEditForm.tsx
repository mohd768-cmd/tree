import React from 'react';
import { FamilyMember } from '../types';

export interface MemberEditFormProps {
  activeEditingMember: FamilyMember | null;
  members: FamilyMember[];
  language: 'en' | 'ml';
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  firstNameMl: string;
  setFirstNameMl: (val: string) => void;
  lastNameMl: string;
  setLastNameMl: (val: string) => void;
  maidenName: string;
  setMaidenName: (val: string) => void;
  generation: number;
  setGeneration: (val: number) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  birthplace: string;
  setBirthplace: (val: string) => void;
  isLiving: boolean;
  setIsLiving: (val: boolean) => void;
  role: string;
  setRole: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  fatherId: string;
  setFatherId: (val: string) => void;
  motherId: string;
  setMotherId: (val: string) => void;
  spouseIds: string[];
  setSpouseIds: React.Dispatch<React.SetStateAction<string[]>>;
  avatarUrl: string;
  setAvatarUrl: (val: string) => void;
  isCreatingWife: boolean;
  setIsCreatingWife: (val: boolean) => void;
  isCreatingParent: 'father' | 'mother' | null;
  setIsCreatingParent: (val: 'father' | 'mother' | null) => void;
  newParentName: string;
  setNewParentName: (val: string) => void;
  newParentNameMl: string;
  setNewParentNameMl: (val: string) => void;
  newParentBirthYear: number;
  setNewParentBirthYear: (val: number) => void;
  newWifeName: string;
  setNewWifeName: (val: string) => void;
  newWifeNameMl: string;
  setNewWifeNameMl: (val: string) => void;
  newWifeBirthYear: number;
  setNewWifeBirthYear: (val: number) => void;
  selectedSpouseToLink: string;
  setSelectedSpouseToLink: (val: string) => void;
  handleCreateAndLinkParent: () => void;
  handleCreateAndLinkWife: () => void;
  handleLinkExistingSpouse: () => void;
  handleRemoveWife: (sId: string) => void;
  getName: (member: FamilyMember) => string;
  isSaving: boolean;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const MemberEditForm: React.FC<MemberEditFormProps> = ({
  activeEditingMember,
  members,
  language,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  firstNameMl,
  setFirstNameMl,
  lastNameMl,
  setLastNameMl,
  maidenName,
  setMaidenName,
  generation,
  setGeneration,
  birthDate,
  setBirthDate,
  birthplace,
  setBirthplace,
  isLiving,
  setIsLiving,
  role,
  setRole,
  bio,
  setBio,
  fatherId,
  setFatherId,
  motherId,
  setMotherId,
  spouseIds,
  avatarUrl,
  setAvatarUrl,
  isCreatingWife,
  setIsCreatingWife,
  isCreatingParent,
  setIsCreatingParent,
  newParentName,
  setNewParentName,
  newParentNameMl,
  setNewParentNameMl,
  newParentBirthYear,
  setNewParentBirthYear,
  newWifeName,
  setNewWifeName,
  newWifeNameMl,
  setNewWifeNameMl,
  newWifeBirthYear,
  setNewWifeBirthYear,
  selectedSpouseToLink,
  setSelectedSpouseToLink,
  handleCreateAndLinkParent,
  handleCreateAndLinkWife,
  handleLinkExistingSpouse,
  handleRemoveWife,
  getName,
  isSaving,
  onSave,
  onClose,
}) => {
  return (
    <section className="flex flex-col bg-white rounded-3xl p-5 sm:p-7 shadow-xl gap-4 border-2 border-[#fdcd7b] animate-fade-in relative z-20">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0d2419] text-[#fdcd7b] flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[20px]">
              {activeEditingMember ? 'edit_note' : 'person_add'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-display font-bold text-base sm:text-lg text-[#0d2419]">
                {activeEditingMember
                  ? `${language === 'ml' ? 'വിവരങ്ങൾ തിരുത്തുക: ' : 'Edit Profile: '} ${firstName} ${lastName}`
                  : (language === 'ml' ? 'പുതിയ വ്യക്തിയെ ചേർക്കുക' : 'Add New Member Record')}
              </h3>
            </div>
            <p className="text-xs text-[#727974] mt-0.5">
              {activeEditingMember
                ? `Node ID: ${activeEditingMember.id} • Gen ${generation} • Changes persist to Vercel Cloud`
                : 'Create node and link directly into family tree & cloud storage'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-[#424844] hover:text-[#0d2419] p-2 rounded-full hover:bg-[#f2ede3] transition-colors cursor-pointer"
          title="Close Form"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>

      <form onSubmit={onSave} className="flex flex-col gap-4">
        {/* Photo Slot */}
        <div className="flex items-center gap-3 bg-[#f8f3e9] p-3 rounded-2xl border border-[#e7e2d8]">
          <div className="w-16 h-16 rounded-xl bg-[#e7e2d8] flex flex-col items-center justify-center overflow-hidden relative group border border-[#c2c8c2] flex-shrink-0">
            <img
              src={avatarUrl}
              alt="Archival Portrait"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="text-xs font-bold text-[#0d2419]">Archival Portrait Photo</span>
            <span className="text-[11px] text-[#424844] truncate">
              Avatar linked with historical family archive
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={() =>
                  setAvatarUrl(
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCSaXdM2kbGewFpd6dQZwaJ8H_vHPu4JJNIrGySmYM-4m4heoUvNPQ2iTuVX1-hDEZpyduBPaMduzyp2tWBwWwYmVfKdzy8seUaG4UG8SlmbC_MLZ37UyGxojRTGFcIoSzpEA4g1zcHpPD-9goYKagtO7f2x4XA7XsOkT5qTmOGXf1qUnjHK_BW4yzYNoO6xorQiST_6naKN0snlpSw4zMle90q6LExun0ZXqGrfp53GJtUaWFtXTY'
                  )
                }
                className="bg-[#ede8de] text-[#0d2419] text-[10px] font-bold px-2 py-0.5 rounded hover:bg-[#0d2419] hover:text-white transition-colors cursor-pointer"
              >
                Select Preset Photo
              </button>
              <input
                type="text"
                placeholder="Or paste image URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="flex-1 bg-white px-2 py-0.5 rounded text-[10px] border border-[#d6cfbe]"
              />
            </div>
          </div>
        </div>

        {/* Field Grids: English & Malayalam Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#424844]">
              First Name (English) *
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-[#f8f3e9] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c16] border border-[#e7e2d8] focus:border-[#0d2419] focus:outline-none focus:ring-1 focus:ring-[#7b5810]"
              placeholder="e.g. Kasim, Mayan Kutty, Moosa"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#7b5810]">
              മലയാളം പേര് (Malayalam Name)
            </label>
            <input
              type="text"
              value={firstNameMl}
              onChange={(e) => setFirstNameMl(e.target.value)}
              className="bg-[#f8f3e9] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c16] border border-[#e7e2d8] focus:border-[#0d2419] focus:outline-none focus:ring-1 focus:ring-[#7b5810]"
              placeholder="ഉദാ: കാസിം, മായൻ കുട്ടി, മൂസ"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#424844]">
              Last / Surname (Optional)
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-[#f8f3e9] px-3.5 py-2 rounded-xl text-xs text-[#1d1c16] border border-[#e7e2d8] focus:border-[#0d2419] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#424844]">
              Maiden Name / House Name (Optional)
            </label>
            <input
              type="text"
              value={maidenName}
              onChange={(e) => setMaidenName(e.target.value)}
              placeholder="e.g. Aayinikunnathth House"
              className="bg-[#f8f3e9] px-3.5 py-2 rounded-xl text-xs text-[#1d1c16] border border-[#e7e2d8] focus:border-[#0d2419] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#424844]">
              Generation Level
            </label>
            <select
              value={generation}
              onChange={(e) => setGeneration(Number(e.target.value))}
              className="bg-[#f8f3e9] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c16] border border-[#e7e2d8] focus:border-[#0d2419] focus:outline-none"
            >
              <option value={1}>Gen 1 (Patriarch/Matriarch)</option>
              <option value={2}>Gen 2 (Heir / Child)</option>
              <option value={3}>Gen 3 (Grandchild)</option>
              <option value={4}>Gen 4 (Great-Grandchild)</option>
              <option value={5}>Gen 5 (Next Generation)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#424844]">
              Birth Date / Year
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-[#f8f3e9] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c16] border border-[#e7e2d8] focus:border-[#0d2419] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#424844]">
              Birth Location
            </label>
            <input
              type="text"
              value={birthplace}
              onChange={(e) => setBirthplace(e.target.value)}
              className="bg-[#f8f3e9] px-3.5 py-2 rounded-xl text-xs text-[#1d1c16] border border-[#e7e2d8] focus:border-[#0d2419] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#f8f3e9] rounded-xl border border-[#e7e2d8]">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="livingCheck"
                checked={isLiving}
                onChange={(e) => setIsLiving(e.target.checked)}
                className="accent-[#0d2419] w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="livingCheck" className="text-xs font-semibold text-[#0d2419] cursor-pointer">
                Living Family Member
              </label>
            </div>
            <span className="text-[10px] text-[#424844]">Hides death date</span>
          </div>
        </div>

        {/* CORE KINSHIP SECTION: FATHER, MOTHER, WIVES */}
        <div className="flex flex-col gap-3 bg-[#fbf8f0] p-4 rounded-2xl border-2 border-[#7b5810]/30 shadow-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#e7e2d8]">
            <div>
              <h4 className="font-display text-sm font-bold text-[#0d2419] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#7b5810]">family_restroom</span>
                <span>{language === 'ml' ? 'മാതാപിതാക്കളും ഭാര്യമാരും' : 'Parentage & Spouses'}</span>
              </h4>
              <p className="text-[11px] text-[#727974]">
                {language === 'ml'
                  ? 'പിതാവ്, മാതാവ്, ഭാര്യമാർ എന്നിവരെ ചേർക്കുക. ഒന്നിൽ കൂടുതൽ ഭാര്യമാരെ ചേർക്കാം.'
                  : 'Link Father, Mother, and Wives. Supports multiple wives & quick creation.'}
              </p>
            </div>
          </div>

          {/* 1. FATHER SECTION */}
          <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-[#e7e2d8]">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#0d2419] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#7b5810]">man</span>
                <span>{language === 'ml' ? 'പിതാവ് (Father / ഉപ്പ):' : 'Father (പിതാവ്):'}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingParent(isCreatingParent === 'father' ? null : 'father')}
                className="text-[11px] font-bold text-[#7b5810] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">add_circle</span>
                <span>{isCreatingParent === 'father' ? 'Cancel' : (language === 'ml' ? 'ലിസ്റ്റിലില്ലെങ്കിൽ പിതാവിനെ ചേർക്കുക' : '+ Create Father if not in list')}</span>
              </button>
            </div>

            <select
              value={fatherId}
              onChange={(e) => setFatherId(e.target.value)}
              className="bg-[#f8f3e9] px-3 py-2 rounded-lg text-xs text-[#1d1c16] border border-[#d6cfbe] focus:outline-none focus:ring-1 focus:ring-[#7b5810]"
            >
              <option value="">{language === 'ml' ? '-- പിതാവില്ല (Root / അജ്ഞാതം) --' : '-- No Father Linked (Root / Unknown) --'}</option>
              {members
                .filter((m) => !activeEditingMember || m.id !== activeEditingMember.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {getName(m)} (Gen {m.generation} • {m.role})
                  </option>
                ))}
            </select>

            {/* Inline Quick Create Father Drawer */}
            {isCreatingParent === 'father' && (
              <div className="mt-2 p-3 bg-[#f5ede0] rounded-xl border border-[#d6cfbe] space-y-2">
                <span className="text-[11px] font-bold text-[#7b5810] uppercase tracking-wider block">
                  {language === 'ml' ? 'പുതിയ പിതാവിനെ ചേർക്കുക:' : 'Quick Create Father:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Father Name (English) e.g. Aayinikunnathth Maayan Kutty"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    className="bg-white px-2.5 py-1.5 rounded-lg text-xs border border-[#d6cfbe]"
                  />
                  <input
                    type="text"
                    placeholder="മലയാളം പേര് (ഉദാ: ആയിനികുന്നത്ത് മായൻ കുട്ടി)"
                    value={newParentNameMl}
                    onChange={(e) => setNewParentNameMl(e.target.value)}
                    className="bg-white px-2.5 py-1.5 rounded-lg text-xs border border-[#d6cfbe]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-[#424844]">Birth Year:</label>
                    <input
                      type="number"
                      value={newParentBirthYear}
                      onChange={(e) => setNewParentBirthYear(Number(e.target.value))}
                      className="bg-white px-2 py-1 rounded-lg text-xs w-20 border border-[#d6cfbe]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateAndLinkParent}
                    className="px-3 py-1 bg-[#0d2419] text-white text-xs font-bold rounded-lg hover:bg-[#1b3a2a] cursor-pointer"
                  >
                    {language === 'ml' ? 'പിതാവിനെ സൂക്ഷിക്കുക' : 'Save & Link Father'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. MOTHER SECTION */}
          <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-[#e7e2d8]">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#0d2419] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#7b5810]">woman</span>
                <span>{language === 'ml' ? 'മാതാവ് (Mother / ഉമ്മ):' : 'Mother (മാതാവ്):'}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingParent(isCreatingParent === 'mother' ? null : 'mother')}
                className="text-[11px] font-bold text-[#7b5810] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">add_circle</span>
                <span>{isCreatingParent === 'mother' ? 'Cancel' : (language === 'ml' ? 'ലിസ്റ്റിലില്ലെങ്കിൽ മാതാവിനെ ചേർക്കുക' : '+ Create Mother if not in list')}</span>
              </button>
            </div>

            <select
              value={motherId}
              onChange={(e) => setMotherId(e.target.value)}
              className="bg-[#f8f3e9] px-3 py-2 rounded-lg text-xs text-[#1d1c16] border border-[#d6cfbe] focus:outline-none focus:ring-1 focus:ring-[#7b5810]"
            >
              <option value="">{language === 'ml' ? '-- മാതാവില്ല (Root / അജ്ഞാതം) --' : '-- No Mother Linked (Root / Unknown) --'}</option>
              {members
                .filter((m) => !activeEditingMember || m.id !== activeEditingMember.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {getName(m)} (Gen {m.generation} • {m.role})
                  </option>
                ))}
            </select>

            {/* Inline Quick Create Mother Drawer */}
            {isCreatingParent === 'mother' && (
              <div className="mt-2 p-3 bg-[#f5ede0] rounded-xl border border-[#d6cfbe] space-y-2">
                <span className="text-[11px] font-bold text-[#7b5810] uppercase tracking-wider block">
                  {language === 'ml' ? 'പുതിയ മാതാവിനെ ചേർക്കുക:' : 'Quick Create Mother:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Mother Name (English) e.g. Paathu"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    className="bg-white px-2.5 py-1.5 rounded-lg text-xs border border-[#d6cfbe]"
                  />
                  <input
                    type="text"
                    placeholder="മലയാളം പേര് (ഉദാ: പാത്തു)"
                    value={newParentNameMl}
                    onChange={(e) => setNewParentNameMl(e.target.value)}
                    className="bg-white px-2.5 py-1.5 rounded-lg text-xs border border-[#d6cfbe]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-[#424844]">Birth Year:</label>
                    <input
                      type="number"
                      value={newParentBirthYear}
                      onChange={(e) => setNewParentBirthYear(Number(e.target.value))}
                      className="bg-white px-2 py-1 rounded-lg text-xs w-20 border border-[#d6cfbe]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateAndLinkParent}
                    className="px-3 py-1 bg-[#0d2419] text-white text-xs font-bold rounded-lg hover:bg-[#1b3a2a] cursor-pointer"
                  >
                    {language === 'ml' ? 'മാതാവിനെ സൂക്ഷിക്കുക' : 'Save & Link Mother'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. WIFE / SPOUSES SECTION (SUPPORTS MULTIPLE WIVES & CREATE WIFE IF NOT THERE) */}
          <div className="flex flex-col gap-2.5 bg-white p-3.5 rounded-xl border-2 border-[#e04f64]/20">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#e04f64]">favorite</span>
                <label className="text-xs text-[#0d2419] font-bold">
                  {language === 'ml' ? 'ഭാര്യമാർ / പങ്കാളികൾ (Wives / Spouses)' : 'Wives / Spouses (ഭാര്യമാർ)'}
                </label>
                <span className="px-2 py-0.5 rounded-full bg-[#fdcd7b] text-[#78550d] text-[10px] font-bold">
                  {spouseIds.length} {language === 'ml' ? 'ഭാര്യമാർ' : 'Linked'}
                </span>
              </div>

              {/* PROMINENT CREATE WIFE BUTTON */}
              <button
                type="button"
                onClick={() => setIsCreatingWife(!isCreatingWife)}
                className="px-3 py-1.5 rounded-lg bg-[#0d2419] text-white hover:bg-[#1b3a2a] text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isCreatingWife ? 'close' : 'person_add'}
                </span>
                <span>
                  {isCreatingWife
                    ? (language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel')
                    : (language === 'ml' ? '+ പുതിയ ഭാര്യയെ ചേർക്കുക' : '+ Create New Wife')}
                </span>
              </button>
            </div>

            <p className="text-[11px] text-[#727974]">
              {language === 'ml'
                ? 'ഭാര്യ ലിസ്റ്റിലില്ലെങ്കിൽ മുകളിലെ ബട്ടൺ ഉപയോഗിച്ച് പുതിയ ഭാര്യയെ ഉണ്ടാക്കാം. ഒന്നിൽ കൂടുതൽ ഭാര്യമാരെയും ചേർക്കാം.'
                : 'If wife is not in list, use "+ Create New Wife". You can create/link more than one wife.'}
            </p>

            {/* Currently Linked Wives List */}
            {spouseIds.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {spouseIds.map((sId, index) => {
                  const wifeObj = members.find((m) => m.id === sId);
                  return (
                    <div
                      key={sId}
                      className="flex items-center justify-between bg-[#fbf3f5] p-2.5 rounded-lg border border-[#f0c5ce]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#e04f64] text-white text-[11px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-[#0d2419] block">
                            {wifeObj ? getName(wifeObj) : sId}
                          </span>
                          <span className="text-[10px] text-[#727974]">
                            {language === 'ml' ? `ഭാര്യ ${index + 1}` : `Wife ${index + 1}`}
                            {wifeObj?.birthYear ? ` • ജനനം ${wifeObj.birthYear}` : ''}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveWife(sId)}
                        className="text-xs text-[#ba1a1a] hover:bg-[#ffdad6] px-2 py-1 rounded font-semibold flex items-center gap-0.5 cursor-pointer"
                        title="Remove this wife"
                      >
                        <span className="material-symbols-outlined text-[14px]">remove_circle</span>
                        <span>{language === 'ml' ? 'ഒഴിവാക്കുക' : 'Remove'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-2.5 bg-[#f8f3e9] rounded-lg text-center text-xs text-[#727974] border border-dashed border-[#d6cfbe]">
                {language === 'ml'
                  ? 'നിലവിൽ ഭാര്യമാരെ ചേർത്തിട്ടില്ല. താഴെയുള്ള ലിസ്റ്റിൽ നിന്ന് തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ "+ പുതിയ ഭാര്യയെ ചേർക്കുക" ക്ലിക്ക് ചെയ്യുക.'
                  : 'No wives currently linked. Select an existing member below or click "+ Create New Wife".'}
              </div>
            )}

            {/* Link Existing Member as Wife Drawer */}
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedSpouseToLink}
                onChange={(e) => setSelectedSpouseToLink(e.target.value)}
                className="flex-1 bg-[#f8f3e9] px-2.5 py-1.5 rounded-lg text-xs text-[#1d1c16] border border-[#d6cfbe]"
              >
                <option value="">{language === 'ml' ? '-- നിലവിലുള്ള അംഗങ്ങളിൽ നിന്ന് ഭാര്യയെ തിരഞ്ഞെടുക്കുക --' : '-- Select Existing Member as Wife --'}</option>
                {members
                  .filter((m) => (!activeEditingMember || m.id !== activeEditingMember.id) && !spouseIds.includes(m.id))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {getName(m)} ({m.birthYear ? `b. ${m.birthYear}` : ''} • Gen {m.generation})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleLinkExistingSpouse}
                disabled={!selectedSpouseToLink}
                className="px-3 py-1.5 bg-[#0d2419] text-white text-xs font-bold rounded-lg hover:bg-[#1b3a2a] disabled:opacity-40 cursor-pointer"
              >
                {language === 'ml' ? 'ചേർക്കുക' : 'Link Wife'}
              </button>
            </div>

            {/* Quick Create New Wife Drawer */}
            {isCreatingWife && (
              <div className="mt-2 p-3 bg-[#fdf2f4] rounded-xl border-2 border-[#e04f64]/40 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#f0c5ce] pb-1.5">
                  <span className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>{language === 'ml' ? 'പുതിയ ഭാര്യയെ ചേർക്കുക (Create New Wife)' : 'Create New Wife Profile'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingWife(false)}
                    className="text-xs text-[#727974] hover:text-[#0d2419] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-[#424844]">
                      Wife Name (English) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Fathima, Mariyam"
                      value={newWifeName}
                      onChange={(e) => setNewWifeName(e.target.value)}
                      className="bg-white px-2.5 py-1.5 rounded-lg text-xs border border-[#d6cfbe]"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-[#7b5810]">
                      മലയാളം പേര് (Malayalam)
                    </label>
                    <input
                      type="text"
                      placeholder="ഉദാ: ഫാത്തിമ, മറിയം"
                      value={newWifeNameMl}
                      onChange={(e) => setNewWifeNameMl(e.target.value)}
                      className="bg-white px-2.5 py-1.5 rounded-lg text-xs border border-[#d6cfbe]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-[#424844]">Birth Year:</label>
                    <input
                      type="number"
                      value={newWifeBirthYear}
                      onChange={(e) => setNewWifeBirthYear(Number(e.target.value))}
                      className="bg-white px-2 py-1 rounded-lg text-xs w-20 border border-[#d6cfbe]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateAndLinkWife}
                    className="px-4 py-1.5 bg-[#e04f64] hover:bg-[#c93b50] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    {language === 'ml' ? 'ഭാര്യയെ ചേർക്കുക' : 'Save & Link Wife'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#424844]">Role / Title</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-white px-3 py-2 rounded-xl text-xs text-[#1d1c16] border border-[#e7e2d8] focus:outline-none focus:ring-1 focus:ring-[#7b5810]"
              placeholder="e.g. Branch Lead • Direct Descendant"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#424844]">Biographical Dossier</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-white px-3 py-2 rounded-xl text-xs text-[#1d1c16] border border-[#e7e2d8] focus:outline-none focus:ring-1 focus:ring-[#7b5810]"
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e7e2d8]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#424844] hover:text-[#0d2419] cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#0d2419] hover:bg-[#1a3828] text-[#fdcd7b] px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 border border-[#fdcd7b]/40 cursor-pointer disabled:opacity-70 transition-all"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#fdcd7b] border-t-transparent rounded-full animate-spin"></span>
                <span>{language === 'ml' ? 'സേവ് ചെയ്യുന്നു...' : 'Saving to Cloud...'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>
                  {activeEditingMember
                    ? (language === 'ml' ? 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക' : 'Save Changes to Cloud')
                    : (language === 'ml' ? 'ചേർക്കുക & ക്ലൗഡിൽ സേവ് ചെയ്യുക' : 'Save New Member to Cloud')}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
