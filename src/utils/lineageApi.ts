import { FamilyMember, TimelineMilestone } from '../types';
import {
  fetchServerData,
  saveMemberToServer,
  deleteMemberFromServer,
  syncAllToServer,
} from '../services/api';

/**
 * Fetch all family members from the Vercel cloud server
 * Accessible by any user on any browser/device
 */
export async function fetchFamilyMembers(): Promise<FamilyMember[]> {
  try {
    const res = await fetchServerData();
    if (res.success && Array.isArray(res.members)) {
      return res.members;
    }
  } catch (err) {
    console.warn('Could not fetch members from Vercel server, falling back to local:', err);
  }
  return [];
}

/**
 * Save a family member directly to Vercel cloud storage
 */
export async function saveFamilyMember(member: FamilyMember): Promise<boolean> {
  try {
    const res = await saveMemberToServer(member, false);
    return res.success;
  } catch (err) {
    console.error('Error saving member to Vercel server:', err);
    return false;
  }
}

/**
 * Delete a family member from Vercel cloud storage
 */
export async function deleteFamilyMember(memberId: string): Promise<boolean> {
  try {
    const res = await deleteMemberFromServer(memberId);
    return res.success;
  } catch (err) {
    console.error('Error deleting member from Vercel server:', err);
    return false;
  }
}

/**
 * Synchronize the entire tree & timeline to Vercel cloud storage
 */
export async function syncAllToVercel(
  members: FamilyMember[],
  timeline: TimelineMilestone[]
): Promise<boolean> {
  try {
    const res = await syncAllToServer(members, timeline);
    return res.success;
  } catch (err) {
    console.error('Error syncing all records to Vercel:', err);
    return false;
  }
}
