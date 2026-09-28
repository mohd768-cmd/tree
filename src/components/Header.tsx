import React from 'react';
import { TabType, FamilyMember } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface HeaderProps {
  activeTab: TabType;
  onSelectTab?: (tab: TabType) => void;
  onOpenSearch?: () => void;
  onOpenAdmin?: () => void;
  onOpenAddMember?: () => void;
  onOpenKinship?: () => void;
  onOpenGoogleDrive?: () => void;
  isGoogleDriveConnected?: boolean;
  serverStatus?: 'connecting' | 'connected' | 'offline';
  serverEngine?: string;
  onSelectMember?: (member: FamilyMember) => void;
  currentMember?: FamilyMember;
}

const DEFAULT_ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDbzkV1MddRxjXC8bMWmtZfXRvD-kx_YP86hWBHyjyH8uRUfZbEKGRDAwmc1tyokRQgZk_uYP0TIrVCPfb4YyXvO1jx9Bbit0Ya8xTCnG_l2AhKA2L-zSsV5qIXHLdxPtzWfkT_1PZlCoGybkZql0Y9mw7NTGsX0exWG_9RfU8QcuUS7IY1r9sW7_4kquIsd9Fws1H4nKPdBO2yj8tUhU_c6cSNg8Nici3pPoRlPCG4nSex9yV7ZYg';

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenAdmin,
  onOpenAddMember,
  onOpenKinship,
  onOpenGoogleDrive,
  isGoogleDriveConnected,
  serverStatus,
  serverEngine,
  onSelectMember,
  currentMember,
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  const getSubTitle = () => {
    switch (activeTab) {
      case 'tree':
        return t.treeTab;
      case 'directory':
        return t.directoryTab;
      case 'admin':
        return t.adminTab;
      case 'timeline':
        return t.timelineTab;
      default:
        return t.familySubtitle;
    }
  };

  const handleAdminClick = () => {
    if (onOpenAdmin) {
      onOpenAdmin();
    } else if (currentMember && onSelectMember) {
      onSelectMember(currentMember);
    } else if (onSelectTab) {
      onSelectTab('admin');
    }
  };

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else if (onSelectTab) {
      onSelectTab('directory');
    }
  };

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[#fef9ef]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(29,28,22,0.06)] border-b border-[#e7e2d8]/70 transition-all">
      <div className="h-16 sm:h-20 px-3 md:px-8 flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Emblem & App Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#0d2419]/5 p-0.5 border border-[#7b5810]/20">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1XcKqkX_S4WCfyuWz1Obd7ZLefHrkgDCrMuxwJTp8CXBDo5SQ3y8vH___ntoiKrYNr2icJKyMzfFEpMHn9EI26UW6Ol2zOkloG5UDyC2JmAJjrkJMgT5PVKYDfMXNQQ0iPub01LDr88h9tZAjVlF7sLf8_z-IVLi9TEGjyqIMiyW3DVPqxmKNrZEAuALWLJXha7b5uIrmE7rwWBJUF4dCRRgbr7zrA6NQBPisT_VmgF_qCrwA9-Vmt5vA"
              alt="Aayinikunnathth Maayan Kutty & Paathu Lineage Emblem"
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display text-xs sm:text-base md:text-xl font-bold text-[#0d2419] leading-tight tracking-tight break-words line-clamp-2 sm:line-clamp-none">
              {t.appTitle}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#424844]">
              <span className="text-[#7b5810] font-bold tracking-wider text-[9px] sm:text-[10px]">
                {language === 'ml' ? 'കുടുംബ വേര്' : 'Family Lineage'}
              </span>
              <span className="text-[#c2c8c2] text-[10px] hidden xs:inline">•</span>
              <span className="font-medium text-[#424844] truncate text-[10px] sm:text-[11px] hidden xs:inline">
                {getSubTitle()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Bar: Streamlined & Touch-Optimized for Mobile */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Vercel Cloud Central Storage Status Badge */}
          {serverStatus && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                serverStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : serverStatus === 'connecting'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
              title={
                serverStatus === 'connected'
                  ? `Vercel Cloud Database Active: ${serverEngine || 'Server Store'}. Records are shared in real-time across all visitors.`
                  : serverStatus === 'connecting'
                  ? 'Connecting to central cloud database...'
                  : 'Using local offline cache (Server unreachable)'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  serverStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : serverStatus === 'connecting'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-stone-400'
                }`}
              ></span>
              <span className="text-[11px] font-bold">
                {serverStatus === 'connected' ? 'Cloud Saved' : serverStatus === 'connecting' ? 'Connecting' : 'Offline'}
              </span>
            </div>
          )}

          {/* Find Relation Between Two Persons Button */}
          {onOpenKinship && (
            <button
              onClick={onOpenKinship}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-[#f4efe4] hover:bg-[#ede8de] border border-[#e7e2d8] text-xs font-bold text-[#0d2419] flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95 shadow-2xs"
              title={language === 'ml' ? 'രണ്ട് വ്യക്തികൾ തമ്മിലുള്ള ബന്ധം കാണുക' : 'See relation between two persons'}
            >
              <span className="material-symbols-outlined text-[16px] text-[#7b5810]">diversity_1</span>
              <span className="text-xs font-bold hidden sm:inline">
                {language === 'ml' ? 'ബന്ധം കാണുക' : 'Relation'}
              </span>
            </button>
          )}

          {/* Google Drive Central Storage Sync Button */}
          {onOpenGoogleDrive && (
            <button
              onClick={onOpenGoogleDrive}
              className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-full border text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95 shadow-2xs ${
                isGoogleDriveConnected
                  ? 'bg-[#1a73e8]/10 text-[#1a56c4] border-[#1a73e8]/35 hover:bg-[#1a73e8]/20'
                  : 'bg-[#f4efe4] hover:bg-[#ede8de] border-[#e7e2d8] text-[#0d2419]'
              }`}
              title={
                isGoogleDriveConnected
                  ? (language === 'ml' ? 'ഗൂഗിൾ ഡ്രൈവുമായി ബന്ധിപ്പിച്ചു (തത്സമയം സിങ്ക് ചെയ്യുന്നു)' : 'Connected to Google Drive (Live sync active)')
                  : (language === 'ml' ? 'ഗൂഗിൾ ഡ്രൈവ് കേന്ദ്രീകൃത സംഭരണവുമായി ബന്ധിപ്പിക്കുക' : 'Connect Google Drive Central Storage')
              }
            >
              <span className="material-symbols-outlined text-[16px] text-[#1a73e8]">drive_folder_upload</span>
              {isGoogleDriveConnected ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-pulse"></span>
                  <span className="text-xs font-bold hidden sm:inline text-[#1a56c4]">Drive</span>
                </span>
              ) : (
                <span className="text-xs font-bold hidden sm:inline">
                  {language === 'ml' ? 'ഡ്രൈവ്' : 'Drive'}
                </span>
              )}
            </button>
          )}

          {/* Common Add Member Button */}
          {onOpenAddMember && (
            <button
              onClick={onOpenAddMember}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-[#0d2419] hover:bg-[#1d3d2c] text-[#fdcd7b] text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95 shadow-xs"
              title={language === 'ml' ? 'പുതിയ അംഗത്തെ ചേർക്കുക' : 'Add Family Member'}
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span className="text-xs font-bold hidden sm:inline">{t.addMember}</span>
            </button>
          )}

          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="h-8 sm:h-9 px-2 sm:px-3 rounded-full bg-[#f4efe4] hover:bg-[#ede8de] border border-[#e7e2d8] text-xs font-bold text-[#0d2419] flex items-center gap-1 transition-all active:scale-95 shadow-2xs"
            title={language === 'ml' ? 'Switch to English' : 'മലയാളത്തിലേക്ക് മാറ്റുക (Switch to Malayalam)'}
          >
            <span className="material-symbols-outlined text-[15px] text-[#7b5810]">translate</span>
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'ml' ? 'EN' : 'മല'}
            </span>
          </button>

          {/* Search Button (Visible on sm+ screens; Directory is in BottomNav on mobile) */}
          <button
            onClick={handleSearchClick}
            aria-label="Search Archive"
            className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-full text-[#0d2419] hover:bg-[#f2ede3] transition-colors active:scale-95"
            title={t.search}
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Admin Login & Controls Button */}
          <button
            onClick={handleAdminClick}
            className="flex items-center gap-1 sm:gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-[#f4efe4] hover:bg-[#ffdeaa]/60 border border-[#e7e2d8] text-xs font-bold text-[#0d2419] transition-all active:scale-95 shadow-2xs cursor-pointer"
            title={language === 'ml' ? 'അഡ്മിൻ പ്രവേശനം' : 'Admin Access'}
          >
            <span className="material-symbols-outlined text-[16px] text-[#7b5810]">admin_panel_settings</span>
            <span className="text-xs font-bold">{t.adminTab}</span>
          </button>

          {/* Admin Custodian Profile (Desktop only; on mobile, Admin is directly in the Bottom Navigation bar) */}
          <button
            onClick={handleAdminClick}
            className="hidden md:flex relative items-center justify-center cursor-pointer group ml-1"
            title={
              currentMember
                ? `${t.adminTab}: ${currentMember.firstName}`
                : t.adminTab
            }
          >
            <div className="p-[1.5px] rounded-full bg-[#ffdeaa] ring-2 ring-[#7b5810]/30 group-hover:ring-[#7b5810] transition-all">
              <img
                src={currentMember?.avatarUrl || DEFAULT_ADMIN_AVATAR}
                alt={currentMember?.firstName ? `${currentMember.firstName} profile` : 'Admin Profile'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#0d2419] text-[#fef9ef] font-bold text-[8px] sm:text-[9px] px-1 py-[1px] rounded-full uppercase tracking-tighter leading-none shadow-sm">
              {t.adminTab}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
