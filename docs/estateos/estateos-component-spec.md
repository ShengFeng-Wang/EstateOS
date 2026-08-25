# ESTATE / OS Component Specification

## Component contract

Every component board documents anatomy, variants, states, size, spacing, content rules, responsive behavior, accessibility, localization, React mapping, token mapping, and Do/Don't examples.

Interactive components cover Default, Hover, Focus, Pressed, Disabled, Loading, and Error where relevant.

## Families

### Navigation

AppShell, Sidebar Expanded/Collapsed, SidebarItem, TopBar, Breadcrumb, MobileNavigation, Tabs, LanguageSwitcher, UserMenu.

### Actions

Primary, Secondary, Quiet, and Destructive Button; IconButton; SplitButton; TextLink; FloatingAction.

### Forms

TextField, NumberField, CurrencyField, TextArea, Select, MultiSelect, Combobox, Checkbox, Radio, Switch, DatePicker, DateRangePicker, AddressFields, SearchField, FileUpload, FieldGroup, FormSection, FormActions.

Form states: Empty, Filled, Hover, Focus, Disabled, Read Only, Error, Success, Helper Text.

### Data display

DataTable, Header, Row, Cell, Sorter, Pagination, BulkActionBar, DefinitionList, KeyValuePair, Metric, Trend, Progress, Timeline, ActivityItem, Avatar, StatusBadge, PropertyTypeBadge, PriorityBadge.

DataTable states: Default, Loading, Empty, Filtered, Row Hovered, Row Selected, Multi Selected, Compact, Responsive Row.

### Feedback

Toast, InlineAlert, Banner, Tooltip, Popover, Modal, ConfirmationDialog, Drawer, BottomSheet, Skeleton, Spinner, ProgressIndicator, EmptyState, ErrorState, OfflineState.

### Search and filtering

GlobalSearch, CommandPalette, FilterBar, FilterChip, FilterDrawer, SortMenu, SavedViewSelector, ResultSummary, NoResults.

### Property and spatial

PropertyCard, PropertyRow, PropertyPreviewPanel, PropertyStatus, PropertyType, OccupancyIndicator, BuildingMarker, BuildingTooltip, BuildingSelectionRing, SpatialLegend, MapControl, AssetSummary.

### Business summaries

TenantSummary, ContractSummary, ContractStatus, PaymentSummary, PaymentStatus, MaintenanceSummary, MaintenanceStatus, PriorityIndicator, RelatedRecord, EntityLink.

### Visualization

KPIValue, Sparkline, OccupancyTrend, RevenueTrend, StatusDistribution, CategoryBreakdown, ChartTooltip, ChartLegend, DateRangeControl, NoChartData.

Charts provide keyboard-accessible values and a text/table alternative. They do not use decorative 3D effects.

### Three.js integration

SpatialViewport, BuildingGeometry, BuildingStateMaterial, CameraControls, MapFilter, MapLegend, PropertyHoverLabel, PropertySelectionPanel, ScanSequence, LoadingFallback, ReducedMotionFallback, WebGLUnsupportedFallback.

Each spatial building consumes real property data:

```text
propertyId, name, location, type, status, occupancy,
monthlyRevenue, contractExpiry, maintenanceCount
```

## Responsive component rules

- Tables become semantic rows on mobile; horizontal scroll is not the primary solution.
- Hover-only actions gain tap/focus equivalents.
- Filters use a drawer on tablet and bottom sheet on mobile.
- Desktop bulk actions are omitted on mobile.
- Touch targets are at least 44 × 44 px.

