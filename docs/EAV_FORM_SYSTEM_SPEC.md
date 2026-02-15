# EAV Form System Specification

## Overview

This document captures the specifications, concepts, and implementation details from the oblio_eav to VIv5 porting session. The goal was to port a Flutter/FlutterFlow EAV (Entity-Attribute-Value) form system to the existing VIv5 TypeScript/React architecture.

---

## 1. Source System: oblio_eav (Flutter/FlutterFlow)

### 1.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Flutter 3.x / FlutterFlow |
| Language | Dart (SDK >= 3.0.0) |
| Backend | Firebase (Auth, Firestore, Storage, Functions) |
| State Management | Provider pattern + FFAppState |
| UI Pattern | Widget-Model pairing |

### 1.2 EAV Data Model

The oblio_eav system uses a nested hierarchical structure:

```
Record
  └── Object (type definition)
       └── FieldGroup (logical groupings)
            └── Field (individual field definitions)
                 └── Property (actual values)
```

#### Key Structs (from `lib/backend/schema/structs/`)

| Struct | Purpose | Key Properties |
|--------|---------|----------------|
| `RecordStruct` | Root container | `idRecord`, `objectStruct` |
| `ObjectStruct` | Type definition | `idRefObjectRecord`, `typeObject`, `fieldGroupStructs[]` |
| `FieldGroupStruct` | Logical grouping | `idRefFieldGroupRecord`, `nameFieldGroup`, `fieldStructs[]` |
| `FieldStruct` | Field definition | `idRefFieldRecord`, `nameField`, `inputType`, `displayPosition`, `isSelectMany`, `propertyStructs[]` |
| `PropertyStruct` | Value container | `valueProperty`, `recordSnapshotStruct?` |

### 1.3 Field Types Supported

| Type | Widget | Purpose |
|------|--------|---------|
| String | `field_string_widget.dart` | Text input |
| Number | `field_number_widget.dart` | Numeric input |
| Checkbox | `field_checkbox_widget.dart` | Multi-select booleans |
| Radio | `field_radio_widget.dart` | Single selection |
| Dropdown | `field_dropdown_widget.dart` | Select list |
| DateTime | `field_date_time_widget.dart` | Date/time picker |
| Image | `field_image_widget.dart` | Image upload |
| Relation | `field_relation_object_widget.dart` | Object references |

### 1.4 Key Patterns

**Widget-Model Pairing:**
- Every UI widget has an associated `*_model.dart` file
- Models extend `FlutterFlowModel<WidgetType>`
- Clean separation of UI and state

**Type-Safe Serialization:**
- `ParamType` enum system for consistent serialization
- Located in `lib/backend/schema/util/schema_util.dart`

**Snapshot Pattern:**
- Immutable copies for state management
- `*SnapshotStruct` types for field, property, record, etc.

### 1.5 Source File Locations

```
agent_context/legacy_module_repos/oblio_eav/
├── lib/
│   ├── backend/schema/structs/     # Data structures
│   │   ├── record_struct.dart
│   │   ├── object_struct.dart
│   │   ├── field_group_struct.dart
│   │   ├── field_struct.dart
│   │   └── property_struct.dart
│   ├── bar_side/forms/             # Form UI components
│   │   └── field_group_list/
│   │       └── field_group/
│   │           └── field_list/
│   │               └── field/
│   │                   ├── field_dynamic/
│   │                   └── field_types/
│   └── flutter_flow/
│       └── custom_functions.dart   # Utility functions
```

---

## 2. Target System: VIv5 (TypeScript/React)

### 2.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js 18+, Express 5.x |
| Database | SQLite (better-sqlite3) |
| Validation | Zod 4.3.6 |
| Frontend | React 18.3.1, Vite 6.2 |
| Forms | react-hook-form 7.x + @hookform/resolvers |
| Styling | Tailwind CSS 4.x |

### 2.2 Pre-existing EAV Types

VIv5 already had EAV structures defined in `src/core/types.ts`:

```typescript
// Field input types
type FieldInputType =
  | 'text' | 'textarea' | 'number' | 'currency'
  | 'date' | 'select' | 'multiselect' | 'image'
  | 'url' | 'boolean' | 'ref' | 'Record';

// Property value container
interface PropertyStruct {
  valueProperty: string | number | boolean | null;
  recordSnapshotStruct?: RecordSnapshotStruct;
}

// Field definition
interface FieldStruct {
  idRefFieldRecord: string;
  nameField: string;
  inputType: FieldInputType;
  displayPosition: number;
  isSelectMany: boolean;
  isSystem: boolean;
  propertyStructs: PropertyStruct[];
}

// Field group
interface FieldGroupStruct {
  idRefFieldGroupRecord: string;
  nameFieldGroup: string;
  fieldStructs: FieldStruct[];
}

// Entity data (stored in records.data JSON column)
interface EntityData {
  fieldGroups: FieldGroupStruct[];
  [key: string]: any;
}
```

