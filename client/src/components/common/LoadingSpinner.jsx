export default function LoadingSpinner({ message = 'Loading...', size = 40 }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', gap: 16
    }}>
      <div style={{
        width: size, height: size, border: '4px solid #E8F5E9',
        borderTop: '4px solid #2E7D32', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      {message && <p style={{ color: '#666', fontSize: 14 }}>{message}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
