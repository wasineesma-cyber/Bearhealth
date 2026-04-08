"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { clsx } from "clsx";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "วันนี้ฉันควรออกกำลังกายหนักแค่ไหน?",
  "ทำไม Recovery ถึงต่ำ?",
  "การนอนเมื่อคืนเป็นยังไงบ้าง?",
  "HRV ของฉันดีมั้ย?",
  "ควรนอนกี่โมงวันนี้?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [hasKey, setHasKey] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      // Welcome message
      setMessages([
        {
          role: "assistant",
          content:
            "สวัสดีค่ะ! ฉันคือ BearHealth AI Coach 🐻\n\nฉันวิเคราะห์ข้อมูลสุขภาพของคุณได้แบบเรียลไทม์ ถามฉันได้เลยเกี่ยวกับ Recovery, การนอน, การออกกำลังกาย หรือสุขภาพโดยรวมค่ะ",
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send(text?: string) {
    const question = text ?? input.trim();
    if (!question || streaming) return;

    setInput("");
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(newMessages);
    setStreaming(true);

    // Add empty assistant message for streaming
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.filter((m) => m.role !== "assistant" || m.content),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error?.includes("ANTHROPIC_API_KEY")) setHasKey(false);
        throw new Error(err.error ?? "Chat failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const { text } = JSON.parse(data);
            assistantText += text;
            setMessages([
              ...newMessages,
              { role: "assistant", content: assistantText },
            ]);
          } catch {}
        }
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `❌ เกิดข้อผิดพลาด: ${err.message}`,
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          open
            ? "bg-bear-muted rotate-0"
            : "bg-gradient-to-br from-bear-recovery to-emerald-400 hover:scale-110"
        )}
        aria-label="AI Coach"
      >
        {open ? (
          <X size={22} className="text-bear-text" />
        ) : (
          <>
            <Sparkles size={22} className="text-black" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-bear-recovery opacity-30 animate-ping" />
          </>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={clsx(
          "fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] flex flex-col rounded-2xl border border-bear-border bg-bear-card shadow-2xl transition-all duration-300 origin-bottom-right",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-bear-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bear-recovery to-emerald-400 flex items-center justify-center">
            <Bot size={16} className="text-black" />
          </div>
          <div>
            <p className="font-semibold text-sm">BearHealth AI Coach</p>
            <p className="text-xs text-bear-subtle flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-bear-recovery inline-block" />
              {streaming ? "กำลังวิเคราะห์..." : "พร้อมช่วยเหลือ"}
            </p>
          </div>
          {!hasKey && (
            <span className="ml-auto text-xs text-bear-warning bg-yellow-900/30 px-2 py-0.5 rounded-full">
              ไม่มี API Key
            </span>
          )}
        </div>

        {/* No API key warning */}
        {!hasKey && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-yellow-900/20 border border-yellow-700/30 text-xs text-bear-warning leading-relaxed">
            กรุณาเพิ่ม <code className="font-mono bg-black/20 px-1 rounded">ANTHROPIC_API_KEY</code> ใน{" "}
            <code className="font-mono bg-black/20 px-1 rounded">.env.local</code> แล้ว restart server ค่ะ
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((m, i) => (
            <div
              key={i}
              className={clsx(
                "flex gap-2.5",
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div
                className={clsx(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  m.role === "user"
                    ? "bg-bear-sleep"
                    : "bg-gradient-to-br from-bear-recovery to-emerald-400"
                )}
              >
                {m.role === "user" ? (
                  <User size={13} className="text-white" />
                ) : (
                  <Bot size={13} className="text-black" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={clsx(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-bear-sleep text-white rounded-tr-sm"
                    : "bg-bear-muted/50 text-bear-text rounded-tl-sm"
                )}
              >
                {m.content || (
                  <span className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-bear-subtle animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-bear-subtle animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-bear-subtle animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions (show only when no messages or just welcome) */}
        {messages.length <= 1 && !streaming && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-bear-border text-bear-subtle hover:text-bear-text hover:border-bear-muted transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-bear-border flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="ถามเรื่องสุขภาพ..."
            disabled={streaming}
            className="flex-1 bg-bear-muted/40 rounded-xl px-3.5 py-2 text-sm placeholder:text-bear-subtle outline-none border border-transparent focus:border-bear-border disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || streaming}
            className="w-9 h-9 rounded-xl bg-bear-recovery flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-emerald-400 transition-colors"
          >
            {streaming ? (
              <Loader2 size={16} className="text-black animate-spin" />
            ) : (
              <Send size={16} className="text-black" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