### 2.3 Database Schema

```sql
CREATE TABLE records (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  type TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  data JSON DEFAULT '{}',  -- Stores EntityData with fieldGroups
  created_at TEXT,
  updated_at TEXT,
  deleted_at TEXT,
  content_hash TEXT,
  UNIQUE(account_id, slug)
);
```

---

## 3. Implementation: Ported Components

### 3.1 Field Components

Created in `src/themes/victory-studio/components/admin/fields/`:

| Component | Props | Purpose |
|-----------|-------|---------|
| `FieldText` | `field`, `value`, `onChange`, `multiline?`, `maxLength?` | Text/textarea input |
| `FieldNumber` | `field`, `value`, `onChange`, `min?`, `max?`, `step?` | Numeric input |
| `FieldBoolean` | `field`, `value`, `onChange` | Yes/No toggle |
| `FieldCheckboxGroup` | `field`, `options`, `selectedValues`, `onChange` | Multi-select |
| `FieldRadioGroup` | `field`, `options`, `selectedValue`, `onChange` | Single-select |
| `FieldDateTime` | `field`, `value`, `onChange`, `includeTime?` | Date/datetime picker |
| `FieldImage` | `field`, `value`, `onChange`, `onUpload?` | Image upload with preview |
| `FieldRelation` | `field`, `value`, `onChange`, `targetType?` | Entity reference picker |

### 3.2 Dynamic Field Dispatcher

`FieldDynamic.tsx` - Routes to correct field type based on `FieldStruct.inputType`:

```typescript
function FieldDynamic({ field, value, onChange, options?, error?, onImageUpload? }) {
  // Extract options from field.propertyStructs if not provided
  const resolvedOptions = options ?? extractOptionsFromField(field);

  switch (field.inputType) {
    case 'text': return <FieldText ... />;
    case 'textarea': return <FieldText multiline ... />;
    case 'number':
    case 'currency': return <FieldNumber ... />;
    case 'boolean': return <FieldBoolean ... />;
    case 'select':
      return field.isSelectMany
        ? <FieldCheckboxGroup ... />
        : <FieldRadioGroup ... />;
    case 'multiselect': return <FieldCheckboxGroup ... />;
    case 'date': return <FieldDateTime ... />;
    case 'image': return <FieldImage ... />;
    case 'ref':
    case 'Record': return <FieldRelation ... />;
    default: return <FieldText ... />;
  }
}
```

### 3.3 Field Group List

`FieldGroupList.tsx` - Renders collapsible field groups:

```typescript
interface FieldGroupListProps {
  fieldGroups: FieldGroupStruct[];
  values: Record<string, PropertyStruct[]>;  // Keyed by field ID
  onChange: (fieldId: string, value: PropertyStruct[]) => void;
  errors?: Record<string, string>;
  onImageUpload?: (file: File) => Promise<string>;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}
```

### 3.4 Dynamic Schema Form

`DynamicSchemaForm.tsx` - Complete EAV form component:

```typescript
interface DynamicSchemaFormProps {
  fieldGroups: FieldGroupStruct[];
  initialValues?: Record<string, PropertyStruct[]>;
  onSubmit: (values: Record<string, PropertyStruct[]>) => void | Promise<void>;
  title?: string;
  onCancel?: () => void;
  onImageUpload?: (file: File) => Promise<string>;  // Defaults to apiClient.uploadImage
  collapsible?: boolean;
  defaultExpanded?: boolean;
  submitLabel?: string;
  isLoading?: boolean;
}
```

#### Helper Functions

```typescript
// Extract values from EntityData for form initialization
function extractValuesFromEntityData(entityData: EntityData): Record<string, PropertyStruct[]>

// Merge form values back into EntityData for saving
function mergeValuesToEntityData(
  entityData: EntityData,
  values: Record<string, PropertyStruct[]>
): EntityData
```

---

## 4. API Integration

### 4.1 API Client Updates

Updated `src/themes/victory-studio/api/client.ts`:

