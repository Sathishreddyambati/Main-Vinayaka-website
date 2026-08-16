import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="eyebrow mb-4">404</p>
      <h1 className="font-display text-3xl text-ivory mb-4">This page has wandered off the procession route.</h1>
      <Link to="/" className="text-saffron-light underline underline-offset-4">Return home</Link>
    </div>
  );
}
