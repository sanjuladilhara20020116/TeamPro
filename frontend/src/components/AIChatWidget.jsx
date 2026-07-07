import { useState } from "react";
import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
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

  // Suggested manager questions
  const suggestions = [
    "Summarize this week's team progress.",
    "Who has open blockers?",
    "Which project has the highest workload?",
    "What should the manager focus on next?",
  ];

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
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-2xl transition hover:scale-105"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat widget panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[620px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                <Bot size={24} />
              </div>

              <div>
                <h3 className="font-bold">TeamPro AI</h3>
                <p className="text-xs text-indigo-100">
                  Manager report assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>

                  {message.source === "local-summary" && (
                    <p className="mt-2 text-xs text-amber-600">
                      Local summary mode
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  <Loader2 className="animate-spin" size={16} />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Sparkles size={14} />
              Suggested questions
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => sendQuestion(item)}
                  disabled={loading}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-60"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-500">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendQuestion();
                  }
                }}
                placeholder="Ask about team reports..."
                className="flex-1 bg-transparent text-sm outline-none"
              />

              <button
                onClick={() => sendQuestion()}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}