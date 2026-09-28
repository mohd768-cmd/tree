import { FamilyMember, TimelineMilestone } from '../types';

export interface ServerDataResponse {
  success: boolean;
  members: FamilyMember[];
  timeline: TimelineMilestone[];
  lastUpdated?: string;
  storageEngine?: string;
  count?: number;
  error?: string;
}

export interface SyncResponse {
  success: boolean;
  savedCount?: number;
  lastUpdated?: string;
  storageEngine?: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  storageEngine: string;
  totalMembers: number;
  lastUpdated: string;
  isVercel: boolean;
  timestamp: string;
}

/**
 * Fetch all family members and timeline from the Vercel / server database
 */
export async function fetchServerData(): Promise<ServerDataResponse> {
  const res = await fetch(`/api/data?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!res.ok) {
    throw new Error(`Server responded with status ${res.status}`);
  }
  return res.json();
}

/**
 * Save or update a member on the server
 */
export async function saveMemberToServer(
  member: FamilyMember,
  isNew: boolean = false
): Promise<{ success: boolean; member: FamilyMember }> {
  // Strategy 1: Try specific endpoint
  const endpoint = isNew ? '/api/members' : `/api/members/${encodeURIComponent(member.id)}`;
  const method = isNew ? 'POST' : 'PUT';

  try {
    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ member }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn(`Primary endpoint ${endpoint} failed, trying fallback /api/members:`, e);
  }

  // Strategy 2 fallback: POST to /api/members
  try {
    const fallbackRes = await fetch('/api/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ member }),
    });
    if (fallbackRes.ok) {
      return await fallbackRes.json();
    }
  } catch (e) {
    console.warn('Fallback /api/members failed, trying /api/data:', e);
  }

  // Strategy 3 fallback: PUT directly to /api/members
  const putRes = await fetch('/api/members', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ member }),
  });

  if (!putRes.ok) {
    throw new Error(`Failed to save member to server (${putRes.status})`);
  }
  return putRes.json();
}

/**
 * Delete a member from the server database
 */
export async function deleteMemberFromServer(
  memberId: string
): Promise<{ success: boolean; remainingCount: number }> {
  try {
    const res = await fetch(`/api/members/${encodeURIComponent(memberId)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('DELETE /api/members/:id failed, trying query param:', e);
  }

  const res2 = await fetch(`/api/members?id=${encodeURIComponent(memberId)}`, {
    method: 'DELETE',
  });

  if (!res2.ok) {
    throw new Error(`Failed to delete member on server (${res2.status})`);
  }
  return res2.json();
}

/**
 * Sync entire family tree and timeline to the server
 */
export async function syncAllToServer(
  members: FamilyMember[],
  timeline: TimelineMilestone[]
): Promise<SyncResponse> {
  // Try /api/sync first
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ members, timeline }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('POST /api/sync failed, trying POST /api/data:', e);
  }

  // Fallback to /api/data
  const res2 = await fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ members, timeline }),
  });

  if (!res2.ok) {
    throw new Error(`Failed to sync with server (${res2.status})`);
  }
  return res2.json();
}

/**
 * Reset server storage back to initial seed data
 */
export async function resetServerData(): Promise<{
  success: boolean;
  members: FamilyMember[];
  timeline: TimelineMilestone[];
}> {
  const res = await fetch('/api/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to reset server data (${res.status})`);
  }
  return res.json();
}

/**
 * Check server connection and storage engine
 */
export async function checkServerHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
