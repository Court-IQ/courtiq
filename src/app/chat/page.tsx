"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Link from "next/link";

type Message = { role: "user" | "model"; content: string };

const STARTERS = [
  "How do I improve my catch-and-shoot range?",
  "What's a good off-day workout?",
  "How do I get coaches to notice me in AAU?",
  "I'm a 6'1 combo guard — what should I focus on this summer?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Add a placeholder model message we'll stream into
    setMessages((prev) => [...prev, { role: "model", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "Request failed");
        setMessages((prev) => {
          const out = [...prev];
          out[out.length - 1] = {
            role: "model",
            content: `Sorry — ${errText}`,
          };
          return out;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const out = [...prev];
          out[out.length - 1] = { role: "model", content: acc };
          return out;
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setMessages((prev) => {
        const out = [...prev];
        out[out.length - 1] = { role: "model", content: `Sorry — ${msg}` };
        return out;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white"
      style={{
        background:
          "linear-gradient(180deg, #0B1428 0%, #152544 60%, #0B1428 100%)",
      }}
    >
      {/* header */}
      <header className="border-b border-slate-800/60 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="font-bold text-lg">CourtIQ</span>
        </Link>
        <span className="text-xs text-slate-400">AI Coach</span>
      </header>

      {/* messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full"
      >
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              Ask your coach anything.
            </h1>
            <p className="text-slate-400 mb-10">
              Drills, game IQ, recruiting, off-season planning. Real talk.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl p-3 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-5 flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-orange-500 text-slate-900 font-medium rounded-br-sm"
                  : "bg-slate-800/80 text-slate-100 rounded-bl-sm"
              }`}
            >
              {m.content || (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
                  <span
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* input bar */}
      <form
        onSubmit={onSubmit}
        className="border-t border-slate-800/60 px-4 py-3 sticky bottom-0 backdrop-blur-sm"
        style={{ background: "rgba(11,20,40,0.85)" }}
      >
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about your game..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 disabled:opacity-60"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
        <p className="text-center text-xs text-slate-500 mt-2 max-w-3xl mx-auto">
          Beta. AI can be wrong — always trust your real coach over me.
        </p>
      </form>
    </div>
  );
}
