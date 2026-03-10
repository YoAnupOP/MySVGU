"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  BookOpen,
  CalendarDays,
  CreditCard,
  MessagesSquare,
  Send,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import StudentShell from "@/components/student-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: string;
}

const starterMessage: ChatMessage = {
  id: "welcome",
  type: "bot",
  content:
    "Hi, I am SVGU AI, your campus buddy inside MySVGU. I can help with attendance planning, fee and exam questions, campus navigation, and quick academic guidance.",
  timestamp: new Date().toISOString(),
};

const quickActions = [
  { icon: CreditCard, label: "Fee help", query: "Explain the fastest way to check my fee status and what to do if something looks wrong." },
  { icon: CalendarDays, label: "Exam plan", query: "Help me plan the next seven days before exams." },
  { icon: BookOpen, label: "Study help", query: "Suggest a focused study plan for my weak subjects." },
  { icon: MessagesSquare, label: "Announcements", query: "Summarize the important campus updates I should care about today." },
];

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatbotPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const seededPromptRef = useRef(false);
  const [promptFromUrl, setPromptFromUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const value = new URLSearchParams(window.location.search).get("prompt");
    setPromptFromUrl(value);
  }, []);

  useEffect(() => {
    if (!seededPromptRef.current && promptFromUrl) {
      setInput(promptFromUrl);
      seededPromptRef.current = true;
    }
  }, [promptFromUrl]);

  const userInitials = (user?.name || "Student")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setInputError("Type something to start the conversation.");
      return;
    }

    if (trimmed.length < 2) {
      setInputError("Use at least 2 characters.");
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setInputError(null);
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationHistory: messages.slice(-6).map((message) => ({
            type: message.type,
            content: message.content,
          })),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to generate a response.");
      }

      setMessages((previous) => [
        ...previous,
        {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: payload.message,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({
        title: "SVGU AI is having trouble",
        description: "The assistant could not answer right now. Please try again in a moment.",
        variant: "destructive",
      });
      setMessages((previous) => [
        ...previous,
        {
          id: `bot-error-${Date.now()}`,
          type: "bot",
          content:
            "I am having trouble responding right now. Please try again in a moment, and for urgent matters use the official department or helpdesk channel.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <StudentShell>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-[520px] w-full" />
        </div>
      </StudentShell>
    );
  }

  return (
    <StudentShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow={
            <>
              <Sparkles className="h-3.5 w-3.5 text-academic-blue" />
              Campus Buddy inside SVGU AI
            </>
          }
          title="A warmer campus copilot, not just a chatbot"
          description="Use SVGU AI for quick guidance, announcement summaries, study nudges, and university help in a calmer, more student-friendly flow."
          status={<StatusPill variant="online">Online</StatusPill>}
        />

        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-6">
            <Card className="border-white/85 bg-gradient-to-br from-slate-950 via-deep-blue to-academic-blue text-white">
              <CardContent className="space-y-4 p-6">
                <StatusPill variant="spotlight" className="border-white/20 bg-white/10 text-white">Campus Buddy</StatusPill>
                <h2 className="font-display text-3xl font-semibold">Student support that feels lighter and faster</h2>
                <p className="text-sm leading-7 text-blue-100">Ask for summaries, planning help, reminders, and general campus guidance without leaving the MySVGU shell.</p>
                <div className="rounded-[1.25rem] border border-white/15 bg-white/10 p-4 text-sm leading-7 text-blue-100">
                  Tip: Use quick actions to start from the most common student flows and then continue naturally.
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <CardTitle className="text-2xl text-slate-950">Quick starts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      setInput(action.query);
                      setInputError(null);
                    }}
                    className="flex w-full items-start gap-3 rounded-[1.2rem] border border-slate-100 bg-slate-50/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-academic-blue shadow-sm">
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{action.label}</p>
                      <p className="mt-1 text-sm leading-7 text-slate-500">{action.query}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/85 bg-white/90">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-academic-blue">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-950">SVGU AI</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">Campus Buddy mode is active for {user?.name || "Student"}</p>
                  </div>
                </div>
                <StatusPill variant="online">Ready</StatusPill>
              </div>
            </CardHeader>
            <CardContent className="flex h-[70vh] min-h-[560px] flex-col p-0">
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-3", message.type === "user" && "justify-end")}
                  >
                    {message.type === "bot" ? (
                      <Avatar className="h-10 w-10 border border-white bg-white shadow-sm">
                        <AvatarFallback className="bg-blue-50 text-academic-blue">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    ) : null}
                    <div className={cn("max-w-[85%] space-y-2", message.type === "user" && "items-end text-right")}
                    >
                      <div
                        className={cn(
                          "rounded-[1.35rem] px-4 py-3 text-sm leading-7 shadow-sm",
                          message.type === "user"
                            ? "rounded-br-md bg-academic-blue text-white"
                            : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700",
                        )}
                      >
                        {message.type === "bot" ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
                              ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
                              li: ({ children }) => <li className="pl-1">{children}</li>,
                              h1: ({ children }) => <h1 className="mb-2 text-base font-bold">{children}</h1>,
                              h2: ({ children }) => <h2 className="mb-2 text-base font-bold">{children}</h2>,
                              h3: ({ children }) => <h3 className="mb-1.5 text-sm font-bold">{children}</h3>,
                              code: ({ children }) => <code className="rounded bg-slate-200/60 px-1 py-0.5 text-xs">{children}</code>,
                              blockquote: ({ children }) => <blockquote className="border-l-2 border-slate-300 pl-3 italic text-slate-500">{children}</blockquote>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          message.content
                        )}
                      </div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{formatTime(message.timestamp)}</p>
                    </div>
                    {message.type === "user" ? (
                      <Avatar className="h-10 w-10 border border-white bg-white shadow-sm">
                        <AvatarFallback className="bg-slate-900 text-white">{userInitials}</AvatarFallback>
                      </Avatar>
                    ) : null}
                  </div>
                ))}

                {sending ? (
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 border border-white bg-white shadow-sm">
                      <AvatarFallback className="bg-blue-50 text-academic-blue">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-[1.35rem] rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-100 p-5 sm:p-6">
                <div className="space-y-3">
                  <Textarea
                    value={input}
                    onChange={(event) => {
                      setInput(event.target.value);
                      if (inputError) {
                        setInputError(null);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        if (!sending) {
                          void sendMessage();
                        }
                      }
                    }}
                    rows={3}
                    placeholder="Ask about attendance, study planning, campus help, or announcements..."
                    className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white"
                    disabled={sending}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {inputError ? <p className="text-sm text-red-600">{inputError}</p> : <p className="text-sm text-slate-500">Press Enter to send. Use Shift+Enter for a new line.</p>}
                    </div>
                    <Button onClick={sendMessage} disabled={sending}>
                      <Send className="h-4 w-4" />
                      {sending ? "Thinking..." : "Send"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentShell>
  );
}