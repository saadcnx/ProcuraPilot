import { DetectionRules } from '../../shared/types';

export const defaultRules: DetectionRules = {
  toleranceAmount: 5,
  tolerancePercent: 1,
  bankCheck: true,
  panicThreshold: 10000,
  panicEmail: 'cfo@procurapilot.com',
  apiKey: 'sk-pp-live-4f9a2c71e8b3d05a'
};