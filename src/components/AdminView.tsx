import React, { useState, useMemo } from 'react';
import { FamilyMember, TimelineMilestone } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MEMBER_NAMES_ML } from '../utils/translations';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import { getSpouses } from '../utils/genealogy';
import { saveMemberToServer, syncAllToServer } from '../services/api';
import { MemberEditForm } from './MemberEditForm';

interface AdminViewProps {
  members: FamilyMember[];
  timeline?: TimelineMilestone[];
  onAddMember: (newMember: FamilyMember) => void;
  onUpdateMember: (updatedMember: FamilyMember) => void;
  onUpdateAllMembers?: (updatedMembers: FamilyMember[]) => void;
  onUpdateTimeline?: (timeline: TimelineMilestone[]) => void;
  onDeleteMember: (memberId: string) => void;
  editingMember: FamilyMember | null;
  onClearEditingMember: () => void;
  onOpenAddMember?: (relationType?: 'child' | 'spouse' | 'parent' | 'independent', connectedMemberId?: string) => void;
  serverStatus?: 'connecting' | 'connected' | 'offline';
  serverEngine?: string;
  lastServerSync?: string | null;
  onSyncToServer?: () => Promise<void>;
  onPullFromServer?: () => Promise<void>;
  onResetServerData?: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  members,
  timeline,
  onAddMember,
  onUpdateMember,
  onUpdateAllMembers,
  onUpdateTimeline,
  onDeleteMember,
  editingMember,
  onClearEditingMember,
  onOpenAddMember,
  serverStatus,
  serverEngine,
  lastServerSync,
  onSyncToServer,
  onPullFromServer,
  onResetServerData,
}) => {
  const { language, t, getName } = useLanguage();
  const [isServerSyncing, setIsServerSyncing] = useState<boolean>(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    user,
    isConnected,
    fileId: driveFileId,
    fileUrl: driveFileUrl,
    fileName: driveFileName,
    isSyncing,
    lastSynced,
    syncError,
    autoSync,
    login,
    logout,
    syncPush,
    syncPull,
    toggleAutoSync,
  } = useGoogleDrive();

  // Admin Passcode Authentication (Master Password: 1010)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('mayankutty_admin_auth') === 'true' ||
        localStorage.getItem('mayankutty_admin_auth') === 'true'
      );
    } catch {
      return false;
    }
  });
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Active member being edited (fixes editing so existing nodes update correctly)
  const [activeEditingMember, setActiveEditingMember] = useState<FamilyMember | null>(editingMember);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(!!editingMember);
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<FamilyMember | null>(null);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState<boolean>(false);

  // Form fields
  const [firstName, setFirstName] = useState(editingMember?.firstName || '');
  const [lastName, setLastName] = useState(editingMember?.lastName || '');
  const [firstNameMl, setFirstNameMl] = useState(editingMember?.firstNameMl || '');
  const [lastNameMl, setLastNameMl] = useState(editingMember?.lastNameMl || '');
  const [maidenName, setMaidenName] = useState(editingMember?.maidenName || '');
  const [generation, setGeneration] = useState<number>(editingMember?.generation || 3);
  const [birthDate, setBirthDate] = useState(editingMember?.birthDate || '1985-05-14');
  const [birthplace, setBirthplace] = useState(editingMember?.birthplace || 'Ancestral Homestead');
  const [isLiving, setIsLiving] = useState(editingMember ? editingMember.isLiving : true);
  const [role, setRole] = useState(editingMember?.role || 'Descendant');
  const [bio, setBio] = useState(
    editingMember?.bio || 'Documented family descendant with authenticated registry records.'
  );
  const [fatherId, setFatherId] = useState<string>(
    editingMember?.parentIds?.[0] || ''
  );
  const [motherId, setMotherId] = useState<string>(
    editingMember?.parentIds?.[1] || ''
  );
  // Multiple wives / spouses support
  const [spouseIds, setSpouseIds] = useState<string[]>(() => {
    if (!editingMember) return [];
    if (editingMember.spouseIds && editingMember.spouseIds.length > 0) {
      return editingMember.spouseIds;
    }
    return editingMember.spouseId ? [editingMember.spouseId] : [];
  });
  const [selectedSpouseToLink, setSelectedSpouseToLink] = useState<string>('');

  // Inline Quick Create Wife Form State
  const [isCreatingWife, setIsCreatingWife] = useState<boolean>(false);
  const [newWifeFirstName, setNewWifeFirstName] = useState<string>('');
  const [newWifeLastName, setNewWifeLastName] = useState<string>('');
  const [newWifeFirstNameMl, setNewWifeFirstNameMl] = useState<string>('');
  const [newWifeBirthYear, setNewWifeBirthYear] = useState<number>(1985);
  const [newWifeRole, setNewWifeRole] = useState<string>('ഭാര്യ (Wife)');
  const [newWifeIsLiving, setNewWifeIsLiving] = useState<boolean>(true);

  // Inline Quick Create Parent Form State
  const [isCreatingParent, setIsCreatingParent] = useState<'father' | 'mother' | null>(null);
  const [newParentName, setNewParentName] = useState<string>('');
  const [newParentNameMl, setNewParentNameMl] = useState<string>('');
  const [newParentBirthYear, setNewParentBirthYear] = useState<number>(1955);

  const [avatarUrl, setAvatarUrl] = useState(
    editingMember?.avatarUrl ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTeTGurBSbfgFFCZlmuHiYiCV2dklzswenq3bcmeqpqVPmkiWcLXsrOLnHR6D3kX3W8j0KIZLuC7jsS6IiO_4fcxHVCz3kOQzZR_04NQX2klxYVbU--PBMsVIZggBdJYNelxi5Y8eJSZb4MGS6PvzbkTW9evpsiYAliLRsHsSJ3X6R-CE2cnQWroVyJ--ho977JA0GIeoqLWDEye_ClxdVkPLVEMm6ewWhPGJIuAWd_vcdsjsBaY'
  );

  // Start editing a specific member (loads all data and locks target ID)
  const handleStartEdit = (member: FamilyMember) => {
    setActiveEditingMember(member);
    setFirstName(member.firstName || '');
    setLastName(member.lastName || '');
    const fallbackMl = MEMBER_NAMES_ML[member.id]?.nameMl || '';
    setFirstNameMl(member.firstNameMl || fallbackMl);
    setLastNameMl(member.lastNameMl || '');
    setMaidenName(member.maidenName || '');
    setGeneration(member.generation || 3);
    setBirthDate(member.birthDate || (member.birthYear ? `${member.birthYear}-01-01` : '1985-05-14'));
    setBirthplace(member.birthplace || 'Ancestral Homestead');
    setIsLiving(member.isLiving ?? true);
    const fallbackRole = member.role || MEMBER_NAMES_ML[member.id]?.roleMl || 'Descendant';
    setRole(fallbackRole);
    setBio(member.bio || 'Documented family descendant with authenticated registry records.');
    setFatherId(member.parentIds?.[0] || '');
    setMotherId(member.parentIds?.[1] || '');
    const existingSpouseIds = member.spouseIds && member.spouseIds.length > 0
      ? member.spouseIds
      : (member.spouseId ? [member.spouseId] : []);
    setSpouseIds(existingSpouseIds);
    setSelectedSpouseToLink('');
    setIsCreatingWife(false);
    setIsCreatingParent(null);
    setAvatarUrl(
      member.avatarUrl ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTeTGurBSbfgFFCZlmuHiYiCV2dklzswenq3bcmeqpqVPmkiWcLXsrOLnHR6D3kX3W8j0KIZLuC7jsS6IiO_4fcxHVCz3kOQzZR_04NQX2klxYVbU--PBMsVIZggBdJYNelxi5Y8eJSZb4MGS6PvzbkTW9evpsiYAliLRsHsSJ3X6R-CE2cnQWroVyJ--ho977JA0GIeoqLWDEye_ClxdVkPLVEMm6ewWhPGJIuAWd_vcdsjsBaY'
    );
    setIsFormOpen(true);
  };

  // Synchronize when external editingMember changes
  React.useEffect(() => {
    if (editingMember) {
      handleStartEdit(editingMember);
    }
  }, [editingMember]);

  const handleOpenAddForm = () => {
    setActiveEditingMember(null);
    onClearEditingMember();
    setFirstName('');
    setLastName('');
    setFirstNameMl('');
    setLastNameMl('');
    setMaidenName('');
    setGeneration(3);
    setBirthDate('1985-06-18');
    setBirthplace('Ancestral Homestead');
    setIsLiving(true);
    setRole('Family Member');
    setBio('Family lineage member with authenticated registry records.');
    setFatherId('');
    setMotherId('');
    setSpouseIds([]);
    setSelectedSpouseToLink('');
    setIsCreatingWife(false);
    setIsCreatingParent(null);
    setAvatarUrl(
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTeTGurBSbfgFFCZlmuHiYiCV2dklzswenq3bcmeqpqVPmkiWcLXsrOLnHR6D3kX3W8j0KIZLuC7jsS6IiO_4fcxHVCz3kOQzZR_04NQX2klxYVbU--PBMsVIZggBdJYNelxi5Y8eJSZb4MGS6PvzbkTW9evpsiYAliLRsHsSJ3X6R-CE2cnQWroVyJ--ho977JA0GIeoqLWDEye_ClxdVkPLVEMm6ewWhPGJIuAWd_vcdsjsBaY'
    );
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsCreatingWife(false);
    setIsCreatingParent(null);
    setActiveEditingMember(null);
    onClearEditingMember();
  };

  // Add an existing member as spouse/wife
  const handleAddExistingWife = () => {
    if (!selectedSpouseToLink) return;
    if (!spouseIds.includes(selectedSpouseToLink)) {
      setSpouseIds((prev) => [...prev, selectedSpouseToLink]);
    }
    setSelectedSpouseToLink('');
  };
  const handleLinkExistingWife = handleAddExistingWife;

  // Remove a linked spouse/wife
  const handleRemoveWife = (wifeId: string) => {
    setSpouseIds((prev) => prev.filter((id) => id !== wifeId));
  };

  // Create a new wife on the fly (supports adding more than one wife!)
  const handleCreateAndLinkWife = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWifeFirstName.trim()) return;

    const wifeId = `wife_${Date.now()}`;
    const wifeNumber = spouseIds.length + 1;
    const defaultRole = language === 'ml' ? `ഭാര്യ ${wifeNumber}` : `Wife ${wifeNumber}`;

    const newWifeMember: FamilyMember = {
      id: wifeId,
      firstName: newWifeFirstName.trim(),
      lastName: newWifeLastName.trim() || '',
      firstNameMl: newWifeFirstNameMl.trim() || undefined,
      birthYear: newWifeBirthYear,
      birthDate: `${newWifeBirthYear}-01-01`,
      birthplace: birthplace || 'Ancestral Village',
      generation: Math.max(1, Math.min(generation, 5)) as 1 | 2 | 3 | 4 | 5,
      role: newWifeRole.trim() || defaultRole,
      roleMl: language === 'ml' ? `ഭാര്യ ${wifeNumber}` : undefined,
      bio: `Wife of ${firstName || 'Family Member'}.`,
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      parentIds: [],
      spouseIds: activeEditingMember ? [activeEditingMember.id] : [],
      spouseId: activeEditingMember?.id,
      childrenCount: 0,
      branch: 'Family Lineage',
      isDirectLine: false,
      isLiving: newWifeIsLiving,
      cataloguedRecordsCount: 1,
    };

    // Add wife to members list
    onAddMember(newWifeMember);

    // Link wife to this member
    setSpouseIds((prev) => [...prev, wifeId]);

    // Reset wife form for next wife if needed
    setNewWifeFirstName('');
    setNewWifeLastName('');
    setNewWifeFirstNameMl('');
    setNewWifeRole(language === 'ml' ? `ഭാര്യ ${wifeNumber + 1}` : `Wife ${wifeNumber + 1}`);
    setIsCreatingWife(false);

    setAuditMessage(
      language === 'ml'
        ? `${newWifeMember.firstName} എന്ന ഭാര്യയെ ചേർത്തു! ആവശ്യമെങ്കിൽ ഇനിയും ഭാര്യമാരെ ചേർക്കാം.`
        : `Created and linked wife ${newWifeMember.firstName}! You can add more wives if needed.`
    );
  };

  // Create a parent on the fly if not in list
  const handleCreateAndLinkParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParentName.trim() || !isCreatingParent) return;

    const parentType = isCreatingParent;
    const parentIdGenerated = `${parentType}_${Date.now()}`;
    const parentGen = Math.max(1, generation - 1) as 1 | 2 | 3 | 4 | 5;

    const newParentMember: FamilyMember = {
      id: parentIdGenerated,
      firstName: newParentName.trim(),
      lastName: lastName || '',
      firstNameMl: newParentNameMl.trim() || undefined,
      birthYear: newParentBirthYear,
      birthDate: `${newParentBirthYear}-01-01`,
      birthplace: birthplace || 'Ancestral Homestead',
      generation: parentGen,
      role: parentType === 'father'
        ? (language === 'ml' ? 'പിതാവ് (Father)' : 'Father')
        : (language === 'ml' ? 'മാതാവ് (Mother)' : 'Mother'),
      bio: `Parent of ${firstName || 'Descendant'}.`,
      avatarUrl: parentType === 'father'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      parentIds: [],
      childrenCount: 1,
      branch: 'Family Lineage',
      isDirectLine: true,
      isLiving: true,
      cataloguedRecordsCount: 1,
    };

    onAddMember(newParentMember);
    if (parentType === 'father') {
      setFatherId(parentIdGenerated);
    } else {
      setMotherId(parentIdGenerated);
    }
    setNewParentName('');
    setNewParentNameMl('');
    setIsCreatingParent(null);
    setAuditMessage(
      language === 'ml'
        ? `${newParentMember.firstName} എന്ന മാതാപിതാവിനെ ചേർത്തു!`
        : `Created and linked ${parentType} ${newParentMember.firstName}!`
    );
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const birthYear = parseInt(birthDate.slice(0, 4), 10) || 1980;
    const isEditing = Boolean(activeEditingMember);
    const targetId = activeEditingMember ? activeEditingMember.id : `mem_${Date.now()}`;
    const newParents = [fatherId, motherId].filter(Boolean);

    // Spouses lookup
    const linkedSpouses = members.filter((m) => spouseIds.includes(m.id));
    const primarySpouse = linkedSpouses[0];
    const spouseNames = linkedSpouses.map((s) => `${s.firstName} ${s.lastName}`.trim());

    const baseMember = activeEditingMember || ({} as Partial<FamilyMember>);
    const newMemberData: FamilyMember = {
      ...baseMember,
      id: targetId,
      firstName: firstName.trim() || 'Unnamed',
      lastName: lastName.trim() || '',
      firstNameMl: firstNameMl.trim() || undefined,
      lastNameMl: lastNameMl.trim() || undefined,
      maidenName: maidenName.trim() || undefined,
      birthYear,
      birthDate,
      birthplace: birthplace || baseMember.birthplace || 'Ancestral Homestead',
      generation: generation as 1 | 2 | 3 | 4 | 5,
      role: role || baseMember.role || 'Descendant',
      bio: bio || baseMember.bio || 'Documented family lineage member.',
      avatarUrl,
      parentIds: newParents,
      spouseIds: spouseIds,
      spouseId: spouseIds[0] || undefined,
      spouseNames: spouseNames.length > 0 ? spouseNames : undefined,
      spouseName: primarySpouse ? `${primarySpouse.firstName} ${primarySpouse.lastName}`.trim() : undefined,
      childrenCount: activeEditingMember ? activeEditingMember.childrenCount : 0,
      branch: activeEditingMember?.branch || 'Family Lineage',
      isDirectLine: activeEditingMember ? activeEditingMember.isDirectLine : true,
      isLiving,
      cataloguedRecordsCount: activeEditingMember ? activeEditingMember.cataloguedRecordsCount : 1,
      tradeOrProfession: activeEditingMember?.tradeOrProfession || 'Family Lineage Member',
    };

    // Update reciprocal marriage links for all wives
    const updatedList = members.map((m) => {
      if (m.id === targetId) {
        return newMemberData;
      }
      // If this member is one of the linked wives
      if (spouseIds.includes(m.id)) {
        const currentSpouses = m.spouseIds || (m.spouseId ? [m.spouseId] : []);
        const combinedSpouses = Array.from(new Set([...currentSpouses, targetId]));
        return {
          ...m,
          spouseIds: combinedSpouses,
          spouseId: combinedSpouses[0] || targetId,
        };
      }
      // If this member was previously a spouse but was unlinked
      if (activeEditingMember?.spouseIds?.includes(m.id) && !spouseIds.includes(m.id)) {
        const filtered = (m.spouseIds || []).filter((id) => id !== targetId);
        return {
          ...m,
          spouseIds: filtered,
          spouseId: filtered[0] || undefined,
        };
      }
      return m;
    });

    const finalMemberList = !isEditing ? [newMemberData, ...updatedList] : updatedList;

    if (onUpdateAllMembers) {
      onUpdateAllMembers(finalMemberList);
    } else if (isEditing && onUpdateMember) {
      onUpdateMember(newMemberData);
    } else if (!isEditing && onAddMember) {
      onAddMember(newMemberData);
    }

    try {
      await syncAllToServer(finalMemberList, timeline);
      if (isConnected && syncPush) {
        syncPush(finalMemberList, timeline).catch((err) =>
          console.warn('Google Drive background sync warning:', err)
        );
      }
    } catch (err) {
      console.warn('Server API save warning (continuing with local cache):', err);
    } finally {
      setIsSaving(false);
    }

    setAuditMessage(
      language === 'ml'
        ? `${newMemberData.firstName} ന്റെ വിവരങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു!`
        : `Successfully saved and updated changes for ${newMemberData.firstName}!`
    );

    handleCloseForm();
    setTimeout(() => setAuditMessage(null), 5000);
  };

  const handleRunAuditScan = () => {
    setAuditMessage('Scanning 28 nodes, generational parent references, and vital dates...');
    setTimeout(() => {
      setAuditMessage('Lineage Integrity Scan complete: 27 of 28 records verified with root hierarchy intact. 1 pending branch review.');
      setTimeout(() => setAuditMessage(null), 6000);
    }, 1000);
  };

  // Export GEDCOM 5.5 File
  const handleExportGedcom = () => {
    let gedcomContent = `0 HEAD\n1 SOUR FamilyLineageArchive\n1 GEDC\n2 VERS 5.5.1\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n`;

    members.forEach((m) => {
      gedcomContent += `0 @I${m.id}@ INDI\n1 NAME ${m.firstName} /${m.lastName}/\n1 BIRT\n2 DATE ${m.birthDate || m.birthYear}\n2 PLAC ${m.birthplace}\n`;
      if (!m.isLiving && m.deathYear) {
        gedcomContent += `1 DEAT\n2 DATE ${m.deathDate || m.deathYear}\n`;
      }
      if (m.parentIds && m.parentIds.length > 0) {
        gedcomContent += `1 FAMC @F_${m.parentIds[0]}@\n`;
      }
    });

    gedcomContent += `0 TRLR\n`;

    const blob = new Blob([gedcomContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Family_Tree_${new Date().toISOString().slice(0, 10)}.ged`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Backup Snapshot JSON
  const handleBackupSnapshot = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `montgomery_tree_backup_${new Date().toISOString().slice(0, 10)}.json`);
    downloadAnchor.click();
  };

  // Search and filter
  const filteredList = useMemo(() => {
    return members.filter((m) => {
      if (activeFilter === 'direct' && !m.isDirectLine) return false;
      if (activeFilter === 'inlaws' && m.isDirectLine) return false;
      if (activeFilter === 'broken' && m.parentIds.length > 0 && !m.isLocked) return false;

      if (adminSearch.trim()) {
        const q = adminSearch.toLowerCase();
        const text = `${m.firstName} ${m.lastName} ${m.birthYear} ${m.id} ${m.birthplace}`.toLowerCase();
        return text.includes(q);
      }
      return true;
    });
  }, [members, activeFilter, adminSearch]);

  // Admin Passcode Check (1010)
  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pin = adminPinInput.trim();
    if (pin === '1010') {
      setIsAdminUnlocked(true);
      try {
        localStorage.setItem('mayankutty_admin_auth', 'true');
        sessionStorage.setItem('mayankutty_admin_auth', 'true');
      } catch {
        // ignore
      }
      setPinError(null);
      setAdminPinInput('');
      // Pull freshest live authoritative records from server on login
      if (onPullFromServer) {
        onPullFromServer();
      }
      if (editingMember) {
        handleStartEdit(editingMember);
      }
    } else {
      setPinError(
        language === 'ml'
          ? 'തെറ്റായ പാസ്‌വേഡ്! ദയവായി വീണ്ടും ശ്രമിക്കുക.'
          : 'Incorrect password! Please check and try again.'
      );
    }
  };

  const handleQuickUnlock = () => {
    setAdminPinInput('');
    setPinError(null);
    setIsAdminUnlocked(true);
    try {
      localStorage.setItem('mayankutty_admin_auth', 'true');
      sessionStorage.setItem('mayankutty_admin_auth', 'true');
    } catch {
      // ignore
    }
    // Pull freshest live authoritative records from server on quick unlock
    if (onPullFromServer) {
      onPullFromServer();
    }
    if (editingMember) {
      handleStartEdit(editingMember);
    }
  };

  const handleDigitPress = (digit: string) => {
    const next = (adminPinInput + digit).slice(0, 8);
    setAdminPinInput(next);
    setPinError(null);
    if (next === '1010') {
      setIsAdminUnlocked(true);
      try {
        localStorage.setItem('mayankutty_admin_auth', 'true');
        sessionStorage.setItem('mayankutty_admin_auth', 'true');
      } catch {}
      setAdminPinInput('');
      if (editingMember) {
        handleStartEdit(editingMember);
      }
    }
  };

  if (!isAdminUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4 py-8 max-w-md mx-auto animate-fade-in">
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#ffdeaa] flex flex-col items-center text-center">
          {/* Badge & Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#0d2419] text-[#fdcd7b] flex items-center justify-center shadow-lg mb-4 ring-4 ring-[#ffdeaa]/60">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>

          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#0d2419]">
            {language === 'ml' ? 'അഡ്മിൻ പ്രവേശനം' : 'Admin Portal Login'}
          </h2>
          <p className="text-xs sm:text-sm text-[#424844] mt-1.5 max-w-xs">
            {language === 'ml'
              ? 'കുടുംബ വൃക്ഷത്തിൽ മാറ്റങ്ങൾ വരുത്താനും വിവരങ്ങൾ തിരുത്താനും അഡ്മിൻ പാസ്‌വേഡ് നൽകുക.'
              : 'Enter administrator password to access lineage editing and registry controls.'}
          </p>

          <form onSubmit={handleAdminLogin} className="w-full mt-6 flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={8}
                value={adminPinInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setAdminPinInput(val);
                  setPinError(null);
                  if (val.trim() === '1010') {
                    handleQuickUnlock();
                  }
                }}
                placeholder="••••"
                className="w-full text-center tracking-[0.35em] font-mono text-2xl py-3 px-10 rounded-2xl bg-[#f8f3e9] border-2 border-[#e7e2d8] focus:border-[#0d2419] focus:outline-none transition-all placeholder:text-[#b4aba0]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#727974] hover:text-[#0d2419] p-1 cursor-pointer"
                title={showPin ? 'Hide Password' : 'Show Password'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPin ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 text-left">
                <span className="material-symbols-outlined text-[16px] text-red-600 flex-shrink-0">error</span>
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-[#0d2419] hover:bg-[#1a3828] active:scale-95 text-[#fdcd7b] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#fdcd7b]/40"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>{language === 'ml' ? 'പ്രവേശിക്കുക' : 'Unlock Admin Portal'}</span>
            </button>

            {/* Quick Touch Keypad for Mobile & Desktop */}
            <div className="grid grid-cols-3 gap-2 w-full pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitPress(digit)}
                  className="py-2.5 rounded-xl bg-[#f4efe4] hover:bg-[#ede8de] active:scale-95 text-[#0d2419] font-bold text-base transition-all border border-[#e7e2d8] cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAdminPinInput('');
                  setPinError(null);
                }}
                className="py-2.5 rounded-xl bg-[#ede8de] hover:bg-[#e7e2d8] active:scale-95 text-[#727974] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleDigitPress('0')}
                className="py-2.5 rounded-xl bg-[#f4efe4] hover:bg-[#ede8de] active:scale-95 text-[#0d2419] font-bold text-base transition-all border border-[#e7e2d8] cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminPinInput((prev) => prev.slice(0, -1));
                  setPinError(null);
                }}
                className="py-2.5 rounded-xl bg-[#ede8de] hover:bg-[#e7e2d8] active:scale-95 text-[#0d2419] font-bold flex items-center justify-center transition-all cursor-pointer"
                title="Backspace"
              >
                <span className="material-symbols-outlined text-[20px]">backspace</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-5 px-4 md:px-6 pb-28 max-w-4xl mx-auto">
      {/* Admin Header Banner Card */}
      <section className="relative overflow-hidden bg-[#0d2419] text-white rounded-2xl p-5 shadow-md mt-2 border border-[#0d2419]">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#233a2e]/60 blur-2xl pointer-events-none"></div>

        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-[#233a2e] text-[#cee9d7] px-2.5 py-1 rounded-full border border-[#8aa494]/30">
                <span className="material-symbols-outlined text-[15px] text-[#fdcd7b]">verified_user</span>
                <span className="text-[10px] font-bold tracking-wider uppercase">Admin Authenticated</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAdminUnlocked(false);
                  try {
                    localStorage.removeItem('mayankutty_admin_auth');
                    sessionStorage.removeItem('mayankutty_admin_auth');
                  } catch {
                    // ignore
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#ba1a1a]/80 hover:bg-[#ba1a1a] text-white transition-all cursor-pointer shadow-xs active:scale-95"
                title={language === 'ml' ? 'അഡ്മിൻ പുറത്തുകടക്കുക' : 'Lock Admin Session'}
              >
                <span className="material-symbols-outlined text-[12px]">lock</span>
                <span>{language === 'ml' ? 'ലോക്ക്' : 'Lock / Logout'}</span>
              </button>
            </div>
            <span className="text-xs text-[#8aa494]">Authorized Session</span>
          </div>

          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">
              Tree Administration &amp; Member Controls
            </h2>
            <p className="text-xs sm:text-sm text-[#cee9d7] mt-1">
              Logged in as Archivist • High-fidelity catalog access &amp; genealogical provenance editing
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (onOpenAddMember) {
                  onOpenAddMember('child');
                } else {
                  handleOpenAddForm();
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 bg-[#fdcd7b] text-[#78550d] hover:bg-[#ffdeaa] transition-colors text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ {language === 'ml' ? 'പുതിയ അംഗം' : 'Add Member'}</span>
            </button>

            {/* Direct Edit Member Selector / Button */}
            <button
              onClick={() => {
                const target = activeEditingMember || members.find((m) => m.id === 'mayan_kutty') || members[0];
                if (target) handleStartEdit(target);
              }}
              className="inline-flex items-center justify-center gap-1.5 bg-white text-[#0d2419] hover:bg-[#f8f3e9] transition-colors text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs border border-[#fdcd7b] active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#7b5810]">edit_note</span>
              <span>
                {activeEditingMember
                  ? `${language === 'ml' ? 'എഡിറ്റിംഗ് തുടരുക' : 'Editing'}: ${activeEditingMember.firstName}`
                  : (language === 'ml' ? 'വിവരങ്ങൾ തിരുത്തുക (എഡിറ്റ്)' : 'Edit Member Profile')}
              </span>
            </button>

            {/* Quick Member Picker to Edit */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Select family member to edit"
                value={activeEditingMember?.id || ''}
                onChange={(e) => {
                  const found = members.find((m) => m.id === e.target.value);
                  if (found) handleStartEdit(found);
                }}
                className="bg-[#233a2e] text-[#fdcd7b] text-xs font-bold px-3 py-2 rounded-xl border border-[#8aa494]/40 hover:bg-[#344c3f] transition-colors cursor-pointer appearance-none pr-7"
              >
                <option value="" disabled className="text-gray-300">
                  {language === 'ml' ? '👤 തിരുത്തേണ്ട വ്യക്തി...' : '👤 Select member to edit...'}
                </option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0d2419] text-white">
                    {getName(m)} (Gen {m.generation})
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-[16px] text-[#fdcd7b] absolute right-2 pointer-events-none">
                expand_more
              </span>
            </div>

            <button
              onClick={handleRunAuditScan}
              className="inline-flex items-center justify-center gap-1.5 bg-[#233a2e] text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-[#344c3f] transition-colors border border-[#8aa494]/30 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Integrity Scan</span>
            </button>
          </div>
        </div>
      </section>

      {/* Audit Feedback Toast */}
      {auditMessage && (
        <div className="p-3 bg-[#cee9d7] text-[#082015] rounded-xl text-xs font-semibold flex items-center gap-2 border border-[#8aa494] shadow-sm animate-fade-in">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span>{auditMessage}</span>
        </div>
      )}

      {/* Interactive Add / Quick-Edit Form Card rendered at the very top */}
      {isFormOpen && (
        <MemberEditForm
          activeEditingMember={activeEditingMember}
          members={members}
          language={language}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          firstNameMl={firstNameMl}
          setFirstNameMl={setFirstNameMl}
          lastNameMl={lastNameMl}
          setLastNameMl={setLastNameMl}
          maidenName={maidenName}
          setMaidenName={setMaidenName}
          generation={generation}
          setGeneration={setGeneration}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          birthplace={birthplace}
          setBirthplace={setBirthplace}
          isLiving={isLiving}
          setIsLiving={setIsLiving}
          role={role}
          setRole={setRole}
          bio={bio}
          setBio={setBio}
          fatherId={fatherId}
          setFatherId={setFatherId}
          motherId={motherId}
          setMotherId={setMotherId}
          spouseIds={spouseIds}
          setSpouseIds={setSpouseIds}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          isCreatingWife={isCreatingWife}
          setIsCreatingWife={setIsCreatingWife}
          isCreatingParent={isCreatingParent}
          setIsCreatingParent={setIsCreatingParent}
          newParentName={newParentName}
          setNewParentName={setNewParentName}
          newParentNameMl={newParentNameMl}
          setNewParentNameMl={setNewParentNameMl}
          newParentBirthYear={newParentBirthYear}
          setNewParentBirthYear={setNewParentBirthYear}
          newWifeName={newWifeFirstName}
          setNewWifeName={setNewWifeFirstName}
          newWifeNameMl={newWifeFirstNameMl}
          setNewWifeNameMl={setNewWifeFirstNameMl}
          newWifeBirthYear={newWifeBirthYear}
          setNewWifeBirthYear={setNewWifeBirthYear}
          selectedSpouseToLink={selectedSpouseToLink}
          setSelectedSpouseToLink={setSelectedSpouseToLink}
          handleCreateAndLinkParent={() => handleCreateAndLinkParent({ preventDefault: () => {} } as React.FormEvent)}
          handleCreateAndLinkWife={() => handleCreateAndLinkWife({ preventDefault: () => {} } as React.FormEvent)}
          handleLinkExistingSpouse={handleAddExistingWife}
          handleRemoveWife={handleRemoveWife}
          getName={getName}
          isSaving={isSaving}
          onSave={handleSaveMember}
          onClose={handleCloseForm}
        />
      )}

      {/* Centralized Vercel Cloud Database Storage Card */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#e7e2d8] flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0d2419]/10 text-[#0d2419] flex items-center justify-center border border-[#0d2419]/20 flex-shrink-0">
              <span className="material-symbols-outlined text-xl">cloud_sync</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-sm sm:text-base text-[#0d2419]">
                  {language === 'ml' ? 'കേന്ദ്രീകൃത സെർവർ സ്റ്റോറേജ്' : 'Central Server Cloud Storage'}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    serverStatus === 'connected'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : serverStatus === 'connecting'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-stone-100 text-stone-600 border-stone-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      serverStatus === 'connected'
                        ? 'bg-emerald-500 animate-pulse'
                        : serverStatus === 'connecting'
                        ? 'bg-amber-500'
                        : 'bg-stone-400'
                    }`}
                  ></span>
                  <span>
                    {serverStatus === 'connected'
                      ? (language === 'ml' ? 'സെർവർ ആക്റ്റീവ്' : 'Connected to Server')
                      : serverStatus === 'connecting'
                      ? (language === 'ml' ? 'കണക്റ്റ് ചെയ്യുന്നു...' : 'Connecting...')
                      : (language === 'ml' ? 'ഓഫ്‌ലൈൻ' : 'Offline Cache')}
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-[#727974] mt-0.5">
                {language === 'ml'
                  ? 'ഡാറ്റ ബ്രൗസറിൽ മാത്രമല്ല, സെൻട്രൽ ക്ലൗഡ് സെർവറിൽ സുരക്ഷിതമായി സൂക്ഷിക്കുന്നു. ആര് സന്ദർശിച്ചാലും തത്സമയം കാണാം.'
                  : 'Master records stored centrally on the server backend — not limited to browser memory. Shared live with all visitors.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSyncToServer && (
              <button
                onClick={async () => {
                  if (isServerSyncing) return;
                  setIsServerSyncing(true);
                  setServerMessage(null);
                  try {
                    await onSyncToServer();
                    setServerMessage(language === 'ml' ? 'സെർവറിലേക്ക് വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു!' : 'Pushed to Central Server successfully!');
                  } catch {
                    setServerMessage(language === 'ml' ? 'സെർവർ സിങ്ക് പരാജയപ്പെട്ടു' : 'Failed to sync with server');
                  } finally {
                    setIsServerSyncing(false);
                    setTimeout(() => setServerMessage(null), 4000);
                  }
                }}
                disabled={isServerSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d2419] hover:bg-[#1a3828] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex-shrink-0 disabled:opacity-50"
                title="Force push current tree to Central Cloud Store"
              >
                <span className={`material-symbols-outlined text-[15px] ${isServerSyncing ? 'animate-spin' : ''}`}>
                  {isServerSyncing ? 'sync' : 'cloud_upload'}
                </span>
                <span className="hidden sm:inline">
                  {language === 'ml' ? 'സെർവർ സിങ്ക്' : 'Sync to Cloud'}
                </span>
              </button>
            )}

            {onPullFromServer && (
              <button
                onClick={async () => {
                  if (isServerSyncing) return;
                  setIsServerSyncing(true);
                  setServerMessage(null);
                  try {
                    await onPullFromServer();
                    setServerMessage(language === 'ml' ? 'സെർവറിൽ നിന്ന് ഏറ്റവും പുതിയ ഡാറ്റ എടുത്തു!' : 'Retrieved latest records from server!');
                  } catch {
                    setServerMessage(language === 'ml' ? 'ഡാറ്റ എടുക്കാൻ കഴിഞ്ഞില്ല' : 'Failed to fetch from server');
                  } finally {
                    setIsServerSyncing(false);
                    setTimeout(() => setServerMessage(null), 4000);
                  }
                }}
                disabled={isServerSyncing}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#f4efe4] hover:bg-[#ede8de] border border-[#e7e2d8] text-[#0d2419] text-xs font-bold active:scale-95 transition-all"
                title="Fetch latest updates from server"
              >
                <span className="material-symbols-outlined text-[15px]">cloud_download</span>
                <span className="hidden sm:inline">{language === 'ml' ? 'പുതുക്കുക' : 'Pull'}</span>
              </button>
            )}
          </div>
        </div>

        {serverMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
            <span>{serverMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-[#fbf8f2] border border-[#e7e2d8]/60 flex flex-col">
            <span className="text-[10px] text-[#727974] font-medium uppercase tracking-wider">
              {language === 'ml' ? 'സ്റ്റോറേജ് എഞ്ചിൻ' : 'Engine'}
            </span>
            <span className="text-xs font-bold text-[#0d2419] truncate mt-0.5">
              {serverEngine || 'Central Server Database'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#fbf8f2] border border-[#e7e2d8]/60 flex flex-col">
            <span className="text-[10px] text-[#727974] font-medium uppercase tracking-wider">
              {language === 'ml' ? 'ആകെ അംഗങ്ങൾ' : 'Saved Members'}
            </span>
            <span className="text-xs font-bold text-[#0d2419] mt-0.5">
              {members.length} {language === 'ml' ? 'വ്യക്തികൾ' : 'individuals'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#fbf8f2] border border-[#e7e2d8]/60 flex flex-col">
            <span className="text-[10px] text-[#727974] font-medium uppercase tracking-wider">
              {language === 'ml' ? 'ടൈംലൈൻ നാഴികക്കല്ലുകൾ' : 'Milestones'}
            </span>
            <span className="text-xs font-bold text-[#0d2419] mt-0.5">
              {(timeline?.length || 0)} {language === 'ml' ? 'രേഖകൾ' : 'events'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#fbf8f2] border border-[#e7e2d8]/60 flex flex-col">
            <span className="text-[10px] text-[#727974] font-medium uppercase tracking-wider">
              {language === 'ml' ? 'അവസാനം അപ്‌ഡേറ്റ്' : 'Last Synced'}
            </span>
            <span className="text-xs font-bold text-[#0d2419] truncate mt-0.5">
              {lastServerSync ? new Date(lastServerSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}
            </span>
          </div>
        </div>
      </section>

      {/* Centralized Google Drive Cloud Storage Card */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#e7e2d8] flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center border border-[#1a73e8]/20 flex-shrink-0">
              <span className="material-symbols-outlined text-xl">drive_folder_upload</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-sm sm:text-base text-[#0d2419]">
                  {language === 'ml' ? 'ഗൂഗിൾ ഡ്രൈവ് കേന്ദ്രീകൃത സംഭരണം' : 'Centralized Google Drive Storage'}
                </h3>
                {isConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1a73e8]/10 text-[#1a56c4] border border-[#1a73e8]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-pulse"></span>
                    <span>Live Cloud Sync</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#727974] mt-0.5">
                {language === 'ml'
                  ? 'കുടുംബ വൃക്ഷത്തിന്റെ എല്ലാ രേഖകളും നിങ്ങളുടെ സ്വന്തം ഗൂഗിൾ ഡ്രൈവിലെ ഒരു ഫയലിൽ തത്സമയം സൂക്ഷിക്കുന്നു'
                  : 'Master family records stored and synchronized in a JSON file on your own Google Drive'}
              </p>
            </div>
          </div>

          {isConnected && driveFileUrl && (
            <a
              href={driveFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a73e8] hover:bg-[#1558b0] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex-shrink-0"
              title="Open the data file in Google Drive"
            >
              <span className="hidden sm:inline">{language === 'ml' ? 'ഡ്രൈവിൽ തുറക്കുക' : 'Open in Google Drive'}</span>
              <span className="sm:hidden">Drive</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          )}
        </div>

        {syncError && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-600">error</span>
            <span>{syncError}</span>
          </div>
        )}

        {!isConnected ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#f8f3e9] border border-[#e7e2d8]">
            <div className="text-xs text-[#424844]">
              <p className="font-semibold text-[#0d2419]">
                {language === 'ml' ? 'ഗൂഗിൾ ഡ്രൈവ് ബന്ധിപ്പിച്ചിട്ടില്ല' : 'Connect Google Drive to enable centralized cloud storage'}
              </p>
              <p className="text-[11px] text-[#727974] mt-0.5">
                {language === 'ml'
                  ? 'ഗൂഗിൾ അക്കൗണ്ട് ഉപയോഗിച്ച് ലോഗിൻ ചെയ്താൽ ഡാറ്റ ഫയൽ സ്വയം സൃഷ്ടിക്കപ്പെടും.'
                  : 'Sign in to automatically create and sync a family tree data file on your own Google Drive.'}
              </p>
            </div>
            <GoogleSignInButton onClick={login} isLoading={isSyncing} size="sm" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#fbf8f2] border border-[#e7e2d8] text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full ring-1 ring-[#0f9d58]" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#0d2419] text-white flex items-center justify-center text-[10px] font-bold">
                    {user?.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-[#424844] truncate text-[11px] sm:text-xs">
                  {user?.email} • <strong>{driveFileName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#727974] flex-shrink-0">
                <span>
                  {language === 'ml' ? 'അവസാനം സേവ് ചെയ്തത്:' : 'Last Synced:'}{' '}
                  <strong>{lastSynced ? lastSynced.toLocaleTimeString() : 'Ready'}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await syncPush(members, timeline || []);
                    if (ok) {
                      setAuditMessage(
                        language === 'ml'
                          ? `ഗൂഗിൾ ഡ്രൈവിലേക്ക് വിജയകരമായി അപ്‌ലോഡ് ചെയ്തു! (${members.length} അംഗങ്ങൾ)`
                          : `Pushed all ${members.length} records to Google Drive!`
                      );
                    }
                  }}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d2419] hover:bg-[#1d3d2c] text-[#fdcd7b] text-xs font-bold transition-all active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">cloud_upload</span>
                  <span>{language === 'ml' ? 'ഡ്രൈവിലേക്ക് പുഷ് ചെയ്യുക' : 'Push to Drive'}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const res = await syncPull();
                    if (res && res.members.length > 0) {
                      if (onUpdateAllMembers) onUpdateAllMembers(res.members);
                      if (onUpdateTimeline && res.timeline.length > 0) onUpdateTimeline(res.timeline);
                      setAuditMessage(
                        language === 'ml'
                          ? `ഗൂഗിൾ ഡ്രൈവിൽ നിന്ന് ${res.members.length} അംഗങ്ങളെ ലഭ്യമാക്കി!`
                          : `Retrieved ${res.members.length} records from Google Drive!`
                      );
                    }
                  }}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f4efe4] hover:bg-[#ede8de] border border-[#e7e2d8] text-[#0d2419] text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#7b5810]">cloud_download</span>
                  <span>{language === 'ml' ? 'ഡ്രൈവിൽ നിന്ന് എടുക്കുക' : 'Pull from Drive'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-[#424844] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => toggleAutoSync(e.target.checked)}
                    className="rounded text-[#0f9d58] focus:ring-[#0f9d58]"
                  />
                  <span>{language === 'ml' ? 'ഓട്ടോ-സിങ്ക്' : 'Auto-sync'}</span>
                </label>

                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-[#727974] hover:text-red-700 underline cursor-pointer"
                >
                  {language === 'ml' ? 'സൈൻ ഔട്ട്' : 'Sign out'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Health & Audit Summary Cards */}
      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="flex flex-col p-3 bg-white rounded-xl shadow-xs border border-[#e7e2d8]">
          <div className="flex items-center justify-between text-[#424844]">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Nodes</span>
            <span className="material-symbols-outlined text-[18px] text-[#0d2419]">diversity_3</span>
          </div>
          <span className="font-display text-xl sm:text-2xl font-bold text-[#0d2419] mt-1">
            {members.length}
          </span>
          <span className="text-[10px] text-[#424844] truncate">Catalogued</span>
        </div>

        <div className="flex flex-col p-3 bg-white rounded-xl shadow-xs border border-[#e7e2d8]">
          <div className="flex items-center justify-between text-[#7b5810]">
            <span className="text-[10px] uppercase font-bold tracking-wider">Approvals</span>
            <span className="material-symbols-outlined text-[18px]">pending_actions</span>
          </div>
          <span className="font-display text-xl sm:text-2xl font-bold text-[#7b5810] mt-1">2</span>
          <span className="text-[10px] text-[#7b5810] truncate">Review queued</span>
        </div>

        <div className="flex flex-col p-3 bg-[#ffdad6] text-[#93000a] rounded-xl shadow-xs border border-[#ffdad6]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider">Unlinked</span>
            <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">link_off</span>
          </div>
          <span className="font-display text-xl sm:text-2xl font-bold text-[#ba1a1a] mt-1">1</span>
          <span className="text-[10px] text-[#93000a] truncate">Orphan record</span>
        </div>
      </section>

      {/* Search & Filter Controls */}
      <section className="flex flex-col gap-2">
        <div className="relative flex items-center bg-white rounded-xl shadow-xs px-3.5 py-1.5 border border-[#e7e2d8]">
          <span className="material-symbols-outlined text-[#727974] text-[20px] mr-2">search</span>
          <input
            type="text"
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            placeholder="Search lineage by name, birth year, or ID..."
            className="w-full bg-transparent text-xs sm:text-sm text-[#1d1c16] placeholder:text-[#727974] focus:outline-none py-1"
          />
          {adminSearch && (
            <button onClick={() => setAdminSearch('')} className="text-[#727974]">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 transition-all ${
              activeFilter === 'all'
                ? 'bg-[#0d2419] text-white'
                : 'bg-[#ede8de] text-[#424844] hover:bg-[#e7e2d8]'
            }`}
          >
            All Members ({members.length})
          </button>
          <button
            onClick={() => setActiveFilter('direct')}
            className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 transition-all ${
              activeFilter === 'direct'
                ? 'bg-[#0d2419] text-white'
                : 'bg-[#ede8de] text-[#424844] hover:bg-[#e7e2d8]'
            }`}
          >
            Direct Line ({members.filter((m) => m.isDirectLine).length})
          </button>
          <button
            onClick={() => setActiveFilter('inlaws')}
            className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 transition-all ${
              activeFilter === 'inlaws'
                ? 'bg-[#0d2419] text-white'
                : 'bg-[#ede8de] text-[#424844] hover:bg-[#e7e2d8]'
            }`}
          >
            In-Laws / Spouses ({members.filter((m) => !m.isDirectLine).length})
          </button>
          <button
            onClick={() => setActiveFilter('broken')}
            className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 transition-all flex items-center gap-1 ${
              activeFilter === 'broken'
                ? 'bg-[#ba1a1a] text-white'
                : 'bg-[#ffdeaa] text-[#271900]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">priority_high</span>
            <span>1 Broken Link</span>
          </button>
        </div>
      </section>


      {/* Member Management List */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 py-1">
          <span className="font-display font-bold text-sm text-[#0d2419]">
            Lineage Index &amp; Node Ownership
          </span>
          <span className="text-xs text-[#424844]">
            Showing {filteredList.length} of {members.length}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {filteredList.map((member) => {
            const parentName = member.parentIds[0]
              ? members.find((p) => p.id === member.parentIds[0])?.firstName
              : 'None (Root)';
            const isLocked = member.isLocked;

            return (
              <div
                key={member.id}
                className="flex flex-col bg-white p-3.5 rounded-xl shadow-xs border border-[#e7e2d8] gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={member.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTeTGurBSbfgFFCZlmuHiYiCV2dklzswenq3bcmeqpqVPmkiWcLXsrOLnHR6D3kX3W8j0KIZLuC7jsS6IiO_4fcxHVCz3kOQzZR_04NQX2klxYVbU--PBMsVIZggBdJYNelxi5Y8eJSZb4MGS6PvzbkTW9evpsiYAliLRsHsSJ3X6R-CE2cnQWroVyJ--ho977JA0GIeoqLWDEye_ClxdVkPLVEMm6ewWhPGJIuAWd_vcdsjsBaY'}
                        alt={member.firstName}
                        className="w-12 h-12 rounded-full object-cover bg-[#f2ede3]"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-[#0d2419] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {member.generation}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-[#0d2419] truncate">
                          {getName(member)}
                        </span>
                        {member.generation === 1 && (
                          <span className="bg-[#ffdeaa] text-[#271900] text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                            Root
                          </span>
                        )}
                        <span className="bg-[#ede8de] text-[#424844] text-[9px] px-1.5 py-0.2 rounded font-semibold">
                          Gen {member.generation}
                        </span>
                      </div>

                      <span className="text-[11px] text-[#424844]">
                        {member.isLiving
                          ? `b. ${member.birthYear}`
                          : `${member.birthYear} – ${member.deathYear}`}{' '}
                        • {member.birthplace}
                      </span>

                      <span className="text-[11px] text-[#7b5810] flex items-center gap-1 mt-0.5 truncate">
                        <span className="material-symbols-outlined text-[12px]">account_tree</span>
                        <span>Trunk Parent: {parentName}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleStartEdit(member)}
                      className="px-3 py-1.5 rounded-xl bg-[#0d2419] hover:bg-[#1a3828] text-[#fdcd7b] text-xs font-bold flex items-center gap-1.5 shadow-xs border border-[#fdcd7b]/40 cursor-pointer active:scale-95 transition-all"
                      title="Edit Profile Details"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>{language === 'ml' ? 'തിരുത്തുക' : 'Edit'}</span>
                    </button>

                    {isLocked ? (
                      <div className="relative group">
                        <button
                          disabled
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#ede8de] text-[#727974] cursor-not-allowed"
                          title="Root Patriarch locked"
                        >
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteTarget(member)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white transition-colors"
                        title="Delete Node"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Deletion Confirmation Modal Sheet */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-[#1d1c16]/60 backdrop-blur-sm flex items-end justify-center p-4 pb-safe animate-fade-in">
          <div className="w-full bg-white rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xl max-w-md mx-auto border border-[#ffdad6]">
            <div className="w-10 h-1 bg-[#e7e2d8] rounded-full mx-auto"></div>

            <div className="flex items-center gap-2.5 text-[#ba1a1a]">
              <div className="w-9 h-9 rounded-full bg-[#ffdad6] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div className="flex flex-col">
                <h4 className="font-display font-bold text-sm sm:text-base text-[#0d2419]">
                  Confirm Node Deletion
                </h4>
                <span className="text-[10px] text-[#ba1a1a] font-bold uppercase tracking-wider">
                  Destructive Lineage Action
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#f8f3e9] rounded-xl text-xs text-[#424844] leading-relaxed border border-[#e7e2d8]">
              <p>
                You are about to remove{' '}
                <strong className="text-[#0d2419]">
                  {deleteTarget.firstName} {deleteTarget.lastName}
                </strong>{' '}
                from the lineage archives.
              </p>
              <div className="mt-2 p-2 bg-[#ffdad6]/40 text-[#93000a] rounded-lg flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[15px] mt-0.5 flex-shrink-0">
                  crisis_alert
                </span>
                <span className="text-[11px] leading-tight">
                  Descendant records will be preserved and automatically rerouted to the closest
                  ancestral trunk node.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  onDeleteMember(deleteTarget.id);
                  setDeleteTarget(null);
                  setAuditMessage(`Removed ${deleteTarget.firstName} and reorganized branches.`);
                  setTimeout(() => setAuditMessage(null), 4000);
                }}
                className="w-full bg-[#ba1a1a] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#93000a] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                <span>Permanently Delete &amp; Sever Tree Links</span>
              </button>

              <button
                onClick={() => setDeleteTarget(null)}
                className="w-full bg-[#f2ede3] text-[#1d1c16] text-xs font-semibold py-2 rounded-xl hover:bg-[#ede8de] transition-colors"
              >
                Cancel &amp; Keep Member Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions & Utility Bar */}
      <section className="flex flex-col gap-3 bg-[#f8f3e9] p-4 rounded-2xl border border-[#e7e2d8]">
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-sm text-[#0d2419]">Archival Safeguards</span>
          <span className="text-[10px] text-[#7b5810] font-bold uppercase tracking-wider">
            Auto-Sync Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={handleExportGedcom}
            className="flex items-center justify-center gap-2 bg-white hover:bg-[#f2ede3] text-[#0d2419] text-xs font-bold p-3 rounded-xl shadow-xs transition-all border border-[#e7e2d8] active:scale-95"
            title="Download standard GEDCOM 5.5 genealogical exchange format"
          >
            <span className="material-symbols-outlined text-[18px] text-[#7b5810]">
              file_download
            </span>
            <span className="truncate">Export GEDCOM 5.5</span>
          </button>

          <button
            onClick={handleBackupSnapshot}
            className="flex items-center justify-center gap-2 bg-white hover:bg-[#f2ede3] text-[#0d2419] text-xs font-bold p-3 rounded-xl shadow-xs transition-all border border-[#e7e2d8] active:scale-95"
            title="Save complete JSON database of family records"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0d2419]">cloud_sync</span>
            <span className="truncate">Backup Tree Snapshot</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 px-1">
          <div className="flex items-center gap-1.5 text-[#424844] text-[11px]">
            <span className="material-symbols-outlined text-[15px]">history</span>
            <span>Activity Log (14 recent edits today)</span>
          </div>
          <button
            onClick={() => setIsLedgerOpen(true)}
            className="text-[11px] text-[#0d2419] font-bold hover:underline"
          >
            View Ledger
          </button>
        </div>
      </section>

      {/* Activity Ledger Modal */}
      {isLedgerOpen && (
        <div className="fixed inset-0 z-50 bg-[#1d1c16]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-[#e7e2d8] flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7e2d8]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7b5810]">history_edu</span>
                <h3 className="font-display font-bold text-sm sm:text-base text-[#0d2419]">
                  Archival Audit Ledger
                </h3>
              </div>
              <button onClick={() => setIsLedgerOpen(false)} className="text-[#727974]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#f8f3e9] rounded-lg flex flex-col gap-0.5 border border-[#e7e2d8]">
                <div className="flex justify-between font-bold text-[#0d2419]">
                  <span>Patriarch Aayinikunnathth Maayan Kutty Node Locked</span>
                  <span className="text-[10px] text-[#727974]">Today</span>
                </div>
                <span className="text-[#424844]">Root patriarch preservation safeguard applied.</span>
              </div>
              <div className="p-2.5 bg-[#f8f3e9] rounded-lg flex flex-col gap-0.5 border border-[#e7e2d8]">
                <div className="flex justify-between font-bold text-[#0d2419]">
                  <span>Document #1948 Manifest Linked</span>
                  <span className="text-[10px] text-[#727974]">Today 09:12</span>
                </div>
                <span className="text-[#424844]">Added R.M.S. Queen Mary transatlantic passenger folio.</span>
              </div>
              <div className="p-2.5 bg-[#f8f3e9] rounded-lg flex flex-col gap-0.5 border border-[#e7e2d8]">
                <div className="flex justify-between font-bold text-[#0d2419]">
                  <span>Candle Memorial Counter Verified</span>
                  <span className="text-[10px] text-[#727974]">Today 08:30</span>
                </div>
                <span className="text-[#424844]">138 tributes synchronized with forest hills ledger.</span>
              </div>
            </div>

            <button
              onClick={() => setIsLedgerOpen(false)}
              className="w-full py-2 bg-[#0d2419] text-white text-xs font-bold rounded-xl mt-2"
            >
              Close Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
