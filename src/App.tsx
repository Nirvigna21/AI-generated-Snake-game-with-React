import React from 'react';
import { AudioSubsystem } from './components/AudioSubsystem';
import { EntityTracker } from './components/EntityTracker';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-[#0ff] font-sans flex flex-col items-center justify-center p-4 scanlines crt-flicker">
      <div className="bg-noise"></div>
      
      <div className="z-10 w-full max-w-6xl">
        <header className="mb-8 border-b-4 border-[#f0f] pb-4 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter glitch-text" data-text="SYS.OP: OROBOROS">
              SYS.OP: OROBOROS
            </h1>
            <p className="text-[#f0f] text-xl mt-2 animate-pulse">STATUS: COMPROMISED // OVERRIDE ENGAGED</p>
          </div>
          <div className="text-left md:text-right mt-4 md:mt-0 text-xl">
            <p>MEM: 0x00FF4A</p>
            <p className="text-[#f0f]">CPU: ERR_OVERFLOW</p>
          </div>
        </header>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
          <div className="xl:col-span-2 flex justify-center w-full">
            <EntityTracker />
          </div>
          
          <div className="xl:col-span-1 w-full">
            <AudioSubsystem />
          </div>
        </div>
      </div>
    </div>
  );
}