```typescript
import { DataRecord, DataRecordInput, EntityType, EntityData } from '../../../core/types';

export const apiClient = {
  // CRUD operations (now use /api/records endpoints)
  listEntities(type?: string, accountId?: string): Promise<DataRecord[]>,
  getEntity(id: string): Promise<DataRecord>,
  createEntity(input: Partial<DataRecordInput>): Promise<DataRecord>,
  updateEntity(id: string, updates: Partial<DataRecordInput>): Promise<DataRecord>,
  deleteEntity(id: string): Promise<void>,

  // AI content rewrite
  rewriteContent(text: string, context?: any): Promise<string>,

  // Image upload (NEW)
  uploadImage(file: File): Promise<string>
};
```

### 4.2 Upload API Route

Created `src/api/routes/upload.ts`:

```typescript
// POST /api/upload
// - Accepts multipart/form-data with 'file' field
// - Validates image MIME types (jpeg, png, gif, webp, svg)
// - Enforces 5MB file size limit
// - Returns: { url, filename, originalName, size, mimetype }
```

Configuration:
- Upload directory: `process.env.UPLOADS_DIR` or `./uploads`
- Static serving: `/uploads/*` serves from uploads directory
- Protected by auth middleware

---

## 5. Utility Functions

### 5.1 Collection Utilities

Created `src/core/utils/collections.ts`:

| Function | Signature | Purpose |
|----------|-----------|---------|
| `toProperCase` | `(str: string) => string` | Capitalize first letter of each word |
| `toUpperCase` | `(str: string) => string` | Convert to uppercase |
| `listToDelimitedString` | `(list: string[], delimiter?: string) => string` | Join with bullet delimiter |
| `mergeListUnique` | `<T>(list1, list2, keyFn) => T[]` | Merge lists removing duplicates |
| `listContainsAny` | `<T>(list, items) => boolean` | Check if any items match |
| `listContains` | `<T>(list, item) => boolean` | Check if item exists |
| `removeFromList` | `<T>(list, predicate) => T[]` | Remove by predicate |
| `removeByKey` | `<T>(list, keys, keyFn) => T[]` | Remove by key |
| `groupBy` | `<T, K>(list, keyFn) => Record<K, T[]>` | Group by key |
| `sortByPosition` | `<T>(list, positionFn) => T[]` | Sort by numeric position |
| `toMap` | `<T, K>(list, keyFn) => Record<K, T>` | Create map from list |
| `findByKey` | `<T>(list, key, keyFn) => T?` | Find by key |

---

## 6. Options Handling

### 6.1 Options from Field Definition

Select/multiselect fields can store predefined options in `field.propertyStructs`:

```typescript
// Field definition with predefined options
const field: FieldStruct = {
  idRefFieldRecord: 'status-field',
  nameField: 'Status',
  inputType: 'select',
  isSelectMany: false,
  propertyStructs: [
    { valueProperty: 'active' },
    { valueProperty: 'inactive' },
    { valueProperty: 'pending' }
  ]
};

// FieldDynamic extracts these as options:
// [{ value: 'active', label: 'active' }, ...]
```

### 6.2 Option Extraction

```typescript
function extractOptionsFromField(field: FieldStruct): Option[] {
  if (!field.propertyStructs?.length) return [];

  return field.propertyStructs
    .filter(p => typeof p.valueProperty === 'string' && p.valueProperty)
    .map(p => ({
      value: String(p.valueProperty),
      label: String(p.valueProperty)
    }));
}
```

---

## 7. Usage Examples

### 7.1 Basic Dynamic Form

```tsx
import { DynamicSchemaForm, extractValuesFromEntityData } from './components/admin/systems';

function EditRecord({ entity }) {
  const handleSubmit = async (values) => {
    const updatedData = mergeValuesToEntityData(entity.data, values);
    await apiClient.updateEntity(entity.id, { data: updatedData });
  };

  return (
    <DynamicSchemaForm
      fieldGroups={entity.data.fieldGroups}
      initialValues={extractValuesFromEntityData(entity.data)}
      onSubmit={handleSubmit}
      title={`Edit ${entity.name}`}
    />
  );
}
```

### 7.2 Individual Field Usage

```tsx
import { FieldDynamic } from './components/admin/fields';

function CustomField({ field, value, onChange }) {
  return (
    <FieldDynamic
      field={field}
      value={value}
      onChange={onChange}
      onImageUpload={(file) => apiClient.uploadImage(file)}
    />
  );
}
```

### 7.3 Field Group Rendering

