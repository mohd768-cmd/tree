import type { Request, Response } from 'express';
import { saveFamilyData } from '../server/storage';

export default async function handler(req: Request, res: Response) {
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
      console.error('Vercel API /sync error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to sync data with Vercel server storage',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
