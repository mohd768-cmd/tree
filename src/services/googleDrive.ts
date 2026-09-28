/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Centralized family-tree storage backed by a single JSON file in the
 * signed-in user's own Google Drive (requires the `drive.file` scope,
 * which only grants access to files this app itself creates/opens —
 * no broad Drive access is requested).
 */

import { FamilyMember, TimelineMilestone } from '../types';

export const DRIVE_FILE_NAME = 'Aayinikunnathth-Family-Tree-Data.json';
export const STORAGE_FILE_ID_KEY = 'family_tree_drive_file_id';
export const STORAGE_AUTO_SYNC_KEY = 'family_tree_drive_auto_sync';

const DRIVE_FILES_ENDPOINT = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_ENDPOINT = 'https://www.googleapis.com/upload/drive/v3/files';

export interface DriveFileData {
  members: FamilyMember[];
  timeline: TimelineMilestone[];
  lastUpdated: string;
}

/**
 * Searches the user's Drive (within this app's access) for the existing
 * central family tree data file.
 */
export async function findDriveDataFile(accessToken: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(
      `name = '${DRIVE_FILE_NAME}' and trashed = false`
    );
    const res = await fetch(
      `${DRIVE_FILES_ENDPOINT}?q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&spaces=drive`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  } catch (err) {
    console.warn('Could not search Drive for existing data file:', err);
  }
  return null;
}

/**
 * Creates a new JSON data file in the user's Drive (root folder) and
 * populates it with the given members/timeline.
 */
export async function createDriveDataFile(
  accessToken: string,
  members: FamilyMember[],
  timeline: TimelineMilestone[]
): Promise<{ id: string; url: string }> {
  const payload: DriveFileData = {
    members,
    timeline,
    lastUpdated: new Date().toISOString(),
  };

  const metadata = {
    name: DRIVE_FILE_NAME,
    mimeType: 'application/json',
  };

  const boundary = `montgomery_lineage_${Date.now()}`;
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${JSON.stringify(payload, null, 2)}\r\n` +
    `--${boundary}--`;

  const createRes = await fetch(
    `${DRIVE_UPLOAD_ENDPOINT}?uploadType=multipart&fields=id`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Drive data file: ${errText}`);
  }

  const created = await createRes.json();
  const id = created.id;
  return { id, url: getDriveFileUrl(id) };
}

/**
 * Overwrites the contents of an existing Drive data file.
 */
export async function pushDataToDrive(
  accessToken: string,
  fileId: string,
  members: FamilyMember[],
  timeline: TimelineMilestone[]
): Promise<void> {
  const payload: DriveFileData = {
    members,
    timeline,
    lastUpdated: new Date().toISOString(),
  };

  const res = await fetch(`${DRIVE_UPLOAD_ENDPOINT}/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload, null, 2),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to save data to Google Drive: ${err}`);
  }
}

/**
 * Reads and parses the JSON contents of the Drive data file.
 */
export async function pullDataFromDrive(
  accessToken: string,
  fileId: string
): Promise<{ members: FamilyMember[]; timeline: TimelineMilestone[] }> {
  const res = await fetch(`${DRIVE_FILES_ENDPOINT}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch from Google Drive: ${err}`);
  }

  const data = (await res.json()) as Partial<DriveFileData>;
  return {
    members: Array.isArray(data.members) ? data.members : [],
    timeline: Array.isArray(data.timeline) ? data.timeline : [],
  };
}

/**
 * Resolves or creates the central Drive data file:
 * 1. Tries a user-supplied file ID
 * 2. Tries the previously linked ID from localStorage
 * 3. Searches Drive by filename
 * 4. Creates a new file
 */
export async function connectOrCreateDriveFile(
  accessToken: string,
  members: FamilyMember[],
  timeline: TimelineMilestone[],
  preferredFileId?: string
): Promise<{ id: string; url: string; isNew: boolean }> {
  // 1. If user provided a specific file ID, test it
  if (preferredFileId && preferredFileId.trim()) {
    const cleanId = preferredFileId.trim();
    const testRes = await fetch(`${DRIVE_FILES_ENDPOINT}/${cleanId}?fields=id`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (testRes.ok) {
      localStorage.setItem(STORAGE_FILE_ID_KEY, cleanId);
      return { id: cleanId, url: getDriveFileUrl(cleanId), isNew: false };
    }
  }

  // 2. Check localStorage for a previously linked file
  const savedId = localStorage.getItem(STORAGE_FILE_ID_KEY);
  if (savedId) {
    const testRes = await fetch(`${DRIVE_FILES_ENDPOINT}/${savedId}?fields=id`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (testRes.ok) {
      return { id: savedId, url: getDriveFileUrl(savedId), isNew: false };
    }
  }

  // 3. Search Drive for an existing file by name
  const foundId = await findDriveDataFile(accessToken);
  if (foundId) {
    localStorage.setItem(STORAGE_FILE_ID_KEY, foundId);
    return { id: foundId, url: getDriveFileUrl(foundId), isNew: false };
  }

  // 4. Create a new file
  const created = await createDriveDataFile(accessToken, members, timeline);
  localStorage.setItem(STORAGE_FILE_ID_KEY, created.id);
  return { id: created.id, url: created.url, isNew: true };
}

export function getDriveFileUrl(id: string): string {
  return `https://drive.google.com/file/d/${id}/view`;
}
