import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How Sam's Southern Eatery uses cookies and how to manage them.",
};

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdatedISO="2026-05-08">
      <p>
        This Cookie Policy explains how Sam&apos;s Southern Eatery uses cookies
        and similar technologies on this website.
      </p>

      <h2>What are cookies</h2>
      <p>
        Cookies are small text files placed on your device by the websites
        you visit. They help sites remember preferences, analyse traffic, and
        deliver a smoother experience.
      </p>

      <h2>How we use cookies</h2>
      <p>
        We use a small number of cookies on this site:
      </p>
      <ul>
        <li>
          <strong>Strictly necessary</strong> — required for the site to
          function (for example, remembering your cookie-consent choice).
          These do not require your consent.
        </li>
        <li>
          <strong>Analytics</strong> — we use{" "}
          <strong>Google Analytics 4</strong>{" "}
          to understand how visitors use the site so we can improve it. These
          cookies only load after you accept the cookie banner.
        </li>
      </ul>

      <h2>Your choices and managing cookies</h2>
      <p>
        You can accept or decline analytics cookies via the banner shown on
        your first visit. You can change your choice at any time by clearing
        this site&apos;s data in your browser settings — the banner will then
        reappear on your next visit. Most browsers also allow you to block
        cookies entirely; doing so will not stop the site from working.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about our use of cookies, please use the contact details
        on the Contact page of this site.
      </p>
    </LegalPageLayout>
  );
}
