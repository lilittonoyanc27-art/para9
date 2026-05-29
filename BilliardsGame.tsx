import { useEffect, useRef, useState } from 'react';
import { PERFECTO_EXCEPTIONS } from './data';
import { BilliardsBall } from './types';
import { Target, RotateCcw, HelpCircle, Trophy } from 'lucide-react';

interface BilliardsGameProps {
  playerGor: { name: string; score: number };
  playerGayane: { name: string; score: number };
  onUpdateScores: (gorScore: number, gayaneScore: number) => void;
}

export default function BilliardsGame({
  playerGor,
  playerGayane,
  onUpdateScores
}: BilliardsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePlayer, setActivePlayer] = useState<'gor' | 'gayane'>('gor');
  const [currentTarget, setCurrentTarget] = useState<typeof PERFECTO_EXCEPTIONS[0] | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackColor, setFeedbackColor] = useState<string>('text-gray-400');
  const [shotCount, setShotCount] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Turn management and reactive outcome handlers
  const hasScoredThisTurn = useRef<boolean>(false);
  const prevIsRolling = useRef<boolean>(false);

  // Cue Stick States
  const [isAiming, setIsAiming] = useState<boolean>(false);
  const [aimAngle, setAimAngle] = useState<number>(0);
  const [aimPower, setAimPower] = useState<number>(50); // 10 to 120

  const ballsRef = useRef<BilliardsBall[]>([]);
  const cueBallRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number }>({
    x: 150,
    y: 175,
    vx: 0,
    vy: 0,
    radius: 12
  });

  const POCKETS = [
    { x: 15, y: 15 },
    { x: 300, y: 10 },
    { x: 585, y: 15 },
    { x: 15, y: 335 },
    { x: 300, y: 340 },
    { x: 585, y: 335 }
  ];

  const TABLE_WIDTH = 600;
  const TABLE_HEIGHT = 350;

  // Initialize fresh round
  const startNewRound = () => {
    // Select a random target
    const targetIdx = Math.floor(Math.random() * PERFECTO_EXCEPTIONS.length);
    const target = PERFECTO_EXCEPTIONS[targetIdx];
    setCurrentTarget(target);

    // Setup cue ball
    cueBallRef.current = {
      x: 150,
      y: 175,
      vx: 0,
      vy: 0,
      radius: 12
    };

    // Create target balls with written Spanish infinitives
    const availableVerbs = PERFECTO_EXCEPTIONS.map(e => e.latin);
    // Shuffle other options
    const targetVerb = target.latin;
    const shuffledVerbs = availableVerbs.filter(v => v !== targetVerb).sort(() => 0.5 - Math.random());
    const roundVerbs = [targetVerb, ...shuffledVerbs.slice(0, 5)]; // 6 balls total
    
    // Sort so target isn't always first
    roundVerbs.sort(() => 0.5 - Math.random());

    const colors = [
      '#EF4444', // Red
      '#F59E0B', // Amber
      '#3B82F6', // Blue
      '#10B981', // Green
      '#8B5CF6', // Purple
      '#EC4899'  // Pink
    ];

    const balls: BilliardsBall[] = [];
    const stepX = 40;
    const startX = 380;
    const startY = 175;

    // Arrange balls in a simple triangular wedge
    let ballIdx = 0;
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row <= col; row++) {
        const x = startX + col * stepX;
        const y = startY + (row - col / 2) * 45;
        const verb = roundVerbs[ballIdx] || 'ver';
        const match = PERFECTO_EXCEPTIONS.find(e => e.latin === verb);
        
        balls.push({
          id: ballIdx + 1,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 12,
          color: colors[ballIdx % colors.length],
          word: verb,
          meaning: match ? match.meaning : '',
          isCorrect: verb === targetVerb,
          pocketed: false
        });
        ballIdx++;
      }
    }
    ballsRef.current = balls;
    setFeedback(`Միավորի համար մտցրու այն գնդակը, որի անորոշ դերբայը (infinitivo) համապատասխանում է «${target.participle}»-ին:`);
    setFeedbackColor('text-amber-300 font-medium');
    setIsRolling(false);
  };

  useEffect(() => {
    startNewRound();
  }, []);

  // Main Canvas Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updatePhysics = () => {
      let moving = false;
      const allObjects = [cueBallRef.current, ...ballsRef.current.filter(b => !b.pocketed)];

      // Apply positions
      allObjects.forEach(obj => {
        obj.x += obj.vx;
        obj.y += obj.vy;

        // Friction
        obj.vx *= 0.985;
        obj.vy *= 0.985;

        // Stop if extremely slow
        if (Math.abs(obj.vx) < 0.05) obj.vx = 0;
        if (Math.abs(obj.vy) < 0.05) obj.vy = 0;

        if (obj.vx !== 0 || obj.vy !== 0) {
          moving = true;
        }

        // Boundary collision check
        const bounce = -0.8;
        const leftLimit = 25;
        const rightLimit = TABLE_WIDTH - 25;
        const topLimit = 25;
        const bottomLimit = TABLE_HEIGHT - 25;

        if (obj.x - obj.radius < leftLimit) {
          obj.x = leftLimit + obj.radius;
          obj.vx *= bounce;
        } else if (obj.x + obj.radius > rightLimit) {
          obj.x = rightLimit - obj.radius;
          obj.vx *= bounce;
        }

        if (obj.y - obj.radius < topLimit) {
          obj.y = topLimit + obj.radius;
          obj.vy *= bounce;
        } else if (obj.y + obj.radius > bottomLimit) {
          obj.y = bottomLimit - obj.radius;
          obj.vy *= bounce;
        }
      });

      // Handle ball-to-ball collisions (simple elastic physics)
      for (let i = 0; i < allObjects.length; i++) {
        for (let j = i + 1; j < allObjects.length; j++) {
          const b1 = allObjects[i];
          const b2 = allObjects[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist) {
            // Overlap resolution
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            b1.x -= nx * overlap * 0.5;
            b1.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;

            // Elastic collision calculations
            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / 2; // Equal mass assumption

            b1.vx -= p * nx;
            b1.vy -= p * ny;
            b2.vx += p * nx;
            b2.vy += p * ny;

            // Check if white ball (i === 0) hit the correct answer ball
            if (i === 0) {
              const targetBall = b2 as any;
              if (targetBall.isCorrect && !targetBall.pocketed) {
                targetBall.pocketed = true;
                targetBall.vx = 0;
                targetBall.vy = 0;
                hasScoredThisTurn.current = true;
                
                // Award point and correct answer
                setFeedback(`Կեցցե՛ք: ${activePlayer === 'gor' ? 'Գոռը' : 'Գայանեն'} դիպավ ճիշտ գնդակին («${targetBall.word}» -> «${currentTarget?.participle}»): +20 միավոր:`);
                setFeedbackColor('text-green-400 font-bold text-lg animate-bounce');
                
                if (activePlayer === 'gor') {
                  onUpdateScores(playerGor.score + 20, playerGayane.score);
                } else {
                  onUpdateScores(playerGor.score, playerGayane.score + 20);
                }
                
                setTimeout(() => {
                  startNewRound();
                }, 1800);
              }
            }
          }
        }
      }

      // Check pocket status
      ballsRef.current.forEach(ball => {
        if (!ball.pocketed) {
          POCKETS.forEach(poc => {
            const dist = Math.hypot(ball.x - poc.x, ball.y - poc.y);
            if (dist < 20) {
              ball.pocketed = true;
              ball.vx = 0;
              ball.vy = 0;
              handlePocketedBall(ball);
            }
          });
        }
      });

      // Cue ball pocketed resolution (respawn)
      POCKETS.forEach(poc => {
        const cueDist = Math.hypot(cueBallRef.current.x - poc.x, cueBallRef.current.y - poc.y);
        if (cueDist < 20) {
          cueBallRef.current.x = 150;
          cueBallRef.current.y = 175;
          cueBallRef.current.vx = 0;
          cueBallRef.current.vy = 0;
          setFeedback('Սպիտակ գնդակն ընկավ փոսը: Տուգա՛նք -5 միավոր:');
          setFeedbackColor('text-red-400 font-bold animate-pulse');
          // Deduct score
          if (activePlayer === 'gor') {
            onUpdateScores(Math.max(0, playerGor.score - 5), playerGayane.score);
          } else {
            onUpdateScores(playerGor.score, Math.max(0, playerGayane.score - 5));
          }
        }
      });

      setIsRolling(moving);
    };

    const handlePocketedBall = (ball: BilliardsBall) => {
      if (ball.isCorrect) {
        hasScoredThisTurn.current = true;
        setFeedback(`Կեցցե՛ք: ${activePlayer === 'gor' ? 'Գոռը' : 'Գայանեն'} ճիշտ գնդակը գցեց փոսը («${ball.word}» -> «${currentTarget?.participle}»): +20 միավոր:`);
        setFeedbackColor('text-green-400 font-bold text-lg animate-bounce');
        if (activePlayer === 'gor') {
          onUpdateScores(playerGor.score + 20, playerGayane.score);
        } else {
          onUpdateScores(playerGor.score, playerGayane.score + 20);
        }
        setTimeout(() => {
          startNewRound();
        }, 1800);
      } else {
        setFeedback(`Սխա՛լ գնդակ: «${ball.word}»-ը չի համապատասխանում «${currentTarget?.participle}»-ին: -10 միավոր:`);
        setFeedbackColor('text-red-400 font-bold');
        if (activePlayer === 'gor') {
          onUpdateScores(Math.max(0, playerGor.score - 10), playerGayane.score);
        } else {
          onUpdateScores(playerGor.score, Math.max(0, playerGayane.score - 10));
        }
        // Change player turn
        setActivePlayer(activePlayer === 'gor' ? 'gayane' : 'gor');
      }
    };

    const drawTable = () => {
      // Clear
      ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      // Wooden outer cushion border
      ctx.fillStyle = '#653D1C';
      ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      // Green table felt
      ctx.fillStyle = '#065F46';
      ctx.fillRect(15, 15, TABLE_WIDTH - 30, TABLE_HEIGHT - 30);

      // Draw table markings (half line)
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(300, 15);
      ctx.lineTo(300, TABLE_HEIGHT - 15);
      ctx.stroke();

      // D-zone outline on the left
      ctx.beginPath();
      ctx.arc(150, 175, 50, 0.5 * Math.PI, 1.5 * Math.PI);
      ctx.stroke();

      // Pockets
      POCKETS.forEach(poc => {
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(poc.x, poc.y, 16, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw target balls
      ballsRef.current.forEach(ball => {
        if (!ball.pocketed) {
          // Ball body
          ctx.fillStyle = ball.color;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
          ctx.fill();

          // Highlight shine
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.beginPath();
          ctx.arc(ball.x - 3, ball.y - 3, 3, 0, 2 * Math.PI);
          ctx.fill();

          // Verb Label Card background shadow
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, 7, 0, 2 * Math.PI);
          ctx.fill();

          // Word Text
          ctx.fillStyle = '#111827';
          ctx.font = 'bold 8px Inter, system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ball.word.slice(0, 3).toUpperCase(), ball.x, ball.y);

          // Full hovering translated label above the ball
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '9px Inter';
          ctx.fillText(ball.word, ball.x, ball.y - 18);
        }
      });

      // Draw Cue Ball (White)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cueBallRef.current.x, cueBallRef.current.y, cueBallRef.current.radius, 0, 2 * Math.PI);
      ctx.fill();

      // Shadow overlay
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.arc(cueBallRef.current.x, cueBallRef.current.y, cueBallRef.current.radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw aiming stick if aiming
      if (isAiming && !isRolling) {
        const dx = Math.cos(aimAngle);
        const dy = Math.sin(aimAngle);

        // Vector guide arrow line in front
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(cueBallRef.current.x, cueBallRef.current.y);
        ctx.lineTo(cueBallRef.current.x + dx * (aimPower * 2), cueBallRef.current.y + dy * (aimPower * 2));
        ctx.stroke();
        ctx.setLineDash([]);

        // Wooden cue stick drawn behind cue ball
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cueBallRef.current.x - dx * 30, cueBallRef.current.y - dy * 30);
        ctx.lineTo(cueBallRef.current.x - dx * 180, cueBallRef.current.y - dy * 180);
        ctx.stroke();

        // Tip of the cue stick (cream/ivory)
        ctx.strokeStyle = '#FEF3C7';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cueBallRef.current.x - dx * 25, cueBallRef.current.y - dy * 25);
        ctx.lineTo(cueBallRef.current.x - dx * 30, cueBallRef.current.y - dy * 30);
        ctx.stroke();
      }
    };

    const mainLoop = () => {
      updatePhysics();
      drawTable();
      animationFrameId = requestAnimationFrame(mainLoop);
    };

    mainLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAiming, aimAngle, aimPower, currentTarget, activePlayer, isRolling]);

  // Handle striking
  const handleStrike = () => {
    if (isRolling) return;
    hasScoredThisTurn.current = false;
    const force = (aimPower / 100) * 15;
    cueBallRef.current.vx = Math.cos(aimAngle) * force;
    cueBallRef.current.vy = Math.sin(aimAngle) * force;
    setShotCount(prev => prev + 1);
    setIsAiming(false);
  };

  // Monitor balls roll to check turn continuation or swap
  useEffect(() => {
    if (prevIsRolling.current && !isRolling) {
      if (!hasScoredThisTurn.current) {
        setActivePlayer(curr => (curr === 'gor' ? 'gayane' : 'gor'));

        // Select a new random target exception
        const targetIdx = Math.floor(Math.random() * PERFECTO_EXCEPTIONS.length);
        const newTarget = PERFECTO_EXCEPTIONS[targetIdx];
        setCurrentTarget(newTarget);

        const targetVerb = newTarget.latin;

        // Shuffle other options for the rest of the balls
        const availableVerbs = PERFECTO_EXCEPTIONS.map(e => e.latin);
        const shuffledOthers = availableVerbs.filter(v => v !== targetVerb).sort(() => 0.5 - Math.random());

        // Update words of remaining active (unpocketed) balls dynamically to match the new target
        const activeBalls = ballsRef.current.filter(b => !b.pocketed);
        if (activeBalls.length > 0) {
          // Select one random ball of the remaining ones to be the designated correct ball
          const correctBallIdx = Math.floor(Math.random() * activeBalls.length);
          activeBalls.forEach((ball, idx) => {
            if (idx === correctBallIdx) {
              ball.word = targetVerb;
              ball.isCorrect = true;
              ball.meaning = newTarget.meaning;
            } else {
              const alternativeVerb = shuffledOthers[idx % shuffledOthers.length];
              const match = PERFECTO_EXCEPTIONS.find(e => e.latin === alternativeVerb);
              ball.word = alternativeVerb;
              ball.isCorrect = false;
              ball.meaning = match ? match.meaning : '';
            }
          });
        }

        setFeedback(`Շեղ հարված կամ բացթողում: Գնդակների բայերը փոխվեցին: Նոր թիրախ՝ «${newTarget.participle}»-ն է:`);
        setFeedbackColor('text-rose-400 font-semibold');
      } else {
        setFeedback(`Կեցցե՛ք! ${activePlayer === 'gor' ? 'Գոռը' : 'Գայանեն'} վաստակեց միավոր և շարունակում է խաղը:`);
        setFeedbackColor('text-emerald-400 font-extrabold');
      }
    }
    prevIsRolling.current = isRolling;
  }, [isRolling, activePlayer]);

  return (
    <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl overflow-hidden relative">
      {/* Target prompt card */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Թիրախային Դերբայ / Participle</div>
            <div className="text-2xl font-black text-white flex items-center gap-2">
              <span className="text-emerald-400">{currentTarget?.participle}</span>
              <span className="text-sm font-normal text-slate-400">({currentTarget?.meaning})</span>
            </div>
          </div>
        </div>

        {/* Competitor status badges */}
        <div className="flex items-center gap-6">
          <div className={`p-3 rounded-xl transition ${activePlayer === 'gor' ? 'bg-red-500/35 ring-2 ring-red-500' : 'bg-slate-700/40 opacity-70'}`}>
            <div className="text-xs font-mono text-slate-400">Խոցողը & Միավորները</div>
            <div className="font-extrabold text-white text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              ԳՈՌ: <span className="text-red-400 font-mono">{playerGor.score} / 200</span>
            </div>
          </div>

          <div className="text-xl font-black text-slate-600 font-mono">VS</div>

          <div className={`p-3 rounded-xl transition ${activePlayer === 'gayane' ? 'bg-blue-500/35 ring-2 ring-blue-500' : 'bg-slate-700/40 opacity-70'}`}>
            <div className="text-xs font-mono text-slate-400">Խոցողը & Միավորները</div>
            <div className="font-extrabold text-white text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              ԳԱՅԱՆԵ: <span className="text-blue-400 font-mono">{playerGayane.score} / 200</span>
            </div>
          </div>
        </div>
      </div>

      {/* Billiard Canvas board */}
      <div className="flex justify-center mb-6">
        <div className="relative border-4 border-slate-700 rounded-lg overflow-hidden shadow-xl bg-slate-950">
          <canvas
            ref={canvasRef}
            width={TABLE_WIDTH}
            height={TABLE_HEIGHT}
            className="block max-w-full cursor-crosshair"
            onMouseMove={(e) => {
              if (isRolling) return;
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;

              // Calculate angle from cue ball to mouse
              const angle = Math.atan2(y - cueBallRef.current.y, x - cueBallRef.current.x);
              setAimAngle(angle);
              if (!isAiming) setIsAiming(true);
            }}
            onMouseLeave={() => {
              setIsAiming(false);
            }}
            onClick={handleStrike}
          />

          {isRolling && (
            <div className="absolute top-3 right-3 bg-slate-900/90 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Գնդակներն ընթացքի մեջ են...
            </div>
          )}
        </div>
      </div>

      {/* Cue Aim and Fire panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
        <div className="md:col-span-8 flex flex-col gap-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Ուժգնություն / Power</span>
            <span className="font-bold text-amber-400">{aimPower}%</span>
          </div>
          <input
            type="range"
            min="15"
            max="100"
            value={aimPower}
            disabled={isRolling}
            onChange={(e) => setAimPower(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-700 rounded-lg h-2"
          />
          <div className="text-[10px] text-slate-500 italic mt-1">
            * Շարժե՛ք մկնիկը սեղանի վրայով՝ ուղղությունը կարգավորելու համար, և կատարե՛ք ՔԼԻՔ՝ հարվածելու համար։
          </div>
        </div>

        <div className="md:col-span-4 flex gap-2">
          <button
            onClick={handleStrike}
            disabled={isRolling}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 font-black tracking-wider py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Trophy className="w-5 h-5" />
            ՀԱՐՎԱԾԵԼ
          </button>

          <button
            onClick={startNewRound}
            className="bg-slate-755 hover:bg-slate-700 text-slate-300 p-3 rounded-xl border border-slate-600 flex items-center justify-center transition"
            title="Թարմացնել ռաունդը"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dynamic educational response status bar */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className={`text-sm ${feedbackColor}`}>{feedback}</span>
        </div>
        <div className="text-xs font-mono text-slate-500">
          Հարվածներ: {shotCount}
        </div>
      </div>

      {/* Absolute overlay when a player reaches 200 points */}
      {(playerGor.score >= 200 || playerGayane.score >= 200) && (
        <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <Trophy className="w-20 h-20 text-yellow-500 mb-6 animate-bounce" />
          <h2 className="text-3xl font-black text-white uppercase tracking-tight font-sans">
            🏆 ՄՐՑԱՇԱՐԻ ՀԱՂԹԱՆԱԿ! 🏆
          </h2>
          <p className="text-slate-300 text-lg max-w-md mt-4">
            Շնորհավորո՛ւմ ենք <strong>{playerGor.score >= 200 ? 'ԳՈՌԻՆ' : 'ԳԱՅԱՆԵԻՆ'}</strong>, ով առաջինը հավաքեց <span className="text-emerald-400 font-bold font-mono">200</span> միավոր և դարձավ Բիլիարդի չեմպիոն:
          </p>
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => {
                onUpdateScores(0, 0);
                startNewRound();
              }}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black tracking-widest text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
            >
              ԶՐՈՅԱՑՆԵԼ ՄԻԱՎՈՐՆԵՐԸ & ԽԱՂԱԼ ԿՐԿԻՆ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
