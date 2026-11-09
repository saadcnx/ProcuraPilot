import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireSigner } from '../middleware/auth';
import { loadRules, saveRules } from '../db/repo';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  const rules = await loadRules();
  const { apiKey, ...safe } = rules;
  res.json({ rules: { ...safe, hasKey: Boolean(apiKey) } });
});

const rulesSchema = z.object({
  toleranceAmount: z.number().min(0).max(1_000_000),
  tolerancePercent: z.number().min(0).max(100),
  bankCheck: z.boolean(),
  panicThreshold: z.number().min(0).max(100_000_000),
  panicEmail: z.string().email().max(320),
  apiKey: z.string().max(500).optional(),
  aiProvider: z.enum(['openai', 'anthropic', 'google']).optional(),
  aiModel: z.string().max(120).optional(),
  aiBaseUrl: z.string().max(500).optional()
});

router.put('/', requireAuth, requireSigner, async (req, res) => {
  const parsed = rulesSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_body' });
    return;
  }
  const existing = await loadRules();
  const nextKey =
    parsed.data.apiKey && parsed.data.apiKey.trim()
      ? parsed.data.apiKey.trim()
      : existing.apiKey;
  await saveRules({
    toleranceAmount: parsed.data.toleranceAmount,
    tolerancePercent: parsed.data.tolerancePercent,
    bankCheck: parsed.data.bankCheck,
    panicThreshold: parsed.data.panicThreshold,
    panicEmail: parsed.data.panicEmail,
    apiKey: nextKey,
    aiProvider: parsed.data.aiProvider ?? existing.aiProvider,
    aiModel: parsed.data.aiModel ?? existing.aiModel,
    aiBaseUrl: parsed.data.aiBaseUrl ?? existing.aiBaseUrl
  });
  const rules = await loadRules();
  const { apiKey, ...safe } = rules;
  res.json({ rules: { ...safe, hasKey: Boolean(apiKey) } });
});

export default router;