import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center px-8 py-6">
        <span className="text-2xl font-semibold text-[#2d2d2d] tracking-tight">
          Endoros
        </span>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 -mt-16">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl md:text-6xl font-semibold text-[#2d2d2d] leading-tight mb-6">
            Your influence,
            <br />
            <span className="text-[#6b7280]">beautifully measured.</span>
          </h1>
          <p className="text-xl text-[#6b7280] mb-10 max-w-2xl mx-auto leading-relaxed">
            Track your growth, understand your audience, and showcase your impact
            with a media kit that speaks for itself.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-[#2d2d2d] text-white rounded-full font-medium text-lg hover:bg-[#404040] transition-colors"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 border border-[#d1d5db] text-[#2d2d2d] rounded-full font-medium text-lg hover:bg-[#f3f4f6] transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-4xl">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#2d2d2d]/5 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#2d2d2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#2d2d2d] mb-2">Analytics</h3>
            <p className="text-[#6b7280] text-sm">
              Deep insights into your audience and engagement patterns.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#2d2d2d]/5 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#2d2d2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#2d2d2d] mb-2">Audience</h3>
            <p className="text-[#6b7280] text-sm">
              Know who follows you and what they care about.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#2d2d2d]/5 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#2d2d2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#2d2d2d] mb-2">Media Kit</h3>
            <p className="text-[#6b7280] text-sm">
              Professional portfolio to share with brands.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 text-center">
        <p className="text-sm text-[#9ca3af]">
          Built for creators who want to grow.
        </p>
      </footer>
    </div>
  );
}
