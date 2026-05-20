import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plane, CalendarDays, Compass, Users2, UserRoundCheck, ClipboardList, ArrowRight } from 'lucide-react';

const Services = () => {
  const serviceList = [
    {
      icon: <Building2 size={32} className="text-primary-600 dark:text-primary-400" />,
      title: 'Corporate Employee Transportation',
      desc: 'Seamless daily commute systems for your staff. We provide routing planning, GPS trackers, female employee safety checks, and absolute timing compliance.',
      features: ['Automated Route Optimization', 'Real-time GPS Tracking', 'Safety Compliance Audit']
    },
    {
      icon: <CalendarDays size={32} className="text-primary-600 dark:text-primary-400" />,
      title: 'Monthly Contract Vehicles',
      desc: 'Dedicated commercial vehicles for corporate sites, government departments, and hotels. Includes backup driver options and full vehicle maintenance oversight.',
      features: ['Fixed Monthly Rates', 'Commercially Compliant RC/Ins', 'Dedicated Account Managers']
    },
    {
      icon: <Plane size={32} className="text-primary-600 dark:text-primary-400" />,
      title: 'Airport Pickup & Drop',
      desc: 'Reliable airport transit for executives and delegates. We monitor flight arrivals in real-time to avoid waiting fees and ensure professional driver greetings.',
      features: ['Flight Arrival Monitoring', 'Terminal Meet-and-Greet', 'Luggage Assistance']
    },
    {
      icon: <Compass size={32} className="text-primary-600 dark:text-primary-400" />,
      title: 'Outstation Trips & Tours',
      desc: 'Interstate commercial vehicle rental for business travels or casual group touring. Clean cars, experienced highway drivers, and clear pricing agreements.',
      features: ['Experienced Highway Drivers', 'Flexible Multi-day Rates', 'State Border Permit Assistance']
    },
    {
      icon: <Users2 size={32} className="text-primary-600 dark:text-primary-400" />,
      title: 'Casual Family Trips',
      desc: 'Hire sedans, SUVs, or luxury coach vans for family picnics, weddings, and weekend getaways. Ensure family safety with experienced drivers.',
      features: ['Clean and Sanitized Interiors', 'Driver Allowances Included', 'Customisable Stopovers']
    },
    {
      icon: <UserRoundCheck size={32} className="text-primary-600 dark:text-primary-400" />,
      title: 'Driver-on-Demand Service',
      desc: 'Hire reliable, highly trained commercial and private drivers on a daily or shift-basis. Perfect for corporate fleet relief or personal luxury car drives.',
      features: ['Screened and Trained Drivers', 'Daily or Weekly Shift Rates', 'Commercial License Hold']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      
      {/* Intro Header */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <span className="text-xs uppercase tracking-widest text-primary-600 dark:text-primary-400 font-extrabold bg-primary-50 dark:bg-primary-950/20 px-3.5 py-1.5 rounded-full">
          What We Do
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Our Professional Services
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 font-light leading-relaxed">
          From corporate logistics to casual road tours, MAA Travels offers robust vehicle hiring services backed by modern technology, verified drivers, and flexible contracts.
        </p>
      </section>

      {/* Services Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviceList.map((svc, idx) => (
          <div key={idx} className="glass-card p-8 rounded-3xl flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300 hover:shadow-2xl">
            <div className="space-y-6">
              <div className="p-4 bg-primary-50 dark:bg-primary-950/20 rounded-2xl w-fit">
                {svc.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{svc.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{svc.desc}</p>
              
              {/* Features bullets */}
              <ul className="space-y-2 pt-2">
                {svc.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-8">
              <Link
                to={`/contact?service=${encodeURIComponent(svc.title)}`}
                className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline inline-flex items-center space-x-1"
              >
                <span>Request Quote</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Callout Quote */}
      <section className="bg-slate-100 dark:bg-slate-850/40 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-200/50 dark:border-slate-800/20">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 text-sm font-semibold">
            <ClipboardList size={18} />
            <span>Custom Corporate Tenders</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Need a custom contract or staff transport solution?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Let our transport analysts design route structures and vehicle pricing custom-tailored for your organization. Contact our commercial billing department.
          </p>
        </div>
        <Link to="/contact" className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold shadow-md btn-premium shrink-0">
          Get Custom Quote
        </Link>
      </section>

    </div>
  );
};

export default Services;
