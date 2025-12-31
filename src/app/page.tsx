import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center px-4 sm:px-8 py-4 sm:py-6">
        <span className="text-xl sm:text-2xl font-semibold text-[#2d2d2d] tracking-tight">
          Endoros
        </span>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-8 pt-8 sm:pt-0 sm:justify-center">
        <div className="max-w-3xl text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-[#2d2d2d] leading-tight mb-4 sm:mb-6">
            Your influence,
            <br />
            <span className="text-[#6b7280]">beautifully measured.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#6b7280] mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Track your growth, understand your audience, and showcase your impact
            with a media kit that speaks for itself.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3 sm:py-3.5 bg-[#2d2d2d] text-white rounded-full font-medium text-base sm:text-lg hover:bg-[#404040] transition-colors text-center"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3 sm:py-3.5 border border-[#d1d5db] text-[#2d2d2d] rounded-full font-medium text-base sm:text-lg hover:bg-[#f3f4f6] transition-colors text-center"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-24 max-w-4xl w-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#2d2d2d]/5 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 text-[#2d2d2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#2d2d2d] mb-1 sm:mb-2">Analytics</h3>
            <p className="text-[#6b7280] text-sm">
              Deep insights into your audience and engagement patterns.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#2d2d2d]/5 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 text-[#2d2d2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#2d2d2d] mb-1 sm:mb-2">Audience</h3>
            <p className="text-[#6b7280] text-sm">
              Know who follows you and what they care about.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#2d2d2d]/5 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 text-[#2d2d2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#2d2d2d] mb-1 sm:mb-2">Media Kit</h3>
            <p className="text-[#6b7280] text-sm">
              Professional portfolio to share with brands.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-6 text-center">
        <p className="text-sm text-[#9ca3af] mb-2">
          Built for creators who want to grow.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-[#9ca3af]">
          <a href="tel:+17029123736" className="hover:text-[#6b7280] transition-colors">
            +1 (702) 912-3736
          </a>
          <span className="hidden sm:inline">•</span>
          <a href="mailto:james@endoros.com" className="hover:text-[#6b7280] transition-colors">
            james@endoros.com
          </a>
        </div>
      </footer>
    </div>
  );
}
