/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TabType, FamilyMember, TimelineMilestone } from './types';
import { INITIAL_MEMBERS, INITIAL_TIMELINE, INITIAL_DOCUMENTS } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TreeView } from './components/TreeView';
import { DirectoryView } from './components/DirectoryView';
import { TimelineView } from './components/TimelineView';
import { AdminView } from './components/AdminView';
import { MemberDossierModal } from './components/MemberDossierModal';
import { AddMemberModal } from './components/AddMemberModal';
import { KinshipModal } from './components/KinshipModal';
import {
  fetchServerData,
  saveMemberToServer,
  deleteMemberFromServer,
  syncAllToServer,
  resetServerData,
} from './services/api';

// Sanitizes and ensures valid structural integrity without clobbering user edits
function healFamilyLineage(list: FamilyMember[]): FamilyMember[] {
  if (!Array.isArray(list) || list.length === 0) return list;

  return list.map((m) => {
    // Preserve all user edits; provide fallback only if firstName is completely blank
    return {
      ...m,
      firstName: m.firstName?.trim() || (m.id === 'mayan_kutty' ? 'Aayinikunnathth Maayan Kutty' : 'Unnamed Member'),
      generation: (m.generation || (m.parentIds && m.parentIds.length > 0 ? 2 : 1)) as 1 | 2 | 3 | 4 | 5,
    };
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('tree');

  // Vercel Server Storage Connection State
  const [serverStatus, setServerStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const [serverEngine, setServerEngine] = useState<string>('Vercel Cloud Database');
  const [lastServerSync, setLastServerSync] = useState<string | null>(null);

  // Persistent Family Members State
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    localStorage.removeItem('montgomery_members');
    localStorage.removeItem('montgomery_timeline');
    localStorage.removeItem('mayankutty_members_v1');
    localStorage.removeItem('mayankutty_timeline_v1');

    const saved = localStorage.getItem('mayankutty_members_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return healFamilyLineage(parsed);
        }
      } catch {
        return INITIAL_MEMBERS;
      }
    }
    return INITIAL_MEMBERS;
  });

  // Persistent Timeline State
  const [timeline, setTimeline] = useState<TimelineMilestone[]>(() => {
    const saved = localStorage.getItem('mayankutty_timeline_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        return INITIAL_TIMELINE;
      }
    }
    return INITIAL_TIMELINE;
  });

  // Selected Member for Peek Drawer & Dossier (Default to Patriarch Mayan Kutty)
  const [selectedMember, setSelectedMember] = useState<FamilyMember>(() => {
    return (
      members.find((m) => m.id === 'mayan_kutty') ||
      members[0] ||
      INITIAL_MEMBERS[0]
    );
  });

  // Member Dossier Modal State
  const [dossierMember, setDossierMember] = useState<FamilyMember | null>(null);

  // Admin Edit Member Target State
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Global Kinship / Relation Calculator Modal State
  const [isKinshipModalOpen, setIsKinshipModalOpen] = useState(false);
  const [kinshipInitialA, setKinshipInitialA] = useState<FamilyMember | null>(null);
  const [kinshipInitialB, setKinshipInitialB] = useState<FamilyMember | null>(null);

  const handleOpenKinship = (memberA?: FamilyMember, memberB?: FamilyMember) => {
    setKinshipInitialA(memberA || selectedMember || members[0] || null);
    setKinshipInitialB(memberB || null);
    setIsKinshipModalOpen(true);
  };

  // Unified Add Member Modal State
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [addMemberRelationType, setAddMemberRelationType] = useState<
    'child' | 'spouse' | 'parent' | 'independent'
  >('child');
  const [addMemberConnectedId, setAddMemberConnectedId] = useState<string | undefined>(undefined);

  const handleOpenAddMemberModal = (
    relationType: 'child' | 'spouse' | 'parent' | 'independent' = 'child',
    connectedMemberId?: string
  ) => {
    setAddMemberRelationType(relationType);
    setAddMemberConnectedId(connectedMemberId || selectedMember?.id || 'mayan_kutty');
    setIsAddMemberModalOpen(true);
  };

  // Fetch live authoritative records from server
  const refreshFromServer = useCallback(async (quiet = false) => {
    try {
      const res = await fetchServerData();
      if (res.success && Array.isArray(res.members) && res.members.length > 0) {
        const healed = healFamilyLineage(res.members);
        setMembers((prev) => {
          // Compare to prevent redundant re-renders
          if (JSON.stringify(prev) === JSON.stringify(healed)) {
            return prev;
          }
          return healed;
        });

        setSelectedMember((prev) => (prev ? healed.find((m) => m.id === prev.id) || prev : healed[0]));
        setDossierMember((prev) => (prev ? healed.find((m) => m.id === prev.id) || prev : null));

        if (Array.isArray(res.timeline) && res.timeline.length > 0) {
          setTimeline(res.timeline);
        }
        setServerStatus('connected');
        if (res.storageEngine) setServerEngine(res.storageEngine);
        setLastServerSync(res.lastUpdated || new Date().toISOString());
      }
    } catch (err) {
      if (!quiet) {
        console.warn('Central server storage unreachable, using local store:', err);
        setServerStatus('offline');
      }
    }
  }, []);

  // 1. Initial mount fetch & real-time listeners (tab focus, cross-tab storage, polling, Google Drive)
  useEffect(() => {
    // Initial fetch on mount
    refreshFromServer(false);

    // Cross-tab synchronization in same browser
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'mayankutty_members_v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const healed = healFamilyLineage(parsed);
            setMembers(healed);
            setSelectedMember((prev) => (prev ? healed.find((m) => m.id === prev.id) || prev : healed[0]));
            setDossierMember((prev) => (prev ? healed.find((m) => m.id === prev.id) || prev : null));
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // Re-fetch whenever window gains focus or tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshFromServer(true);
      }
    };
    const handleFocus = () => {
      refreshFromServer(true);
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Automatic background poll every 8 seconds so other devices & logins see updates live
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshFromServer(true);
      }
    }, 8000);

    // Google Drive remote load event listener
    const handleGoogleDriveEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{ members: FamilyMember[]; timeline?: TimelineMilestone[] }>;
      if (customEvt.detail && Array.isArray(customEvt.detail.members) && customEvt.detail.members.length > 0) {
        const healed = healFamilyLineage(customEvt.detail.members);
        setMembers(healed);
        setSelectedMember((prev) => (prev ? healed.find((m) => m.id === prev.id) || prev : healed[0]));
        setDossierMember((prev) => (prev ? healed.find((m) => m.id === prev.id) || prev : null));
        if (customEvt.detail.timeline && customEvt.detail.timeline.length > 0) {
          setTimeline(customEvt.detail.timeline);
        }
        syncAllToServer(healed, customEvt.detail.timeline || timeline).catch(() => {});
      }
    };
    window.addEventListener('googledrive:dataloaded', handleGoogleDriveEvent);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('googledrive:dataloaded', handleGoogleDriveEvent);
      clearInterval(pollInterval);
    };
  }, [refreshFromServer, timeline]);

  // Sync to local cache as secondary offline buffer
  useEffect(() => {
    localStorage.setItem('mayankutty_members_v2', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('mayankutty_timeline_v2', JSON.stringify(timeline));
  }, [timeline]);

  // Handle member selection
  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
  };

  // Open Tree view directly centered on this member
  const handleViewMemberTree = (member: FamilyMember) => {
    setSelectedMember(member);
    setActiveTab('tree');
  };

  // Open full bio dossier
  const handleOpenDossier = (member: FamilyMember) => {
    setDossierMember(member);
  };

  // Switch to admin tab and pre-load member into form
  const handleNavigateToAdminEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setActiveTab('admin');
  };

  // Add member: saved to Vercel Cloud Storage
  const handleAddMember = async (newMember: FamilyMember) => {
    const updated = healFamilyLineage([newMember, ...members]);
    setMembers(updated);
    setSelectedMember(newMember);
    try {
      await saveMemberToServer(newMember, true);
      setServerStatus('connected');
      setLastServerSync(new Date().toISOString());
    } catch (err) {
      console.warn('Failed to save member to Vercel store:', err);
    }
  };

  const handleAddMemberWithConnections = async (
    newMember: FamilyMember,
    updatedRelatedMembers: FamilyMember[]
  ) => {
    const updatedMap = new Map(updatedRelatedMembers.map((m) => [m.id, m]));
    const result = members.map((m) => updatedMap.get(m.id) || m);
    const combined = !result.some((m) => m.id === newMember.id) ? [newMember, ...result] : result;
    const healed = healFamilyLineage(combined);
    setMembers(healed);
    setSelectedMember(newMember);
    try {
      await syncAllToServer(healed, timeline);
      setServerStatus('connected');
      setLastServerSync(new Date().toISOString());
    } catch (err) {
      console.warn('Failed to sync new member to Vercel store:', err);
    }
  };

  // Update member: saved to Vercel Cloud Storage
  const handleUpdateMember = async (updatedMember: FamilyMember) => {
    const updated = healFamilyLineage(
      members.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
    setMembers(updated);
    if (selectedMember?.id === updatedMember.id) {
      setSelectedMember(updatedMember);
    }
    if (dossierMember?.id === updatedMember.id) {
      setDossierMember(updatedMember);
    }
    try {
      await saveMemberToServer(updatedMember, false);
      setServerStatus('connected');
      setLastServerSync(new Date().toISOString());
    } catch (err) {
      console.warn('Failed to update member in Vercel store:', err);
    }
  };

  // Batch update members (used by Tree relation editor)
  const handleUpdateAllMembers = (updatedMembers: FamilyMember[]) => {
    const healed = healFamilyLineage(updatedMembers);
    setMembers(healed);
    if (selectedMember) {
      const refreshed = healed.find((m) => m.id === selectedMember.id);
      if (refreshed) {
        setSelectedMember(refreshed);
      }
    }
    if (dossierMember) {
      const refreshedDossier = healed.find((m) => m.id === dossierMember.id);
      if (refreshedDossier) {
        setDossierMember(refreshedDossier);
      }
    }
    syncAllToServer(healed, timeline).catch((err) =>
      console.warn('Background sync to Vercel warning:', err)
    );
  };

  // Delete member: removed from Vercel Cloud Storage
  const handleDeleteMember = async (memberId: string) => {
    const remaining = members.filter((m) => m.id !== memberId);
    const updated = remaining.length > 0 ? remaining : INITIAL_MEMBERS;
    setMembers(updated);
    if (selectedMember?.id === memberId) {
      setSelectedMember(remaining[0] || INITIAL_MEMBERS[0]);
    }
    if (dossierMember?.id === memberId) {
      setDossierMember(null);
    }
    try {
      await deleteMemberFromServer(memberId);
      setServerStatus('connected');
      setLastServerSync(new Date().toISOString());
    } catch (err) {
      console.warn('Failed to delete member from Vercel store:', err);
    }
  };

  // Add timeline memory
  const handleAddTimelineMemory = (memory: {
    title: string;
    year: number;
    generation: string;
    narrative: string;
  }) => {
    const newMilestone: TimelineMilestone = {
      id: `custom_${Date.now()}`,
      year: memory.year,
      title: memory.title,
      generationTag: memory.generation,
      location: 'Family Heritage Archives',
      description: memory.narrative,
      category: 'photos',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDTyXz1WJ3v5-bM6_v-gD4J4W-g39hY44V60rG2E7Jt_c6uX7m1i0E9g3t7Z1q9A2K9j8v2p4s2o6r1x9z5w7y3v1u5t9s7r5q3p1o9m7k5j3h1g9f7e5d3c1b9a7Z5Y3X1W9V7U5T3S1R9Q7P5O3N1M9L7K5J3I1H9G7F5E3D1C9B7A5',
      imageCaption: 'Submitted to archive record',
    };
    const updated = [...timeline, newMilestone].sort((a, b) => {
      const yA = typeof a.year === 'number' ? a.year : parseInt(String(a.year), 10) || 2020;
      const yB = typeof b.year === 'number' ? b.year : parseInt(String(b.year), 10) || 2020;
      return yA - yB;
    });
    setTimeline(updated);
    syncAllToServer(members, updated).catch((err) =>
      console.warn('Background timeline sync to Vercel warning:', err)
    );
  };

  // Manual Push to Vercel
  const handleManualServerSync = useCallback(async () => {
    const res = await syncAllToServer(members, timeline);
    if (res.success) {
      setServerStatus('connected');
      if (res.storageEngine) setServerEngine(res.storageEngine);
      setLastServerSync(res.lastUpdated || new Date().toISOString());
    }
  }, [members, timeline]);

  // Manual Pull from Vercel / Server
  const handleManualServerPull = useCallback(async () => {
    await refreshFromServer(false);
  }, [refreshFromServer]);

  // Reset Vercel Storage to initial Seed
  const handleResetServerData = useCallback(async () => {
    const res = await resetServerData();
    if (res.success) {
      setMembers(INITIAL_MEMBERS);
      setTimeline(INITIAL_TIMELINE);
      setServerStatus('connected');
      setLastServerSync(new Date().toISOString());
    }
  }, []);

  const adminMember =
    members.find((m) => m.id === 'kasim') ||
    members.find((m) => m.id === 'mayan_kutty') ||
    members[0] ||
    INITIAL_MEMBERS[0];

  return (
    <div className="min-h-screen bg-[#fef9ef] text-[#1d1c16] flex flex-col font-body selection:bg-[#ffdeaa] selection:text-[#271900]">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setActiveTab('directory')}
        onOpenAdmin={() => {
          setEditingMember(null);
          setActiveTab('admin');
        }}
        onSelectMember={(member) => {
          setSelectedMember(member);
          setDossierMember(member);
        }}
        onOpenAddMember={handleOpenAddMemberModal}
        onOpenKinship={() => handleOpenKinship()}
        serverStatus={serverStatus}
        serverEngine={serverEngine}
        currentMember={adminMember}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full pt-16 sm:pt-20 pb-16">
        {activeTab === 'tree' && (
          <TreeView
            members={members}
            selectedMember={selectedMember}
            onSelectMember={handleSelectMember}
            onOpenDossier={handleOpenDossier}
            onNavigateToAdminEdit={handleNavigateToAdminEdit}
            onUpdateMembers={handleUpdateAllMembers}
            onOpenAddMember={handleOpenAddMemberModal}
            onOpenKinship={handleOpenKinship}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView
            members={members}
            onSelectMember={handleSelectMember}
            onOpenDossier={handleOpenDossier}
            onViewTree={handleViewMemberTree}
            onOpenAddMember={handleOpenAddMemberModal}
            onOpenKinship={handleOpenKinship}
            onNavigateToAdminEdit={handleNavigateToAdminEdit}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            milestones={timeline}
            onAddMilestoneMemory={handleAddTimelineMemory}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            members={members}
            timeline={timeline}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onUpdateAllMembers={handleUpdateAllMembers}
            onUpdateTimeline={setTimeline}
            onDeleteMember={handleDeleteMember}
            editingMember={editingMember}
            onClearEditingMember={() => setEditingMember(null)}
            onOpenAddMember={handleOpenAddMemberModal}
            serverStatus={serverStatus}
            serverEngine={serverEngine}
            lastServerSync={lastServerSync}
            onSyncToServer={handleManualServerSync}
            onPullFromServer={handleManualServerPull}
            onResetServerData={handleResetServerData}
          />
        )}
      </main>

      {/* Persistent Bottom Tab Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onSelectTab={setActiveTab}
        memberCount={members.length}
      />

      {/* Full Bio & Lineage Dossier Modal */}
      {dossierMember && (
        <MemberDossierModal
          member={dossierMember}
          allMembers={members}
          documents={INITIAL_DOCUMENTS}
          onClose={() => setDossierMember(null)}
          onSelectRelative={(rel) => {
            setSelectedMember(rel);
            setDossierMember(rel);
          }}
          onEditInAdmin={(m) => {
            setDossierMember(null);
            handleNavigateToAdminEdit(m);
          }}
          onViewTree={handleViewMemberTree}
          onOpenKinship={(m) => handleOpenKinship(m)}
        />
      )}

      {/* Unified Add Member Modal with Explicit Connections Selection */}
      {isAddMemberModalOpen && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          members={members}
          onAddMember={handleAddMemberWithConnections}
          initialRelationType={addMemberRelationType}
          initialConnectedMemberId={addMemberConnectedId}
        />
      )}

      {/* Global Kinship & Relationship Calculator Modal */}
      {isKinshipModalOpen && (
        <KinshipModal
          initialMember={kinshipInitialA}
          initialTargetMember={kinshipInitialB}
          allMembers={members}
          onClose={() => setIsKinshipModalOpen(false)}
          onSelectMemberForTree={(m) => {
            handleViewMemberTree(m);
            setIsKinshipModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
