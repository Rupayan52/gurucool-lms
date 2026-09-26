"use client";
import { useState, useEffect } from "react";

type Question = { q: string; options: string[]; answer: number };
type Quiz = { id: string; title: string; questions: Question[] };

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/quiz").then(res => res.json()).then(data => setQuiz(data));
  }, []);

  const handleNext = async () => {
    if (selectedOption === null || !quiz) return;
    
    let newScore = score;
    if (selectedOption === quiz.questions[currentQ].answer) {
      newScore += 1;
      setScore(newScore);
    }

    if (currentQ + 1 < quiz.questions.length) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
    } else {
      setSubmitting(true);
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quiz.id, score: newScore })
      });
      setShowResult(true);
    }
  };

  if (!quiz) return <div className="p-8 text-slate-500 animate-pulse">Loading assessments...</div>;

  if (showResult) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center animate-in fade-in zoom-in duration-500">
        <h2 className="text-3xl font-black text-gray-900 mb-4">Quiz Completed!</h2>
        <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-black mb-6 bg-blue-50 text-blue-600 border-4 border-blue-100">
          {percentage}%
        </div>
        <p className="text-gray-600 mb-8">You scored {score} out of {quiz.questions.length} correct.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
          Retake Assessment
        </button>
      </div>
    );
  }

  const q = quiz.questions[currentQ];

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{quiz.title}</h1>
        <p className="mt-2 text-gray-500">Question {currentQ + 1} of {quiz.questions.length}</p>
      </header>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{q.q}</h2>
        <div className="space-y-3 mb-8">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedOption === idx 
                  ? "border-blue-600 bg-blue-50 text-blue-800 font-medium" 
                  : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-gray-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={selectedOption === null || submitting}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving Score..." : currentQ === quiz.questions.length - 1 ? "Submit Assessment" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
