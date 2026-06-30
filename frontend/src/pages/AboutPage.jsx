import { Link } from 'react-router-dom';
import { Crown, Trophy, Users, Shield, Award, ArrowRight } from 'lucide-react';
import { AWARD_CATEGORIES } from '../utils/categories.js';

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      <section className="bg-hero-pattern py-20">
        <div className="page-container text-center">
          <Crown size={40} className="text-gold-400 mx-auto mb-5" />
          <h1 className="font-display text-4xl font-bold text-white mb-4">About FASA Awards 2026</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Organized by the Faculty of Arts Student Association, University of Benin â€” celebrating excellence, leadership, talent, and creativity across the faculty.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="page-container grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="section-label mb-3">Our mission</p>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">Recognizing greatness, one vote at a time</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The FASA Awards is an annual celebration honoring the brightest, most influential, and most talented students of the Faculty of Arts. With 26 distinct award categories spanning leadership, sports, fashion, creativity, business, and academics, every student has a chance to be recognized.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Voting is transparent, secure, and powered by Paystack â€” Nigeria's leading payment platform â€” ensuring every vote counts and every transaction is protected.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Trophy, label: '26', sub: 'Award categories' },
              { icon: Users,  label: '5000+', sub: 'Students reached' },
              { icon: Shield, label: '100%', sub: 'Secure payments' },
              { icon: Award,  label: '2026', sub: 'Awards edition' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={sub} className="card p-6 text-center">
                <Icon size={24} className="text-gold-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 font-display">{label}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="page-container">
          <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-10">All 26 categories at a glance</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AWARD_CATEGORIES.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-gray-100">
                <span className="w-7 h-7 rounded-lg bg-gold-50 text-gold-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{cat.id}</span>
                <span className="text-sm text-gray-700">{cat.name}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/events" className="btn-primary px-10">Start Voting <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
