import { Invoice } from '../../shared/types';

export const heldInvoices: Invoice[] = [
{
  id: 'harbor-steel-88213',
  vendor: 'Harbor Steel Supply',
  poNumber: 'PO-20418',
  invoiceNumber: 'HS-88213',
  receivedAt: '2026-11-07T09:14:22',
  poLines: [
  { sku: 'STL-204', description: 'Galvanized steel bracket, 40mm', qty: 500, unitPrice: 3.2 },
  { sku: 'STL-311', description: 'Hex bolt M10, box of 100', qty: 40, unitPrice: 18.5 },
  { sku: 'STL-090', description: 'Anchor plate, 6mm', qty: 120, unitPrice: 11.75 }],

  invoiceLines: [
  { sku: 'STL-204', description: 'Galvanized steel bracket, 40mm', qty: 500, unitPrice: 3.65 },
  { sku: 'STL-311', description: 'Hex bolt M10, box of 100', qty: 60, unitPrice: 18.5 },
  { sku: 'STL-090', description: 'Anchor plate, 6mm', qty: 120, unitPrice: 11.75 },
  { sku: 'STL-777', description: 'Expedited handling fee', qty: 1, unitPrice: 240 }],

  taxRate: 0.08,
  invoiceTaxCharged: 366.8,
  bankAccount: '•••• 4410',
  bankOnFile: '•••• 4410',
  status: 'held'
},
{
  id: 'coastal-freight-1189',
  vendor: 'Coastal Freight Partners',
  poNumber: 'PO-20442',
  invoiceNumber: 'CFP-1189',
  receivedAt: '2026-11-07T15:48:03',
  poLines: [
  { sku: 'FRT-010', description: 'Container freight, Karachi → Rotterdam', qty: 2, unitPrice: 6850 },
  { sku: 'FRT-044', description: 'Port handling', qty: 2, unitPrice: 420 }],

  invoiceLines: [
  { sku: 'FRT-010', description: 'Container freight, Karachi → Rotterdam', qty: 2, unitPrice: 12400 },
  { sku: 'FRT-044', description: 'Port handling', qty: 2, unitPrice: 420 }],

  taxRate: 0,
  invoiceTaxCharged: 0,
  bankAccount: '•••• 8812',
  bankOnFile: '•••• 8812',
  status: 'held'
},
{
  id: 'meridian-lab-30471',
  vendor: 'Meridian Lab Instruments',
  poNumber: 'PO-20397',
  invoiceNumber: 'MLI-30471',
  receivedAt: '2026-11-06T11:02:57',
  poLines: [
  { sku: 'LAB-501', description: 'Digital pipette, 10–100 µL', qty: 12, unitPrice: 410 },
  { sku: 'LAB-622', description: 'Centrifuge tubes, case of 500', qty: 30, unitPrice: 64 }],

  invoiceLines: [
  { sku: 'LAB-501', description: 'Digital pipette, 10–100 µL', qty: 12, unitPrice: 410 },
  { sku: 'LAB-622', description: 'Centrifuge tubes, case of 500', qty: 30, unitPrice: 64 }],

  taxRate: 0,
  invoiceTaxCharged: 0,
  bankAccount: '•••• 7731',
  bankOnFile: '•••• 2094',
  status: 'held'
},
{
  id: 'northwind-5520',
  vendor: 'Northwind Office Co.',
  poNumber: 'PO-20431',
  invoiceNumber: 'NW-5520',
  receivedAt: '2026-11-06T16:30:41',
  poLines: [
  { sku: 'OFC-112', description: 'A4 copy paper, 5-ream case', qty: 80, unitPrice: 34 },
  { sku: 'OFC-245', description: 'Toner cartridge, black', qty: 24, unitPrice: 89 }],

  invoiceLines: [
  { sku: 'OFC-112', description: 'A4 copy paper, 5-ream case', qty: 80, unitPrice: 34 },
  { sku: 'OFC-245', description: 'Toner cartridge, black', qty: 24, unitPrice: 89 }],

  taxRate: 0.07,
  invoiceTaxCharged: 412.76,
  bankAccount: '•••• 0937',
  bankOnFile: '•••• 0937',
  status: 'held'
},
{
  id: 'greenleaf-0402',
  vendor: 'Greenleaf Packaging',
  poNumber: 'PO-20450',
  invoiceNumber: 'GLP-0402',
  receivedAt: '2026-11-08T08:21:10',
  poLines: [
  { sku: 'PKG-300', description: 'Corrugated box, 18×12×10 in', qty: 2000, unitPrice: 0.92 },
  { sku: 'PKG-310', description: 'Packing tape, 48mm', qty: 150, unitPrice: 2.4 }],

  invoiceLines: [
  { sku: 'PKG-300', description: 'Corrugated box, 18×12×10 in', qty: 2000, unitPrice: 0.93 },
  { sku: 'PKG-310', description: 'Packing tape, 48mm', qty: 150, unitPrice: 2.4 }],

  taxRate: 0.05,
  invoiceTaxCharged: 111,
  bankAccount: '•••• 5526',
  bankOnFile: '•••• 5526',
  status: 'held'
}];


export const intakePool: Invoice[] = [
{
  id: 'atlas-electrical-7702',
  vendor: 'Atlas Electrical Wholesale',
  poNumber: 'PO-20457',
  invoiceNumber: 'AEW-7702',
  receivedAt: '2026-11-08T10:00:00',
  poLines: [
  { sku: 'ELC-120', description: 'LED panel, 600×600', qty: 60, unitPrice: 38 },
  { sku: 'ELC-205', description: 'Cable tray, 3m', qty: 40, unitPrice: 27.5 }],

  invoiceLines: [
  { sku: 'ELC-120', description: 'LED panel, 600×600', qty: 72, unitPrice: 38 },
  { sku: 'ELC-205', description: 'Cable tray, 3m', qty: 40, unitPrice: 27.5 }],

  taxRate: 0,
  invoiceTaxCharged: 0,
  bankAccount: '•••• 3318',
  bankOnFile: '•••• 3318',
  status: 'held'
},
{
  id: 'brightway-4471',
  vendor: 'Brightway Janitorial',
  poNumber: 'PO-20459',
  invoiceNumber: 'BJ-4471',
  receivedAt: '2026-11-08T10:00:00',
  poLines: [
  { sku: 'JAN-010', description: 'Floor cleaning, monthly contract', qty: 1, unitPrice: 1850 },
  { sku: 'JAN-022', description: 'Restroom supplies kit', qty: 12, unitPrice: 46 }],

  invoiceLines: [
  { sku: 'JAN-010', description: 'Floor cleaning, monthly contract', qty: 1, unitPrice: 1850 },
  { sku: 'JAN-022', description: 'Restroom supplies kit', qty: 12, unitPrice: 46 }],

  taxRate: 0,
  invoiceTaxCharged: 0,
  bankAccount: '•••• 6120',
  bankOnFile: '•••• 6120',
  status: 'held'
}];