import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | MetaLens AI',
  description:
    'MetaLens AI privacy policy — data collection, cookies, Google AdSense, GDPR/CCPA compliance, and your rights.',
  keywords:
    'MetaLens AI privacy, privacy policy, data collection, GDPR, CCPA, Google AdSense cookies',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-2"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        Privacy Policy
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">Last Updated: April 6, 2026</p>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] space-y-8">
        <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
          This Privacy Policy describes how SPINAI (&quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;) collects, uses, and protects your personal information when you use
          MetaLens AI (accessible at https://metalens-ai.vercel.app). We are committed to
          protecting your privacy and ensuring transparency about our data practices. By using
          MetaLens AI, you consent to the data practices described in this policy.
        </p>

        <PolicySection title="1. Information We Collect">
          <p>We collect the following categories of information:</p>
          <p className="mt-2">
            <strong>Account Information:</strong> When you create an account through our
            authentication provider (Clerk), we collect your email address, display name, and
            profile information that you provide. This information is necessary to manage your
            account, track your subscription tier, and provide personalized features such as
            saved analysis history.
          </p>
          <p className="mt-2">
            <strong>Usage Data:</strong> We automatically collect certain technical information
            when you use MetaLens AI, including your IP address, browser type and version,
            operating system, referring URL, pages visited, time spent on pages, and the dates
            and times of your visits. This data helps us understand how our service is used and
            identify areas for improvement.
          </p>
          <p className="mt-2">
            <strong>Search Queries:</strong> When you perform a meta-analysis search, your query
            is transmitted to our servers and forwarded to the PubMed API and Google Gemini AI
            for processing. Search queries may be temporarily logged for the purpose of
            debugging, performance monitoring, and service improvement. We do not sell or share
            your search queries with third parties for marketing purposes.
          </p>
        </PolicySection>

        <PolicySection title="2. Cookies and Tracking Technologies">
          <p>
            MetaLens AI uses cookies and similar tracking technologies to enhance your experience
            and support our operations. The types of cookies we use include:
          </p>
          <p className="mt-2">
            <strong>Essential Cookies:</strong> Required for basic site functionality, including
            authentication session management and language preferences. These cookies cannot be
            disabled without affecting the core functionality of the service.
          </p>
          <p className="mt-2">
            <strong>Analytics Cookies (Google Analytics):</strong> We use Google Analytics to
            collect anonymized usage statistics such as page views, session duration, and traffic
            sources. Google Analytics may set cookies on your browser (e.g., _ga, _gid) to
            distinguish unique users and track session information. You can opt out of Google
            Analytics by installing the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
          <p className="mt-2">
            <strong>Advertising Cookies (Google AdSense):</strong> MetaLens AI displays
            advertisements through Google AdSense to support the free tier of our service. Google
            AdSense may use cookies (including the DoubleClick DART cookie) to serve ads based on
            your prior visits to MetaLens AI and other websites on the internet. You can opt out
            of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline"
            >
              Google Ads Settings
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection title="3. Third-Party Services">
          <p>
            MetaLens AI integrates with the following third-party services, each of which has its
            own privacy policy governing data handling:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              <strong>Clerk (Authentication):</strong> We use Clerk for user authentication and
              account management. Clerk processes your email address, password (hashed), and
              session tokens. For more information, see{' '}
              <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                Clerk&apos;s Privacy Policy
              </a>.
            </li>
            <li>
              <strong>PubMed / NCBI E-Utilities API:</strong> Your search queries are sent to the
              National Library of Medicine&apos;s PubMed API to retrieve biomedical abstracts. The
              NLM may log API requests. See the{' '}
              <a href="https://www.nlm.nih.gov/web_policies.html" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                NLM Privacy Policy
              </a>.
            </li>
            <li>
              <strong>Google Gemini AI:</strong> Retrieved abstracts are processed by Google&apos;s
              Gemini AI model to generate meta-analysis summaries. Data sent to the Gemini API is
              subject to{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                Google&apos;s Privacy Policy
              </a>.
            </li>
            <li>
              <strong>Google Analytics:</strong> Used for anonymized usage statistics. See{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                Google&apos;s Privacy Policy
              </a>.
            </li>
            <li>
              <strong>Google AdSense:</strong> Used to serve advertisements on the free tier. See{' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                Google&apos;s Advertising Privacy Policy
              </a>.
            </li>
            <li>
              <strong>Vercel (Hosting):</strong> MetaLens AI is hosted on Vercel. Vercel may
              process request metadata (IP addresses, headers) as part of its hosting
              infrastructure. See{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                Vercel&apos;s Privacy Policy
              </a>.
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="4. How We Use Your Information">
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>To provide, maintain, and improve MetaLens AI&apos;s features and functionality</li>
            <li>To authenticate your identity and manage your account and subscription</li>
            <li>To process your meta-analysis queries and deliver results</li>
            <li>To analyze usage patterns and optimize site performance</li>
            <li>To display relevant advertisements through Google AdSense</li>
            <li>To communicate important service updates and respond to support inquiries</li>
            <li>To detect and prevent fraud, abuse, and security threats</li>
            <li>To comply with legal obligations and enforce our Terms of Service</li>
          </ul>
        </PolicySection>

        <PolicySection title="5. Data Retention">
          <p>
            We retain your account information for as long as your account is active. If you
            delete your account, we will remove your personal information within 30 days, except
            where we are required by law to retain certain records. Anonymized usage data and
            analytics information may be retained indefinitely for statistical analysis purposes.
            Server logs containing IP addresses and request metadata are automatically purged
            after 90 days.
          </p>
        </PolicySection>

        <PolicySection title="6. Data Security">
          <p>
            We implement industry-standard security measures to protect your personal information,
            including encryption in transit (TLS/HTTPS), secure authentication through Clerk,
            and access controls on our server infrastructure. However, no method of electronic
            transmission or storage is 100% secure, and we cannot guarantee absolute security. If
            you discover a security vulnerability, please report it to us immediately at
            taeshinkim11@gmail.com.
          </p>
        </PolicySection>

        <PolicySection title="7. Your Rights Under GDPR (European Economic Area)">
          <p>
            If you are located in the European Economic Area (EEA), you have the following rights
            under the General Data Protection Regulation (GDPR):
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Right of Access:</strong> You may request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> You may request that we correct inaccurate personal data.</li>
            <li><strong>Right to Erasure:</strong> You may request that we delete your personal data.</li>
            <li><strong>Right to Restriction:</strong> You may request that we restrict the processing of your data.</li>
            <li><strong>Right to Data Portability:</strong> You may request a machine-readable copy of your data.</li>
            <li><strong>Right to Object:</strong> You may object to the processing of your personal data for certain purposes, including direct marketing.</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, please contact us at taeshinkim11@gmail.com. We will
            respond to your request within 30 days.
          </p>
        </PolicySection>

        <PolicySection title="8. Your Rights Under CCPA (California)">
          <p>
            If you are a California resident, you have the right to know what personal information
            we collect, request deletion of your personal information, and opt out of the sale of
            your personal information. We do not sell personal information as defined by the
            California Consumer Privacy Act (CCPA). To exercise your rights, contact us at
            taeshinkim11@gmail.com.
          </p>
        </PolicySection>

        <PolicySection title="9. Children's Privacy">
          <p>
            MetaLens AI is not directed at children under the age of 13 (or 16 in the EEA). We do
            not knowingly collect personal information from children. If we become aware that we
            have inadvertently collected personal data from a child, we will take steps to delete
            that information promptly. If you believe a child has provided us with personal
            information, please contact us at taeshinkim11@gmail.com.
          </p>
        </PolicySection>

        <PolicySection title="10. International Data Transfers">
          <p>
            MetaLens AI is hosted on Vercel&apos;s global infrastructure, and your data may be
            processed in the United States or other countries where our service providers operate.
            By using MetaLens AI, you consent to the transfer of your information to these
            countries. We ensure that appropriate safeguards are in place for international data
            transfers in compliance with applicable data protection laws.
          </p>
        </PolicySection>

        <PolicySection title="11. Changes to This Privacy Policy">
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our
            practices, technology, legal requirements, or other factors. When we make material
            changes, we will update the &quot;Last Updated&quot; date at the top of this page and,
            where appropriate, notify you via email or a prominent notice on our website. We
            encourage you to review this Privacy Policy periodically.
          </p>
        </PolicySection>

        <PolicySection title="12. Do Not Track Signals">
          <p>
            Some web browsers transmit &quot;Do Not Track&quot; (DNT) signals. Because there is
            no uniform standard for interpreting DNT signals, MetaLens AI does not currently
            respond to DNT signals. However, you can manage your cookie preferences and opt out
            of personalized advertising using the methods described in Section 2 of this policy.
          </p>
        </PolicySection>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <p className="text-[var(--color-text-secondary)]">
            If you have any questions or concerns about this Privacy Policy, please contact us
            at{' '}
            <a
              href="mailto:taeshinkim11@gmail.com"
              className="text-[var(--color-primary)] hover:underline"
            >
              taeshinkim11@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2
        className="text-lg font-semibold text-[var(--color-text-primary)] mb-2"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {title}
      </h2>
      <div className="text-[var(--color-text-secondary)] leading-relaxed">
        {children}
      </div>
    </div>
  );
}
