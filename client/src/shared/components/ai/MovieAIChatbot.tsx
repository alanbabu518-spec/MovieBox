import { useState } from "react";
import {
  Bot,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  chatWithMovieAI,
  type AIChatMessage,
  type AIAssistantMovie,
} from "../../services/ai.api";

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

const TMDB_IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w500";

export default function MovieAIChatbot() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] =
    useState<ChatMessage[]>(initialMessages);

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

    const conversation: AIChatMessage[] =
      messages.map((item) => ({
        role: item.role,
        content: item.content,
      }));

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const result =
        await chatWithMovieAI(
          trimmedMessage,
          conversation,
        );

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: result.answer,
        movies: result.movies ?? [],
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "Failed to chat with MovieBox AI:",
        error,
      );

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Sorry, I couldn't process that right now. Please try again.",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (
    suggestion: string,
  ) => {
    setMessage(suggestion);
  };

  const handleMovieClick = (
    movieId: number,
  ) => {
    setIsOpen(false);
    navigate(`/movie/${movieId}`);
  };

  const getReleaseYear = (
    releaseDate: string | null,
  ) => {
    if (!releaseDate) {
      return null;
    }

    return releaseDate.slice(0, 4);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-60 flex h-[min(680px,calc(100vh-120px))] w-[calc(100vw-32px)] max-w-120 flex-col overflow-hidden rounded-2xl border shadow-2xl sm:right-6">
          <div
            className="flex items-center justify-between border-b px-5 py-4"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor:
                    "var(--primary)",
                }}
              >
                <Bot
                  size={21}
                  className="text-white"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="font-display text-base font-semibold"
                    style={{
                      color:
                        "var(--text-primary)",
                    }}
                  >
                    MovieBox AI
                  </h2>

                  <Sparkles
                    size={15}
                    style={{
                      color:
                        "var(--primary)",
                    }}
                  />
                </div>

                <p
                  className="text-xs"
                  style={{
                    color:
                      "var(--text-secondary)",
                  }}
                >
                  Your movie assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition"
              style={{
                color:
                  "var(--text-secondary)",
              }}
              aria-label="Close MovieBox AI"
            >
              <X size={19} />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 py-5"
            style={{
              backgroundColor:
                "var(--background)",
            }}
          >
            <div className="space-y-5">
              {messages.map((chatMessage) => (
                <div
                  key={chatMessage.id}
                  className={`flex ${
                    chatMessage.role ===
                    "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      chatMessage.role ===
                      "user"
                        ? "max-w-[88%]"
                        : "w-full"
                    }`}
                  >
                    <div
                      className="rounded-2xl px-4 py-3 text-sm leading-7"
                      style={{
                        backgroundColor:
                          chatMessage.role ===
                          "user"
                            ? "var(--primary)"
                            : "var(--card)",
                        color:
                          chatMessage.role ===
                          "user"
                            ? "#ffffff"
                            : "var(--text-primary)",
                      }}
                    >
                      {chatMessage.role ===
                      "assistant" ? (
                        <div className="space-y-2">
                          {chatMessage.content
                            .split("\n")
                            .filter(
                              (line) =>
                                line.trim(),
                            )
                            .map(
                              (
                                line,
                                index,
                              ) => (
                                <p
                                  key={
                                    index
                                  }
                                >
                                  {line}
                                </p>
                              ),
                            )}
                        </div>
                      ) : (
                        chatMessage.content
                      )}
                    </div>

                    {chatMessage.role ===
                      "assistant" &&
                      chatMessage.movies &&
                      chatMessage.movies
                        .length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {chatMessage.movies.map(
                            (movie) => {
                              const releaseYear =
                                getReleaseYear(
                                  movie.releaseDate,
                                );

                              return (
                                <button
                                  key={
                                    movie.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    handleMovieClick(
                                      movie.id,
                                    )
                                  }
                                  className="group overflow-hidden rounded-xl border text-left transition hover:-translate-y-0.5"
                                  style={{
                                    backgroundColor:
                                      "var(--card)",
                                    borderColor:
                                      "var(--border)",
                                  }}
                                >
                                  <div className="aspect-2/3 w-full overflow-hidden">
                                    {movie.posterPath ? (
                                      <img
                                        src={`${TMDB_IMAGE_BASE_URL}${movie.posterPath}`}
                                        alt={
                                          movie.title
                                        }
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                      />
                                    ) : (
                                      <div
                                        className="flex h-full w-full items-center justify-center px-3 text-center text-xs"
                                        style={{
                                          backgroundColor:
                                            "var(--background)",
                                          color:
                                            "var(--text-secondary)",
                                        }}
                                      >
                                        No poster
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-3">
                                    <p
                                      className="line-clamp-2 text-sm font-semibold"
                                      style={{
                                        color:
                                          "var(--text-primary)",
                                      }}
                                    >
                                      {
                                        movie.title
                                      }
                                    </p>

                                    {releaseYear && (
                                      <p
                                        className="mt-1 text-xs"
                                        style={{
                                          color:
                                            "var(--text-secondary)",
                                        }}
                                      >
                                        {
                                          releaseYear
                                        }
                                      </p>
                                    )}
                                  </div>
                                </button>
                              );
                            },
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl px-4 py-3 text-sm"
                    style={{
                      backgroundColor:
                        "var(--card)",
                      color:
                        "var(--text-secondary)",
                    }}
                  >
                    MovieBox AI is
                    thinking...
                  </div>
                </div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="mt-6">
                <p
                  className="mb-3 text-xs font-medium"
                  style={{
                    color:
                      "var(--text-secondary)",
                  }}
                >
                  Try asking
                </p>

                <div className="flex flex-wrap gap-2">
                  {suggestions.map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() =>
                          handleSuggestion(
                            suggestion,
                          )
                        }
                        className="rounded-full border px-3 py-2 text-xs transition"
                        style={{
                          borderColor:
                            "var(--border)",
                          color:
                            "var(--text-secondary)",
                        }}
                      >
                        {suggestion}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className="border-t p-4"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center gap-2 rounded-xl border px-3"
              style={{
                backgroundColor:
                  "var(--background)",
                borderColor:
                  "var(--border)",
              }}
            >
              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value,
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask MovieBox AI..."
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none disabled:opacity-60"
                style={{
                  color:
                    "var(--text-primary)",
                }}
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={
                  loading ||
                  !message.trim()
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  backgroundColor:
                    "var(--primary)",
                }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (current) => !current,
          )
        }
        className="fixed bottom-5 right-4 z-60 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform duration-200 hover:scale-105 sm:right-6"
        style={{
          backgroundColor:
            "var(--primary)",
        }}
        aria-label={
          isOpen
            ? "Close MovieBox AI"
            : "Open MovieBox AI"
        }
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <MessageCircle size={22} />
        )}
      </button>
    </>
  );
}