const fs = require('fs');
const file = 'src/app/dashboard/forum/page.tsx';

if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  
  const oldJoin = `const joinMeet = () => {
    alert("Live video routing activated. Generating secure WebRTC tunnel...");
  };`;
  const newJoin = `const joinMeet = () => {
    if(activeView?.type === 'THREAD') window.location.href = "/live-session/" + activeView.threadData.id;
  };`;
  code = code.replace(oldJoin, newJoin);
  
  const activeChatSection = `/* UNLOCKED CHAT FEED */`;
  const closedStateUI = `
  {activeView.type === 'THREAD' && activeView.threadData?.isClosed ? (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Session Terminated</h2>
          <p className="text-slate-500 max-w-md mb-8">This 1-on-1 communication channel has been formally closed.</p>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full mb-6 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Termination Reason</p>
              <p className="text-sm font-medium text-slate-700 italic border-l-4 border-rose-400 pl-4 py-1">{activeView.threadData.terminationReason}</p>
          </div>
          
          <div className="flex items-center gap-4">
              {activeView.threadData.recordingUrl && (
                 <a href={activeView.threadData.recordingUrl} className="px-6 py-3.5 bg-blue-50 hover:bg-blue-100 transition-colors text-blue-600 font-bold rounded-xl text-sm border border-blue-100 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    View Recording
                 </a>
              )}
              <button onClick={() => setShowMeetModal(true)} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                 Request New Meet
              </button>
          </div>
      </div>
  ) : (
  `;
  code = code.replace(activeChatSection, activeChatSection + '\n' + closedStateUI);
  
  const endOfChatFeed = `</>
          )}`;
  code = code.replace(endOfChatFeed, `</> )}\n )}`);

  fs.writeFileSync(file, code);
  console.log("✅ Patched Student UI for Live Session Routing, Closed State, & Cyclical Meet Requests.");
}
