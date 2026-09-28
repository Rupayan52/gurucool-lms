const fs = require('fs');
let content = fs.readFileSync('src/app/admin/content/page.tsx', 'utf8');

// Replace the old toggle with the new Enterprise 3-way selector
const oldToggleRegex = /<div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick=\{[^}]+\}>.*?<\/span><\/div>/s;

const newSelector = `
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Lesson Type</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setBroadcastType("VOD")} className={\`py-2 text-xs font-bold rounded-lg transition-colors \${broadcastType === "VOD" ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}\`}>VOD</button>
                <button type="button" onClick={() => setBroadcastType("NATIVE_WEBRTC")} className={\`py-2 text-xs font-bold rounded-lg transition-colors \${broadcastType === "NATIVE_WEBRTC" ? 'bg-red-500 text-white shadow-sm animate-pulse' : 'text-slate-500'}\`}>In-House Live</button>
                <button type="button" onClick={() => setBroadcastType("PRE_RECORDED_LIVE")} className={\`py-2 text-xs font-bold rounded-lg transition-colors \${broadcastType === "PRE_RECORDED_LIVE" ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'}\`}>Scheduled Playout</button>
              </div>
            </div>
`;
content = content.replace(oldToggleRegex, newSelector);

// Replace the inputs based on the new state
const oldInputsRegex = /\{isLive \? \([\s\S]*?\) : \([\s\S]*?\}\)/s;
const newInputs = `
            {broadcastType === "NATIVE_WEBRTC" && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-xs font-bold">
                Deploy this lesson to make it appear in your Broadcast Studio. You will use your hardware camera and screen share to stream this session natively.
              </div>
            )}
            
            {broadcastType === "PRE_RECORDED_LIVE" && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Upload Source MP4 (Database Video URL)</label>
                  <input type="url" required value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://your-storage.com/video.mp4" className="w-full border border-blue-300 bg-blue-50 rounded-xl p-3 outline-none focus:border-blue-500 font-medium text-sm text-blue-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Scheduled Live Start Time</label>
                  <input type="datetime-local" required value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full border border-blue-300 bg-blue-50 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm text-blue-900" />
                </div>
                <div className="text-[10px] font-bold text-slate-500 leading-tight">The platform will lock this video until the scheduled time. At the exact time, it will automatically initiate a live playout for all enrolled students.</div>
              </div>
            )}

            {broadcastType === "VOD" && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Video URL (VOD)</label>
                <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium text-sm" />
              </div>
            )}
`;
content = content.replace(oldInputsRegex, newInputs);

// Fix TS2304 error by making sure variables are properly passed
content = content.replace(/body: JSON\.stringify\(\{ title: lessonTitle, chapterId: activeChapter, videoUrl, pdfUrl, orderIndex: 1, isLive: broadcastType !== "VOD", liveUrl, broadcastType, scheduledStartTime: scheduledTime \Vert{}\Vert{} null \}\)/, 
                          `body: JSON.stringify({ title: lessonTitle, chapterId: activeChapter, videoUrl, pdfUrl, orderIndex: 1, isLive: broadcastType !== "VOD", liveUrl: "", broadcastType, scheduledStartTime: scheduledTime || null })`);

fs.writeFileSync('src/app/admin/content/page.tsx', content);
