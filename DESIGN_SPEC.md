# Design Spec — Global Address Onboarding (MVP)

Version: 1.1

## 1. Design Direction

The UI should feel clean, professional, and easy to scan. Prioritize clarity and usability over visual novelty.

### Principles

- Single-page workflow (no wizard, no modal flow, no separate pages)
- Clear visual hierarchy
- Predictable form behavior
- Low cognitive load

## 2. Page Structure

```txt
Top Header
  - AcmeCorp label + small brand icon
  - Full-width divider

Main Content (fixed max width)
  - Title: Add a new address
  - Country Selector
  - Search Address
  - Address Details Form (shown after country is selected)
  - Save Address
  - Saved Addresses
```

### Layout Rules

- Header is sticky at the top.
- Header and body content use the same max content width.
- Do not wrap the whole page in a card-like outer shell.
- Use simple section dividers only where they improve readability.

## 3. Typography

Font family:

```css
Inter, sans-serif
```

Type scale:

- Page title: `32/40`, weight `700`
- Section heading: `20/28`, weight `600`
- Field label: `14`, weight `600`
- Body text: `14`, weight `400`
- Helper text: `13`, weight `400`

## 4. Color Tokens

Primary:

```css
primary-500: #2563eb;
primary-600: #1d4ed8;
```

Neutrals:

```css
gray-50: #f8fafc;
gray-100: #f1f5f9;
gray-200: #e2e8f0;
gray-300: #cbd5e1;
gray-500: #64748b;
gray-700: #334155;
gray-900: #0f172a;
```

Semantic:

```css
surface-primary: #ffffff;
surface-secondary: #f8fafc;
border-default: #e2e8f0;
border-hover: #cbd5e1;
text-primary: #0f172a;
text-secondary: #475569;
text-muted: #64748b;
success-bg: #ecfdf5;
success-text: #047857;
success-border: #a7f3d0;
error-bg: #fef2f2;
error-text: #dc2626;
error-border: #fca5a5;
```

## 5. Spacing, Radius, and Depth

Spacing scale (8px base):

```css
xs: 8px;
sm: 12px;
md: 16px;
lg: 24px;
xl: 32px;
2xl: 48px;
```

Recommended usage:

- Page padding: `32px`
- Section gap: `32px`
- Field gap: `16px`
- Control height: `44px`

Radius:

- Inputs: `8px`
- Buttons: `8px`
- Panels/cards: `12px`

Shadows (use sparingly):

```css
sm: 0px 1px 2px rgba(0,0,0,0.04);
md: 0px 4px 12px rgba(0,0,0,0.06);
```

## 6. Component Behavior Rules

### Country Selector

- Required field indicator shown.
- Helper copy appears directly below selector.
- Changing country resets form values.

### Search Address

- Label: `Search Address`
- Suggestion list is anchored directly below the search input.
- Suggestions must overlay helper text/content below (not push layout).
- Suggestions hide on selection and on blur.
- Hover and keyboard-highlight states must be clearly visible.

### Address Details Form

- Hidden until a country is selected.
- Prefill values from autocomplete when mapping is available.
- Unknown/missing components remain manual.
- Manual Edit enables full field editing.

### Save Feedback

- Success message auto-dismisses after short delay (~2 seconds).
- Error message remains until corrected or dismissed.

### Saved Addresses

- Show normalized backend display rows.
- Each row includes a delete action.
- Deletion is immediate (no confirmation modal for MVP).

## 7. Responsive Rules

- Desktop: country + search can share a row.
- Mobile: controls and fields stack vertically, single-column form.
- Saved addresses remain a vertical readable list across breakpoints.

## 8. Accessibility Baseline

- Label-control association for all inputs
- Keyboard navigation for search suggestions and form controls
- Visible focus styles on interactive elements
- Sufficient contrast for text, borders, and status messages
- Error text linked to related fields

## 9. Mantine Theme Baseline

```ts
const theme = createTheme({
  fontFamily: "Inter, sans-serif",
  primaryColor: "blue",
  radius: {
    xs: "4px",
    sm: "8px",
    md: "12px",
  },
  defaultRadius: "sm",
});
```
