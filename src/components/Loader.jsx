export default function Loader({ label = 'Loading…', fullscreen }) {
  return (
    <div className={`loader ${fullscreen ? 'loader-full' : ''}`} role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
