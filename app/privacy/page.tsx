import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Sam's Southern Eatery collects, uses, and protects personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdatedISO="2026-05-08">
      <p>
        This Privacy Policy explains how Sam&apos;s Southern Eatery
        (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, and
        protects personal information you provide through this website.
      </p>

      <h2>Information we collect</h2>
      <p>
        When you submit our contact form we collect your name, email address,
        and the contents of your message. When you accept analytics cookies we
        also collect anonymised usage data via Google Analytics 4
        (page views, device type, approximate location).
      </p>

      <h2>How we use your information</h2>
      <p>
        We use the information you provide to respond to your enquiry, to
        improve our service, and to monitor site performance. We do not sell
        or rent your personal information to third parties.
      </p>

      <h2>How long we keep your information</h2>
      <p>
        Contact form submissions are retained for up to 24 months for the
        purpose of responding to enquiries and corresponding records.
        Analytics data is retained per Google Analytics&apos;{" "}
        default settings (currently 14 months).
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to access, correct, or request deletion of your
        personal information. You may also withdraw consent for analytics
        cookies at any time via the cookie banner on this site. To exercise
        any of these rights, contact us using the details below.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy-related requests, email us at the address listed on the
        Contact page of this site. We will respond within 30 days.
      </p>
    </LegalPageLayout>
  );
}
