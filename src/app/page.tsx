import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-base font-semibold text-black tracking-tight">
            endoros
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-neutral-500 hover:text-black transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-semibold text-black leading-[1.1] tracking-tight">
            Your influence,
            <br />
            <span className="text-neutral-400">beautifully measured.</span>
          </h1>
          <p className="text-lg text-neutral-500 mt-6 max-w-xl mx-auto leading-relaxed">
            Track growth across platforms, understand your audience,
            and share a media kit that gets you deals.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/signup"
              className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 text-neutral-500 hover:text-black transition-colors font-medium"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-neutral-100">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-4xl font-semibold text-black">10K+</p>
            <p className="text-sm text-neutral-400 mt-1">Creators</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-semibold text-black">50M+</p>
            <p className="text-sm text-neutral-400 mt-1">Followers tracked</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-semibold text-black">2K+</p>
            <p className="text-sm text-neutral-400 mt-1">Brand deals closed</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-black">Everything you need</h2>
            <p className="text-neutral-500 mt-3">One dashboard. All your platforms. Zero spreadsheets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div>
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Real-time Analytics</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Track followers, engagement, and reach across Instagram, TikTok, YouTube, and more. Updated daily.
              </p>
            </div>

            {/* Feature 2 */}
            <div>
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Audience Insights</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Demographics, locations, and interests. Know exactly who your audience is and what they want.
              </p>
            </div>

            {/* Feature 3 */}
            <div>
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Shareable Media Kit</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                One link. All your stats. Send brands a professional profile that updates automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-black">How it works</h2>
            <p className="text-neutral-500 mt-3">Get set up in under 2 minutes</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-medium text-black">Connect your accounts</h3>
                <p className="text-neutral-500 mt-1">Link Instagram, TikTok, YouTube, and other platforms with one click.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-medium text-black">Watch your data sync</h3>
                <p className="text-neutral-500 mt-1">We pull your metrics automatically. Followers, engagement, demographics—all in one place.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-medium text-black">Share your media kit</h3>
                <p className="text-neutral-500 mt-1">Get a custom link to share with brands. Your stats stay fresh without lifting a finger.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-black mb-4">Ready to grow?</h2>
          <p className="text-neutral-500 mb-8">Join thousands of creators tracking their influence.</p>
          <Link
            href="/signup"
            className="inline-flex px-8 py-3.5 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium text-black">endoros</span>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-black transition-colors">Terms</Link>
            <a href="mailto:hello@endoros.com" className="hover:text-black transition-colors">Contact</a>
          </div>
          <p className="text-sm text-neutral-400">© 2025 Endoros</p>
        </div>
      </footer>
    </div>
  );
}
