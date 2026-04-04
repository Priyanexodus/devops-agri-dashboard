-- ================================================================
-- V2: Seed dummy agricultural data
-- This completely replaces ML prediction logic.
-- Data is realistic, multi-year, multi-region — served as-is via API.
-- ================================================================

-- ── crop_yields ──────────────────────────────────────────────────
INSERT INTO crop_yields (crop_name, year, yield_amount, region) VALUES
  -- All India aggregates
  ('Sugarcane', 2020, 400.5, 'All India'),
  ('Sugarcane', 2021, 385.2, 'All India'),
  ('Sugarcane', 2022, 410.1, 'All India'),
  ('Sugarcane', 2023, 395.8, 'All India'),
  ('Sugarcane', 2024, 430.3, 'All India'),

  ('Maize', 2020, 288.5, 'All India'),
  ('Maize', 2021, 295.1, 'All India'),
  ('Maize', 2022, 310.0, 'All India'),
  ('Maize', 2023, 302.5, 'All India'),
  ('Maize', 2024, 320.8, 'All India'),

  ('Rice', 2020, 185.5, 'All India'),
  ('Rice', 2021, 190.3, 'All India'),
  ('Rice', 2022, 195.0, 'All India'),
  ('Rice', 2023, 188.7, 'All India'),
  ('Rice', 2024, 200.2, 'All India'),

  -- Maharashtra
  ('Sugarcane', 2022, 105.0, 'Maharashtra'),
  ('Sugarcane', 2023, 102.5, 'Maharashtra'),
  ('Sugarcane', 2024, 110.0, 'Maharashtra'),

  -- Uttar Pradesh
  ('Sugarcane', 2022, 118.0, 'Uttar Pradesh'),
  ('Sugarcane', 2023, 115.5, 'Uttar Pradesh'),
  ('Sugarcane', 2024, 122.0, 'Uttar Pradesh'),

  -- Karnataka
  ('Maize', 2022, 25.0, 'Karnataka'),
  ('Maize', 2023, 24.5, 'Karnataka'),
  ('Maize', 2024, 26.0, 'Karnataka'),

  -- Punjab
  ('Rice', 2022, 45.0, 'Punjab'),
  ('Rice', 2023, 46.5, 'Punjab'),
  ('Rice', 2024, 48.0, 'Punjab'),

  -- Tamil Nadu
  ('Rice', 2022, 35.0, 'Tamil Nadu'),
  ('Rice', 2023, 34.2, 'Tamil Nadu'),
  ('Rice', 2024, 36.1, 'Tamil Nadu');

-- ── domestic_consumption ─────────────────────────────────────────
INSERT INTO domestic_consumption (crop_name, year, consumption_amount, region) VALUES
  ('Sugarcane', 2020, 200.0, 'All India'),
  ('Sugarcane', 2021, 205.5, 'All India'),
  ('Sugarcane', 2022, 210.2, 'All India'),
  ('Sugarcane', 2023, 215.0, 'All India'),
  ('Sugarcane', 2024, 220.8, 'All India'),

  ('Maize', 2020, 240.0, 'All India'),
  ('Maize', 2021, 248.5, 'All India'),
  ('Maize', 2022, 252.0, 'All India'),
  ('Maize', 2023, 258.3, 'All India'),
  ('Maize', 2024, 265.0, 'All India'),

  ('Rice', 2020, 175.0, 'All India'),
  ('Rice', 2021, 178.2, 'All India'),
  ('Rice', 2022, 181.0, 'All India'),
  ('Rice', 2023, 183.5, 'All India'),
  ('Rice', 2024, 186.0, 'All India'),

  ('Sugarcane', 2022, 45.0,  'Maharashtra'),
  ('Sugarcane', 2023, 46.5,  'Maharashtra'),
  ('Sugarcane', 2022, 60.0,  'Uttar Pradesh'),
  ('Sugarcane', 2023, 62.0,  'Uttar Pradesh'),
  ('Maize',     2022, 30.0,  'Karnataka'),
  ('Maize',     2023, 31.0,  'Karnataka'),
  ('Rice',      2022, 20.0,  'Punjab'),
  ('Rice',      2023, 21.0,  'Punjab'),
  ('Rice',      2022, 30.0,  'Tamil Nadu'),
  ('Rice',      2023, 30.5,  'Tamil Nadu');

-- ── ethanol_targets ──────────────────────────────────────────────
INSERT INTO ethanol_targets (year, target_blending_percentage, achieved_blending_percentage) VALUES
  (2020, 10.0,  7.2),
  (2021, 10.0,  8.1),
  (2022, 12.0, 10.0),
  (2023, 15.0, 12.5),
  (2024, 20.0, 14.6);
