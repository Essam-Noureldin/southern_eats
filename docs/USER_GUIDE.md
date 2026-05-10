# USER_GUIDE.md — For the site owner

> Plain-English guide for whoever runs Sam's Southern Eatery day-to-day, not for developers. If you can use email and a web browser, this guide is for you.

## What you need to know in 60 seconds

- The site lives at your domain (e.g. `samssoutherneatery.com`).
- Anyone can view it. No login required for visitors.
- Customers can browse the menu, find a location, read your story, and send you a message.
- Their messages arrive in your inbox at the email address you gave us.
- The site updates itself when we push new code. You don't need to do anything.

## Homepage — what each section does

```
┌─────────────────────────────────────────┐
│ NAVBAR (sticky)                          │  ← always visible at the top
├─────────────────────────────────────────┤
│                                          │
│   HERO                                   │  ← big shrimp photo + Order CTA
│   "Jumbo Shrimp, real fast..."           │
│                                          │
├─────────────────────────────────────────┤
│   DISH CAROUSEL                          │  ← swipeable signature dishes
│   [Card] [Card] [Card] →                 │
├─────────────────────────────────────────┤
│   NUMBERS BAND                           │  ← "51 locations. 9 states."
│                                          │
├─────────────────────────────────────────┤
│   STORY TEASE                            │  ← Tracy & Mo's founding story
│                                          │
├─────────────────────────────────────────┤
│   REVIEWS                                │  ← three real testimonials
│                                          │
├─────────────────────────────────────────┤
│   FRANCHISE TEASE                        │  ← red CTA for franchisees
│                                          │
├─────────────────────────────────────────┤
│ FOOTER                                   │  ← contact + legal links
└─────────────────────────────────────────┘
   [ ORDER ONLINE ]  ← only on mobile, fixed bottom
```

## How customers find the site

Most visits will come from:

1. **Google search** for "fried shrimp near me" / "Sam's Southern Eatery" / "Sam's near [city]" — this is why we invested in SEO (sitemap, structured headings, fast load).
2. **Direct typing** of your domain by people who already know you.
3. **Social media** — your Instagram/Facebook posts that link to the site.
4. **Franchise inquiries** — people who saw a Sam's location and Googled it.

## SEO — what's happening behind the scenes

The site is set up for search engines. Realistic timeline:

```
Week 0:   Site goes live
Week 1-2: Google's crawler discovers the site (we tell it via the sitemap)
Week 3-4: Site appears for branded searches ("Sam's Southern Eatery")
Month 2-3: Site starts ranking for non-branded searches near your locations
Month 6+: Established ranking, organic traffic plateaus
```

What helps SEO:

- Real, attributed customer reviews on the Reviews section (we'll replace the placeholders)
- Fresh content — when we add new menu items, blog posts, or location pages
- Consistent NAP (Name / Address / Phone) across the site, Google Business, Yelp, Facebook
- Backlinks from food blogs, local press, franchise directories

What hurts SEO:

- Duplicate content (don't paste the same description on every page)
- Slow page load (we monitor this)
- Broken links (we test this in CI)

## How to update content

Right now, content lives in the code. Reaching out to a developer is the right move for any change. Long-term, if you want a content management system (CMS) so you can edit text yourself, that's a separate engagement — talk to us.

## What the contact form looks like to you

When someone fills in the form on `/contact`:

- An email arrives at your `CONTACT_FORM_TO_EMAIL` address.
- Subject line: `[Sam's Southern] Contact form: <visitor name>`.
- The "From" address is your verified Resend sender; the "Reply-To" is the visitor's email — so hitting Reply in your mail client goes back to them.
- Body is plain text — no HTML to format.

Spam filtering is built in:

- A bot can submit at most 3 messages per 10 minutes from the same internet address.
- Hidden fields trap naive bots silently.
- The form is invisible to most spam-bot scrapers.

If the inbox dries up entirely, see `docs/ERRORS.md` → "The contact form doesn't send".

## What the cookie banner does

On a visitor's first visit, they see a small banner at the bottom of the page asking about cookies. Two buttons:

- **Accept**: Google Analytics starts tracking their session (no personal data — just "someone viewed this page from this region").
- **Decline**: GA never loads. We respect their choice.

After they click either, the banner disappears forever for that browser. They can revoke their choice via the link in the footer.

This is a legal requirement (UK + EU + California — and good practice everywhere).

## FAQ

**Q: Can I change the photos?**
A: Yes — talk to us. We'll swap them in and ship a new build. Aim for high-resolution JPGs, ≤1 MB each before processing.

**Q: Can I add a new location?**
A: Yes. Send us the address + hours + whatever photos you have. We'll add it to the locations page.

**Q: Why does Google show old info for my restaurant?**
A: That's Google Business Profile, not your website. Claim/edit at [business.google.com](https://business.google.com).

**Q: A customer says the form didn't send their message.**
A: Check `docs/ERRORS.md` → "The contact form doesn't send". Most often: their email was blocked by your mail provider's spam filter — search the spam folder.

**Q: Can people order online?**
A: The "Order Online" CTA currently links to `/order`, which is reserved for the franchise's order partner (DoorDash, etc.). Once the partner is wired up, the link goes there.

**Q: Why does my site sometimes show different layouts?**
A: It's responsive — phones see a stacked layout, desktops see a wider one. Same content, different presentation.

**Q: Is it safe?**
A: Yes — we've layered security headers, HTTPS, content security policy, rate-limited the form, and added bot traps. Full details in `docs/SECURITY.md`.

**Q: Who do I contact if something breaks?**
A: Email Essam at `esam.nourledin@gmail.com`. Sentry alerts us to broken pages automatically, but a customer report is always welcome.

## What happens next

| Phase | What we do |
|---|---|
| Right now | You're seeing the speculative build. Tell us what you want changed before launch. |
| Pre-launch | Solicitor reviews legal pages → real menu photography swap-in → real customer reviews |
| Launch | We point your domain at the new site, flip the SEO settings, submit to Google |
| Month 1 | We watch Sentry for errors and Lighthouse for performance regressions |
| Ongoing | Monthly check-in on metrics; quarterly content refresh |
