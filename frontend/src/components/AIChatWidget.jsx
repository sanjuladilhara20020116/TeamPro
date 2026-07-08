import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function AIChatWidget({ weekStart }) {
  // Controls open/close state
  const [open, setOpen] = useState(false);

  // Stores typed message
  const [question, setQuestion] = useState("");

  // Stores chat messages
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I am TeamPro AI. Ask me about team progress, blockers, workload, or weekly reports.",
    },
  ]);

  // Loading state while waiting for backend AI response
  const [loading, setLoading] = useState(false);

  // Auto scroll chat to latest message
  const messagesEndRef = useRef(null);

  // Suggested manager questions
  const suggestions = [
    "Summarize this week's team progress.",
    "Who has open blockers?",
    "Which project has the highest workload?",
    "What should the manager focus on next?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Send question to backend AI endpoint
  const sendQuestion = async (customQuestion) => {
    const finalQuestion = customQuestion || question;

    if (!finalQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      setLoading(true);

      // Add manager question to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: finalQuestion,
        },
      ]);

      setQuestion("");

      // Call backend AI route
      const response = await api.post("/ai/chat", {
        question: finalQuestion,
        filters: {
          weekStart,
        },
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: response.data.answer,
            source: response.data.source,
          },
        ]);
      }
    } catch (error) {
      console.log("AI frontend error:", error.response?.data || error.message);

      const backendMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "AI assistant failed";

      toast.error(backendMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: backendMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating open button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 text-white shadow-[0_20px_60px_rgba(168,85,247,0.45)] transition-all duration-300 hover:-translate-y-1 hover:scale-105"
        >
          <span className="absolute inset-0 rounded-[1.4rem] bg-white/20 opacity-0 transition group-hover:opacity-100"></span>
          <MessageCircle size={29} className="relative z-10" />
        </button>
      )}

      {/* Chat widget panel */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[calc(100vh-2rem)] max-h-[720px] w-[430px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] border border-white/50 bg-white/90 shadow-[0_30px_100px_rgba(15,23,42,0.28)] backdrop-blur-2xl md:bottom-6 md:right-6">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-fuchsia-800 to-orange-500 px-5 py-5 text-white">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-300/35 blur-3xl"></div>
            <div className="absolute -bottom-24 left-8 h-52 w-52 rounded-full bg-fuchsia-400/35 blur-3xl"></div>
            <div className="absolute left-1/2 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Realistic chatbot header icon */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/25 bg-white/15 shadow-2xl backdrop-blur-xl">
                  <div className="absolute inset-1 rounded-[1rem] bg-gradient-to-br from-white/25 to-white/5"></div>

                  <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-lg">
                    <Bot size={23} />
                  </div>

                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-xl border border-white/30 bg-orange-400 text-white shadow-md">
                    <Sparkles size={12} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    TeamPro AI
                  </h3>

                  <p className="mt-1 text-xs text-orange-50">
                    Smart manager report assistant
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/10 p-2.5 text-white transition hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs text-orange-50">
                <Sparkles size={14} />
                <span>
                  Ask about reports, blockers, workload, progress, and team
                  focus.
                </span>
              </div>
            </div>
          </div>

          {/* Chat messages */}
          <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
            <div className="pointer-events-none absolute -left-20 top-20 h-44 w-44 rounded-full bg-violet-100 blur-3xl"></div>
            <div className="pointer-events-none absolute -right-24 bottom-20 h-52 w-52 rounded-full bg-orange-100 blur-3xl"></div>

            <div className="relative h-full space-y-5 overflow-y-auto px-4 py-5">
              {messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={index}
                    className={`flex items-end gap-2 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-orange-400 text-white shadow-md">
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] rounded-[1.4rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                        isUser
                          ? "rounded-br-md bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-violet-200"
                          : "rounded-bl-md border border-slate-200/80 bg-white/95 text-slate-700 shadow-slate-200/70"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>

                    {isUser && (
                      <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                        <UserRound size={16} />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-end gap-2">
                  <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-orange-400 text-white shadow-md">
                    <Bot size={16} />
                  </div>

                  <div className="rounded-[1.4rem] rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Loader2
                        className="animate-spin text-violet-600"
                        size={17}
                      />
                      <span>Analyzing reports...</span>
                    </div>

                    <div className="mt-2 flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-fuchsia-400 [animation-delay:120ms]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:240ms]"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef}></div>
            </div>
          </div>

          {/* Suggestions and input */}
          <div className="border-t border-slate-200/80 bg-white/95 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Sparkles size={14} className="text-violet-500" />
                Suggested questions
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                Weekly reports
              </span>
            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => sendQuestion(item)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-inner transition focus-within:border-violet-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendQuestion();
                  }
                }}
                placeholder="Ask about team reports..."
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />

              <button
                onClick={() => sendQuestion()}
                disabled={loading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              AI answers are generated from selected weekly report data.
            </p>
          </div>
        </div>
      )}
    </>
  );
}