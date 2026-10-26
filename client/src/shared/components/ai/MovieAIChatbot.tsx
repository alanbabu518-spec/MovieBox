import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  chatWithMovieAI,
  type AIChatMessage,
  type AIAssistantMovie,
} from "../../services/ai.api";

import { cn } from "../../lib/cn";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  movies?: AIAssistantMovie[];
}

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi! I'm MovieBox AI. I can help you discover movies, find similar movies, and answer questions about movies.",
  },
];

const suggestions = [
  "Recommend a movie for me",
  "Movies like Interstellar",
  "Best Malayalam thrillers",
];

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";

export default function MovieAIChatbot() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const scroller = useRef<HTMLDivElement>(null);

  /* Keep the newest message in view */
  useEffect(() => {
    const node = scroller.current;

    if (isOpen && node) {
      node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  /* Esc closes the panel */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage,
    };

    const conversation: AIChatMessage[] = messages.map((item) => ({
      role: item.role,
      content: item.content,
    }));

    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const result = await chatWithMovieAI(trimmedMessage, conversation);

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: result.answer,
          movies: result.movies ?? [],
        },
      ]);
    } catch (error) {
      console.error("Failed to chat with MovieBox AI:", error);

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "Sorry, I couldn't process that right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const handleMovieClick = (movieId: number) => {
    setIsOpen(false);
    navigate(`/movie/${movieId}`);
  };

  const getReleaseYear = (releaseDate: string | null) =>
    releaseDate ? releaseDate.slice(0, 4) : null;

  return (
    <>
      {/* Panel stays mounted so open/close animates (transform + opacity only) */}
      <div
        role="dialog"
        aria-label="MovieBox AI chat"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "fixed inset-x-3 bottom-[calc(9rem+env(safe-area-inset-bottom,0px))] z-60 flex h-[min(680px,calc(100dvh-13rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl transition-[transform,opacity] duration-300 ease-out md:inset-x-auto md:bottom-24 md:right-6 md:h-[min(680px,calc(100dvh-8rem))] md:w-[420px]",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-line bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand shadow-[0_8px_24px_-8px_var(--primary)]">
              <Bot size={21} className="text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold">
                  MovieBox AI
                </h2>
                <Sparkles size={15} className="text-brand" />
              </div>

              <p className="text-xs text-muted">Your movie assistant</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full text-muted transition-[transform,background-color] duration-150 hover:bg-white/10 active:scale-90"
            aria-label="Close MovieBox AI"
          >
            <X size={19} />
          </button>
        </div>

        <div
          ref={scroller}
          className="flex-1 overflow-y-auto overscroll-contain bg-canvas px-4 py-5"
        >
          <div className="space-y-5">
            {messages.map((chatMessage) => {
              const isUser = chatMessage.role === "user";

              return (
                <div
                  key={chatMessage.id}
                  className={cn(
                    "animate-rise flex",
                    isUser ? "justify-end" : "justify-start",
                  )}
                >
                  <div className={isUser ? "max-w-[88%]" : "w-full"}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-7",
                        isUser
                          ? "rounded-br-md bg-brand text-white"
                          : "rounded-bl-md border border-line bg-card text-ink",
                      )}
                    >
                      {isUser ? (
                        chatMessage.content
                      ) : (
                        <div className="space-y-2">
                          {chatMessage.content
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((line, index) => (
                              <p key={index}>{line}</p>
                            ))}
                        </div>
                      )}
                    </div>

                    {!isUser &&
                      chatMessage.movies &&
                      chatMessage.movies.length > 0 && (
                        <ul
                          role="list"
                          className="mt-3 grid grid-cols-2 gap-3"
                        >
                          {chatMessage.movies.map((movie) => {
                            const releaseYear = getReleaseYear(
                              movie.releaseDate,
                            );

                            return (
                              <li key={movie.id}>
                                <button
                                  type="button"
                                  onClick={() => handleMovieClick(movie.id)}
                                  className="group w-full overflow-hidden rounded-xl border border-line bg-card text-left transition-transform duration-150 active:scale-[0.97] motion-safe:hover:-translate-y-0.5"
                                >
                                  <div className="aspect-2/3 w-full overflow-hidden bg-elevated">
                                    {movie.posterPath ? (
                                      <img
                                        src={`${TMDB_IMAGE_BASE_URL}${movie.posterPath}`}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-muted">
                                        No poster
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-3">
                                    <p className="line-clamp-2 text-sm font-semibold">
                                      {movie.title}
                                    </p>

                                    {releaseYear && (
                                      <p className="mt-1 text-xs text-muted">
                                        {releaseYear}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start" role="status">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-card px-4 py-3.5">
                  <span className="sr-only">MovieBox AI is thinking</span>

                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      aria-hidden="true"
                      style={{ animationDelay: `${delay}ms` }}
                      className="h-2 w-2 animate-bounce rounded-full bg-muted"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-medium text-muted">Try asking</p>

              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setMessage(suggestion)}
                    className="rounded-full border border-line bg-white/5 px-3.5 py-2 text-xs font-medium text-muted transition-[transform,color] duration-150 hover:text-ink active:scale-95"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line bg-card p-3 md:p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-canvas pl-4 pr-1.5 focus-within:border-brand/70">
            <input
              type="text"
              enterKeyHint="send"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask MovieBox AI…"
              aria-label="Message MovieBox AI"
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-muted disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={loading || !message.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white transition-[transform,opacity] duration-150 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 z-60 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-[0_12px_32px_-8px_var(--primary)] transition-transform duration-200 active:scale-90 md:bottom-5 md:right-6 motion-safe:md:hover:scale-105"
        aria-label={isOpen ? "Close MovieBox AI" : "Open MovieBox AI"}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}