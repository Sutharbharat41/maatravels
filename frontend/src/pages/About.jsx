import React from 'react';
import { Target, Compass, Sparkles, Shield, UserCheck, PhoneCall } from 'lucide-react';

const About = () => {
  const values = [
    { icon: <Shield size={24} className="text-primary-600 dark:text-primary-400" />, title: 'Safety Assurance', desc: 'Every trip is monitored. Speed limits, GPS tracking, and safety protocols are strictly enforced for peace of mind.' },
    { icon: <UserCheck size={24} className="text-primary-600 dark:text-primary-400" />, title: 'Professional Drivers', desc: 'Our drivers undergo rigorous background checks, commercial license screening, and soft-skills training.' },
    { icon: <PhoneCall size={24} className="text-primary-600 dark:text-primary-400" />, title: '24/7 Support Desk', desc: 'Our operations center is staffed round the clock to assist you with scheduling edits, breakdowns, or flight arrivals.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

      {/* Intro Header */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <span className="text-xs uppercase tracking-widest text-primary-600 dark:text-primary-400 font-extrabold bg-primary-50 dark:bg-primary-950/20 px-3.5 py-1.5 rounded-full">
          Who We Are
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          About MAA TRAVELS
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 font-light leading-relaxed">
          MAA Travels is a premier vehicle hiring and employee transportation agency. We establish standards in fleet management, logistics transparency, and passenger comfort.
        </p>
      </section>

      {/* Mission & Vision cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-10 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-bl-full"></div>
          <div className="p-3 bg-primary-50 dark:bg-primary-950/25 text-primary-600 dark:text-primary-400 rounded-2xl w-fit">
            <Target size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Our Mission</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            To provide safe, reliable, comfortable, and cost-effective vehicle hiring services to our corporate and personal travel clients. We focus on integrating technology with logistics to build long-term relationships through absolute punctuality and professionalism.
          </p>
        </div>

        <div className="glass-card p-10 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-bl-full"></div>
          <div className="p-3 bg-primary-50 dark:bg-primary-950/25 text-primary-600 dark:text-primary-400 rounded-2xl w-fit">
            <Compass size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Our Vision</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            To become the most trusted name in corporate employee transportation and vehicle rental services across the region, recognized for our modern fleet, commercial compliance, well-trained drivers, and responsive customer care.
          </p>
        </div>
      </section>

      {/* Service Quality Commitment */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-bold">
            <Sparkles size={20} />
            <span>Service Excellence</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Our Commitment to Quality</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            At MAA Travels, we understand that client comfort and employee safety represent critical business pillars. That is why we implement strict quality assurance parameters for every single vehicle and trip.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 shrink-0"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cleanliness:</strong> Every vehicle undergoes sanitization and cleaning before dispatch.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 shrink-0"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Compliance:</strong> All vehicles hold commercial licenses, insurance, speed governors, and tax registrations.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 shrink-0"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Tracking:</strong> 24/7 operations room with real-time GPS tracking coordinates for employee safety.
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5">
          <img
            src="/Quality.png"
            alt="Safety Assured Fleet"
            className="rounded-3xl shadow-xl w-full object-cover h-[350px]"
          />
        </div>
      </section>

      {/* Values Grid */}
      <section className="space-y-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-800 dark:text-white">Our Pillars of Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((val, idx) => (
            <div key={idx} className="glass-card p-8 rounded-3xl flex flex-col space-y-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="p-3 bg-primary-50 dark:bg-primary-950/20 rounded-2xl w-fit">
                {val.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{val.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default About;
