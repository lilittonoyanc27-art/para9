import { useEffect, useRef, useState } from 'react';
import { PERFECTO_EXCEPTIONS } from './data';
import { BowlingPin } from './types';
import { Target, RotateCcw, Flame, Sparkles } from 'lucide-react';

interface BowlingGameProps {
  playerGor: { name: string; score: number };
  playerGayane: { name: string; score: number };
  onUpdateScores: (gorScore: number, gayaneScore: number) => void;
}

export default function BowlingGame({
  playerGor,
  playerGayane,
  onUpdateScores
}: BowlingGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePlayer, setActivePlayer] = useState<'gor' | 'gayane'>('gor');
  const [currentTarget, setCurrentTarget] = useState<typeof PERFECTO_EXCEPTIONS[0] | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackColor, setFeedbackColor] = useState<string>('text-gray-300');
  const [ballX, setBallX] = useState<number>(300);
  const [ballY, setBallY] = useState<number>(310);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rollsCount, setRollsCount] = useState<number>(0);
  const [options, setOptions] = useState<string[]>([]);

  // Bowling Ball Launch Velocity
  const [aimAngle, setAimAngle] = useState<number>(0); // left/right curve offset
  const ballSpeed = 10; // constant speed upwards

  const pinsRef = useRef<BowlingPin[]>([]);
  const ballRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number }>({
    x: 300,
    y: 310,
    vx: 0,
    vy: 0,
    radius: 16
  });

  const LANE_WIDTH = 600;
  const LANE_HEIGHT = 380;

  const startNewFrame = () => {
    // Select randomly from important Spanish participles
    const targetIdx = Math.floor(Math.random() * PERFECTO_EXCEPTIONS.length);
    const target = PERFECTO_EXCEPTIONS[targetIdx];
    setCurrentTarget(target);

    // Prepare wrong variants / foils
    const correctAns = target.participle;
    const foils = [
      target.latin + 'ido',
      target.latin + 'ado',
      'dicho',
      'vuelto',
      'puesto',
      'escribido'
    ].filter(f => f !== correctAns).slice(0, 3); // 3 foils

    const combinedOptions = [correctAns, ...foils].sort(() => 0.5 - Math.random());
    setOptions(combinedOptions);

    // Ball reset
    ballRef.current = {
      x: 300,
      y: 320,
      vx: 0,
      vy: 0,
      radius: 16
    };
    setBallX(300);
    setBallY(320);
    setIsRolling(false);

    // Arrange 10 pins in triangle formation at the top of the lane
    // Rows layout: 4 pins, then 3 pins, then 2 pins, then 1 pin
    const pins: BowlingPin[] = [];
    const colors = ['#f43f5e', '#ec4899', '#3b82f6', '#10b981'];

    // Setup 4 options pinned onto specific positions
    // We make 10 pins total. Let's write the options on some central pins
    // Pin grid layout
    const pinRows = [
      [ { x: 230, y: 50 }, { x: 275, y: 50 }, { x: 320, y: 50 }, { x: 370, y: 50 } ],
      [ { x: 250, y: 80 }, { x: 300, y: 80 }, { x: 348, y: 80 } ],
      [ { x: 275, y: 110 }, { x: 325, y: 110 } ],
      [ { x: 300, y: 140 } ]
    ];

    let optionIdx = 0;
    let pinId = 1;
    for (let r = 0; r < pinRows.length; r++) {
      for (let p = 0; p < pinRows[r].length; p++) {
        const pos = pinRows[r][p];
        // Give 4 central/prominent pins the dynamic option words
        let word = '';
        if (pinId % 2 === 0 && optionIdx < combinedOptions.length) {
          word = combinedOptions[optionIdx];
          optionIdx++;
        } else {
          // Filler distractors
          word = '...';
        }

        pins.push({
          id: pinId,
          x: pos.x,
          y: pos.y,
          originalX: pos.x,
          originalY: pos.y,
          radius: 11,
          word: word,
          isCorrect: word === correctAns,
          isFallen: false
        });
        pinId++;
      }
    }

    pinsRef.current = pins;
    setFeedback(`Կարգավորի՛ր գնդակի գիրքը, թեքությունը և տապալի՛ր «${target.latin}» (${target.meaning}) բայի ԻՍԿԱԿԱՆ participio-ն:`);
    setFeedbackColor('text-amber-300 font-medium');
  };

  useEffect(() => {
    startNewFrame();
  }, []);

  // Frame simulation loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateGame = () => {
      if (isRolling) {
        // Move ball along angle
        ballRef.current.x += ballRef.current.vx;
        ballRef.current.y += ballRef.current.vy;
        setBallX(ballRef.current.x);
        setBallY(ballRef.current.y);

        // Friction slow bend down slightly
        ballRef.current.vx *= 0.99;

        // Boundaries check
        if (ballRef.current.x - ballRef.current.radius < 50 || ballRef.current.x + ballRef.current.radius > LANE_WIDTH - 50) {
          ballRef.current.vx *= -1; // bounce off lane gutters
        }

        // Hit pins check
        pinsRef.current.forEach(pin => {
          if (!pin.isFallen) {
            const dist = Math.hypot(ballRef.current.x - pin.x, ballRef.current.y - pin.y);
            if (dist < ballRef.current.radius + pin.radius) {
              pin.isFallen = true;

              // Knock adjacent pins down too with cascaded random physics
              knockNeighborPins(pin);
              handleHitPinEvent(pin);
            }
          }
        });

        // Ball reached top or completely stopped
        if (ballRef.current.y < 30) {
          setIsRolling(false);
          ballRef.current.vx = 0;
          ballRef.current.vy = 0;
          
          // Check if correct pin is hit
          const correctPin = pinsRef.current.find(p => p.isCorrect);
          if (correctPin && correctPin.isFallen) {
            // Already handled
          } else {
            setFeedback('Ափսո՜ս, շեղ գնացիր: Ճիշտ կեգլին չընկավ: Հերթափոխություն:');
            setFeedbackColor('text-slate-400');
            setActivePlayer(curr => (curr === 'gor' ? 'gayane' : 'gor'));
          }

          // Reset ball position
          setTimeout(() => {
            ballRef.current.x = 300;
            ballRef.current.y = 310;
            setBallX(300);
            setBallY(310);
          }, 1500);
        }
      }
    };

    const knockNeighborPins = (struckPin: BowlingPin) => {
      // Simple physical chain reaction: knock neighbor pins that are close by
      pinsRef.current.forEach(pin => {
        if (!pin.isFallen) {
          const distanceToStruck = Math.hypot(struckPin.x - pin.x, struckPin.y - pin.y);
          if (distanceToStruck < 45) {
            // 75% chance to fall
            if (Math.random() < 0.75) {
              pin.isFallen = true;
              if (pin.word !== '' && pin.word !== '...') {
                handleHitPinEvent(pin);
              }
            }
          }
        }
      });
    };

    const handleHitPinEvent = (pin: BowlingPin) => {
      if (pin.word === '...') return;

      if (pin.isCorrect) {
        setFeedback(`ՍԹՐԱ՛ՅՔ! ${activePlayer === 'gor' ? 'Գոռը' : 'Գայանեն'} գետնեց ճիշտ «${pin.word}» կեգլին: +20 միավոր:`);
        setFeedbackColor('text-emerald-400 font-bold animate-bounce');
        if (activePlayer === 'gor') {
          onUpdateScores(playerGor.score + 20, playerGayane.score);
        } else {
          onUpdateScores(playerGor.score, playerGayane.score + 20);
        }
        setTimeout(() => {
          startNewFrame();
        }, 2000);
      } else if (pin.word !== '') {
        setFeedback(`Սխալ կեգլի! «${pin.word}»-ը սխալ ձևն է: -10 միավոր:`);
        setFeedbackColor('text-rose-400 font-medium');
        if (activePlayer === 'gor') {
          onUpdateScores(Math.max(0, playerGor.score - 10), playerGayane.score);
        } else {
          onUpdateScores(playerGor.score, Math.max(0, playerGayane.score - 10));
        }
        setActivePlayer(curr => (curr === 'gor' ? 'gayane' : 'gor'));
      }
    };

    const drawLane = () => {
      ctx.clearRect(0, 0, LANE_WIDTH, LANE_HEIGHT);

      // Dark background borders
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, LANE_WIDTH, LANE_HEIGHT);

      // Wooden lanes with perspective drawing
      ctx.fillStyle = '#f5e0c3'; // light pine wood
      ctx.beginPath();
      ctx.moveTo(70, 0);
      ctx.lineTo(530, 0);
      ctx.lineTo(570, LANE_HEIGHT);
      ctx.lineTo(30, LANE_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Draw wood lines / bowling guides
      ctx.strokeStyle = '#d7ba8d';
      ctx.lineWidth = 1;
      for (let offset = 100; offset < 500; offset += 50) {
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset * 1.05 - 15, LANE_HEIGHT);
        ctx.stroke();
      }

      // Draw gutters (black sides)
      ctx.fillStyle = '#1e293b';
      // Left gutter
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(70, 0);
      ctx.lineTo(30, LANE_HEIGHT);
      ctx.lineTo(0, LANE_HEIGHT);
      ctx.fill();
      // Right gutter
      ctx.beginPath();
      ctx.moveTo(530, 0);
      ctx.lineTo(600, 0);
      ctx.lineTo(600, LANE_HEIGHT);
      ctx.lineTo(570, LANE_HEIGHT);
      ctx.fill();

      // Red guide arrows in lane
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(300, 240);
      ctx.lineTo(294, 250);
      ctx.lineTo(306, 250);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(250, 240);
      ctx.lineTo(245, 248);
      ctx.lineTo(255, 248);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(350, 240);
      ctx.lineTo(345, 248);
      ctx.lineTo(355, 248);
      ctx.fill();

      // Draw Pins
      pinsRef.current.forEach(pin => {
        if (!pin.isFallen) {
          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.arc(pin.x, pin.y + 4, pin.radius, 0, 2 * Math.PI);
          ctx.fill();

          // Ivory Pin body
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(pin.x, pin.y, pin.radius, 0, 2 * Math.PI);
          ctx.fill();

          // Red neck stripe stripe
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(pin.x - 7, pin.y - 3, 14, 4);

          // Highlights
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Text labels for irregular options
          if (pin.word !== '' && pin.word !== '...') {
            ctx.save();
            const text = pin.word;
            ctx.font = 'bold 12px Inter, sans-serif';
            const textWidth = ctx.measureText(text).width;
            
            // Draw an elegant backdrop badge for perfect visibility
            const padX = 8;
            const cardW = textWidth + padX * 2;
            const cardH = 20;
            const cardX = pin.x - cardW / 2;
            const cardY = pin.y - 32;

            // Card Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.roundRect(cardX + 1, cardY + 1.5, cardW, cardH, 4);
            ctx.fill();

            // Background Fill (Deep Slate for solid contrast)
            ctx.fillStyle = '#1e293b'; 
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, 4);
            ctx.fill();

            // Contrast Border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Word text styling
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, pin.x, cardY + cardH / 2);
            ctx.restore();
          }
        } else {
          // Draw fallen pin (slanted with transparency)
          ctx.save();
          ctx.translate(pin.x, pin.y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
          ctx.fillRect(-5, -15, 10, 30);
          ctx.restore();
        }
      });

      // Draw Bowling Ball (Sparkly Purple/Yellow)
      ctx.fillStyle = '#6b21a8'; // Purple
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, 2 * Math.PI);
      ctx.fill();

      // 3 finger grip holes
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(ballRef.current.x - 5, ballRef.current.y - 4, 3, 0, 2 * Math.PI);
      ctx.arc(ballRef.current.x + 5, ballRef.current.y - 4, 3, 0, 2 * Math.PI);
      ctx.arc(ballRef.current.x, ballRef.current.y + 4, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Shine effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(ballRef.current.x - 6, ballRef.current.y - 6, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw curve aim dashed line if not rolling
      if (!isRolling) {
        ctx.strokeStyle = 'rgba(107, 33, 168, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ballRef.current.x, ballRef.current.y);
        ctx.lineTo(ballRef.current.x + aimAngle * 12, 100);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const mainLoop = () => {
      updateGame();
      drawLane();
      animationFrameId = requestAnimationFrame(mainLoop);
    };

    mainLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [ballX, ballY, aimAngle, isRolling, currentTarget, activePlayer]);

  const handleRollBall = () => {
    if (isRolling) return;
    setIsRolling(true);
    setRollsCount(prev => prev + 1);

    // Speed vectors
    ballRef.current.vx = aimAngle;
    ballRef.current.vy = -ballSpeed;
  };

  return (
    <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 shadow-2xl">
      {/* Upper stats banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/25 rounded-lg text-purple-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Ուսուցողական Բոուլինգ / bowling</div>
            <div className="text-xl font-bold text-white flex items-center gap-1.5">
              <span>Ինչպե՞ս է «</span>
              <span className="text-amber-400 font-black">{currentTarget?.latin}</span>
              <span>» բայի Participio-ն</span>
            </div>
            <div className="text-xs text-slate-400">({currentTarget?.meaning})</div>
          </div>
        </div>

        {/* Current Turn Badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">Հերթը՝</span>
          <div className={`px-4 py-2 rounded-xl text-sm font-black tracking-wider shadow ${
            activePlayer === 'gor' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-blue-500 text-white shadow-blue-500/20'
          }`}>
            {activePlayer === 'gor' ? 'ԳՈՌ' : 'ԳԱՅԱՆԵ'} -ԻՆՆ Է
          </div>
        </div>
      </div>

      {/* Main Bowling Lane Viewport */}
      <div className="flex justify-center mb-6">
        <div className="relative border-4 border-slate-700 rounded-lg overflow-hidden bg-slate-950">
          <canvas
            ref={canvasRef}
            width={LANE_WIDTH}
            height={LANE_HEIGHT}
            className="block max-w-full cursor-pointer"
            onClick={handleRollBall}
          />
        </div>
      </div>

      {/* Dashboard controls for Position, Slant & Shoot */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-800/40 p-5 rounded-xl border border-slate-700/60">
        <div className="md:col-span-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Գնդակի Դիրքը / Ball Position</span>
            <span className="text-purple-400">{ballX}</span>
          </div>
          <input
            type="range"
            min="100"
            max="500"
            value={ballX}
            disabled={isRolling}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBallX(val);
              ballRef.current.x = val;
            }}
            className="w-full accent-purple-500 bg-slate-700 rounded-lg h-2"
          />
        </div>

        <div className="md:col-span-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Թեքություն / Ball Angle Curve</span>
            <span className="text-purple-400">{aimAngle > 0 ? `+${aimAngle}` : aimAngle}</span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.5"
            value={aimAngle}
            disabled={isRolling}
            onChange={(e) => setAimAngle(Number(e.target.value))}
            className="w-full accent-fuchsia-500 bg-slate-700 rounded-lg h-2"
          />
        </div>

        <div className="md:col-span-4 flex gap-2">
          <button
            onClick={handleRollBall}
            disabled={isRolling}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-30 disabled:hover:bg-purple-600 text-white font-extrabold tracking-wide py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            ՆԵՏԵԼ
          </button>
          <button
            onClick={startNewFrame}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-xl border border-slate-600 transition shrink-0"
            title="Հաջորդ հարցը"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Visual Feedback Line */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400 shrink-0" />
          <span className={`text-sm ${feedbackColor}`}>{feedback}</span>
        </div>
        <div className="text-xs font-mono text-slate-500">
          Նետումներ: {rollsCount}
        </div>
      </div>
    </div>
  );
}
