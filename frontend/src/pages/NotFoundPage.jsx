import { Link } from "react-router-dom";
import { Crown, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <Crown size={48} className="text-gold-300 mb-6" />
      <h1 className="font-display text-6xl font-bold text-gray-900 mb-3">
        404
      </h1>
      <p className="text-gray-500 mb-8">Page not found.</p>
      <Link to="/" className="btn-primary">
        <Home size={16} /> Back to home
      </Link>
    </div>
  );
}
