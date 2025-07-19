import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatProps {
  videoTitle: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const Chat: React.FC<ChatProps> = ({
  videoTitle,
  messages,
  setMessages,
  inputValue,
  setInputValue,
  isLoading,
  setIsLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Utility to clean up double numbering in AI responses
  function cleanDoubleNumbering(text: string) {
    // Remove [n] n, [n]. n, [n]: n, [n]- n, etc.
    let cleaned = text.replace(/\[(\d+)\][\s\.:\-]*\1(?!\d)/g, "[$1]");
    // Remove numbers at the start of bold section headers (e.g., **3. Title:**, **3: Title:**, **3 Title:**)
    cleaned = cleaned.replace(/\*\*\d+[\.:\-]?\s*/g, "**");
    return cleaned;
  }

  // Function to format AI response with bold teal references, no links/highlighting
  const formatAIResponse = (text: string) => {
    const cleanedText = cleanDoubleNumbering(text);
    // Replace [n] with bold teal [n] everywhere
    const refFormatted = cleanedText.replace(
      /\[(\d+)\]/g,
      '<strong style="color:#0da6b8">[$1]</strong>'
    );
    // Split by bold section headers
    const sections = refFormatted.split(/\*\*(.*?)\*\*/);
    return sections.map((section, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className="text-[#0da6b8]">
            {section}
          </strong>
        );
      } else {
        // Render HTML for bold teal references
        return (
          <span key={index} dangerouslySetInnerHTML={{ __html: section }} />
        );
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage.text,
          videoTitle: videoTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error. Please try again.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-[#0da6b8]">AI Assistant</h3>
          <p className="text-sm text-gray-600">
            Ask questions about: {videoTitle}
          </p>
        </div>
        <div className="w-2 h-2 bg-[#0da6b8] rounded-full animate-pulse"></div>
      </div>

      {/* Messages - with proper scrolling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#e6fafd] rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#0da6b8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">
              Ask me anything about this lecture!
            </p>
            <p className="text-sm mt-2">
              I can help explain concepts, provide additional context, or answer
              your questions.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isUser
                  ? "bg-[#0da6b8] text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.isUser ? (
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              ) : (
                <div className="text-sm whitespace-pre-line break-words leading-relaxed">
                  {formatAIResponse(message.text)}
                </div>
              )}
              <p
                className={`text-xs mt-1 ${
                  message.isUser ? "text-[#e6fafd]" : "text-gray-500"
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about this lecture..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da6b8] focus:border-[#0da6b8] bg-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-[#0da6b8] text-white rounded-lg hover:bg-[#0a8a9a] focus:outline-none focus:ring-2 focus:ring-[#0da6b8] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
