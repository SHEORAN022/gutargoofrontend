
# Home Section Layout Style Update Plan

## Summary
This plan updates the Section Builder to replace the current display style options with new layout styles specifically designed for vertical-oriented content display. The new layout styles include banner variants, big content variants, and indexed styles that support numbered ordering (1, 2, 3) for featured content.

## Current State
- The `display_style` column in `home_sections` table uses an enum with values: `horizontal_scroll`, `vertical_scroll`, `grid`
- The admin UI shows these three options with corresponding icons
- The API returns the `display_style` value for Flutter to render

## Proposed Changes

### New Layout Styles
| Layout Style | Description | Use Case |
|-------------|-------------|----------|
| `horizontal_banner` | Wide banner cards in horizontal scroll | Featured content rows |
| `vertical_banner` | Portrait/poster style cards | Movie poster grids |
| `big_horizontal` | Large landscape cards | Hero-like featured sections |
| `big_vertical` | Large portrait cards | Premium showcase content |
| `index_horizontal` | Numbered (1,2,3) horizontal layout | Top 10 horizontal list |
| `index_vertical` | Numbered (1,2,3) vertical layout | Top 10 vertical list |

### Implementation Steps

**Step 1: Database Migration**
Create a migration to update the `display_style` enum:
- Drop the existing enum values (`horizontal_scroll`, `vertical_scroll`, `grid`)
- Add new enum values: `horizontal_banner`, `vertical_banner`, `big_horizontal`, `big_vertical`, `index_horizontal`, `index_vertical`
- Update existing records to use a default value (`horizontal_banner`)

**Step 2: Update TypeScript Types**
Modify `src/hooks/useHomeSections.ts`:
- Update the `DisplayStyle` type to include new values
- Keep the interface structure same

**Step 3: Update Admin UI**
Modify `src/pages/HomeSections.tsx`:
- Replace the display style dropdown options with new layout styles
- Add descriptive icons for each layout type
- Update the section card to show appropriate icons based on new styles
- Keep the form functionality intact

**Step 4: Update Edge Function**
Modify `supabase/functions/home-layout/index.ts`:
- The function already returns `display_style` in the response
- No changes needed as Flutter will interpret the new values

**Step 5: Update API Documentation**
Modify `src/pages/ApiDocs.tsx`:
- Update the `display_style` field documentation to list new values
- Add descriptions for each layout style
- Update example responses

---

## Technical Details

### Database Migration SQL
```sql
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
```

### TypeScript Type Update
```typescript
export type DisplayStyle = 
  | 'horizontal_banner' 
  | 'vertical_banner' 
  | 'big_horizontal' 
  | 'big_vertical' 
  | 'index_horizontal' 
  | 'index_vertical';
```

### Admin UI Layout Options Array
```typescript
const LAYOUT_STYLES = [
  { 
    value: 'horizontal_banner', 
    label: 'Horizontal Banner', 
    icon: RectangleHorizontal,
    description: 'Wide banner cards'
  },
  { 
    value: 'vertical_banner', 
    label: 'Vertical Banner', 
    icon: RectangleVertical,
    description: 'Portrait poster cards'
  },
  { 
    value: 'big_horizontal', 
    label: 'Big Horizontal', 
    icon: LayoutPanelLeft,
    description: 'Large landscape cards'
  },
  { 
    value: 'big_vertical', 
    label: 'Big Vertical', 
    icon: Columns2,
    description: 'Large portrait cards'
  },
  { 
    value: 'index_horizontal', 
    label: 'Index Horizontal', 
    icon: ListOrdered,
    description: 'Numbered (1,2,3) horizontal'
  },
  { 
    value: 'index_vertical', 
    label: 'Index Vertical', 
    icon: List,
    description: 'Numbered (1,2,3) vertical'
  },
];
```

### API Response Structure
The API will return sections with the new `display_style` values:
```json
{
  "sections": [
    {
      "id": "uuid",
      "title": "Top 10 Movies",
      "display_style": "index_horizontal",
      "content": [...]
    }
  ]
}
```

The Flutter frontend will interpret these styles:
- `index_horizontal` / `index_vertical`: Render numbered overlays (1, 2, 3) on content cards
- `big_horizontal` / `big_vertical`: Render larger card sizes
- `horizontal_banner` / `vertical_banner`: Render standard banner/poster layouts

---

## Files to be Modified
1. **New Migration**: `supabase/migrations/[timestamp]_update_display_styles.sql`
2. **Hook**: `src/hooks/useHomeSections.ts` - Update DisplayStyle type
3. **Admin Page**: `src/pages/HomeSections.tsx` - Update UI with new layout options
4. **API Docs**: `src/pages/ApiDocs.tsx` - Update documentation

## Validation
- Admin can create sections with new layout styles
- Existing sections are migrated to `horizontal_banner` default
- API returns correct `display_style` values
- Documentation reflects new options
