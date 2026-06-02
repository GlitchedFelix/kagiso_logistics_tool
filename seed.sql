-- ============================================================
-- LogiTrack — Mock Data Seed
-- 3 months of trips + expenses (Jan–Mar 2026)
-- Payouts calculated using the live rate card (15% markdown)
-- Run this in Supabase: SQL Editor → paste → Run
-- ============================================================

-- ── TRIPS ──────────────────────────────────────────────────

INSERT INTO trips (trip_date, trip_type, status, invoice_number, trip_id, distance_km, weight_kg, payout, grouped_invoices, grouped_trip_ids, notes) VALUES

-- January 2026
('2026-01-06', 'Delivery', 'Online',  'INV-0001', 'T-0001',  25,    50,    260.10, NULL, NULL, NULL),
('2026-01-08', 'Delivery', 'Online',  'INV-0002', 'T-0002',  40,    20,    287.30, NULL, NULL, NULL),
('2026-01-10', 'OTO',      'Online',  'INV-0003', 'T-0003',  60,  3000,   1892.10, NULL, NULL, NULL),
('2026-01-13', 'Delivery', 'Online',  'INV-0004', 'T-0004', 180,   200,   5202.00, NULL, NULL, 'Long haul — Joburg to Cape Town corridor'),
('2026-01-15', 'MrT',      'Manual',  'INV-0005', 'T-0005',  20,    80,    244.80, NULL, NULL, NULL),
('2026-01-17', 'Delivery', 'Online',  'INV-0006', 'T-0006',  50,   400,    432.65, NULL, NULL, NULL),
('2026-01-20', 'Delivery', 'Manual',  'INV-0007', 'T-0007',  30,    15,    183.60, NULL, NULL, NULL),
('2026-01-22', 'OTO',      'Online',  'INV-0008', 'T-0008',  80,  5000,   2894.25, 'INV-0008-A, INV-0008-B', 'T-0008-A, T-0008-B', 'Grouped consignment — 2 drops'),
('2026-01-24', 'MrT',      'Online',  'INV-0009', 'T-0009',  10,   100,    244.80, NULL, NULL, NULL),
('2026-01-27', 'Delivery', 'Online',  'INV-0010', 'T-0010',  70,   600,    523.60, NULL, NULL, NULL),
('2026-01-29', 'Delivery', 'Online',  'INV-0011', 'T-0011', 200,   100,   5780.00, NULL, NULL, 'Long haul — overnight run'),

-- February 2026
('2026-02-03', 'OTO',      'Online',  'INV-0012', 'T-0012',  40,  2000,    911.20, NULL, NULL, NULL),
('2026-02-05', 'Delivery', 'Online',  'INV-0013', 'T-0013',  30,    40,    214.20, NULL, NULL, NULL),
('2026-02-07', 'MrT',      'Manual',  'INV-0014', 'T-0014',  50,   100,    401.20, NULL, NULL, NULL),
('2026-02-10', 'Delivery', 'Online',  'INV-0015', 'T-0015',  80,   200,    550.80, NULL, NULL, NULL),
('2026-02-12', 'Delivery', 'Online',  'INV-0016', 'T-0016', 160,   300,   4624.00, NULL, NULL, 'Long haul — Durban run'),
('2026-02-14', 'OTO',      'Online',  'INV-0017', 'T-0017', 100,  8000,   5514.80, 'INV-0017-A, INV-0017-B, INV-0017-C', 'T-0017-A, T-0017-B, T-0017-C', 'Grouped — 3 consignments'),
('2026-02-17', 'MrT',      'Online',  'INV-0018', 'T-0018',  20,    50,    244.80, NULL, NULL, NULL),
('2026-02-19', 'Delivery', 'Manual',  'INV-0019', 'T-0019',  40,   800,    428.40, NULL, NULL, NULL),
('2026-02-21', 'Delivery', 'Online',  'INV-0020', 'T-0020',  60,    20,    382.50, NULL, NULL, NULL),
('2026-02-24', 'OTO',      'Online',  'INV-0021', 'T-0021',  30,  1500,    550.80, NULL, NULL, NULL),
('2026-02-26', 'Delivery', 'Online',  'INV-0022', 'T-0022',  90,   100,    539.75, NULL, NULL, NULL),

