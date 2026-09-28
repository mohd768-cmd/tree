import type { Request, Response } from 'express';
import {
  addMemberToStorage,
  updateMemberInStorage,
  deleteMemberFromStorage,
} from '../server/storage';

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
      const { member } = req.body || {};
      if (!member || !member.id || !member.firstName) {
        return res.status(400).json({
          success: false,
          error: 'Invalid member payload: id and firstName are required',
        });
      }
      const result = await addMemberToStorage(member);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Vercel API POST /members error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to add member to Vercel storage',
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { member } = req.body || {};
      if (!member || !member.id) {
        return res.status(400).json({
          success: false,
          error: 'Invalid member payload',
        });
      }
      const result = await updateMemberInStorage(member);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Vercel API PUT /members error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update member in Vercel storage',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = (req.query.id as string) || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Member id is required for deletion',
        });
      }
      const result = await deleteMemberFromStorage(id);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Vercel API DELETE /members error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete member in Vercel storage',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
