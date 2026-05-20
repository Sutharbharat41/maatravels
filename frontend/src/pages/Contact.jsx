import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { inquiryAPI } from '../services/api';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = () => {
  const query = new URLSearchParams(useLocation().search);
  const messageQuery = query.get('message') || '';
  const serviceQuery = query.get('service') || '';

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    message: '',
    error: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let initialMessage = '';
    if (messageQuery) {
      initialMessage = messageQuery;
    } else if (serviceQuery) {
      initialMessage = `Hello, I would like to get a quote and more information regarding your service: "${serviceQuery}".`;
    }
    
    if (initialMessage) {
      setFormData(prev => ({ ...prev, message: initialMessage }));
    }
  }, [messageQuery, serviceQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ success: false, message: '', error: '' });

    if (!formData.name || !formData.phone || !formData.email || !formData.message) {
      setSubmitStatus({ success: false, message: '', error: 'Please fill in all required fields.' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await inquiryAPI.submit(formData);
      setSubmitStatus({
        success: true,
        message: response.message || 'Inquiry submitted successfully! We will contact you soon.',
        error: ''
      });
      // Clear form
      setFormData({
        name: '',
        company_name: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
      setSubmitStatus({
        success: false,
        message: '',
        error: err.response?.data?.error || 'Failed to submit inquiry. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">Contact Us</h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-light">
          Get in touch with MAA Travels. Whether you need corporate transit planning, contract vehicle rates, or a causal trip quote.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Info Details (Col 5) */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Our Head Office</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              We look forward to serving your transportation needs. Stop by our main administrative hub or contact our booking line.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="block font-bold text-slate-800 dark:text-white text-sm">Address</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                    123 Travel Enclave, Corporate Sector V, Salt Lake, Kolkata, West Bengal - 700091
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="block font-bold text-slate-800 dark:text-white text-sm">Phone Line</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">+91 9876543210</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="block font-bold text-slate-800 dark:text-white text-sm">Email Inquiries</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">info@maatravels.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="w-full h-64 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <iframe
              title="MAA Travels HQ Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.0673418579566!2d88.42940251500293!3d22.576579285181773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0275ade5d34ff7%3A0xa19f9f9ad72023cb!2sSector%20V%2C%20Salt%20Lake%20City%2C%20Kolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1653048900000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>

        </div>

        {/* Contact Form (Col 7) */}
        <div className="lg:col-span-7">
          <div className="glass-card p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <HelpCircle className="text-primary-500" />
              <span>Send a Message</span>
            </h2>

            {/* Notification alert */}
            {submitStatus.success && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 border border-emerald-200/40">
                <CheckCircle size={16} />
                <span>{submitStatus.message}</span>
              </div>
            )}
            {submitStatus.error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2 border border-rose-200/40">
                <AlertCircle size={16} />
                <span>{submitStatus.error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Company name if any"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Mobile number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Your Message *</label>
                <textarea
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Detail your request..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md btn-premium flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Send Inquiry</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Contact;
