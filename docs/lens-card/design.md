# Lens Card Component - Architecture Design

## 1. Component Mapping Analysis

### UI Prototype Reference (`docs/lens-card-ui.html`)
The UI prototype shows a sophisticated lens card with multiple sections:
- Header (Logo & Actions)
- Syntax X-Ray (syntax highlighting)
- Simple English Rewrite
- Key Terms vocabulary
- Chinese Translation (blurred)

**Simplified MVP Scope**: Based on user requirements, only implement:
1. Lens icon appears next to selected text
2. Click icon to open draggable overlay card
3. Card displays selected text only (no additional analysis)
4. Card can be dragged freely (no backdrop/mask)

### Existing Components
- `ContentApp.vue`: Current test button component in content script
- Need to replace with new `LensOverlay.vue` as root component

## 2. Component Splitting

### Component Tree
```
LensOverlay.vue (Root)
├── LensIcon.vue (Child)
└── LensCard.vue (Child)
```

### Component Specifications

#### 1. LensOverlay.vue (`src/content/LensOverlay.vue`)
**Purpose**: Root component that manages text selection, icon visibility, and card state.

**Props**: None (injected into Shadow DOM)

**Emits**: None

**Slots**: None

**defineExpose**: None

**State**:
```typescript
// Reactive state
const selectedText = ref<string>('')
const iconPosition = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const isIconVisible = ref<boolean>(false)
const isCardVisible = ref<boolean>(false)
const cardPosition = ref<{ x: number, y: number }>({ x: 0, y: 0 })
```

#### 2. LensIcon.vue (`src/content/components/LensIcon.vue`)
**Purpose**: Displays lens icon at selection position.

**Props**:
```typescript
interface Props {
  position: { x: number, y: number }
  visible: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'click'): void
}
```

**Slots**: None

**defineExpose**: None

**State**: None (stateless presentation)

#### 3. LensCard.vue (`src/content/components/LensCard.vue`)
**Purpose**: Draggable overlay card showing selected text.

**Props**:
```typescript
interface Props {
  position: { x: number, y: number }
  visible: boolean
  text: string
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'close'): void
  (e: 'update:position', position: { x: number, y: number }): void
}
```

**Slots**: None

**defineExpose**:
```typescript
// Optional: expose drag methods if needed
const startDrag = (e: MouseEvent) => { /* ... */ }
defineExpose({ startDrag })
```

**State**:
```typescript
const internalPosition = ref(props.position)
const isDragging = ref(false)
```

## 3. Logic Extraction (Composables)

### Hook 1: `useTextSelection`
**Location**: `src/content/composables/useTextSelection.ts`

**Purpose**: Monitors document text selection and provides selection data.

**Arguments**: None

**Return Values**:
```typescript
interface TextSelection {
  text: Ref<string>
  rect: Ref<DOMRect | null>
  isEmpty: Ref<boolean>
}
```

**Internal Side Effects**:
- Adds `selectionchange` event listener to `document`
- Removes listener on cleanup
- Debounces rapid selection changes (optional)

### Hook 2: `useDraggable`
**Location**: `src/content/composables/useDraggable.ts`

**Purpose**: Makes an HTML element draggable.

**Arguments**:
```typescript
interface DraggableArgs {
  elementRef: Ref<HTMLElement | null>
  initialPosition: { x: number, y: number }
}
```

**Return Values**:
```typescript
interface DraggableReturn {
  position: Ref<{ x: number, y: number }>
  isDragging: Ref<boolean>
  dragHandlers: {
    onMousedown: (e: MouseEvent) => void
  }
}
```

**Internal Side Effects**:
- Adds `mousemove` and `mouseup` event listeners to `document` when dragging starts
- Removes listeners when dragging stops or on cleanup
- Calculates position offset during drag

### Hook 3: `useLensState`
**Location**: `src/content/composables/useLensState.ts`

**Purpose**: Manages lens component state (icon, card visibility, positions).

**Arguments**: None

**Return Values**:
```typescript
interface LensState {
  iconVisible: boolean
  iconPosition: { x: number, y: number }
  cardVisible: boolean
  cardPosition: { x: number, y: number }
  selectedText: string
}

interface LensStateMethods {
  showIcon: (rect: DOMRect) => void
  hideIcon: () => void
  showCard: () => void
  hideCard: () => void
  updateCardPosition: (position: { x: number, y: number }) => void
  setSelectedText: (text: string) => void
}

interface UseLensStateReturn {
  state: Ref<LensState>
  methods: LensStateMethods
}
```

**Internal Side Effects**: None (pure state management)

## 4. CSS Variables & Styling Strategy

### Required CSS Variables (to be added to `src/assets/tailwind.css`)
Based on product design document color scheme:
```css
@import 'tailwindcss';
@plugin 'tailwindcss-animate';

@theme {
  --color-primary: oklch(0.208 0.042 265.755); /* slate-900 */
  --color-primary-foreground: oklch(0.985 0.001 247.858); /* slate-50 */
  --color-accent: oklch(0.585 0.233 277.117); /* indigo-500 */
  --color-accent-foreground: oklch(1 0 0); /* white */
  --color-card: oklch(0.208 0.042 265.755); /* slate-900 */
  --color-card-foreground: oklch(0.87 0.01 258.338); /* slate-200 */
  --color-border: oklch(0.274 0.04 260.031); /* slate-800 */
}
```

### Tailwind Semantic Classes
Components should use semantic classes instead of hardcoded colors:
- `bg-primary`, `text-primary-foreground`
- `bg-accent`, `text-accent-foreground`
- `bg-card`, `text-card-foreground`
- `border-border`

### Shadow DOM Considerations
All styles must be inlined into Shadow DOM via `?inline` import pattern:
```typescript
import tailwindContent from '@/assets/tailwind.css?inline'
// Inject into Shadow DOM
```

## 5. Test Plan (Unit Tests for Hooks Only)

### `useTextSelection.spec.ts`
1. **Initial state**: Should have empty text, null rect, and isEmpty true
2. **Text selection**: When selection exists, should update text and rect
3. **Selection cleared**: Should return to initial empty state
4. **Cleanup**: Should remove event listener on unmount

### `useDraggable.spec.ts`
1. **Initial position**: Should set position to initialPosition
2. **Drag start**: onMousedown should set isDragging to true
3. **Drag move**: Mouse movement should update position
4. **Drag end**: Mouse up should set isDragging to false
5. **Cleanup**: Should remove event listeners on unmount

### `useLensState.spec.ts`
1. **Initial state**: All visibility flags false, positions at origin
2. **showIcon**: Should set iconVisible true and position based on rect
3. **hideIcon**: Should set iconVisible false
4. **showCard/hideCard**: Should toggle cardVisible
5. **updateCardPosition**: Should update cardPosition
6. **setSelectedText**: Should update selectedText

## 6. Implementation Notes

### File Structure Changes
```
src/content/
├── index.ts                    # Updated to mount LensOverlay
├── LensOverlay.vue            # New root component
├── components/
│   ├── LensIcon.vue
│   └── LensCard.vue
└── composables/
    ├── useTextSelection.ts
    ├── useDraggable.ts
    └── useLensState.ts
```

### Integration with Existing Content Script
- Update `src/content/index.ts` to mount `LensOverlay` instead of `ContentApp`
- Maintain Shadow DOM isolation pattern
- Ensure all CSS is properly inlined

### Performance Considerations
- Debounce selection events to avoid rapid updates
- Use passive event listeners where possible
- Clean up all event listeners on component unmount

---

**Next Phase**: Implementation of test files (`*.spec.ts`) for all hooks.