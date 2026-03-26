import React, { useEffect, useRef, useState, useCallback } from 'react';

const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const CELL_SIZE = 24;
const INITIAL_SPEED = 120;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export function EntityTracker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [glitchTrigger, setGlitchTrigger] = useState(0);

  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const speedRef = useRef(INITIAL_SPEED);
  const lastRenderTimeRef = useRef(0);
  const requestRef = useRef<number>();

  const generateFood = useCallback((): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
      isOccupied = snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    foodRef.current = generateFood();
    speedRef.current = INITIAL_SPEED;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
    setGlitchTrigger(prev => prev + 1);
  }, [generateFood]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === ' ' && hasStarted) {
      if (gameOver) {
        resetGame();
      } else {
        setIsPaused(p => !p);
      }
      return;
    }

    if (!hasStarted || isPaused || gameOver) return;

    const currentDir = directionRef.current;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (currentDir !== 'DOWN') nextDirectionRef.current = 'UP';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (currentDir !== 'UP') nextDirectionRef.current = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (currentDir !== 'RIGHT') nextDirectionRef.current = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (currentDir !== 'LEFT') nextDirectionRef.current = 'RIGHT';
        break;
    }
  }, [gameOver, hasStarted, isPaused, resetGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTouchStart = (dir: Direction) => {
    if (!hasStarted || isPaused || gameOver) return;
    const currentDir = directionRef.current;
    if (dir === 'UP' && currentDir !== 'DOWN') nextDirectionRef.current = 'UP';
    if (dir === 'DOWN' && currentDir !== 'UP') nextDirectionRef.current = 'DOWN';
    if (dir === 'LEFT' && currentDir !== 'RIGHT') nextDirectionRef.current = 'LEFT';
    if (dir === 'RIGHT' && currentDir !== 'LEFT') nextDirectionRef.current = 'RIGHT';
  };

  const update = useCallback(() => {
    const snake = [...snakeRef.current];
    directionRef.current = nextDirectionRef.current;
    const head = { ...snake[0] };

    switch (directionRef.current) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
      setGameOver(true);
      return;
    }

    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(s => {
        const newScore = s + 1;
        if (newScore > highScore) setHighScore(newScore);
        return newScore;
      });
      foodRef.current = generateFood();
      speedRef.current = Math.max(40, speedRef.current - 3);
      setGlitchTrigger(prev => prev + 1);
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
  }, [generateFood, highScore]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

    // Draw grid lines (harsh magenta)
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food (Cyan packet)
    ctx.fillStyle = '#0ff';
    ctx.fillRect(foodRef.current.x * CELL_SIZE + 2, foodRef.current.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(foodRef.current.x * CELL_SIZE + 6, foodRef.current.y * CELL_SIZE + 6, CELL_SIZE - 12, CELL_SIZE - 12);

    // Draw snake (Magenta blocks with Cyan borders)
    snakeRef.current.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#fff' : '#f0f';
      ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    if (isPaused || gameOver || !hasStarted) {
      if (canvasRef.current) {
         draw(canvasRef.current.getContext('2d')!);
      }
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current);
    if (secondsSinceLastRender < speedRef.current) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    lastRenderTimeRef.current = currentTime;
    update();
    
    if (canvasRef.current) {
      draw(canvasRef.current.getContext('2d')!);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [draw, gameOver, hasStarted, isPaused, update]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameLoop]);

  // Handle ResizeObserver for responsive canvas scaling
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        if (canvasRef.current) {
           canvasRef.current.style.width = `${width}px`;
           canvasRef.current.style.height = `${width * (GRID_HEIGHT / GRID_WIDTH)}px`;
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="brutal-border bg-black p-4 w-full relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-[#0ff] text-black px-2 py-1 text-sm font-bold z-10">
        ENTITY_TRACKER_v1.0
      </div>
      
      <div className="flex justify-between w-full mb-4 px-2 border-b-4 border-[#f0f] pb-2 mt-4">
        <div className="text-[#0ff] text-2xl md:text-3xl font-bold">
          DATA_YIELD: <span className="text-white">{score}</span>
        </div>
        <div className="text-[#f0f] text-2xl md:text-3xl font-bold">
          PEAK_EFFICIENCY: <span className="text-white">{highScore}</span>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className={`relative bg-black border-4 border-[#0ff] w-full max-w-2xl mx-auto ${glitchTrigger % 2 !== 0 ? 'translate-x-[4px] -translate-y-[4px]' : ''} transition-transform duration-75`}
        style={{ aspectRatio: `${GRID_WIDTH} / ${GRID_HEIGHT}` }}
      >
        <canvas
          ref={canvasRef}
          width={GRID_WIDTH * CELL_SIZE}
          height={GRID_HEIGHT * CELL_SIZE}
          className="block"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {(!hasStarted || gameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6 border-4 border-[#f0f] m-2">
            {!hasStarted ? (
              <>
                <h2 className="text-4xl md:text-6xl font-black text-[#0ff] mb-4 glitch-text" data-text="INITIALIZE_SEQUENCE">INITIALIZE_SEQUENCE</h2>
                <p className="text-[#f0f] mb-8 text-xl md:text-2xl">AWAITING MANUAL OVERRIDE (SPACEBAR)</p>
                <button 
                  onClick={resetGame}
                  className="brutal-btn px-8 py-4 text-2xl md:text-3xl"
                >
                  EXECUTE
                </button>
              </>
            ) : gameOver ? (
              <>
                <h2 className="text-5xl md:text-7xl font-black text-[#f0f] mb-2 glitch-text" data-text="SYSTEM_FAILURE">SYSTEM_FAILURE</h2>
                <p className="text-[#0ff] mb-8 text-2xl md:text-3xl">DATA_CORRUPTED: {score} PACKETS</p>
                <button 
                  onClick={resetGame}
                  className="brutal-btn px-8 py-4 text-2xl md:text-3xl bg-[#f0f] text-black border-[#f0f] hover:bg-[#0ff] hover:border-[#0ff]"
                >
                  REBOOT_SYSTEM
                </button>
              </>
            ) : isPaused ? (
              <>
                <h2 className="text-5xl md:text-6xl font-black text-[#0ff] mb-6 glitch-text" data-text="PROCESS_SUSPENDED">PROCESS_SUSPENDED</h2>
                <button 
                  onClick={() => setIsPaused(false)}
                  className="brutal-btn px-8 py-4 text-2xl md:text-3xl"
                >
                  RESUME_PROCESS
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="mt-8 grid grid-cols-3 gap-4 max-w-[240px] mx-auto md:hidden">
        <div />
        <button className="brutal-btn h-16 flex items-center justify-center text-3xl font-bold" onTouchStart={(e) => { e.preventDefault(); handleTouchStart('UP'); }}>W</button>
        <div />
        <button className="brutal-btn h-16 flex items-center justify-center text-3xl font-bold" onTouchStart={(e) => { e.preventDefault(); handleTouchStart('LEFT'); }}>A</button>
        <button className="brutal-btn h-16 flex items-center justify-center text-3xl font-bold" onTouchStart={(e) => { e.preventDefault(); handleTouchStart('DOWN'); }}>S</button>
        <button className="brutal-btn h-16 flex items-center justify-center text-3xl font-bold" onTouchStart={(e) => { e.preventDefault(); handleTouchStart('RIGHT'); }}>D</button>
      </div>
    </div>
  );
}
