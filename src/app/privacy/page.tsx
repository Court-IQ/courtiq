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
        <p className="text-slate-400 mb-10">Last updated: June 4, 2026</p>

        <Section title="The short version">
          <p>
            HooprLab helps you get better at basketball. We collect only what
            we need to run the product: your email, your profile, the films
            you submit, and your conversations with the AI coach. We don&apos;t
            sell data, we don&apos;t run ads, and we don&apos;t track you across
            other apps or sites. You can delete your account from inside the
            app at any time.
          </p>
        </Section>

        <Section title="What we collect">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account info:</strong> email address (for sign-in),
              optional profile fields you fill in — name, jersey number,
              position, level, school/team, height. Stored in our database
              (Supabase). Linked to your account.
            </li>
            <li>
              <strong>Submitted film and notes:</strong> game film you upload or
              link, plus the focus/jersey/notes you submit alongside it. Stored
              in our database and storage (Supabase) so we can deliver your
              scouting report.
            </li>
            <li>
              <strong>AI coach conversations:</strong> messages you send to the
              in-app coach. Your questions (and recent context) are sent to
              Google&apos;s Gemini API so it can respond. Stored locally on
              your device for chat history. See{" "}
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
              <strong>Email address from the waitlist (website only):</strong>{" "}
              if you enter your email on hooprlab.com, it&apos;s stored by{" "}
              <a
                href="https://formspree.io/legal/privacy-policy"
                className="text-orange-400 underline"
                target="_blank"
                rel="noopener"
              >
                Formspree
              </a>{" "}
              so we can email you when the product is ready.
            </li>
            <li>
              <strong>Crash and error data:</strong> when the app crashes or
              errors, we send a stack trace to{" "}
              <a
                href="https://sentry.io/privacy/"
                className="text-orange-400 underline"
                target="_blank"
                rel="noopener"
              >
                Sentry
              </a>{" "}
              so we can fix it. Includes device model, OS version, and the
              code path that failed. Not used for marketing or analytics.
            </li>
            <li>
              <strong>Infrastructure logs:</strong> our hosting providers
              (Apple TestFlight during beta,{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                className="text-orange-400 underline"
                target="_blank"
                rel="noopener"
              >
                Vercel
              </a>{" "}
              for the website,{" "}
              <a
                href="https://supabase.com/privacy"
                className="text-orange-400 underline"
                target="_blank"
                rel="noopener"
              >
                Supabase
              </a>{" "}
              for the backend) keep basic request logs to keep the service
              running.
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
              We don&apos;t track you across other apps or websites for
              advertising.
            </li>
            <li>
              We don&apos;t collect contacts, photos, or location unless you
              explicitly upload film. Permissions are only requested when
              you tap a feature that needs them.
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
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Delete your account:</strong> open the app, go to
              Settings, tap &ldquo;Delete account.&rdquo; This permanently
              removes your account, profile, submitted films, and all related
              data from our servers. There is no undo.
            </li>
            <li>
              <strong>Request a copy of your data:</strong> email us and we&apos;ll
              export everything tied to your account within 30 days.
            </li>
            <li>
              <strong>Be removed from the waitlist:</strong> email us asking
              and we&apos;ll remove your email from Formspree within 7 days.
            </li>
          </ul>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we change something material, we&apos;ll update the &ldquo;last
            updated&rdquo; date at the top and, if you have an account, notify
            you in-app.
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
