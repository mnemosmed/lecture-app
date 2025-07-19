import React, { useState } from "react";

export interface MCQ {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  reference: string;
}

interface MCQQuizProps {
  mcqs: MCQ[];
}

const optionLetters = ["A", "B", "C", "D", "E", "F"];

const MCQQuiz: React.FC<MCQQuizProps> = ({ mcqs }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!mcqs || mcqs.length === 0) return <div>No MCQs available.</div>;
  const q = mcqs[current];

  const handleSelect = (idx: number) => {
    if (!submitted) setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected !== null) setSubmitted(true);
  };

  const handleNext = () => {
    setCurrent((prev) => Math.min(prev + 1, mcqs.length - 1));
    setSelected(null);
    setSubmitted(false);
  };

  const handlePrev = () => {
    setCurrent((prev) => Math.max(prev - 1, 0));
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-2xl mx-auto">
      <div className="mb-4 text-gray-700 font-medium">
        <span className="text-[#0da6b8] font-bold">
          Question {current + 1} of {mcqs.length}
        </span>
      </div>
      <div className="mb-4 font-semibold text-gray-900 whitespace-pre-line text-sm sm:text-base">
        {q.question}
      </div>
      <div className="space-y-2 mb-4">
        {q.options.map((opt, idx) => {
          let optionStyle = "border-gray-200 bg-white text-gray-900";
          let icon = null;
          if (submitted) {
            if (idx === q.answer) {
              optionStyle = "border-green-500 bg-green-50 text-green-800";
              icon = <span className="ml-2 text-green-600 font-bold">✔</span>;
            } else if (selected === idx) {
              optionStyle = "border-red-400 bg-red-50 text-red-800";
              icon = <span className="ml-2 text-red-500 font-bold">✗</span>;
            }
          } else if (selected === idx) {
            optionStyle = "border-[#0da6b8] bg-[#e6fafd] text-[#0da6b8]";
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={submitted}
              className={`w-full flex items-center px-3 py-1.5 sm:px-4 sm:py-3 rounded-lg border transition-all text-left font-medium focus:outline-none text-xs sm:text-base ${optionStyle}`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full mr-2 sm:mr-3 text-xs sm:text-base font-bold border ${
                  submitted
                    ? idx === q.answer
                      ? "bg-green-500 text-white border-green-500"
                      : selected === idx
                      ? "bg-red-400 text-white border-red-400"
                      : "bg-gray-200 text-gray-500 border-gray-200"
                    : selected === idx
                    ? "bg-[#0da6b8] text-white border-[#0da6b8]"
                    : "bg-gray-200 text-gray-500 border-gray-200"
                }`}
              >
                {optionLetters[idx]}
              </span>
              <span className="flex-1 break-words whitespace-pre-line">
                {opt}
              </span>
              {icon}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mb-2">
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="flex-1 px-2 py-1 sm:px-3 sm:py-2 rounded bg-gray-100 text-gray-500 font-medium text-xs sm:text-base disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={current === mcqs.length - 1}
          className="flex-1 px-2 py-1 sm:px-3 sm:py-2 rounded bg-gray-100 text-gray-500 font-medium text-xs sm:text-base disabled:opacity-50"
        >
          Next
        </button>
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="px-3 py-1 sm:px-4 sm:py-2 rounded bg-[#0da6b8] text-white font-semibold text-xs sm:text-base disabled:opacity-50"
          >
            Check Answer
          </button>
        )}
      </div>
      {submitted && (
        <div className="mt-4 p-3 rounded bg-gray-50 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-1">Explanation:</div>
          <div className="text-gray-700 mb-2 whitespace-pre-line text-sm sm:text-base">
            {q.explanation}
          </div>
          <div className="text-xs text-[#0da6b8] font-semibold">
            {q.reference}
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQQuiz;
