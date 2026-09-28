import type { Request, Response } from 'express';
import {
  updateMemberInStorage,
  deleteMemberFromStorage,
  loadFamilyData,
} from '../../server/storage';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract ID from query (Vercel populates req.query[id]) or URL
  const id = (req.query?.id as string) || (req.url?.split('/').pop()?.split('?')[0]);

  if (req.method === 'GET') {
    try {
      const { data } = await loadFamilyData();
      const member = data.members.find((m) => m.id === id);
      if (!member) {
        return res.status(404).json({ success: false, error: 'Member not found' });
      }
      return res.status(200).json({ success: true, member });
    } catch (err) {
      return res.status(500).json({ success: false, error: String(err) });
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'POST') {
    try {
      const { member } = req.body || {};
      if (!member) {
        return res.status(400).json({ success: false, error: 'Member payload required' });
      }
      if (id && (!member.id || member.id !== id)) {
        member.id = id;
      }
      const result = await updateMemberInStorage(member);
      return res.status(200).json(result);
    } catch (err) {
      console.error('API /members/[id] PUT error:', err);
      return res.status(500).json({ success: false, error: 'Failed to update member' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (!id) {
        return res.status(400).json({ success: false, error: 'Member id required' });
      }
      const result = await deleteMemberFromStorage(id);
      return res.status(200).json(result);
    } catch (err) {
      console.error('API /members/[id] DELETE error:', err);
      return res.status(500).json({ success: false, error: 'Failed to delete member' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
