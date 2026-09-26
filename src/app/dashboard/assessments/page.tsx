"use client";

export default function AssessmentsPage() {
  const activeQuizzes = [
    { id: 1, title: "Light & Optics Concept Check", subject: "Physics", questions: 15, timeLimit: "20 mins", dueDate: "Today" },
    { id: 2, title: "Genetics Weekly Test", subject: "Biology", questions: 25, timeLimit: "45 mins", dueDate: "Tomorrow" }
  ];

  const pastScores = [
    { id: 3, title: "Chemical Reactions", subject: "Chemistry", score: 85, total: 100, date: "Sep 20, 2026" },
    { id: 4, title: "Coordinate Geometry", subject: "Mathematics", score: 92, total: 100, date: "Sep 15, 2026" }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assessments & Quizzes</h1>
        <p className="mt-2 text-gray-500">Test your knowledge and track your performance.</p>
      </header>

      <div className="space-y-10">
        {/* Active Quizzes Section */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">🔥</span>
            Pending Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Due {quiz.dueDate}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 mt-2">{quiz.title}</h3>
                <p className="text-sm font-medium text-blue-600 mb-4">{quiz.subject}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center">⏱ {quiz.timeLimit}</span>
                  <span className="flex items-center">📝 {quiz.questions} Questions</span>
                </div>
                <button className="w-full bg-gray-900 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-600 transition-colors">
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Past Performance Section */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Scores</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-sm text-gray-600">Test Name</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Subject</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Date</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pastScores.map((score) => (
                  <tr key={score.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{score.title}</td>
                    <td className="p-4 text-gray-600 text-sm">{score.subject}</td>
                    <td className="p-4 text-gray-500 text-sm">{score.date}</td>
                    <td className="p-4 text-right font-bold text-green-600">
                      {score.score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
