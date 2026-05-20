import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Clock, Users, ChevronRight, Star, HeartHandshake } from 'lucide-react';

const Home = () => {
  const whyChooseUs = [
    { icon: <ShieldCheck size={28} className="text-primary-500" />, title: 'Safety Assured', desc: 'GPS-tracked modern fleet with professional, background-verified drivers.' },
    { icon: <Award size={28} className="text-primary-500" />, title: 'Premium Service', desc: 'Punctual corporate pickups, sanitized cabs, and well-behaved drivers.' },
    { icon: <Clock size={28} className="text-primary-500" />, title: '24/7 Availability', desc: 'Round-the-clock dispatcher support for urgent calls or flight connections.' },
    { icon: <Users size={28} className="text-primary-500" />, title: 'Flexible Contracts', desc: 'Custom monthly hiring agreements for corporate shuttle and employee transport.' },
  ];

  const categories = [
    { title: 'Executive Sedans', desc: 'Ideal for airport runs and corporate executives. Premium comfort.', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600' },
    { title: 'Spacious SUVs', desc: 'Comfortable outstation road trips and client transport. High road presence.', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600' },
    { title: 'Tempo Travellers', desc: 'Perfect for casual family events and corporate group tours.', image: 'https://images.unsplash.com/photo-1600706432502-75a0e286b92b?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1920"
            alt="Corporate Transport Hero"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left">
          <div className="max-w-3xl space-y-6 md:space-y-8 animate-slide-up">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
              Reliable Vehicle Hiring & Logistics
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
              MAA TRAVELS
            </h1>
            <p className="text-xl sm:text-2xl font-light text-slate-300">
              “Professional Vehicle Hiring Services for Corporate & Personal Travel”
            </p>
            <p className="text-base text-slate-400 max-w-xl">
              We specialize in employee transportation, premium corporate rentals, airport logistics, monthly contracts, and outstation trips with commercial compliance and safety assurance.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/fleet"
                className="px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all btn-premium flex items-center space-x-2"
              >
                <span>Book Vehicle</span>
                <ChevronRight size={18} />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-white font-bold transition-all hover:border-slate-500"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block p-2 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-lg">
              <HeartHandshake size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
              Pioneering Logistics for Travel Needs
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              MAA TRAVELS has been a leading vehicle hiring agency, building long-standing contracts with corporate clients, business executives, and private individuals. We pride ourselves on punctuality, safety, and a highly versatile fleet.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Whether you need automated daily logistics for staff transport or an SUV for a casual outstation tour, we manage booking scheduling, vehicle compliance, and professional driver allocations seamlessly.
            </p>
            <div className="pt-2">
              <Link to="/about" className="text-primary-600 dark:text-primary-400 font-bold hover:underline inline-flex items-center space-x-1">
                <span>Read More About Our Mission</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary-400/10 rounded-3xl blur-3xl -z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800"
              alt="Hired Fleet"
              className="rounded-3xl shadow-2xl w-full object-cover h-[400px]"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-100 dark:bg-slate-850/40 py-20 border-y border-slate-200/50 dark:border-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
              Why Corporate Partners Choose Us
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We engineer employee transport and custom vehicle hiring solutions with compliance, comfort, and dispatch efficiency.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform">
                <div className="p-4 bg-primary-50 dark:bg-primary-950/20 rounded-full">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
            Our Vehicle Categories
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            A comprehensive fleet of well-maintained vehicles suitable for any occasion and road condition.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="glass-card rounded-3xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{cat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Clients Logos placeholder */}
      <section className="bg-slate-100 dark:bg-slate-850/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Trusted by Top Corporate Employers</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-65">
            <span className="text-lg font-bold text-slate-400">TECH LABS CORP</span>
            <span className="text-lg font-bold text-slate-400">GLOBAL IND. GROUP</span>
            <span className="text-lg font-bold text-slate-400">FINANCE PARTNERS</span>
            <span className="text-lg font-bold text-slate-400">KOLKATA BPO INFO</span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
            Client Testimonials
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <div className="flex text-amber-500 space-x-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="italic text-slate-600 dark:text-slate-300">
              "MAA Travels has managed our corporate employee shuttle for over two years. Their punctuality is top-notch, and their driver compliance reports are always complete and timely. Highly recommended for any business logistics."
            </p>
            <div>
              <h5 className="font-bold text-slate-800 dark:text-white text-sm">Rohan Sengupta</h5>
              <span className="text-xs text-slate-500">Facilities Manager, Tech Labs Corp</span>
            </div>
          </div>
          
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <div className="flex text-amber-500 space-x-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="italic text-slate-600 dark:text-slate-300">
              "We hired a luxury SUV for an outstation casual family tour. The vehicle was immaculately clean, and the driver was extremely polite and navigated the mountain roads with absolute skill. The rates were very transparent."
            </p>
            <div>
              <h5 className="font-bold text-slate-800 dark:text-white text-sm">Priya Sharma</h5>
              <span className="text-xs text-slate-500">Casual Rental Customer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-700 p-10 md:p-16 text-center text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
          <h2 className="text-3xl md:text-5xl font-extrabold relative z-10">Ready to Book with MAA Travels?</h2>
          <p className="text-lg md:text-xl font-light text-primary-100 max-w-2xl mx-auto relative z-10">
            Reach out for long-term contract pricing, corporate quotations, or instant booking details. Our support desk operates 24/7.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4 relative z-10">
            <Link to="/fleet" className="px-8 py-4 rounded-xl bg-white text-primary-700 font-bold hover:bg-slate-100 transition-colors shadow-lg">
              Explore Fleet
            </Link>
            <Link to="/contact" className="px-8 py-4 rounded-xl border border-primary-400 bg-primary-700/30 font-bold hover:bg-primary-700/50 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
