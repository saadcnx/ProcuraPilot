import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireSigner } from '../middleware/auth';
import { loadRules, saveRules } from '../db/repo';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  const rules = await loadRules();
  res.json({ rules });
});

const rulesSchema = z.object({
  toleranceAmount: z.number().min(0).max(1_000_000),
  tolerancePercent: z.number().min(0).max(100),
  bankCheck: z.boolean(),
  panicThreshold: z.number().min(0).max(100_000_000),
  panicEmail: z.string().email().max(320),
  apiKey: z.string().max(500)
});

router.put('/', requireAuth, requireSigner, async (req, res) => {
  const parsed = rulesSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_body' });
    return;
  }
  await saveRules(parsed.data);
  const rules = await loadRules();
  res.json({ rules });
});

export default router;