-- March 2026
('2026-03-03', 'MrT',      'Online',  'INV-0023', 'T-0023',  30,    40,    214.20, NULL, NULL, NULL),
('2026-03-05', 'Delivery', 'Online',  'INV-0024', 'T-0024', 220,   500,   6358.00, NULL, NULL, 'Long haul — PE run'),
('2026-03-07', 'OTO',      'Online',  'INV-0025', 'T-0025',  50,  4000,   1921.00, NULL, NULL, NULL),
('2026-03-10', 'Delivery', 'Online',  'INV-0026', 'T-0026',  70,   100,    481.95, NULL, NULL, NULL),
('2026-03-12', 'MrT',      'Manual',  'INV-0027', 'T-0027',  50,    20,    340.00, NULL, NULL, NULL),
('2026-03-14', 'Delivery', 'Online',  'INV-0028', 'T-0028',  40,   600,    395.25, NULL, NULL, NULL),
('2026-03-17', 'OTO',      'Online',  'INV-0029', 'T-0029',  80, 10000,   5788.50, NULL, NULL, NULL),
('2026-03-19', 'Delivery', 'Online',  'INV-0030', 'T-0030', 175,   100,   5057.50, NULL, NULL, 'Long haul — return leg'),
('2026-03-21', 'MrT',      'Online',  'INV-0031', 'T-0031',  30,    80,    260.10, NULL, NULL, NULL),
('2026-03-24', 'Delivery', 'Online',  'INV-0032', 'T-0032',  60,   400,    474.30, NULL, NULL, NULL),
('2026-03-26', 'OTO',      'Manual',  'INV-0033', 'T-0033',  20,  3000,    933.30, NULL, NULL, NULL),
('2026-03-28', 'Delivery', 'Online',  'INV-0034', 'T-0034',  50,   200,    432.65, NULL, NULL, NULL),
('2026-03-31', 'MrT',      'Online',  'INV-0035', 'T-0035',  80,    60,    520.20, NULL, NULL, NULL);


-- ── EXPENSES ───────────────────────────────────────────────

INSERT INTO expenses (expense_date, category, amount, description) VALUES

-- January 2026
('2026-01-05', 'Fuel',     850.00,  'Diesel top-up — BP Midrand'),
('2026-01-12', 'Fuel',     920.00,  'Full tank — Engen N1 South'),
('2026-01-19', 'Repairs',  2400.00, 'Tyre replacement — front left'),
('2026-01-26', 'Fuel',     780.00,  'Diesel — Sasol Centurion'),
('2026-01-31', 'Other',    350.00,  'Toll fees — January'),

-- February 2026
('2026-02-04', 'Fuel',     910.00,  'Diesel top-up — BP Midrand'),
('2026-02-11', 'Breakages',1200.00, 'Damaged pallet — client claim'),
('2026-02-14', 'Fuel',     870.00,  'Full tank — Shell Pretoria'),
('2026-02-20', 'Repairs',  5800.00, 'Engine service + brake pads'),
('2026-02-25', 'Fuel',     830.00,  'Diesel — Engen Johannesburg'),
('2026-02-28', 'Other',    450.00,  'Toll fees — February'),

-- March 2026
('2026-03-04', 'Fuel',     950.00,  'Diesel top-up — BP Midrand'),
('2026-03-11', 'Fuel',     880.00,  'Full tank — Engen N14'),
('2026-03-17', 'Repairs',  1800.00, 'Wheel alignment + balance'),
('2026-03-22', 'Fuel',     900.00,  'Diesel — Sasol Centurion'),
('2026-03-26', 'Breakages', 650.00, 'Minor load damage — client claim'),
('2026-03-31', 'Other',    480.00,  'Toll fees — March');
