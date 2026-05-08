import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms governing the use of Sam's Southern Eatery's website.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      lastUpdatedISO="2026-05-08"
    >
      <p>
        These Terms govern your use of the Sam&apos;s Southern Eatery website.
        By accessing or using the site, you agree to these Terms.
      </p>

      <h2>Use of the site</h2>
      <p>
        You agree to use this site only for lawful purposes and in a way that
        does not infringe the rights of, restrict, or inhibit anyone else&apos;s
        use of the site.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on this site — including text, photography, logos, and
        recipes — is owned by or licensed to Sam&apos;s Southern Eatery and is
        protected by applicable copyright and trademark law.
      </p>

      <h2>Disclaimers and liability</h2>
      <p>
        The information on this site is provided as-is. We do not warrant that
        the site will be uninterrupted, error-free, or free of harmful
        components. To the fullest extent permitted by law, we exclude
        liability for any loss or damage arising from your use of the site.
      </p>

      <h2>Third-party links</h2>
      <p>
        The site may contain links to third-party websites. We are not
        responsible for the content or practices of those sites.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Louisiana,
        United States. Any disputes shall be subject to the exclusive
        jurisdiction of the courts of Louisiana.
      </p>
    </LegalPageLayout>
  );
}
