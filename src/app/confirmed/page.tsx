import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Email confirmed — HooprLab",
  description: "Your HooprLab email is confirmed. Open the app to keep going.",
};

export default function ConfirmedPage() {
  return (
    <div
      className="min-h-screen text-white flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, #0B1428 0%, #152544 60%, #0B1428 100%)",
      }}
    >
      <header className="border-b border-slate-800/60 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 max-w-3xl mx-auto">
          <Image
            src="/logo.png"
            alt="HooprLab"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="font-bold text-lg">HooprLab</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-orange-500/15 border border-orange-500/40 flex items-center justify-center">
            <span className="text-orange-400 text-3xl">✓</span>
          </div>
          <p className="text-orange-400 font-bold tracking-widest text-xs mb-3">
            EMAIL CONFIRMED
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            You&apos;re in.
          </h1>
          <p className="text-slate-300 mb-8">
            Your account is verified. Head back to the HooprLab app and sign in
            to start working.
          </p>
          <a
            href="rork-app://"
            className="inline-block w-full py-3 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 transition"
          >
            Open HooprLab →
          </a>
          <p className="text-xs text-slate-500 mt-4">
            If the button doesn&apos;t open the app, just close this tab and
            open HooprLab from your home screen.
          </p>
        </div>
      </main>
    </div>
  );
}
