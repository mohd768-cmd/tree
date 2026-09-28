import fs from 'fs';
import path from 'path';
import { FamilyMember, TimelineMilestone } from '../src/types';
import { INITIAL_MEMBERS, INITIAL_TIMELINE } from '../src/data/mockData';

export interface StorageData {
  members: FamilyMember[];
  timeline: TimelineMilestone[];
  lastUpdated: string;
}

// In-memory cache for fast response and serverless continuity
let memoryCache: StorageData | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();

// Determine file storage path
function getFilePath(): string {
  // If in Vercel serverless environment, only /tmp is writable
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return '/tmp/family_tree_data.json';
  }
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // fallback to /tmp
      return '/tmp/family_tree_data.json';
    }
  }
  return path.join(dataDir, 'family_tree_data.json');
}

// Check for Vercel KV / Upstash Redis
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function getFromVercelKV(): Promise<StorageData | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/family_tree_data`, {
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
      },
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (body && body.result) {
      const parsed = typeof body.result === 'string' ? JSON.parse(body.result) : body.result;
      if (parsed && Array.isArray(parsed.members) && parsed.members.length > 0) {
        return parsed as StorageData;
      }
    }
  } catch (err) {
    console.warn('Vercel KV read warning:', err);
  }
  return null;
}

async function saveToVercelKV(data: StorageData): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const res = await fetch(`${KV_URL}/set/family_tree_data`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(data)),
    });
    return res.ok;
  } catch (err) {
    console.warn('Vercel KV write warning:', err);
    return false;
  }
}

/**
 * Read data from storage (Vercel KV -> Disk file -> In-memory -> Default Seed)
 */
export async function loadFamilyData(): Promise<{
  data: StorageData;
  storageEngine: string;
}> {
  // 1. Try Vercel KV if configured
  if (KV_URL && KV_TOKEN) {
    const kvData = await getFromVercelKV();
    if (kvData) {
      memoryCache = kvData;
      return { data: kvData, storageEngine: 'Vercel KV Cloud Database' };
    }
  }

  // 2. Try Memory Cache
  if (memoryCache && memoryCache.members && memoryCache.members.length > 0) {
    const engine = process.env.VERCEL ? 'Vercel Serverless Cache' : 'Server Memory & Disk';
    return { data: memoryCache, storageEngine: engine };
  }

  // 3. Try Local / /tmp File
  const filePath = getFilePath();
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.members) && parsed.members.length > 0) {
        memoryCache = parsed;
        const engine = process.env.VERCEL ? 'Vercel Serverless Storage' : 'Server Persistent File DB';
        return { data: parsed, storageEngine: engine };
      }
    } catch (err) {
      console.error('Error reading disk file:', err);
    }
  }

  // 4. Default to Initial Seed data and write it out
  const initialData: StorageData = {
    members: INITIAL_MEMBERS,
    timeline: INITIAL_TIMELINE,
    lastUpdated: new Date().toISOString(),
  };

  await saveFamilyData(initialData.members, initialData.timeline);
  memoryCache = initialData;

  const engine = process.env.VERCEL ? 'Vercel Initialized Cloud Store' : 'Server Default Seed Database';
  return { data: initialData, storageEngine: engine };
}

/**
 * Save data to storage (Memory + Disk + Vercel KV if available)
 */
export async function saveFamilyData(
  members: FamilyMember[],
  timeline: TimelineMilestone[]
): Promise<{ success: boolean; lastUpdated: string; storageEngine: string }> {
  // Execute sequentially through writeQueue to prevent race conditions and concurrent write corruption
  return new Promise((resolve, reject) => {
    writeQueue = writeQueue
      .then(async () => {
        const timestamp = new Date().toISOString();
        const storageData: StorageData = {
          members,
          timeline,
          lastUpdated: timestamp,
        };

        // Update in-memory
        memoryCache = storageData;

        // Save to disk
        try {
          const filePath = getFilePath();
          const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
          fs.writeFileSync(tempPath, JSON.stringify(storageData, null, 2), 'utf-8');
          fs.renameSync(tempPath, filePath);
        } catch (err) {
          console.error('Error writing storage to disk:', err);
        }

        // Save to Vercel KV if available
        let engine = process.env.VERCEL ? 'Vercel Serverless Storage' : 'Server Persistent File DB';
        if (KV_URL && KV_TOKEN) {
          const kvOk = await saveToVercelKV(storageData);
          if (kvOk) {
            engine = 'Vercel KV Cloud Database';
          }
        }

        resolve({
          success: true,
          lastUpdated: timestamp,
          storageEngine: engine,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * Add a new member
 */
export async function addMemberToStorage(newMember: FamilyMember): Promise<{
  success: boolean;
  member: FamilyMember;
  totalMembers: number;
}> {
  const { data } = await loadFamilyData();
  const existing = data.members.find((m) => m.id === newMember.id);
  const finalMember = existing ? { ...existing, ...newMember } : newMember;
  const updatedMembers = existing
    ? data.members.map((m) => (m.id === newMember.id ? finalMember : m))
    : [...data.members, newMember];

  await saveFamilyData(updatedMembers, data.timeline);
  return {
    success: true,
    member: finalMember,
    totalMembers: updatedMembers.length,
  };
}

/**
 * Update an existing member
 */
export async function updateMemberInStorage(updatedMember: FamilyMember): Promise<{
  success: boolean;
  member: FamilyMember;
}> {
  const { data } = await loadFamilyData();
  const existing = data.members.find((m) => m.id === updatedMember.id);
  const finalMember = existing ? { ...existing, ...updatedMember } : updatedMember;
  const updatedMembers = existing
    ? data.members.map((m) => (m.id === updatedMember.id ? finalMember : m))
    : [...data.members, finalMember];

  await saveFamilyData(updatedMembers, data.timeline);
  return {
    success: true,
    member: finalMember,
  };
}

/**
 * Delete a member
 */
export async function deleteMemberFromStorage(memberId: string): Promise<{
  success: boolean;
  remainingCount: number;
}> {
  const { data } = await loadFamilyData();
  const updatedMembers = data.members.filter((m) => m.id !== memberId);
  await saveFamilyData(updatedMembers, data.timeline);
  return {
    success: true,
    remainingCount: updatedMembers.length,
  };
}

/**
 * Reset back to initial seed data
 */
export async function resetStorageToSeed(): Promise<{
  success: boolean;
  members: FamilyMember[];
  timeline: TimelineMilestone[];
}> {
  await saveFamilyData(INITIAL_MEMBERS, INITIAL_TIMELINE);
  return {
    success: true,
    members: INITIAL_MEMBERS,
    timeline: INITIAL_TIMELINE,
  };
}
