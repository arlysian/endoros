"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const creatorNames = [
  "sarah",
  "alex",
  "jordan",
  "mia",
  "chris",
  "taylor",
  "jamie",
  "casey",
  "morgan",
  "riley",
];

export default function LandingPage() {
  const [currentNameIndex, setCurrentNameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNameIndex((prev) => (prev + 1) % creatorNames.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden">
      {/* Vertical border lines */}
      <div className="fixed top-0 bottom-0 left-[7.5%] w-px bg-neutral-400/20 z-30 hidden lg:block" />
      <div className="fixed top-0 bottom-0 right-[7.5%] w-px bg-neutral-400/20 z-30 hidden lg:block" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            endoros
          </Link>
          <div className="flex items-center gap-4 sm:gap-8">
            <Link
              href="/login"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-300"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 sm:px-5 py-2 sm:py-2.5 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-700 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-900/20 whitespace-nowrap"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="sm:min-h-screen flex items-start lg:items-center pt-24 sm:pt-28 lg:pt-16 pb-12 sm:pb-0 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-xl"
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-8"
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-700 text-sm font-medium">Trusted by creators</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight"
              >
                Create a media kit that brands{" "}
                <span className="text-neutral-400">can't ignore.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-neutral-500 mt-8 max-w-lg leading-relaxed"
              >
                Connect your socials, get a media kit that updates itself. Land the brand deals.
              </motion.p>

              <motion.div variants={fadeUp} className="flex items-center gap-4 mt-10">
                <Link
                  href="/signup"
                  className="group px-8 py-4 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-neutral-900/20 flex items-center gap-2"
                >
                  Claim your link
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="#how"
                  className="text-neutral-500 hover:text-neutral-900 transition-colors duration-300"
                >
                  See how it works
                </Link>
              </motion.div>
            </motion.div>

            {/* Right side - Phone mockups */}
            <div className="relative h-[280px] sm:h-[500px] lg:h-[600px]">
              {/* Phone 1 - Front/Left */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute left-4 sm:left-0 lg:left-4 top-1/2 -translate-y-1/2 z-20"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <img
                    src="/tel1.png"
                    alt="Endoros app analytics view"
                    className="w-[140px] sm:w-[240px] lg:w-[280px] h-auto"
                  />
                </motion.div>
              </motion.div>

              {/* Phone 2 - Back/Right */}
              <motion.div
                initial={{ opacity: 0, x: 30, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute right-4 sm:right-0 lg:right-4 top-1/2 -translate-y-1/2 z-10"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="relative"
                >
                  <img
                    src="/tel 2.png"
                    alt="Endoros app dashboard view"
                    className="w-[140px] sm:w-[240px] lg:w-[280px] h-auto"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal divider */}
      <div className="w-full h-px bg-neutral-400/20" />

      {/* Scrolling names section */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Floating elements - chaotic */}
        <motion.div
          initial={{ opacity: 0, rotate: -8 }}
          whileInView={{ opacity: 1, rotate: -6 }}
          viewport={{ once: true }}
          className="absolute left-[2%] sm:left-[8%] lg:left-[15%] top-[18%] sm:top-[22%] lg:top-[25%]"
        >
          <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-100">847K</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="absolute right-[4%] sm:right-[12%] lg:right-[22%] top-[8%] sm:top-[10%] lg:top-[12%] bg-neutral-900 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full rotate-6"
        >
          +24% this week
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="absolute left-[4%] sm:left-[7.5%] lg:left-[20%] top-[6%] sm:top-[8%] lg:top-[12%] border border-neutral-200 bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg -rotate-3"
        >
          <p className="text-[8px] sm:text-[10px] text-neutral-400 uppercase tracking-wider">avg views</p>
          <p className="text-sm sm:text-lg font-semibold">2.1M</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="absolute right-[2%] sm:right-[8%] lg:right-[15%] top-[32%] sm:top-[35%] lg:top-[38%]"
        >
          <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-100 rotate-3 block">5.2%</span>
          <span className="text-[8px] sm:text-[10px] text-neutral-300 ml-1">engagement</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="absolute left-[2%] sm:left-[8%] lg:left-[18%] bottom-[18%] sm:bottom-[20%] lg:bottom-[22%] flex items-center gap-1.5 sm:gap-2 bg-white border border-neutral-100 shadow-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-full rotate-2"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
          </svg>
          <span className="text-xs sm:text-sm font-medium">TikTok</span>
          <span className="text-[10px] sm:text-xs text-neutral-400">320K</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="absolute right-[4%] sm:right-[7.5%] lg:right-[18%] bottom-[12%] sm:bottom-[15%] lg:bottom-[18%] text-right -rotate-2"
        >
          <p className="text-[10px] sm:text-xs text-neutral-400">monthly reach</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-900">4.8M</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true }}
          className="absolute left-[20%] sm:left-[24%] lg:left-[28%] bottom-[32%] sm:bottom-[35%] lg:bottom-[38%] w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-2 border-dashed border-neutral-200 rounded-full"
        />

        {/* Center - Scrolling names */}
        <div className="flex items-center justify-center relative z-10">
          <span className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-neutral-300 leading-none">
            endoros.com/
          </span>

          {/* Vertical scrolling names - film credits style */}
          <div className="relative h-[220px] sm:h-[260px] overflow-hidden">
            {/* Gradient masks for fade effect */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

            <motion.div
              animate={{ y: ["0%", "-50%"] }}
              transition={{
                y: {
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              className="flex flex-col items-start"
            >
              {[...creatorNames, ...creatorNames].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-[1.5] text-neutral-900"
                >
                  {name}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Horizontal divider */}
      <div className="w-full h-px bg-neutral-400/20" />

      {/* Logos / Social proof - Marquee */}
      <section className="py-8">
        <p className="text-sm text-neutral-400 text-center mb-6">Trusted by creators working with</p>
        <div className="relative">
          {/* Solid masks to hide content outside vertical separators */}
          <div className="absolute left-0 top-0 bottom-0 w-[7.5%] bg-white z-20" />
          <div className="absolute right-0 top-0 bottom-0 w-[7.5%] bg-white z-20" />
          {/* Gradient fades at the separator edges */}
          <div className="absolute left-[7.5%] top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-[7.5%] top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-24 w-fit"
          >
            {[...Array(4)].map((_, setIndex) => (
              <div key={setIndex} className="contents">
                <img src="/Google.svg" alt="Google" className="h-5 w-auto" />
                <img src="/Instagram.svg" alt="Instagram" className="h-5 w-auto" />
                <img src="/YouTube.svg" alt="YouTube" className="h-5 w-auto" />
                <img src="/Tiktok.svg" alt="TikTok" className="h-5 w-auto" />
                <img src="/facebook.svg" alt="Facebook" className="h-5 w-auto" />
                <img src="/Shopify.svg" alt="Shopify" className="h-5 w-auto" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Horizontal divider */}
      <div className="w-full h-px bg-neutral-400/20" />

      {/* How it works */}
      <section id="how" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-semibold tracking-tight">Three steps. That's it.</h2>
            <p className="text-neutral-500 mt-4">No design skills. No spreadsheets. No stress.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Connect",
                desc: "Link your Instagram, TikTok, YouTube. One click each.",
              },
              {
                num: "02",
                title: "Watch",
                desc: "We pull your stats automatically. Updated daily.",
              },
              {
                num: "03",
                title: "Share",
                desc: "Get your link. Send it to brands. Land deals.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <span className="text-5xl font-semibold text-neutral-200 group-hover:text-neutral-900 transition-colors duration-500">
                  {step.num}
                </span>
                <h3 className="text-xl font-semibold mt-4 mb-2">{step.title}</h3>
                <p className="text-neutral-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6 bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-4xl font-semibold tracking-tight">
              Everything you need.
              <br />
              <span className="text-neutral-500">Nothing you don't.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: "Real-time analytics",
                desc: "Followers, engagement, reach—across all platforms. Always current.",
                image: "/realtime.png",
              },
              {
                title: "Audience demographics",
                desc: "Age, location, interests. Know exactly who's watching.",
                image: "/audience.png",
              },
              {
                title: "Beautiful media kit",
                desc: "One link that looks good. Updates itself. Impresses brands.",
                image: "/media_kit.png",
              },
              {
                title: "Growth tracking",
                desc: "See where you came from. See where you're going.",
                image: "/growth_tracking.png",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border-t border-neutral-800 pt-6 flex flex-col"
              >
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-neutral-400 mb-4 min-h-[48px]">{feature.desc}</p>
                {feature.image && (
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-48 sm:h-60 md:h-72 object-cover rounded-xl mt-auto"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-neutral-900 rounded-3xl p-12 sm:p-16 text-center text-white"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            Ready to look professional?
          </h2>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto">
            Free to start. No credit card. Takes about 2 minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex px-8 py-4 bg-white text-neutral-900 rounded-full font-medium hover:bg-neutral-100 transition-colors"
          >
            Create your media kit
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="font-semibold">endoros</span>
          <div className="flex items-center gap-8 text-sm text-neutral-400">
            <Link href="/privacy" className="hover:text-neutral-900 transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-neutral-900 transition-colors">Terms</Link>
            <a href="mailto:hello@endoros.com" className="hover:text-neutral-900 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-neutral-400">© 2025</p>
        </div>
      </footer>
    </div>
  );
}
