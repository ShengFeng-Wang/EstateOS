# ESTATE / OS Responsive and Localization Specification

## Coverage

- All screens: Desktop
- Core flows: Tablet and Mobile frames
- Non-core screens: explicit responsive rules

## Breakpoint validation sizes

```text
1440 × 900
1280 × 800
1024 × 1366
768 × 1024
390 × 844
360 × 800
```

## Tablet

- Sidebar becomes icon rail
- Tables retain essential columns and hide secondary columns
- Filters open in a right drawer
- Detail pages use two columns where capacity allows, then stack
- 3D scene uses Medium quality

## Mobile

- Tables become semantic rows, not generic oversized cards
- Filters, sort, and property preview use bottom sheets
- Long forms use steps without changing the data model
- Primary actions stay in reachable/sticky action areas
- Hover becomes tap/focus
- Bulk actions are desktop-only
- Charts show the core trend and value with drill-down for detail
- Digital Twin uses Low quality or 2D/list fallback

## Localization

```text
Primary interface: English
Secondary interface: Traditional Chinese
Default locale: en-US
Business locale: Taiwan
Currency: TWD
Timezone: Asia/Taipei
```

Use locale formatters for dates, numbers, currency, and statuses. Do not concatenate localized strings inside UI components.

### Required Traditional Chinese frames

Desktop Login, Overview, Property List, Property Detail, Create Property, Payment List; Mobile Overview and Property Detail.

### Content behavior

- Buttons are content-sized within min/max constraints
- Navigation reserves space for both languages
- Headers may wrap; critical data cells do not silently truncate
- Property names support two lines
- Addresses support two to three lines
- Tooltips never contain the only copy of important information
- Database enums are mapped through the localization layer

## Demo content rules

- Fictional Taiwan names and addresses only
- No Lorem Ipsum
- No real identity, phone, financial, or tenant data
- Related records remain internally consistent
- Dashboard values derive from seed data

## QA cases

Test English and Traditional Chinese with long addresses, long property names, large currency values, validation messages, errors, empty states, timezone boundaries, virtual keyboard, and mobile landscape.

