# 🧩 New Component Usage Guide

Quick reference for using the new UI enhancement components.

---

## 1. SkeletonLoader

**Purpose**: Display loading placeholder while fetching data

**Location**: `client/src/components/SkeletonLoader.tsx`

**Usage**:
```tsx
import { SkeletonLoader } from '../components';

export default function MyPage() {
  const [loading, setLoading] = useState(true);
  
  if (loading) return <SkeletonLoader />;
  
  return <div>Your content</div>;
}
```

**Customization**:
Create multiple skeletons for a list:
```tsx
{loading ? (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {Array(3).fill(0).map((_, i) => (
      <SkeletonLoader key={i} />
    ))}
  </div>
) : (
  // Content
)}
```

---

## 2. StatCard

**Purpose**: Display a metric with label, value, trend, and icon

**Location**: `client/src/components/StatCard.tsx`

**Props**:
```typescript
interface StatCardProps {
  icon: string;        // Emoji or icon
  label: string;       // Metric label
  value: string | number;  // Main value
  trend?: number;      // Optional trend % (positive/negative)
  color?: string;      // CSS color for left border
}
```

**Usage Examples**:

### Basic Stat
```tsx
<StatCard 
  icon="💰" 
  label="Total Owed" 
  value="$12,500.50"
/>
```

### With Trend
```tsx
<StatCard 
  icon="📊" 
  label="Active Loans" 
  value="8"
  trend={3}
  color="var(--primary)"
/>
```

### Negative Trend
```tsx
<StatCard 
  icon="✅" 
  label="Loans Repaid" 
  value="12"
  trend={-2}
  color="var(--success)"
/>
```

### In a Dashboard Grid
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
  <StatCard icon="💸" label="Total Balance" value="$45,000" trend={5} color="var(--primary)" />
  <StatCard icon="📈" label="Interest Accrued" value="$2,350" trend={8} color="var(--warning)" />
  <StatCard icon="✅" label="Fully Paid" value="15" trend={-2} color="var(--success)" />
  <StatCard icon="⏰" label="Overdue" value="2" trend={-1} color="var(--danger)" />
</div>
```

**Styling**: The component automatically inherits from your CSS variables:
- Text gradient: `--gradient-text`
- Border color: `color` prop or `--primary`
- Background: Light gradient background with subtle primary color

---

## 3. Loan Card Animations

**Purpose**: Smooth animated cards for loan display

**Location**: `client/src/index.css` (class: `.loan-card`)

**Usage**:
```tsx
<div className={`loan-card status-${loan.status}`}>
  {/* Your loan card content */}
</div>
```

**Status Classes**:
- `.loan-card.status-active` - Blue indicator
- `.loan-card.status-paid` - Green indicator
- `.loan-card.status-overdue` - Red indicator

**Features**:
- Hover effect: Lifts card and adds shadow
- Status indicator: 4px colored bar on left
- Gradient background
- Smooth transitions (0.3s cubic-bezier)

**Example**:
```tsx
<div 
  className={`loan-card status-${loan.status}`}
  onClick={() => openLoanDetail(loan)}
>
  <h3>{loan.borrowerName}</h3>
  <p>Amount: {loan.currentBalance}</p>
  <p>Status: {loan.status}</p>
</div>
```

---

## 4. Button Interactions

**Purpose**: Enhanced button feedback and animations

**Available Styles**:
```tsx
// Primary action (blue gradient)
<button className="btn-primary">Add Loan</button>

// Danger action (red)
<button className="btn-danger">Delete</button>

// Secondary (ghost style)
<button className="btn-ghost">Cancel</button>

// Success (green gradient)
<button className="btn-success">Confirm</button>

// Icon button
<button className="btn-icon">⚙️ Settings</button>
```

**Animations**:
- Hover: Lifts up 2px, adds shadow
- Active: Scales down 0.97 (pressed effect)
- All transitions: 0.2s smooth

---

## 5. Input Focus States

**Features**:
- 4px glow ring: `rgba(99, 102, 241, 0.15)`
- Glowing shadow: `0 0 20px rgba(99, 102, 241, 0.2)`
- Subtle scale: `1.01`
- Background color change

**Usage**:
```tsx
<input 
  type="text"
  placeholder="Enter name..."
  // Focus automatically gets enhanced styling