```tsx
import { FieldGroupList } from './components/admin/fields';

function FormSection({ fieldGroups, values, onChange }) {
  return (
    <FieldGroupList
      fieldGroups={fieldGroups}
      values={values}
      onChange={onChange}
      collapsible={true}
      defaultExpanded={true}
    />
  );
}
```

---

## 8. File Manifest

### 8.1 Created Files

| Path | Purpose |
|------|---------|
| `src/themes/victory-studio/components/admin/fields/FieldText.tsx` | Text/textarea input |
| `src/themes/victory-studio/components/admin/fields/FieldNumber.tsx` | Numeric input |
| `src/themes/victory-studio/components/admin/fields/FieldBoolean.tsx` | Boolean toggle |
| `src/themes/victory-studio/components/admin/fields/FieldCheckboxGroup.tsx` | Multi-select |
| `src/themes/victory-studio/components/admin/fields/FieldRadioGroup.tsx` | Single-select |
| `src/themes/victory-studio/components/admin/fields/FieldDateTime.tsx` | Date/time picker |
| `src/themes/victory-studio/components/admin/fields/FieldImage.tsx` | Image upload |
| `src/themes/victory-studio/components/admin/fields/FieldRelation.tsx` | Entity reference |
| `src/themes/victory-studio/components/admin/fields/FieldDynamic.tsx` | Type dispatcher |
| `src/themes/victory-studio/components/admin/fields/FieldGroupList.tsx` | Group renderer |
| `src/themes/victory-studio/components/admin/fields/index.ts` | Exports |
| `src/themes/victory-studio/components/admin/systems/DynamicSchemaForm.tsx` | EAV form |
| `src/themes/victory-studio/components/admin/systems/index.ts` | Exports |
| `src/api/routes/upload.ts` | Upload endpoint |
| `src/core/utils/collections.ts` | Utilities |
| `src/core/utils/collections.test.ts` | Unit tests |
| `tests/fields/form-helpers.test.ts` | Form helper tests |

### 8.2 Modified Files

| Path | Changes |
|------|---------|
| `src/themes/victory-studio/api/client.ts` | Fixed types, added `uploadImage()` |
| `src/api/server.ts` | Added upload route, static serving |
| `src/core/index.ts` | Exported collections utilities |

---

## 9. Decisions Made

| Question | Decision | Rationale |
|----------|----------|-----------|
| Field types priority | All 8 types | Full feature parity with legacy system |
| Field grouping | Yes - full hierarchical groups | Required for complex forms |
| Data storage | Keep JSON columns | EAV types already in `types.ts` |
| Image storage | Local filesystem (`/uploads`) | Simple, suitable for single-server deployment |

---

## 10. Testing

### 10.1 Test Coverage

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `collections.test.ts` | 26 | All collection utilities |
| `form-helpers.test.ts` | 18 | Form helpers, value extraction |

### 10.2 Running Tests

```bash
npm test -- --run src/core/utils/collections.test.ts tests/fields/form-helpers.test.ts
```

---

## 11. Dependencies Added

```json
{
  "dependencies": {
    "multer": "^1.4.x"
  },
  "devDependencies": {
    "@types/multer": "^1.4.x"
  }
}
```

---

## 12. Seed Data System

The seeding system converts flat JSON seed files into the canonical FieldGroupStruct format for storage. This allows seed data to be authored in a simple key-value format while maintaining full EAV compatibility at runtime.

### 12.1 Seed Directory Structure

```
data/seeds/
├── tier_0_core/           # Core system data
│   └── accounts.json      # Account definitions
├── tier_0_system/         # System-level configuration
│   └── system_users.json  # System users
├── tier_1_schema/         # Schema definitions (object_def, field_def)
│   └── ...
└── tenants/               # Per-tenant seed data
    └── {tenant_slug}.json
```

### 12.2 Seed Data Tiers

| Tier | Purpose | Examples |
|------|---------|----------|
| `tier_0_core` | Core accounts and system records | accounts.json |
| `tier_0_system` | System users and configuration | system_users.json |
| `tier_1_schema` | Object and field definitions | object_def, field_def records |
| `tenants` | Tenant-specific initial data | Per-tenant configuration |

### 12.3 System IDs

The seeding module defines stable UUIDs for system records:

