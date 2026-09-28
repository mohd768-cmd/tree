import { Router, Request, Response } from 'express';
import {
  loadFamilyData,
  saveFamilyData,
  addMemberToStorage,
  updateMemberInStorage,
  deleteMemberFromStorage,
  resetStorageToSeed,
} from './storage';

export const apiRouter = Router();

// Ensure no-cache headers for real-time consistency across multiple logins & devices
apiRouter.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// GET all family data (members & timeline)
apiRouter.get('/data', async (req: Request, res: Response) => {
  try {
    const { data, storageEngine } = await loadFamilyData();
    res.json({
      success: true,
      members: data.members,
      timeline: data.timeline,
      lastUpdated: data.lastUpdated,
      storageEngine,
      count: data.members.length,
    });
  } catch (error) {
    console.error('API /data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve family data from server storage',
    });
  }
});

// POST /api/members - Add a new member
apiRouter.post('/members', async (req: Request, res: Response) => {
  try {
    const { member } = req.body;
    if (!member || !member.id || !member.firstName) {
      return res.status(400).json({
        success: false,
        error: 'Invalid member payload: id and firstName are required',
      });
    }
    const result = await addMemberToStorage(member);
    res.json(result);
  } catch (error) {
    console.error('API POST /members error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add member to server storage',
    });
  }
});

// PUT /api/members/:id - Update member
apiRouter.put('/members/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { member } = req.body;
    if (!member || !member.id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid member payload',
      });
    }
    if (member.id !== id) {
      member.id = id;
    }
    const result = await updateMemberInStorage(member);
    res.json(result);
  } catch (error) {
    console.error('API PUT /members/:id error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update member in server storage',
    });
  }
});

// DELETE /api/members/:id - Delete member
apiRouter.delete('/members/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Member id is required',
      });
    }
    const result = await deleteMemberFromStorage(id);
    res.json(result);
  } catch (error) {
    console.error('API DELETE /members/:id error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete member from server storage',
    });
  }
});

// POST /api/sync - Batch sync all members and timeline
apiRouter.post('/sync', async (req: Request, res: Response) => {
  try {
    const { members, timeline } = req.body;
    if (!Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload: members array is required',
      });
    }
    const currentTimeline = Array.isArray(timeline) ? timeline : [];
    const result = await saveFamilyData(members, currentTimeline);
    res.json({
      success: true,
      savedCount: members.length,
      lastUpdated: result.lastUpdated,
      storageEngine: result.storageEngine,
    });
  } catch (error) {
    console.error('API POST /sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync data with server storage',
    });
  }
});

// POST /api/reset - Reset storage to initial seed records
apiRouter.post('/reset', async (req: Request, res: Response) => {
  try {
    const result = await resetStorageToSeed();
    res.json(result);
  } catch (error) {
    console.error('API POST /reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset storage to initial seed data',
    });
  }
});

// GET /api/health - Status check
apiRouter.get('/health', async (req: Request, res: Response) => {
  try {
    const { storageEngine, data } = await loadFamilyData();
    res.json({
      status: 'healthy',
      storageEngine,
      totalMembers: data.members.length,
      lastUpdated: data.lastUpdated,
      isVercel: !!process.env.VERCEL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: String(error),
    });
  }
});
