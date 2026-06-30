import { Link } from 'react-router-dom';
import { Crown, Mail, Phone, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                <Crown size={16} className="text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-white text-lg">FASA Awards</span>
                <span className="text-gold-400 text-xs ml-2">2026</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs text-gray-500">
              Faculty of Arts Student Association, University of Benin. 26 award categories celebrating excellence, talent, and leadership.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: Instagram, href: 'https://instagram.com/fasa_uniben' },
                { icon: Twitter,   href: 'https://twitter.com/fassa_uniben' },
                { icon: Facebook,  href: 'https://facebook.com/fasa_uniben' },
              ].map(({ icon: Icon, href }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gold-600 flex items-center justify-center transition-colors group">
                  <Icon size={15} className="text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Quick links</h4>
            <ul className="space-y-2.5">
              {[['/', 'Home'], ['/events', 'All events'], ['/about', 'About FASA'], ['/contact', 'Contact'], ['/login', 'Admin login']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-sm text-gray-500 hover:text-gold-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-500">
                <Mail size={14} className="mt-0.5 text-gold-500 flex-shrink-0" />
                <a href="mailto:admin@fasaawards.site" className="hover:text-gold-400 transition-colors">admin@fasaawards.site</a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-500">
                <Phone size={14} className="mt-0.5 text-gold-500 flex-shrink-0" />
                <a href="tel:08187178218" className="hover:text-gold-400 transition-colors">08187178218</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>Â© {new Date().getFullYear()} FASA Awards. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
