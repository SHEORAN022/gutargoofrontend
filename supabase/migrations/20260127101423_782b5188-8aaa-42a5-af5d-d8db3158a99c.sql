-- Update display_style enum to new layout values
ALTER TYPE display_style RENAME TO display_style_old;

CREATE TYPE display_style AS ENUM (
  'horizontal_banner',
  'vertical_banner', 
  'big_horizontal',
  'big_vertical',
  'index_horizontal',
  'index_vertical'
);

-- Update existing rows to use new default
ALTER TABLE home_sections 
  ALTER COLUMN display_style DROP DEFAULT;

ALTER TABLE home_sections 
  ALTER COLUMN display_style TYPE display_style 
  USING 'horizontal_banner'::display_style;

ALTER TABLE home_sections 
  ALTER COLUMN display_style SET DEFAULT 'horizontal_banner';

DROP TYPE display_style_old;