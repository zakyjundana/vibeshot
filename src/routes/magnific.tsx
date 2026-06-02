import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/magnific")({
  component: MagnificContactForm,
});

function MagnificContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    countryCode: "US",
    phone: "",
    company: "",
    topic: "Tech Integration",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Message sent successfully!");
    setSubmitted(true);
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      countryCode: "US",
      phone: "",
      company: "",
      topic: "Tech Integration",
      message: "",
    });
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#111114] text-zinc-200 font-sans flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-xl bg-[#19191c] border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-zinc-700/85">
        {/* Subtle decorative top border gradient */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Back Link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to VibeShot
        </a>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Contact Magnific</h2>
              <p className="text-xs text-zinc-400">
                Please fill out the form below to get in touch with our team.
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold text-zinc-300 block">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Clara Rockmore"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#242427] border border-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-550 transition-all duration-200"
                required
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-zinc-300 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#242427] border border-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-550 transition-all duration-200"
                required
              />
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-xs font-semibold text-zinc-300 block">
                Phone (optional)
              </label>
              <div className="flex gap-2">
                <select
                  value={form.countryCode}
                  onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  className="bg-[#242427] border border-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 text-sm text-zinc-300 transition-all duration-200 cursor-pointer min-w-[110px]"
                >
                  <option value="US">US (+1)</option>
                  <option value="ID">ID (+62)</option>
                  <option value="GB">GB (+44)</option>
                  <option value="SG">SG (+65)</option>
                  <option value="AU">AU (+61)</option>
                </select>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="flex-1 bg-[#242427] border border-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-550 transition-all duration-200"
                />
              </div>
            </div>

            {/* Company Input */}
            <div className="space-y-2">
              <label htmlFor="company" className="text-xs font-semibold text-zinc-300 block">
                Company
              </label>
              <input
                id="company"
                type="text"
                placeholder="Magnific Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full bg-[#242427] border border-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-550 transition-all duration-200"
              />
            </div>

            {/* Help / Topic Dropdown */}
            <div className="space-y-2">
              <label htmlFor="topic" className="text-xs font-semibold text-zinc-300 block">
                How Can We Help You?
              </label>
              <select
                id="topic"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full bg-[#242427] border border-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 text-sm text-white transition-all duration-200 cursor-pointer"
              >
                <option value="Tech Integration">Tech Integration</option>
                <option value="Enterprise License">Enterprise License</option>
                <option value="Partnership / Collaborations">Partnership / Collaborations</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            {/* Message Area */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-semibold text-zinc-300 block">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="Tell us what you need. Please, be as detailed as you can."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-[#242427] border border-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-550 transition-all duration-200 resize-none"
                required
              />
            </div>

            {/* Privacy Disclaimer */}
            <p className="text-[10px] text-zinc-500 leading-relaxed pt-2">
              Magnific Company will process your data for the purpose of maintaining a professional
              contact, for the management of pre-contractual measures, and, where appropriate, the
              conclusion of an agreement with you, based on our legitimate interest. Your data will
              not be communicated to third parties and will be transferred outside the EU under the
              terms of the privacy policy. You can find out how to exercise your rights and more
              information in the{" "}
              <a href="#" className="text-blue-500 hover:underline transition-all">
                Privacy Policy
              </a>
              .
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-sm rounded-lg py-3.5 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-lg shadow-blue-600/10"
            >
              Send us your message
            </button>
          </form>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-16 h-16 text-blue-500 animate-bounce" />
            <h3 className="text-xl font-bold text-white">Message Sent!</h3>
            <p className="text-sm text-zinc-400 max-w-sm">
              Thanks, <span className="text-blue-400 font-semibold">{form.name}</span>. Your message
              regarding <span className="font-semibold text-zinc-300">{form.topic}</span> has been
              simulated successfully!
            </p>
            <button
              onClick={resetForm}
              className="mt-4 px-6 py-2 bg-[#242427] border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 rounded-lg transition-all"
            >
              Send Another Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
