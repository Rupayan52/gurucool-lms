export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, Student!</h1>
        <p className="mt-2 text-gray-500">Here is an overview of your learning progress and upcoming phygital batches.</p>
      </header>

      {/* Analytics & Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Overall Progress</h3>
          <p className="mt-2 text-4xl font-black text-blue-600">68%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Lessons Completed</h3>
          <p className="mt-2 text-4xl font-black text-green-600">12 <span className="text-lg text-gray-400 font-medium">/ 45</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Upcoming Tests</h3>
          <p className="mt-2 text-4xl font-black text-orange-500">2</p>
        </div>
      </div>

      {/* Course Enrollment Section */}
      <section className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Active Subjects</h2>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All →</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Subject Card 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-6 text-center">
              <span className="text-white text-xl font-bold tracking-wide">Physics - Class 10</span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600 line-clamp-1">Current: Light & Optics</span>
                <span className="text-sm font-bold text-blue-600 ml-2">45%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <button className="mt-auto w-full bg-blue-50 text-blue-700 py-2.5 rounded-xl font-semibold hover:bg-blue-100 transition-colors">
                Continue Lesson
              </button>
            </div>
          </div>

          {/* Subject Card 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center p-6 text-center">
              <span className="text-white text-xl font-bold tracking-wide">Biology - Class 10</span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600 line-clamp-1">Current: Genetics</span>
                <span className="text-sm font-bold text-green-600 ml-2">80%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <button className="mt-auto w-full bg-green-50 text-green-700 py-2.5 rounded-xl font-semibold hover:bg-green-100 transition-colors">
                Continue Lesson
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