/>
```

---

## 6. Gradient Classes

**CSS Variables** (available in any component):
```css
var(--gradient-primary)     /* Blue to purple */
var(--gradient-success)     /* Green gradient */
var(--gradient-danger)      /* Red gradient */
var(--gradient-warning)     /* Orange gradient */
var(--gradient-text)        /* Text gradient */
var(--shadow-elevated)      /* Heavy shadow */
var(--shadow-card)          /* Card shadow */
```

**Usage**:
```tsx
<div style={{ 
  background: 'var(--gradient-primary)',
  color: 'white',
  padding: '20px',
  borderRadius: '12px'
}}>
  Featured Content
</div>
```

---

## 7. Mobile Responsive

**Mobile-first breakpoints**:
```css
@media (max-width: 600px) {
  /* Touch targets: 44px minimum */
  button { min-height: 44px; }
  input { min-height: 44px; }
  
  /* Text sizing prevents iOS zoom */
  button { font-size: 16px; }
  input { font-size: 16px; }
}
```

**Testing**:
```tsx
// Test responsive by resizing browser or using DevTools device emulation
// Or visit http://localhost:5174 on actual mobile device
```

---

## 8. Page Header

**Enhanced Header Styling**:
```tsx
<div className="page-header">
  <div>
    <h1 style={{ 
      fontSize: '28px', 
      fontWeight: '900',
      letterSpacing: '-1px',
      marginBottom: '6px'
    }}>
      📋 Page Title
    </h1>
    <p style={{ 
      fontSize: '14px', 
      color: 'var(--text-muted)'
    }}>
      Descriptive subtitle
    </p>
  </div>
  <button className="btn-primary">Action</button>
</div>
```

**Responsive**: Stacks on mobile with full-width button

---

## 9. Empty States

**Better Visual Feedback**:
```tsx
const EmptyState = () => (
  <div style={{
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--text-muted)',
  }}>
    <div style={{ fontSize: '56px', marginBottom: '16px' }}>📭</div>
    <h3 style={{ 
      fontSize: '18px', 
      fontWeight: '700', 
      color: 'var(--text)',
      marginBottom: '8px'
    }}>
      No loans found
    </h3>
    <p style={{ 
      fontSize: '14px', 
      maxWidth: '280px', 
      margin: '0 auto'
    }}>
      Start by adding your first loan
    </p>
    <button className="btn-primary" style={{ marginTop: '20px' }}>
      Add Loan
    </button>
  </div>
);
```

---

## 10. Quick Copy-Paste Examples

### Dashboard Overview
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
  <StatCard icon="💰" label="Total Owed" value="$45,000" color="var(--primary)" />
  <StatCard icon="📈" label="Interest" value="$2,350" trend={5} color="var(--warning)" />
  <StatCard icon="✅" label="Repaid" value="15" color="var(--success)" />
</div>
```

### List with Skeletons
```tsx
{loading ? (
  Array(3).fill(0).map((_, i) => <SkeletonLoader key={i} />)
) : loans.length === 0 ? (
  <EmptyState />
) : (
  loans.map(loan => <LoanCard key={loan.id} loan={loan} />)
)}
```

### Enhanced Form
```tsx
<form>
  <div className="form-group">
    <label>Borrower Name</label>
    <input placeholder="Enter name..." required />
  </div>
  <div className="form-row">
    <div className="form-group">
      <label>Amount</label>
      <input type="number" placeholder="0.00" />
    </div>
    <div className="form-group">
      <label>Currency</label>
      <select>
        <option>PLN</option>
        <option>EUR</option>
        <option>USD</option>
      </select>
    </div>
  </div>
  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
    <button className="btn-ghost">Cancel</button>
    <button className="btn-primary">Save</button>
  </div>
</form>
```

---

## 🎨 Color Reference

```
Primary:    #6366f1 (Indigo)
Success:    #10b981 (Green)
Danger:     #f43f5e (Red)
Warning:    #f59e0b (Orange)
Info:       #38bdf8 (Cyan)
Purple:     #a855f7
Pink:       #ec4899
```

---

## 📦 Import Reference

```tsx
import { SkeletonLoader, StatCard } from '../components';
```

Or individual imports:
```tsx
import SkeletonLoader from '../components/SkeletonLoader';
import StatCard from '../components/StatCard';
```

---

## ✅ Best Practices

1. **Use SkeletonLoader** while fetching data
2. **Use StatCard** on dashboards for metrics
3. **Apply .loan-card** class to loan items
4. **Ensure 44px** touch targets on mobile
5. **Test animations** with DevTools Performance tab
6. **Check contrast** in both dark and light modes
7. **Validate forms** with proper ARIA attributes

---

**Need help?** Check `UI_UX_ENHANCEMENTS_APPLIED.md` for implementation details! 🚀
