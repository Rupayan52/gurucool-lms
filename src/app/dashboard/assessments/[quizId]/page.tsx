"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Question = { question: string; options: string[] };

export default function QuizViewer({ params }: { params: { quizId: string } }) {
  const [quiz, setQuiz] = useState<{ title: string; questions: Question[] } | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/student/quiz/${params.quizId}`)
      .then(res => res.json())
      .then(data => { if (data.questions) setQuiz(data); });
  }, [params.quizId]);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("/api/student/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: params.quizId, answers })
    });
    
    if (res.ok) {
      const data = await res.json();
      setFinalScore(data.score);
    }
    setLoading(false);
  };

  if (!quiz) return <div className="p-8 animate-pulse text-slate-500">Loading assessment...</div>;

  if (finalScore !== null) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center animate-in zoom-in">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Assessment Complete</h2>
        <div className="text-6xl font-black text-blue-600 my-6">{finalScore}%</div>
        <button onClick={() => router.push("/dashboard/assessments")} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
          Return to Assessments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{quiz.title}</h1>
      </header>

      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">{qIndex + 1}. {q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt, oIndex) => (
                <label key={oIndex} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${answers[qIndex] === oIndex ? 'bg-blue-50 border-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" checked={answers[qIndex] === oIndex} onChange={() => setAnswers({ ...answers, [qIndex]: oIndex })} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={handleSubmit} disabled={loading || Object.keys(answers).length < quiz.questions.length} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Grading..." : "Submit Assessment"}
        </button>
      </div>
    </div>
  );
}
