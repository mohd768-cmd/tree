import React from 'react';
import { TabType } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface BottomNavProps {
  activeTab: TabType;
  onChangeTab?: (tab: TabType) => void;
  onSelectTab?: (tab: TabType) => void;
  unlinkedCount?: number;
  memberCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onSelectTab,
  unlinkedCount = 0,
}) => {
  const { t } = useLanguage();

  const handleTabClick = (tabId: TabType) => {
    if (typeof onChangeTab === 'function') {
      onChangeTab(tabId);
    }
    if (typeof onSelectTab === 'function') {
      onSelectTab(tabId);
    }
  };

  const navItems: {
    id: TabType;
    label: string;
    icon: string;
    badge?: number;
  }[] = [
    { id: 'tree', label: t.treeTab, icon: 'account_tree' },
    { id: 'directory', label: t.directoryTab, icon: 'groups' },
    { id: 'admin', label: t.adminTab, icon: 'admin_panel_settings', badge: unlinkedCount },
    { id: 'timeline', label: t.timelineTab, icon: 'history_edu' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#ffffff]/90 backdrop-blur-xl border-t border-[#e7e2d8] shadow-[0_-2px_12px_rgba(29,28,22,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-[#0d2419] font-bold'
                  : 'text-[#424844] hover:text-[#0d2419]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[22px] transition-transform"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-[#ba1a1a] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] tracking-wide">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#7b5810]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
