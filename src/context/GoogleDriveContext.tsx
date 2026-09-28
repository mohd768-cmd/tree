/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  signInWithGoogle,
  signOutGoogle,
  getAccessToken,
} from '../services/googleAuth';
import {
  connectOrCreateDriveFile,
  pushDataToDrive,
  pullDataFromDrive,
  STORAGE_FILE_ID_KEY,
  STORAGE_AUTO_SYNC_KEY,
  getDriveFileUrl,
  DRIVE_FILE_NAME,
} from '../services/googleDrive';
import { FamilyMember, TimelineMilestone } from '../types';

export interface GoogleDriveContextType {
  user: User | null;
  isConnected: boolean;
  fileId: string | null;
  fileUrl: string | null;
  fileName: string;
  isSyncing: boolean;
  lastSynced: Date | null;
  syncError: string | null;
  autoSync: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  syncPush: (members: FamilyMember[], timeline: TimelineMilestone[]) => Promise<boolean>;
  syncPull: () => Promise<{ members: FamilyMember[]; timeline: TimelineMilestone[] } | null>;
  setCustomFileId: (id: string, members: FamilyMember[], timeline: TimelineMilestone[]) => Promise<boolean>;
  toggleAutoSync: (enabled: boolean) => void;
  clearError: () => void;
}

const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

export const GoogleDriveProvider: React.FC<{
  children: React.ReactNode;
  onDataLoadedFromDrive?: (data: { members: FamilyMember[]; timeline: TimelineMilestone[] }) => void;
}> = ({ children, onDataLoadedFromDrive }) => {
  const [user, setUser] = useState<User | null>(null);
  const [fileId, setFileId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_FILE_ID_KEY);
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [autoSync, setAutoSyncState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_AUTO_SYNC_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const onDataLoadedRef = useRef(onDataLoadedFromDrive);
  useEffect(() => {
    onDataLoadedRef.current = onDataLoadedFromDrive;
  }, [onDataLoadedFromDrive]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser) => {
        setUser(authUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const toggleAutoSync = (enabled: boolean) => {
    setAutoSyncState(enabled);
    localStorage.setItem(STORAGE_AUTO_SYNC_KEY, String(enabled));
  };

  const clearError = () => setSyncError(null);

  // Sign in with Google
  const login = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const result = await signInWithGoogle();
      setUser(result.user);

      const token = result.accessToken;
      const conn = await connectOrCreateDriveFile(token, [], [], fileId || undefined);
      setFileId(conn.id);

      if (!conn.isNew) {
        const remoteData = await pullDataFromDrive(token, conn.id);
        if (remoteData.members.length > 0) {
          if (onDataLoadedRef.current) {
            onDataLoadedRef.current(remoteData);
          }
          window.dispatchEvent(
            new CustomEvent('googledrive:dataloaded', { detail: remoteData })
          );
          setLastSynced(new Date());
        }
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setSyncError(err?.message || 'Google Sign-in failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const logout = async () => {
    try {
      await signOutGoogle();
      setUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  // Push current app data to the Drive file
  const syncPush = async (
    members: FamilyMember[],
    timeline: TimelineMilestone[]
  ): Promise<boolean> => {
    const token = getAccessToken();
    if (!token) {
      setSyncError('Please sign in with Google to sync to Google Drive');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      let activeFileId = fileId;
      if (!activeFileId) {
        const conn = await connectOrCreateDriveFile(token, members, timeline);
        activeFileId = conn.id;
        setFileId(conn.id);
      } else {
        await pushDataToDrive(token, activeFileId, members, timeline);
      }
      setLastSynced(new Date());
      return true;
    } catch (err: any) {
      console.error('Push to Google Drive failed:', err);
      setSyncError(err?.message || 'Failed to save to Google Drive');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull data from the Drive file into the app
  const syncPull = async (): Promise<{
    members: FamilyMember[];
    timeline: TimelineMilestone[];
  } | null> => {
    const token = getAccessToken();
    if (!token) {
      setSyncError('Please sign in with Google to sync from Google Drive');
      return null;
    }

    if (!fileId) {
      setSyncError('No Google Drive file connected yet');
      return null;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      const data = await pullDataFromDrive(token, fileId);
      if (data.members.length > 0) {
        if (onDataLoadedRef.current) {
          onDataLoadedRef.current(data);
        }
        window.dispatchEvent(
          new CustomEvent('googledrive:dataloaded', { detail: data })
        );
        setLastSynced(new Date());
      }
      return data;
    } catch (err: any) {
      console.error('Pull from Google Drive failed:', err);
      setSyncError(err?.message || 'Failed to fetch from Google Drive');
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  // Connect to a custom Drive file ID
  const setCustomFileId = async (
    customId: string,
    members: FamilyMember[],
    timeline: TimelineMilestone[]
  ): Promise<boolean> => {
    const token = getAccessToken();
    if (!token) {
      setSyncError('Please sign in with Google first');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      const conn = await connectOrCreateDriveFile(token, members, timeline, customId);
      setFileId(conn.id);
      setLastSynced(new Date());
      return true;
    } catch (err: any) {
      console.error('Custom Drive file connect error:', err);
      setSyncError(err?.message || 'Invalid or inaccessible Google Drive file');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const isConnected = !!user && !!getAccessToken();
  const fileUrl = fileId ? getDriveFileUrl(fileId) : null;

  return (
    <GoogleDriveContext.Provider
      value={{
        user,
        isConnected,
        fileId,
        fileUrl,
        fileName: DRIVE_FILE_NAME,
        isSyncing,
        lastSynced,
        syncError,
        autoSync,
        login,
        logout,
        syncPush,
        syncPull,
        setCustomFileId,
        toggleAutoSync,
        clearError,
      }}
    >
      {children}
    </GoogleDriveContext.Provider>
  );
};

const defaultGoogleDriveContext: GoogleDriveContextType = {
  user: null,
  isConnected: false,
  fileId: null,
  fileUrl: null,
  fileName: DRIVE_FILE_NAME,
  isSyncing: false,
  lastSynced: null,
  syncError: null,
  autoSync: false,
  login: async () => {},
  logout: async () => {},
  syncPush: async () => false,
  syncPull: async () => null,
  setCustomFileId: async () => false,
  toggleAutoSync: () => {},
  clearError: () => {},
};

export const useGoogleDrive = (): GoogleDriveContextType => {
  const context = useContext(GoogleDriveContext);
  return context || defaultGoogleDriveContext;
};
