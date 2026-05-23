/**
 * SkeletonLoader Component
 * 
 * Displays a loading skeleton placeholder for cards and data.
 * Used while data is being fetched from the API.
 */

export default function SkeletonLoader() {
  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Title skeleton */}
      <div 
        className="skeleton" 
        style={{ 
          height: '24px', 
          marginBottom: '12px', 
          width: '60%',
          borderRadius: '8px'
        }} 
      />
      
      {/* Main content skeleton */}
      <div 
        className="skeleton" 
        style={{ 
          height: '48px', 
          marginBottom: '12px',
          borderRadius: '8px'
        }} 
      />
      
      {/* Grid of smaller skeletons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div 
          className="skeleton" 
          style={{ height: '40px', borderRadius: '8px' }} 
        />
        <div 
          className="skeleton" 
          style={{ height: '40px', borderRadius: '8px' }} 
        />
      </div>
    </div>
  );
}