```typescript
// src/modules/content/seeding.ts
const SYSTEM_IDS: Record<string, string> = {
  // Objects
  'object_def': '00000000-0000-0000-0000-000000000001',
  'field_def': '00000000-0000-0000-0000-000000000002',
  'field_group': '00000000-0000-0000-0000-000000000003',
  'activity_def': '00000000-0000-0000-0000-000000000004',
  // Fields
  'system_name': '00000000-0000-0000-0000-000000000100',
  'system_slug': '00000000-0000-0000-0000-000000000101',
  'system_description': '00000000-0000-0000-0000-000000000102',
};
```

### 12.4 Schema Map

Defines how flat seed fields are grouped for each entity type:

```typescript
const SCHEMA_MAP: Record<string, any[]> = {
  contact: [
    { name: 'Identity', fields: ['Email', 'First Name', 'Last Name', 'Job Title', 'Account', 'Owner'] },
    { name: 'Segmentation', fields: ['Persona', 'Department'] },
    { name: 'Contact Info', fields: ['Phone', 'LinkedIn'] }
  ],
  account: [
    { name: 'Profile', fields: ['Website', 'Industry', 'Employees', 'Type'] },
    { name: 'Sales', fields: ['Owner', 'Status'] }
  ],
  opportunity: [
    { name: 'Deal Info', fields: ['Amount', 'Close Date', 'Stage', 'Probability'] },
    { name: 'Relationships', fields: ['Account', 'Primary Contact'] }
  ]
};
```

### 12.5 Field Name Mapping

Converts snake_case seed keys to Title Case display names:

```typescript
const FIELD_NAME_MAP: Record<string, string> = {
  'first_name': 'First Name',
  'last_name': 'Last Name',
  'job_title': 'Job Title',
  'account_id': 'Account',
  'owner_id': 'Owner',
  'close_date': 'Close Date',
  'primary_contact_id': 'Primary Contact',
  // ... etc
};
```

### 12.6 The inflateRecord Function

Converts flat seed JSON into a canonical `RecordStruct`:

```typescript
export function inflateRecord(
  input: any,
  accountId: string = '00000000-0000-0000-0000-000000000000'
): RecordStruct
```

**Process:**

1. **Extract data** - Reads `input.data` or flat keys (excluding system keys like `id`, `type`, `slug`)

2. **Create FieldStructs** - For each key-value pair:
   - Map key to display name via `FIELD_NAME_MAP`
   - Detect input type (Record for `*_id` keys, number for numeric values)
   - Create `PropertyStruct[]` from value(s)

3. **Group fields** - Use `SCHEMA_MAP` to place fields into named groups

4. **Handle remaining fields** - Fields not in schema go to "General" group

5. **Build ObjectStruct** - Wrap field groups in object structure

6. **Return RecordStruct** - Complete record with ID and account

**Example transformation:**

```json
// Input (flat seed JSON)
{
  "id": "contact-001",
  "type": "contact",
  "slug": "john-doe",
  "name": "John Doe",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "555-1234"
  }
}
```

```typescript
// Output (RecordStruct with FieldGroupStructs)
{
  idRecord: "contact-001",
  account_id: "00000000-0000-0000-0000-000000000000",
  objectStruct: {
    idRefObjectRecord: "...",
    typeObject: "contact",
    fieldGroupStructs: [
      {
        nameFieldGroup: "Identity",
        fieldStructs: [
          { nameField: "Email", inputType: "text", propertyStructs: [{ valueProperty: "john@example.com" }] },
          { nameField: "First Name", inputType: "text", propertyStructs: [{ valueProperty: "John" }] },
          { nameField: "Last Name", inputType: "text", propertyStructs: [{ valueProperty: "Doe" }] }
        ]
      },
      {
        nameFieldGroup: "Contact Info",
        fieldStructs: [
          { nameField: "Phone", inputType: "text", propertyStructs: [{ valueProperty: "555-1234" }] }
        ]
      }
    ]
  }
}
```

### 12.7 The loadSeedState Function

Loads all seed data and returns a unified `SeedState`:

```typescript
export interface SeedState {
  accounts: any[];           // Raw account objects
  records: DataRecord[];     // Inflated records with FieldGroupStructs
  relationships: RecordRelationship[];
  domains: any[];            // Domain mappings
  dimensions: any[];         // Dimension values
  users: any[];              // System users
}

export function loadSeedState(): SeedState
```

**Loading Order:**

1. Load `tier_0_core/accounts.json`
2. Load `tier_0_system/system_users.json`
3. Scan `tier_0_core`, `tier_0_system`, `tier_1_schema` for JSON files
4. Inflate each record via `inflateRecord()`
5. Process tenant files from `tenants/` directory
6. Unify all accounts into records

