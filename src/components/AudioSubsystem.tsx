import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "SECTOR_01_NOISE", artist: "UNIT_A", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "CORRUPT_DATA_STREAM", artist: "UNIT_B", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "VOID_RESONANCE", artist: "UNIT_C", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export function AudioSubsystem() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("AUDIO_ERR:", e));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="brutal-border-magenta bg-black p-6 w-full max-w-md mx-auto relative">
      <div className="absolute top-0 left-0 bg-[#f0f] text-black px-2 py-1 text-sm font-bold">
        AUDIO_SUBSYSTEM_v2.4
      </div>
      
      <div className="mt-6 flex items-center justify-between mb-6 border-b-2 border-[#0ff] pb-2">
        <h2 className="text-3xl font-bold text-[#0ff] flex items-center gap-2">
          <Terminal className="w-8 h-8" />
          FREQ_MODULATOR
        </h2>
        <div className={`text-2xl ${isPlaying ? 'text-[#f0f] animate-pulse' : 'text-gray-600'}`}>
          {isPlaying ? 'ACTIVE' : 'IDLE'}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className="mb-6 bg-[#0ff] text-black p-4 border-l-8 border-[#f0f]">
        <div className="text-3xl font-bold truncate uppercase">{currentTrack.title}</div>
        <div className="text-xl mt-1">SRC: {currentTrack.artist}</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={progress}
          onChange={handleProgressChange}
          className="w-full h-6 bg-gray-900 appearance-none cursor-pointer accent-[#f0f] border-2 border-[#0ff]"
        />
        <div className="flex justify-between text-2xl text-[#0ff] mt-2">
          <span>T-{formatTime(progress)}</span>
          <span>T-{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button 
          onClick={playPrev}
          className="brutal-btn p-3 flex-1 flex justify-center min-h-[64px] items-center"
        >
          <SkipBack className="w-8 h-8" />
        </button>
        
        <button 
          onClick={togglePlay}
          className="brutal-btn p-4 flex-2 flex justify-center min-h-[64px] items-center bg-[#f0f] text-black border-[#f0f] hover:bg-[#0ff] hover:border-[#0ff]"
        >
          {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
        </button>
        
        <button 
          onClick={playNext}
          className="brutal-btn p-3 flex-1 flex justify-center min-h-[64px] items-center"
        >
          <SkipForward className="w-8 h-8" />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-4 bg-gray-900 p-3 border-2 border-[#0ff]">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="text-[#0ff] hover:text-[#f0f] min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {isMuted || volume === 0 ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="w-full h-4 bg-black appearance-none cursor-pointer accent-[#0ff] border border-[#f0f]"
        />
      </div>
    </div>
  );
}
