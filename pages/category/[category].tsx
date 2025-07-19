import { useRouter } from "next/router";
import { categories, hardcodedVideos } from "../../data/videos";
import { useState, useEffect, useCallback } from "react";
import VideoPlayer from "../../components/VideoPlayer";
import Chat from "../../components/Chat";
import Link from "next/link";
import { BookOpen, GraduationCap, ArrowLeft } from "lucide-react";
import React from "react";
import MCQQuiz, { MCQ } from "../../components/MCQQuiz";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Formatting helpers (copied from Chat.tsx)
const formatAIResponse = (text: string) => {
  // Split the text into sections
  const sections = text.split(/\*\*(.*?)\*\*/);
  return sections.map((section, index) => {
    if (index % 2 === 1) {
      // Bold section header
      return (
        <strong key={index} className="text-[#0da6b8]">
          {section}
        </strong>
      );
    } else {
      return processReferences(section, index);
    }
  });
};

const processReferences = (text: string, keyIndex: number) => {
  // Check if this is the references section
  if (text.includes("References:") || text.includes("**References:**")) {
    return processExternalLinks(text, keyIndex);
  }
  // Match reference patterns like [1], [2], etc.
  const parts = text.split(/(\[(\d+)\])/);
  return parts.map((part, index) => {
    const match = part.match(/\[(\d+)\]/);
    if (match) {
      const refNumber = match[1];
      return (
        <a
          key={`${keyIndex}-${index}`}
          href={`#ref-${refNumber}`}
          className="text-[#0da6b8] hover:text-[#0a8a9a] underline font-medium"
          onClick={(e) => {
            e.preventDefault();
            const refElement = document.getElementById(`ref-${refNumber}`);
            if (refElement) {
              refElement.scrollIntoView({ behavior: "smooth" });
              refElement.classList.add("bg-[#e6fafd]");
              setTimeout(() => {
                refElement.classList.remove("bg-[#e6fafd]");
              }, 2000);
            }
          }}
        >
          [{refNumber}]
        </a>
      );
    }
    return part;
  });
};

