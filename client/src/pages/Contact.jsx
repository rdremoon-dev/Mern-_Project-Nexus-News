import { useState } from 'react';
import MailLineIcon from 'remixicon-react/MailLineIcon';
import PhoneFillIcon from 'remixicon-react/PhoneFillIcon';
import MapPinLineIcon from 'remixicon-react/MapPinLineIcon';

const CONTACT_EMAIL = 'contact@nexusnews.com';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    const subject = encodeURIComponent(`Website inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${formData.email.trim()}\n\n${formData.message.trim()}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatusMessage(
      `Your email app should open with your message addressed to ${CONTACT_EMAIL}. Send the draft there to complete your inquiry.`,
    );
  };

  return (
    <main className="bg-white text-[#1E1E1E]">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        {/* Top Two-Column Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Contact Info */}
          <div className="lg:col-span-5">
            <h1 className="text-3xl sm:text-4xl font-medium text-[#3d3d3d]tracking-tight font-lexend">
              Contact us
            </h1>
            <p className="text-xs sm:text-base text-[#555555] leading-relaxed mt-3.5 max-w-md">
              We value your feedback, inquiries, and contributions. Send us a
              message using the form or email our team directly.
            </p>

            <div className="mt-9 border-b border-gray-950 py-6">
              <div className="flex items-center gap-3">
                <MailLineIcon size={24} className="text-[#D04A33] shrink-0" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-xl max-sm:text-base font-bold text-[#3d3d3d] hover:text-[#D04A33] transition-colors font-lexend"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
              <p className="text-base text-[#3d3d3d] mt-2">
                For general questions and feedback.
              </p>
            </div>
            <div className="mt-9 border-b border-gray-950 py-6">
              <div className="flex items-center gap-3">
                <PhoneFillIcon
                  size={24}
                  className="text-[#D04A33] shrink-0"
                  aria-hidden="true"
                />
                <p className="font-lexend text-xl font-bold">(123) 456-7890</p>
              </div>
              <p className="text-base text-[#3d3d3d] mt-2">
                For general questions and feedback.
              </p>
            </div>
            <div className="mt-9 border-b border-gray-950 py-6">
              <div className="flex items-center gap-3">
                <MapPinLineIcon
                  size={24}
                  className="text-[#D04A33] shrink-0"
                  aria-hidden="true"
                />
                <p className="font-lexend text-xl font-bold">Address</p>
              </div>
              <p className="text-base text-[#3d3d3d] mt-2">
                1234 Elm Street, Springfield, IL 62701, USA
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 pt-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-slate-400 rounded-sm px-3.5 py-3.5 text-base text-[#3d3d3d]placeholder-gray-400 outline-none focus:border-[#D04A33] transition-colors bg-[#FBFAF6]"
                />
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="Last Name *"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-slate-400 rounded-sm px-3.5 py-3.5 text-base text-[#3d3d3d]placeholder-gray-400 outline-none focus:border-[#D04A33] transition-colors bg-[#FBFAF6]"
                />
              </div>

              <input
                type="email"
                name="email"
                required
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-slate-400 rounded-sm px-3.5 py-3.5 text-base text-[#3d3d3d]placeholder-gray-400 outline-none focus:border-[#D04A33] transition-colors bg-[#FBFAF6] mt-4"
              />

              <textarea
                name="message"
                required
                rows={7}
                placeholder="Message *"
                value={formData.message}
                onChange={handleChange}
                className="w-full border border-slate-400 rounded-sm px-3.5 py-2.5 text-base text-[#3d3d3d]placeholder-gray-400 outline-none focus:border-[#D04A33] transition-colors resize-y bg-[#FBFAF6] mt-4"
              />

              <div className="pt-1">
                <button
                  type="submit"
                  className="bg-[#D04A33] hover:bg-[#b83d28] text-white text-xs sm:text-base font-semibold px-6 py-3 rounded-sm transition-colors cursor-pointer"
                >
                  Submit
                </button>
              </div>

              {statusMessage && (
                <p
                  role="status"
                  className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-400 px-4 py-3 rounded-sm"
                >
                  {statusMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Terracotta Team & Partnerships Banner */}
        <div className="mt-16 sm:mt-20 bg-[#D04A33] text-white py-12 sm:py-16 px-6 sm:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-0 md:divide-x md:divide-white/30 text-center">
            <div className="md:px-8 flex flex-col items-center justify-center">
              <h2 className="text-lg sm:text-xl font-bold">Editorial Team</h2>
              <p className="text-xs sm:text-base text-white/90 leading-relaxed max-w-xs mt-2.5">
                For editorial inquiries, corrections, or content submissions,
                contact our editorial team
              </p>
              <a
                href="mailto:editorial@nexusnews.com"
                className="text-lg sm:text-xl font-bold underline underline-offset-4 mt-5 hover:text-white/85 transition-colors"
              >
                editorial@nexusnews.com
              </a>
            </div>

            <div className="md:px-8 flex flex-col items-center justify-center">
              <h2 className="text-lg sm:text-xl font-bold">
                Advertising &amp; Partnerships
              </h2>
              <p className="text-xs sm:text-base text-white/90 leading-relaxed max-w-xs mt-2.5">
                Interested in advertising with us or exploring partnership
                opportunities?
              </p>
              <a
                href="mailto:ads@nexusnews.com"
                className="text-lg sm:text-xl font-bold underline underline-offset-4 mt-5 hover:text-white/85 transition-colors"
              >
                ads@nexusnews.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
