import { useState } from 'react';

const tracks = [
  { title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55' },
  { title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
  { title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: '8:02' },
];

export default function PlayerMockup() {
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(30);
  const [current, setCurrent] = useState(0);
  const [progress] = useState(33);

  const track = tracks[current];

  return (
    <div className="glass-card rounded-2xl border border-white/5 p-6 shadow-2xl relative">
      <div className="absolute -top-3 -left-3 bg-[#81ecff] text-[#005762] px-3 py-1 rounded-md text-xs font-bold uppercase">
        Live Preview
      </div>

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#81ecff]/20 shrink-0 flex items-center justify-center text-[#81ecff] font-black text-lg">
          M
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#81ecff]">Musicólogo</span>
            <span className="bg-indigo-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold uppercase">BOT</span>
            <span className="text-slate-500 text-xs">Hoy a las 4:20 PM</span>
          </div>

          <div className="bg-[#1e1f24] border-l-4 border-[#81ecff] p-4 rounded-r-lg space-y-3">
            <h4 className="font-bold text-white text-sm">{track.title}</h4>
            <p className="text-slate-400 text-xs">{track.artist} · {track.duration}</p>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <span className="text-[#81ecff] font-mono text-xs">1:14</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full relative cursor-pointer">
                <div
                  className="absolute inset-y-0 left-0 bg-[#81ecff] rounded-full"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                </div>
              </div>
              <span className="text-slate-500 font-mono text-xs">{track.duration}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                onClick={() => setPlaying(!playing)}
                title={playing ? 'Pause' : 'Resume'}
              >
                <span className="text-white text-sm">{playing ? '⏸' : '▶️'}</span>
              </button>
              <button
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                onClick={() => setCurrent((current + 1) % tracks.length)}
                title="Next"
              >
                <span className="text-white text-sm">⏭</span>
              </button>
              <button
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                onClick={() => setVolume(Math.max(0, volume - 10))}
                title="Volume down"
              >
                <span className="text-white text-sm">🔉</span>
              </button>
              <button
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                onClick={() => setVolume(Math.min(100, volume + 10))}
                title="Volume up"
              >
                <span className="text-white text-sm">🔊</span>
              </button>
              <span className="text-slate-400 text-xs ml-1">Vol: {volume}%</span>
            </div>

            {/* Queue preview */}
            <div className="border-t border-white/5 pt-3">
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2">Cola</p>
              {tracks.filter((_, i) => i !== current).map((t, i) => (
                <p key={i} className="text-slate-400 text-xs py-0.5">
                  {i + 1}. {t.title} — {t.artist}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
