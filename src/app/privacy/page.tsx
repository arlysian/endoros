export const metadata = {
  title: "Privacy Policy - Endoros",
  description: "Privacy Policy for Endoros",
};

export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-8">Last updated: January 13, 2026</p>

      <p className="mb-6">
        Endoros Inc. (&quot;Endoros,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website
        endoros.com (the &quot;Service&quot;). This Privacy Policy describes how we collect, use, and share
        information when you use our Service.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
      <p className="mb-3">We collect the following types of information:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Account Information:</strong> When you create an account, we collect your email address,
          first name, last name, and phone number.
        </li>
        <li>
          <strong>Social Media Information:</strong> When you connect your account using Facebook Login, we
          collect information from your linked social media accounts, including your Facebook and Instagram
          profile information, Instagram Business Account data, and related insights and analytics associated
          with your connected accounts.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
      <p className="mb-3">We use the information we collect to:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Provide, maintain, and improve our Service</li>
        <li>Create and manage your account</li>
        <li>Display your social media insights and analytics within the Service</li>
        <li>Respond to your inquiries and provide customer support</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Information Sharing</h2>
      <p className="mb-3">
        We do not sell, rent, or trade your personal information to third parties. We may share your
        information only in the following circumstances:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Service Providers:</strong> We use Meta Platforms, Inc. (Facebook/Instagram) APIs to access
          your social media data that you have authorized us to collect.
        </li>
        <li>
          <strong>Legal Requirements:</strong> We may disclose your information if required by law,
          regulation, or legal process.
        </li>
        <li>
          <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets,
          your information may be transferred.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Facebook and Instagram Data</h2>
      <p className="mb-3">When you connect your Facebook and Instagram accounts, we access:</p>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>Your Facebook Pages and associated Instagram Business or Creator accounts</li>
        <li>Instagram profile information (username, bio, profile picture, follower count)</li>
        <li>Instagram insights and analytics (reach, impressions, engagement metrics)</li>
        <li>Instagram media and content performance data</li>
      </ul>
      <p className="mb-6">
        This data is used solely to provide you with analytics and insights within our Service. We do not
        post to your accounts or share this data with third parties without your consent.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Data Retention</h2>
      <p className="mb-6">
        We retain your personal information for as long as your account is active or as needed to provide you
        with our Service. You may request deletion of your data at any time by contacting us.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Data Security</h2>
      <p className="mb-6">
        We implement appropriate technical and organizational measures to protect your personal information.
        However, no method of transmission over the Internet or electronic storage is completely secure.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Your Rights</h2>
      <p className="mb-3">You have the right to:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your personal information</li>
        <li>Disconnect your social media accounts at any time</li>
        <li>Revoke Facebook permissions through your Facebook settings</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Children&apos;s Privacy</h2>
      <p className="mb-6">
        Our Service is not directed to children under the age of 13. We do not knowingly collect personal
        information from children under 13. If you believe we have collected information from a child under
        13, please contact us immediately.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Third-Party Links</h2>
      <p className="mb-6">
        Our Service may contain links to third-party websites. We are not responsible for the privacy
        practices of these websites.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Changes to This Policy</h2>
      <p className="mb-6">
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
        new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Contact Us</h2>
      <p className="mb-3">If you have any questions about this Privacy Policy, please contact us:</p>
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