const processExternalLinks = (text: string, keyIndex: number) => {
  const lines = text.split("\n");
  return lines.map((line, lineIndex) => {
    // PubMed
    if (line.includes("PMID:")) {
      const pmidMatch = line.match(/PMID:\s*(\d+)/);
      if (pmidMatch) {
        const pmid = pmidMatch[1];
        const beforePMID = line.substring(0, line.indexOf("PMID:"));
        const afterPMID = line.substring(
          line.indexOf("PMID:") + pmidMatch[0].length
        );
        return (
          <div key={`${keyIndex}-${lineIndex}`} className="mb-2">
            {beforePMID}
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0da6b8] hover:text-[#0a8a9a] underline font-medium"
            >
              PMID: {pmid}
            </a>
            {afterPMID}
          </div>
        );
      }
    }
    // MedScape
    if (line.includes("MedScape") && line.includes("http")) {
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        const url = urlMatch[1];
        const beforeURL = line.substring(0, line.indexOf(url));
        const afterURL = line.substring(line.indexOf(url) + url.length);
        return (
          <div key={`${keyIndex}-${lineIndex}`} className="mb-2">
            {beforeURL}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0da6b8] hover:text-[#0a8a9a] underline font-medium"
            >
              {url}
            </a>
            {afterURL}
          </div>
        );
      }
    }
    return (
      <div key={`${keyIndex}-${lineIndex}`} className="mb-2">
        {line}
      </div>
    );
  });
};

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;

  const categoryData = categories.find((c) => c.id === category);
  // Map category id to hardcodedVideos category name if needed
  const categoryNameMap: Record<string, string> = {
    nephrology: "Renal",
    endocrinology: "Endocrine",
    // Add more mappings if needed
  };
  const mappedCategory =
    categoryNameMap[category as string] || categoryData?.name || "";
  // Use hardcodedVideos for topics and video playback
  const categoryVideos = hardcodedVideos.filter(
    (v) =>
      v.Category.toLowerCase().replace(/ /g, "") ===
      mappedCategory.toLowerCase().replace(/ /g, "")
  );
  const [selectedVideo, setSelectedVideo] = useState(categoryVideos[0] || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<"contents" | "chat" | "mcq">(
    "contents"
  );
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Chat state - persists across tab switches
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInputValue, setChatInputValue] = useState("");
  const [chatIsLoading, setChatIsLoading] = useState(false);

  // MCQ state
  const [showMCQQuiz, setShowMCQQuiz] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);

  // Add MCQ state
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqError, setMcqError] = useState<string | null>(null);

  // Reset MCQ state when a new video is selected
  const handleVideoSelect = useCallback(
    (video: (typeof categoryVideos)[0]) => {
      setSelectedVideo(video);
      setShowMCQQuiz(false);
      setSelectedOption(null);
      setMcqSubmitted(false);

      // Reset chat state when switching videos
      setChatMessages([]);
      setChatInputValue("");
      setChatIsLoading(false);

      // Update current video index
      const videoIndex = categoryVideos.findIndex(
        (v) => v.Title === video.Title
      );
      if (videoIndex !== -1) {
        setCurrentVideoIndex(videoIndex);
      }
    },
    [categoryVideos]
  );

  // Chat handlers
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputValue.trim() || chatIsLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: chatInputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInputValue("");
    setChatIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage.text,
          videoTitle: selectedVideo?.Title || "Medical Lecture",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        isUser: false,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "END_STREAM") {
              setChatIsLoading(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setChatMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessage.id
                      ? { ...msg, text: parsed.text }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setChatIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error. Please try again.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setChatIsLoading(false);
    }
  };

  // Fetch MCQs when selectedVideo changes
  useEffect(() => {
    setShowMCQQuiz(false);
    setMcqs([]);
    if (!selectedVideo) return;
    setMcqLoading(true);
    setMcqError(null);
    fetch("/api/generate-mcqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoTitle: selectedVideo.Title }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMcqs(data.mcqs || []);
        setMcqLoading(false);
      })
      .catch((err) => {
        setMcqError("Failed to load MCQs");
        setMcqLoading(false);
      });
  }, [selectedVideo]);

  // Sample MCQ data
  const sampleMCQ = {
    question: "What is the primary function of the frontal lobe?",
    options: [
      "Vision",
      "Motor control and decision making",
      "Balance and coordination",
      "Language comprehension",
    ],
    answer: 1, // index of correct answer
  };

  // MCQ interface component
  const MCQInterface = (
    <div className="bg-white rounded-lg shadow p-4 mt-4 w-full max-w-2xl">
      <h4 className="font-semibold mb-2 text-[#0da6b8]">Quiz</h4>
      {!showMCQQuiz ? (
        <>
          <div className="mb-3 text-gray-700 font-medium">
            Test your understanding of {selectedVideo?.Title}
          </div>
          <button
            className="px-4 py-2 bg-[#0da6b8] text-white rounded"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMCQQuiz(true);
            }}
          >
            Generate MCQs
          </button>
        </>
      ) : (
        <>
          <div className="mb-3 font-medium">{sampleMCQ.question}</div>
          <div className="space-y-2 mb-4">
            {sampleMCQ.options.map((opt, idx) => (
              <label
                key={idx}
                className={`block px-3 py-2 rounded border cursor-pointer transition-all ${
                  selectedOption === idx
                    ? "border-[#0da6b8] bg-[#e6fafd]"
                    : "border-gray-200 bg-white"
                } ${
                  mcqSubmitted && idx === sampleMCQ.answer
                    ? "border-green-500 bg-green-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="mcq"
                  value={idx}
                  checked={selectedOption === idx}
                  onChange={() => setSelectedOption(idx)}
                  className="mr-2"
                  disabled={mcqSubmitted}
                />
                {opt}
              </label>
            ))}
          </div>
          <button
            className="px-4 py-2 bg-[#0da6b8] text-white rounded disabled:opacity-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMcqSubmitted(true);
            }}
            disabled={selectedOption === null || mcqSubmitted}
          >
            {mcqSubmitted ? "Submitted" : "Submit"}
          </button>
          {mcqSubmitted && (
            <div
              className={`mt-3 text-sm ${
                selectedOption === sampleMCQ.answer
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {selectedOption === sampleMCQ.answer
                ? "Correct!"
                : "Incorrect. The correct answer is: " +
                  sampleMCQ.options[sampleMCQ.answer]}
            </div>
          )}
        </>
      )}
    </div>
  );

  const [activeMainTab, setActiveMainTab] = useState<"courses" | "qbank">(
    "courses"
  );

  if (!categoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Category not found</h2>
          <Link href="/" className="text-[#0da6b8] underline">
            Back to categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Nav Bar (desktop) - Fixed */}
      <nav className="hidden lg:flex items-center justify-between w-full px-6 py-3 bg-white border-b border-gray-200 shadow-sm z-30 fixed top-0 left-0 right-0">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center text-[#0da6b8] font-medium hover:underline"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to course catalogue
          </Link>
        </div>
        <div /> {/* Spacer for symmetry */}
      </nav>
      {/* Floating Bottom Nav Bar (mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow z-40 flex items-center justify-between px-4 py-2">
        <Link
          href="/"
          className="flex items-center font-bold text-base text-white bg-[#0da6b8] px-4 py-2 rounded-lg shadow hover:bg-[#0a8a9a] transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="ml-1">Back to catalogue</span>
        </Link>
        <div className="w-8" /> {/* Spacer for symmetry */}
      </nav>

      {/* Main content area with proper spacing for fixed nav */}
      <div className="flex-1 flex pt-16 lg:pt-16">
        {" "}
        {/* Add top padding for fixed nav */}
        {/* Sidebar (desktop only, toggleable) */}
        {sidebarOpen && (
          <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col relative h-[calc(100vh-64px)] overflow-hidden transition-all duration-500 ease-in-out">
            {/* Hamburger/X button inside sidebar */}
            <button
              className="absolute top-4 left-4 z-30 bg-white border border-gray-200 rounded-md p-1.5 shadow hover:bg-gray-100 focus:outline-none transition-all duration-300 ease-in-out"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              {/* X icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="p-6 pt-12">
              {" "}
              {/* Reduced top padding */}
              <h2 className="text-xl font-bold mb-6 text-[#0da6b8]">
                {categoryData.name}
              </h2>
              <nav className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                {categoryVideos.map((video, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleVideoSelect(video)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition text-sm font-medium text-gray-700 hover:bg-[#0da6b8]/10 ${
                      selectedVideo?.Title === video.Title
                        ? "bg-[#0da6b8]/20 text-[#0da6b8]"
                        : ""
                    }`}
                  >
                    {video.Title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
        {/* Floating hamburger button when sidebar is closed (desktop only) */}
        {!sidebarOpen && (
          <button
            className="hidden lg:flex fixed top-20 left-2 z-40 bg-white border border-gray-200 rounded-md p-1.5 shadow hover:bg-gray-100 focus:outline-none transition-all duration-300 ease-in-out"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            {/* Hamburger icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            </svg>
          </button>
        )}
        {/* Main Content + AMBR Chat */}
        <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
          {/* Desktop flex row: Video, AMBR */}
          <div className="hidden lg:flex flex-row items-stretch w-full h-full">
            {/* Video player with background */}
            <div
              className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${
                sidebarOpen ? "mr-[400px]" : "mr-[400px]"
              } overflow-y-auto`}
            >
              {/* Background that shows when sidebar is closed */}
              <div
                className={`w-full h-full transition-all duration-500 ease-in-out ${
                  sidebarOpen
                    ? "bg-gray-50"
                    : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"
                }`}
              >
                <div
                  className={`w-full transition-all duration-500 ease-in-out ${
                    sidebarOpen ? "p-4" : "p-4 pl-0"
                  }`}
                >
                  <div
                    className={`w-full flex justify-center items-start transition-all duration-500 ease-in-out ${
                      sidebarOpen ? "" : "pl-0"
                    }`}
                  >
                    <div
                      className={`transition-all duration-500 ease-in-out ${
                        sidebarOpen ? "w-full max-w-4xl" : "w-full max-w-6xl"
                      }`}
                    >
                      {selectedVideo ? (
                        <VideoPlayer
                          key={`${selectedVideo.Title}-${selectedVideo.URL}`}
                          videoUrl={selectedVideo.URL}
                          title={selectedVideo.Title}
                        />
                      ) : (
                        <div className="text-gray-500">
                          No lectures found for this category.
                        </div>
                      )}
                      {/* MCQ Quiz below video player - Left aligned */}
                      <div className="w-full mt-4">
                        {!showMCQQuiz ? (
                          mcqs.length > 0 ? (
                            <button
                              className="px-4 py-2 bg-[#0da6b8] text-white rounded font-semibold"
                              onClick={() => setShowMCQQuiz(true)}
                            >
                              Generate MCQs
                            </button>
                          ) : mcqError ? (
                            <div className="text-center text-red-500">
                              {mcqError}
                            </div>
                          ) : null
                        ) : (
                          <MCQQuiz mcqs={mcqs} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AMBR Chat Panel, fixed to right edge */}
            <aside className="hidden lg:flex flex-col bg-white border-l border-gray-200 fixed right-0 top-16 h-[calc(100vh-64px)] w-[400px] z-20">
              <Chat
                messages={chatMessages}
                setMessages={setChatMessages}
                inputValue={chatInputValue}
                setInputValue={setChatInputValue}
                isLoading={chatIsLoading}
                setIsLoading={setChatIsLoading}
                videoTitle={selectedVideo?.Title || "Medical Lecture"}
              />
            </aside>
          </div>

          {/* Mobile: video, tab bar, and one panel below video */}
          <div className="lg:hidden w-full max-w-3xl mx-auto pt-0 px-2 pb-20 overflow-y-auto">
            {" "}
            {/* Remove top padding, add bottom padding for mobile nav */}
            {selectedVideo ? (
              <VideoPlayer
                key={`${selectedVideo.Title}-${selectedVideo.URL}`}
                videoUrl={selectedVideo.URL}
                title={selectedVideo.Title}
              />
            ) : (
              <div className="text-gray-500">
                No lectures found for this category.
              </div>
            )}
            {/* Mobile tab bar (below video) */}
            <div className="w-full mt-2 mb-2 sticky top-0 z-10 bg-gray-50">
              <div className="flex justify-around border-b border-gray-200">
                <button
                  className={`flex-1 py-3 text-center font-medium ${
                    mobileTab === "contents"
                      ? "border-b-2 border-[#0da6b8] text-[#0da6b8] bg-white"
                      : "text-gray-500"
                  }`}
                  onClick={() => setMobileTab("contents")}
                >
                  Contents
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium ${
                    mobileTab === "chat"
                      ? "border-b-2 border-[#0da6b8] text-[#0da6b8] bg-white"
                      : "text-gray-500"
                  }`}
                  onClick={() => setMobileTab("chat")}
                >
                  AMBR
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium ${
                    mobileTab === "mcq"
                      ? "border-b-2 border-[#0da6b8] text-[#0da6b8] bg-white"
                      : "text-gray-500"
                  }`}
                  onClick={() => setMobileTab("mcq")}
                >
                  MCQ
                </button>
              </div>
            </div>
            {/* Mobile: show one panel below video */}
            {mobileTab === "contents" && (
              <div className="bg-white rounded-lg shadow p-4 mt-2 max-h-[60vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4 text-[#0da6b8]">
                  {categoryData.name}
                </h2>

                <nav className="space-y-2">
                  {categoryVideos.map((video, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVideoSelect(video)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition text-sm font-medium text-gray-700 hover:bg-[#0da6b8]/10 ${
                        selectedVideo?.Title === video.Title
                          ? "bg-[#0da6b8]/20 text-[#0da6b8]"
                          : ""
                      }`}
                    >
                      {video.Title}
                    </button>
                  ))}
                </nav>
              </div>
            )}
            {mobileTab === "chat" && (
              <aside className="bg-white rounded-lg shadow mt-2 flex flex-col h-[60vh] overflow-hidden">
                <Chat
                  messages={chatMessages}
                  setMessages={setChatMessages}
                  inputValue={chatInputValue}
                  setInputValue={setChatInputValue}
                  isLoading={chatIsLoading}
                  setIsLoading={setChatIsLoading}
                  videoTitle={selectedVideo?.Title || "Medical Lecture"}
                />
              </aside>
            )}
            {mobileTab === "mcq" && (
              <div className="bg-white rounded-lg shadow p-4 mt-2 max-h-[60vh] overflow-y-auto">
                {!showMCQQuiz ? (
                  mcqs.length > 0 ? (
                    <button
                      className="w-full px-4 py-2 bg-[#0da6b8] text-white rounded font-semibold"
                      onClick={() => setShowMCQQuiz(true)}
                    >
                      Generate MCQs
                    </button>
                  ) : mcqError ? (
                    <div className="text-center text-red-500">{mcqError}</div>
                  ) : null
                ) : (
                  <MCQQuiz mcqs={mcqs} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
