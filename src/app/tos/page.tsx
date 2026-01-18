export const metadata = {
  title: "Terms of Service - Endoros",
  description: "Terms of Service for Endoros",
};

export default function TermsOfService() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-gray-500 text-sm mb-8">Last updated: January 18, 2026</p>

      <p className="mb-6">
        Welcome to Endoros. By accessing or using our website at endoros.com (the &quot;Service&quot;),
        you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read them carefully.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
      <p className="mb-6">
        By creating an account or using our Service, you agree to these Terms and our Privacy Policy.
        If you do not agree, do not use the Service.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Description of Service</h2>
      <p className="mb-6">
        Endoros provides a platform for creators to build media kits, track social media metrics,
        and share their profiles with brands for collaboration opportunities. We integrate with
        third-party platforms including Instagram, TikTok, and YouTube to display your analytics.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Account Registration</h2>
      <p className="mb-3">To use certain features, you must create an account. You agree to:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Provide accurate and complete information</li>
        <li>Maintain the security of your account credentials</li>
        <li>Notify us immediately of any unauthorized access</li>
        <li>Be responsible for all activities under your account</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. User Conduct</h2>
      <p className="mb-3">You agree not to:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe on the rights of others</li>
        <li>Submit false or misleading information</li>
        <li>Attempt to gain unauthorized access to our systems</li>
        <li>Use the Service for any illegal or harmful purpose</li>
        <li>Interfere with or disrupt the Service</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Third-Party Integrations</h2>
      <p className="mb-6">
        Our Service integrates with third-party platforms (Instagram, Facebook, TikTok, YouTube).
        Your use of these integrations is subject to the respective platforms&apos; terms of service.
        We are not responsible for the availability or accuracy of data from third-party platforms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Intellectual Property</h2>
      <p className="mb-6">
        The Service and its content, features, and functionality are owned by Endoros Inc. and are
        protected by copyright, trademark, and other intellectual property laws. You may not copy,
        modify, or distribute any part of the Service without our prior written consent.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. User Content</h2>
      <p className="mb-6">
        You retain ownership of content you submit to the Service. By submitting content, you grant
        us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your
        content in connection with providing the Service.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Disclaimer of Warranties</h2>
      <p className="mb-6">
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
        EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
        SECURE, OR ERROR-FREE.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Limitation of Liability</h2>
      <p className="mb-6">
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, ENDOROS SHALL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Termination</h2>
      <p className="mb-6">
        We may suspend or terminate your account at any time for any reason, including violation of
        these Terms. You may delete your account at any time through your account settings.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Changes to Terms</h2>
      <p className="mb-6">
        We may modify these Terms at any time. We will notify you of material changes by posting
        the updated Terms on this page. Your continued use of the Service after changes constitutes
        acceptance of the new Terms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">12. Governing Law</h2>
      <p className="mb-6">
        These Terms shall be governed by the laws of the State of New York, without regard to
        conflict of law principles.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">13. Contact Us</h2>
      <p className="mb-3">If you have any questions about these Terms, please contact us:</p>
      <p className="mb-6">
        Endoros Inc.
        <br />
        2248 Broadway
        <br />
        New York, NY 10024
        <br />
        United States
        <br />
        <br />
        Email:{" "}
        <a href="mailto:general@endoros.com" className="text-blue-600 hover:underline">
          general@endoros.com
        </a>
      </p>
    </main>
  );
}
