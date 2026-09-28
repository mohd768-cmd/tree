import type { Request, Response } from 'express';
import { loadFamilyData, saveFamilyData } from '../server/storage';

export default async function handler(req: Request, res: Response) {
  // Enable CORS & disable caching
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { data, storageEngine } = await loadFamilyData();
      return res.status(200).json({
        success: true,
        members: data.members,
        timeline: data.timeline,
        lastUpdated: data.lastUpdated,
        storageEngine,
        count: data.members.length,
      });
    } catch (error) {
      console.error('Vercel API /data error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve family data from Vercel storage',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { members, timeline } = req.body || {};
      if (!Array.isArray(members)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payload: members array is required',
        });
      }
      const currentTimeline = Array.isArray(timeline) ? timeline : [];
      const result = await saveFamilyData(members, currentTimeline);
      return res.status(200).json({
        success: true,
        savedCount: members.length,
        lastUpdated: result.lastUpdated,
        storageEngine: result.storageEngine,
      });
    } catch (error) {
      console.error('Vercel API /data POST error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save family data to Vercel storage',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