### 12.8 Reference Type Detection

The seeding system auto-detects reference fields:

```typescript
// Fields ending in _id or named Account/Owner/Primary Contact
if (key.endsWith('_id') || key === 'Account' || key === 'Owner') {
  inputType = 'Record';
  if (key === 'account_id') refTarget = 'account';
  if (key === 'owner_id') refTarget = 'user';
  if (key === 'primary_contact_id') refTarget = 'contact';
}
```

### 12.9 Creating Seed Data

**Simple seed file example:**

```json
// data/seeds/tier_1_schema/products.json
[
  {
    "id": "prod-001",
    "type": "product",
    "slug": "starter-plan",
    "name": "Starter Plan",
    "data": {
      "price": 99,
      "billing_frequency": "monthly",
      "features": ["Feature A", "Feature B"]
    }
  }
]
```

**Tenant seed file example:**

```json
// data/seeds/tenants/acme-corp.json
{
  "account_id": "acct-acme-001",
  "tenant_slug": "acme-corp",
  "domain": "acme.example.com",
  "owner": {
    "name": "Jane Smith",
    "email": "jane@acme.com"
  },
  "subscription": {
    "plan": "pro",
    "seats": 10
  },
  "initial_records": [
    {
      "type": "contact",
      "slug": "jane-smith",
      "name": "Jane Smith",
      "data": { "email": "jane@acme.com", "job_title": "CEO" }
    }
  ]
}
```

### 12.10 Integration with EAV Forms

The seeded `FieldGroupStruct` data is directly compatible with the EAV form system:

```tsx
// Load a seeded record
const record = await apiClient.getEntity('contact-001');

// Render with DynamicSchemaForm
<DynamicSchemaForm
  fieldGroups={record.data.fieldGroups}
  initialValues={extractValuesFromEntityData(record.data)}
  onSubmit={handleSubmit}
/>
```

---

## Appendix A: Concept Mapping

| oblio_eav (Flutter) | VIv5 (React) | Notes |
|---------------------|--------------|-------|
| `FieldNumberWidget` | `FieldNumber` | Props simplified |
| `FieldStringWidget` | `FieldText` | Supports multiline |
| `FieldCheckboxWidget` | `FieldCheckboxGroup` | For `isSelectMany` |
| `FieldRadioWidget` | `FieldRadioGroup` | For single select |
| `FieldDropdownWidget` | `FieldRadioGroup` | Merged with radio |
| `FieldDateTimeWidget` | `FieldDateTime` | Uses native inputs |
| `FieldImageWidget` | `FieldImage` | Local upload |
| `FieldRelationObjectWidget` | `FieldRelation` | Entity picker |
| `FieldDynamicWidget` | `FieldDynamic` | Type dispatcher |
| `FieldGroupListWidget` | `FieldGroupList` | Collapsible groups |
| `FlutterFlowModel` | React hooks | State management |
| `FFAppState` | React Context | Global state |
| Firebase Storage | Local `/uploads` | File storage |

---

## Appendix B: Type Reference

```typescript
// Core types from src/core/types.ts

type FieldInputType =
  | 'text' | 'textarea' | 'number' | 'currency'
  | 'date' | 'select' | 'multiselect' | 'image'
  | 'url' | 'boolean' | 'ref' | 'Record';

interface PropertyStruct {
  valueProperty: string | number | boolean | null;
  recordSnapshotStruct?: RecordSnapshotStruct;
}

interface RecordSnapshotStruct {
  idRefRecord: string;
  data: Record<string, any>;
  created_at: string;
}

interface FieldStruct {
  idRefFieldRecord: string;
  nameField: string;
  inputType: FieldInputType;
  displayPosition: number;
  isSelectMany: boolean;
  isSystem: boolean;
  propertyStructs: PropertyStruct[];
}

interface FieldGroupStruct {
  idRefFieldGroupRecord: string;
  nameFieldGroup: string;
  fieldStructs: FieldStruct[];
}

interface ObjectStruct {
  idRefObjectRecord: string;
  typeObject: string;
  fieldGroupStructs: FieldGroupStruct[];
}

interface RecordStruct {
  idRecord: string;
  account_id: string;
  objectStruct: ObjectStruct;
}

interface EntityData {
  fieldGroups: FieldGroupStruct[];
  [key: string]: any;
}

interface DataRecord {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  data: EntityData;
  created_at: string;
  updated_at: string;
  content_hash?: string;
  account_id: string;
}
```
