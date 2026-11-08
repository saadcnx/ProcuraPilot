import { TeamUser } from '../../shared/types';

export const DEMO_PASSWORD = 'pilot123';

export const seedUsers: TeamUser[] = [
{ id: 'u1', name: 'Ayesha Khan', email: 'ayesha.khan@procurapilot.com', role: 'boss', active: true, forceApprovals: 3 },
{ id: 'u2', name: 'Bilal Ahmed', email: 'bilal.ahmed@procurapilot.com', role: 'inspector', active: true, forceApprovals: 0 },
{ id: 'u3', name: 'Sana Mirza', email: 'sana.mirza@procurapilot.com', role: 'boss', active: true, forceApprovals: 11 },
{ id: 'u4', name: 'Hira Siddiqui', email: 'hira.siddiqui@procurapilot.com', role: 'inspector', active: true, forceApprovals: 0 },
{ id: 'u5', name: 'Omar Farooq', email: 'omar.farooq@procurapilot.com', role: 'inspector', active: false, forceApprovals: 0 }];


export const demoAccounts = [
{ email: 'ayesha.khan@procurapilot.com', label: 'Ayesha Khan · Approver' },
{ email: 'bilal.ahmed@procurapilot.com', label: 'Bilal Ahmed · Inspector' }];