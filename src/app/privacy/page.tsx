import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — HooprLab",
  description: "How HooprLab handles your data.",
};

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(180deg, #0B1428 0%, #152544 60%, #0B1428 100%)",
      }}
    >
      <header className="border-b border-slate-800/60 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 max-w-3xl mx-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="font-bold text-lg">HooprLab</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 leading-relaxed">
        <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-slate-400 mb-10">Last updated: May 29, 2026</p>

        <Section title="The short version">
          <p>
            HooprLab is built to help you get better at basketball. We collect
            as little as possible. Your chat history, practice plans, and
            game logs live on your device — not on our servers. Your
            questions to the AI coach are sent to Google&apos;s Gemini API
            so it can respond. We don&apos;t sell your data. We don&apos;t
            track you across the web.
          </p>
        </Section>

        <Section title="What we collect, and where it lives">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>On your device only:</strong> your chat history with the
              AI coach, your generated practice plans, your logged games and
              stats. This data stays in your phone&apos;s local storage. We
              don&apos;t see it. You can clear it anytime by removing the app
              or clearing your browser data.
            </li>
            <li>
              <strong>Sent to Google for AI responses:</strong> when you ask
              the coach a question or generate a practice plan, your question
              (and recent chat context) is sent to Google&apos;s Gemini API
              so it can generate a response. Google processes this data under
              their own terms. See{" "}
              <a
                href="https://ai.google.dev/terms"
                className="text-orange-400 underline"
                target="_blank"
                rel="noopener"
              >
                Google AI&apos;s terms
              </a>
              .
            </li>
            <li>
              <strong>Email address (only if you join the waitlist):</strong>{" "}
              if you enter your email on our website, it&apos;s stored by{" "}
              <a
                href="https://formspree.io/legal/privacy-policy"
                className="text-orange-400 underline"
                target="_blank"
                rel="noopener"
              >
                Formspree
              </a>{" "}
              so we can email you when the product is ready. We don&apos;t add
              you to any other lists. You can email us anytime to be removed.
            </li>
            <li>
              <strong>Basic crash and usage data:</strong> our app is hosted
              on Apple TestFlight (during beta) and Vercel (for the website).
              Both collect basic crash reports and request logs to keep the
              service running. See{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                className="text-orange-400 underline"
                target="_blank"
                rel="noopener"
              >
                Vercel
              </a>{" "}
              and{" "}
              <a
                href="https://www.apple.com/legal/privacy/en-ww/"
                className="text-orange-400 underline"
                target="_blank"
                rel="noopener"
              >
                Apple
              </a>
              .
            </li>
          </ul>
        </Section>

        <Section title="What we DON'T do">
          <ul className="list-disc pl-6 space-y-2">
            <li>We don&apos;t sell your data. Not to anyone. Ever.</li>
            <li>We don&apos;t run ads in the app.</li>
            <li>
              We don&apos;t use third-party analytics services like Google
              Analytics or Facebook Pixel.
            </li>
            <li>
              We don&apos;t require an account or login (for v1). Everything
              is anonymous.
            </li>
            <li>
              We don&apos;t collect location, contacts, photos, or any other
              device data we don&apos;t need.
            </li>
          </ul>
        </Section>

        <Section title="Players under 13">
          <p>
            HooprLab is built for high school, AAU, and college basketball
            players (generally ages 14-22). The app is not directed at
            children under 13, and we don&apos;t knowingly collect data from
            them. If you&apos;re a parent and your child under 13 has used
            the app, email us and we&apos;ll delete anything we have.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Because almost all your data lives on your device, you control it:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>
              <strong>Delete everything:</strong> delete the app on your phone,
              or clear your browser&apos;s storage for the website. That
              removes your chat history, plans, and game logs.
            </li>
            <li>
              <strong>Get a copy:</strong> email us — since the data is on
              your device, you already have it, but we&apos;ll help you
              extract anything related to your waitlist email.
            </li>
            <li>
              <strong>Be removed from waitlist:</strong> email us asking and
              we&apos;ll remove your email from Formspree within 7 days.
            </li>
          </ul>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we change something material, we&apos;ll update the &ldquo;last
            updated&rdquo; date at the top and, if you&apos;re on the waitlist,
            send you an email.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Built by Matthew Angelo. Questions, concerns, or data deletion
            requests: <strong>businessforangelo@gmail.com</strong>.
          </p>
        </Section>

        <p className="text-slate-500 text-sm mt-16">
          This policy is written in plain English on purpose. If you&apos;re
          a lawyer reading this on behalf of someone considering HooprLab,
          we&apos;re happy to answer specific questions — just email.
        </p>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link
            href="/"
            className="text-orange-400 hover:underline"
          >
            ← Back to HooprLab
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-3 text-orange-400">{title}</h2>
      <div className="text-slate-200">{children}</div>
    </section>
  );
}
