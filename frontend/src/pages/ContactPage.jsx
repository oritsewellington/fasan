import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill in all fields.');
    toast.success('Message sent! We will get back to you shortly.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="page-container py-16 animate-fade-in">
      <div className="text-center mb-12">
        <p className="section-label mb-2">Get in touch</p>
        <h1 className="font-display text-3xl font-bold text-gray-900">Contact Us</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        <div className="space-y-5">
          {[
            { icon: Mail, label: 'Email', value: 'admin@fasaawards.site', href: 'mailto:admin@fasaawards.site' },
            { icon: Phone, label: 'Phone', value: '08187178218', href: 'tel:08187178218' },
            { icon: MapPin, label: 'Address', value: 'Faculty of Arts, University of Benin, Edo State', href: null },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-gold-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-gold-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                {href ? <a href={href} className="text-sm font-semibold text-gray-900 hover:text-gold-600">{value}</a> : <p className="text-sm font-semibold text-gray-900">{value}</p>}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} className="input-field resize-none" placeholder="How can we help?" />
          </div>
          <button type="submit" className="btn-primary w-full"><Send size={15} /> Send message</button>
        </form>
      </div>
    </div>
  );
}
