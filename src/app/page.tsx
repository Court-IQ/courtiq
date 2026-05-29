import Image from "next/image";
import Link from "next/link";

const FORMSPREE = "https://formspree.io/f/mojbnyjj";

function WaitlistForm({ id }: { id: string }) {
  return (
    <form
      id={id}
      action={FORMSPREE}
      method="POST"
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-lg font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 transition"
      >
        Get on the list
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(180deg, #0B1428 0%, #152544 60%, #0B1428 100%)",
      }}
    >
      {/* nav */}
      <nav className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="font-bold text-xl">CourtIQ</span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/chat"
            className="text-sm text-slate-300 hover:text-orange-400 transition hidden sm:inline"
          >
            Ask the coach
          </Link>
          <Link
            href="/plan"
            className="text-sm text-slate-300 hover:text-orange-400 transition"
          >
            Build a plan
          </Link>
          <Link
            href="/log"
            className="text-sm text-slate-300 hover:text-orange-400 transition"
          >
            Game log
          </Link>
          <a
            href="#waitlist"
            className="text-sm text-slate-300 hover:text-white hidden sm:inline"
          >
            Join waitlist →
          </a>
        </div>
      </nav>

      {/* hero */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-12 text-center">
        <p className="text-orange-400 font-bold tracking-widest text-sm mb-4">
          AI SCOUTING REPORTS FOR HOOPERS
        </p>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          Your scouting report<br />
          after every&nbsp;game.
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          Send us your game film. We send back a shot chart, your tendencies,
          and exactly what to work on before the next game.
        </p>
        <WaitlistForm id="waitlist" />
        <p className="text-xs text-slate-500 mt-3">
          First 50 AAU + HS players get reports free.
        </p>
      </section>

      {/* card preview row */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "01_cover",
            "02_scoreboard",
            "03_shotchart",
            "04_strength",
          ].map((name) => (
            <div
              key={name}
              className="rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
              }}
            >
              <Image
                src={`/cards/${name}.png`}
                alt={name}
                width={1080}
                height={1920}
                className="w-full h-auto"
                priority={name === "01_cover"}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-slate-400 text-sm mt-6 italic">
          Sample cards from a real game.
        </p>
      </section>

      {/* how it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              n: "01",
              h: "Send your film",
              p: "Hudl share link, MP4, or Drive link. Anything we can watch.",
            },
            {
              n: "02",
              h: "We analyze it",
              p: "AI breaks down every possession — shot locations, tendencies, where you struggled.",
            },
            {
              n: "03",
              h: "Get your report",
              p: "Mobile cards + a shareable PDF. In your inbox within 24 hours.",
            },
          ].map((step) => (
            <div key={step.n}>
              <div className="text-orange-400 text-3xl font-extrabold mb-2">
                {step.n}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.h}</h3>
              <p className="text-slate-400">{step.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* who it's for */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          Built for hoopers who want to get better.
        </h2>
        <p className="text-slate-400 text-center mb-12">
          If you play, this is for you.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              tag: "HS & AAU RECRUITS",
              body: "Real data to attach to your recruiting profile — not just highlights.",
            },
            {
              tag: "COLLEGE PLAYERS",
              body: "Know your tendencies before your coach does. Argue your case for minutes.",
            },
            {
              tag: "SKILLS TRAINERS",
              body: "Show your clients real progress, game over game. Built-in homework.",
            },
            {
              tag: "SERIOUS PARENTS",
              body: "See exactly where your player is winning and where they need work.",
            },
          ].map((card) => (
            <div
              key={card.tag}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6"
            >
              <p className="text-orange-400 font-bold text-xs tracking-widest mb-2">
                {card.tag}
              </p>
              <p className="text-lg">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* bottom CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
          Get on the list.
        </h2>
        <p className="text-slate-400 mb-8">
          We&apos;re launching with AAU summer 2026.
          <br />
          First 50 players get free reports.
        </p>
        <WaitlistForm id="waitlist-bottom" />
      </section>

      <footer className="max-w-5xl mx-auto px-6 py-10 text-center text-slate-500 text-sm">
        <p>© 2026 CourtIQ — built by a hooper, for hoopers.</p>
      </footer>
    </div>
  );
}
