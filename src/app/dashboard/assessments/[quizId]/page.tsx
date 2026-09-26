"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  options: string[];
  correctOption: number;
};

export default function QuizViewer({ params }: { params: { quizId: string } }) {
  const [quiz, setQuiz] = useState<{ title: string; questions: Question[] } | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Mocking a fetch since real DB questions rely on admin entry
    setQuiz({
      title: "Sample Assessment",
      questions: [
        { question: "What is the speed of light in a vacuum?", options: ["300,000 km/s", "150,000 km/s", "400,000 km/s", "None of the above"], correctOption: 0 },
        { question: "Which lens is used to correct myopia?", options: ["Convex", "Concave", "Cylindrical", "Bifocal"], correctOption: 1 }
      ]
    });
  }, []);

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
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center animate-in zoom-in duration-500">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Assessment Complete</h2>
        <div className="text-6xl font-black text-blue-600 my-6">{finalScore}%</div>
        <button onClick={() => router.push("/dashboard/assessments")} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
          Return to Assessments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{quiz.title}</h1>
        <p className="mt-2 text-slate-500">Answer all questions carefully before submitting.</p>
      </header>

      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">{qIndex + 1}. {q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt, oIndex) => (
                <label key={oIndex} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${answers[qIndex] === oIndex ? 'bg-blue-50 border-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name={`question-${qIndex}`} checked={answers[qIndex] === oIndex} onChange={() => setAnswers({ ...answers, [qIndex]: oIndex })} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={handleSubmit} disabled={loading || Object.keys(answers).length < quiz.questions.length} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Grading..." : "Submit Assessment"}
        </button>
      </div>
    </div>
  );
}
