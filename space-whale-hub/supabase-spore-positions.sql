-- Allow planted spores to keep a place in the forest after drag-and-drop.
ALTER TABLE spores
  ADD COLUMN IF NOT EXISTS position_x double precision,
  ADD COLUMN IF NOT EXISTS position_y double precision;
