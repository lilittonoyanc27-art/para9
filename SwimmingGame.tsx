import { useEffect, useState } from 'react';
import { IMPERFECTO_EXCEPTIONS, INDEFINIDO_EXCEPTIONS, PERFECTO_EXCEPTIONS } from './data';
import { Trophy, HelpCircle, AlertCircle, Waves, Timer } from 'lucide-react';

interface SwimmingGameProps {
  playerGor: { name: string; score: number };
  playerGayane: { name: string; score: number };
  onUpdateScores: (gorScore: number, gayaneScore: number) => void;
}

interface TFQuestion {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export default function SwimmingGame({
  playerGor,
  playerGayane,
  onUpdateScores
}: SwimmingGameProps) {
  const [activeSegmentPlayer, setActiveSegmentPlayer] = useState<'gor' | 'gayane'>('gor');
  const [questions, setQuestions] = useState<TFQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  
  // Swimming completion distances (0% to 100%)
  const [swimGor, setSwimGor] = useState<number>(10);
  const [swimGayane, setSwimGayane] = useState<number>(10);

  const [round, setRound] = useState<number>(1);
  const [winner, setWinner] = useState<'gor' | 'gayane' | null>(null);
  const [feedback, setFeedback] = useState<string>('Լողի մրցումներ: Գոռի հերթն է: Պատասխանի՛ր արագ՝ առաջ լողալու համար:');
  const [feedbackColor, setFeedbackColor] = useState<string>('text-blue-200');

  // Pool distance cap
  const GOAL_DISTANCE = 100;

  // Build 12 conjugation statements (some true, some false)
  const generateQuestions = (): TFQuestion[] => {
    const list: TFQuestion[] = [];

    // Add some true / false statements from provided tables
    list.push({
      statement: 'Pretérito Imperfecto-ում SER բայի «él» ձևը era-ն է։',
      isTrue: true,
      explanation: 'Ճիշտ է։ ser -> yo era, tú eras, él era...'
    });
    list.push({
      statement: 'Pretérito Perfecto-ում decir բայի participio-ն decido-ն է։',
      isTrue: false,
      explanation: 'Սխալ է։ decir բայի participio-ն dicho-ն է։'
    });
    list.push({
      statement: 'IR (գնալ) և SER (լինել) բայերը Pretérito Indefinido-ում ունեն նույն ձևերը (fui, fuiste, fue...)։',
      isTrue: true,
      explanation: 'Ճիշտ է։ Դրանք ամբողջությամբ համընկնում են։'
    });
    list.push({
      statement: '«Puse el libro en la mesa» նշանակում է «Գիրքը դրեցի սեղանի վրա»։',
      isTrue: true,
      explanation: 'Ճիշտ է։ poner -> yo puse (դրեցի)։'
    });
    list.push({
      statement: 'hacer (անել) բայի yo ձևը Pretérito Indefinido-ում hico-ն է։',
      isTrue: false,
      explanation: 'Սխալ է։ Ճիշտ տարբերակն է hice, իսկ hizo-ն él ձևն է։'
    });
    list.push({
      statement: 'Pluscuamperfecto ժամանակը կազմվում է haber բայով (había) և participio-ով։',
      isTrue: true,
      explanation: 'Ճիշտ է։ Օրինակ՝ había hablado (խոսել էի)։'
    });
    list.push({
      statement: 'dormir (քնել) բայի él ձևում Indefinido-ում o-ն դառնում է u՝ durmió։',
      isTrue: true,
      explanation: 'Ճիշտ է։ e->i և o->u փոփոխությունները տեղի են ունենում միայն -ir բայերի 3-րդ դեմքում։'
    });
    list.push({
      statement: 'volver (վերադառնալ) բայի participio-ն volvido-ն է։',
      isTrue: false,
      explanation: 'Սխալ է։ volvido չկա, ճիշտը vuelve -> vuelto-ն է։'
    });
    list.push({
      statement: 'buscar բայի yo ձևը Indefinido-ում busqué-ն է:',
      isTrue: true,
      explanation: 'Ճիշտ է։ c->qu փոփոխությունը պահպանում է [k] հնչյունը։'
    });
    list.push({
      statement: 'decir բայի yo ձևը Indefinido-ում decí-ն է։',
      isTrue: false,
      explanation: 'Սխալ է։ dizer -> dije է։'
    });
    list.push({
      statement: 'destruir (ոչնչացնել) բայի ellos ձևը Indefinido-ում destruyeron-ն է։',
      isTrue: true,
      explanation: 'Ճիշտ է։ -UIR բայերում հայտնվում է y տառը։'
    });
    list.push({
      statement: 'ver բայի participio-ն visto-ն է։',
      isTrue: true,
      explanation: 'Ճիշտ է՝ visto (տեսած)։'
    });

    return list.sort(() => 0.5 - Math.random());
  };

  useEffect(() => {
    setQuestions(generateQuestions());
    setSwimGor(10);
    setSwimGayane(10);
    setRound(1);
    setCurrentIdx(0);
    setWinner(null);
    setActiveSegmentPlayer('gor');
  }, []);

  const handleTFReply = (reply: boolean) => {
    if (winner || questions.length === 0) return;

    const currentQ = questions[currentIdx];
    const isCorrect = reply === currentQ.isTrue;

    if (isCorrect) {
      if (activeSegmentPlayer === 'gor') {
        const d = Math.min(GOAL_DISTANCE, swimGor + 20);
        setSwimGor(d);
        setFeedback(`🏊‍♂️ Ճիշտ պատասխան: Գոռը սլացավ առաջ: (${currentQ.explanation})`);
        setFeedbackColor('text-emerald-400 font-bold');
        if (d >= GOAL_DISTANCE) {
          setWinner('gor');
          onUpdateScores(playerGor.score + 25, playerGayane.score);
        }
      } else {
        const d = Math.min(GOAL_DISTANCE, swimGayane + 20);
        setSwimGayane(d);
        setFeedback(`🏊‍♀️ Ճիշտ պատասխան: Գայանեն սլացավ առաջ: (${currentQ.explanation})`);
        setFeedbackColor('text-emerald-400 font-bold');
        if (d >= GOAL_DISTANCE) {
          setWinner('gayane');
          onUpdateScores(playerGor.score, playerGayane.score + 25);
        }
      }
    } else {
      setFeedback(`❌ Ո՛չ, սխալվեցիր: ${currentQ.explanation}`);
      setFeedbackColor('text-rose-400');
    }

    // Move to next turn segment
    setTimeout(() => {
      // Toggle player so they play turn-by-turn sequence
      setActiveSegmentPlayer(prev => (prev === 'gor' ? 'gayane' : 'gor'));

      // Cycle questions
      const nextIdx = (currentIdx + 1) % questions.length;
      setCurrentIdx(nextIdx);

      // Increment round
      if (activeSegmentPlayer === 'gayane') {
        setRound(r => r + 1);
      }
    }, 1800);
  };

  const restartSwimMeet = () => {
    setQuestions(generateQuestions());
    setSwimGor(10);
    setSwimGayane(10);
    setRound(1);
    setCurrentIdx(0);
    setWinner(null);
    setActiveSegmentPlayer('gor');
    setFeedback('Նոր մեկնարկը տրվեց: Գոռը պատրա՛ստ է:');
    setFeedbackColor('text-slate-300');
  };

  return (
    <div className="bg-slate-900 border border-blue-500/20 rounded-2xl p-6 shadow-2xl">
      {/* Swimming Lanes UI */}
      <div className="relative bg-slate-950 p-6 rounded-2xl mb-6 border-b-4 border-blue-600/30 overflow-hidden">
        
        {/* Pool overhead lanes container */}
        <div className="flex flex-col gap-6 relative">
          {/* Lanes decorative water ripples background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* LANE 1: Gor */}
          <div className="relative h-20 bg-gradient-to-r from-blue-950/80 to-blue-900/40 rounded-xl px-4 flex items-center border border-sky-500/10">
            {/* Lane string guide */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-white to-red-500 opacity-60" />

            {/* Gor Swimmer Icon */}
            <div
              className="absolute transition-all duration-700 ease-out flex items-center gap-2"
              style={{ left: `${swimGor}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono bg-red-600 text-white uppercase font-black px-1.5 py-0.5 rounded shadow">
                  ԳՈՌ (RED)
                </span>
                
                {/* 2D Swimmer Body */}
                <div className="relative flex items-center justify-center bg-sky-400 border-2 border-red-500 w-12 h-12 rounded-full shadow-lg">
                  <span className="text-xl">🏊‍♂️</span>
                  <Waves className="absolute w-12 h-12 text-blue-300 animate-spin opacity-40" />
                </div>
              </div>
            </div>

            {/* Goal Wall flags */}
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-b from-blue-500 via-sky-300 to-blue-500 flex items-center justify-center rounded-r-xl border-l border-white/20">
              <span className="text-[10px] text-white font-black rotate-90 scale-90 select-none">100m</span>
            </div>
          </div>

          {/* LANE 2: Gayane */}
          <div className="relative h-20 bg-gradient-to-r from-blue-950/80 to-blue-900/40 rounded-xl px-4 flex items-center border border-sky-500/10">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-white to-red-500 opacity-60" />

            {/* Gayane Swimmer Icon */}
            <div
              className="absolute transition-all duration-700 ease-out flex items-center gap-2"
              style={{ left: `${swimGayane}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono bg-blue-600 text-white uppercase font-black px-1.5 py-0.5 rounded shadow">
                  ԳԱՅԱՆԵ (BLUE)
                </span>
                
                <div className="relative flex items-center justify-center bg-sky-400 border-2 border-blue-500 w-12 h-12 rounded-full shadow-lg">
                  <span className="text-xl">🏊‍♀️</span>
                  <Waves className="absolute w-12 h-12 text-blue-300 animate-spin opacity-40" />
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-b from-blue-500 via-sky-300 to-blue-500 flex items-center justify-center rounded-r-xl border-l border-white/20">
              <span className="text-[10px] text-white font-black rotate-90 scale-90 select-none">100m</span>
            </div>
          </div>

        </div>

        {/* Milestone values */}
        <div className="flex justify-between mt-3 text-[10px] text-slate-500 font-mono px-2">
          <span>ՄԵԿՆԱՐԿ (0m)</span>
          <span>ԿԵՍ-ՃԱՆԱՊԱՐՀ (50m)</span>
          <span className="text-sky-400 font-bold">ՎԵՐՋՆԱԳԻԾ (100m)</span>
        </div>
      </div>

      {/* Match status header */}
      <div className="flex justify-between items-center bg-slate-800/50 border border-slate-700 px-4 py-3 rounded-xl mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Timer className="w-4 h-4 text-sky-400" />
          <span>ՌԱՈՒՆԴ {round} · ՀԱՐՑ {currentIdx + 1}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">ԼՈՂՈՒՄ Է՝</span>
          <div className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase text-white shadow-md ${
            activeSegmentPlayer === 'gor' ? 'bg-red-500 shadow-red-500/15' : 'bg-blue-500 shadow-blue-500/15'
          }`}>
            🏊 {activeSegmentPlayer === 'gor' ? 'ԳՈՌԸ' : 'ԳԱՅԱՆԵՆ'}
          </div>
        </div>
      </div>

      {/* Swim Finish Pod */}
      {winner && (
        <div className="p-6 bg-slate-800 border border-blue-500/50 text-center rounded-2xl mb-6 animate-bounce">
          <Trophy className="w-14 h-14 text-yellow-400 mx-auto mb-3 animate-pulse" />
          <h3 className="text-2xl font-extrabold text-white">
            🥇 ԼՈՂԻ ՄՐՑՈՒՅԹԻ ՀԱՂԹՈՂ՝ {winner === 'gor' ? 'ԳՈՌ' : 'ԳԱՅԱՆԵ'}
          </h3>
          <p className="text-slate-300 text-sm mt-1">
            {winner === 'gor' ? 'Գոռը' : 'Գայանեն'} առաջինը լողացավ 100 մետրը և նվաճեց ոսկե մեդալը (+25 միավոր)։
          </p>
          <button
            onClick={restartSwimMeet}
            className="mt-4 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black py-2 px-5 rounded-lg text-xs tracking-wider"
          >
            ՆՈՐ ՍԼԱՑՔ
          </button>
        </div>
      )}

      {/* True or False conjugation challenge prompt */}
      {!winner && questions.length > 0 && (
        <div className="bg-slate-800 border border-slate-700/80 p-6 rounded-2xl mb-6">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-mono mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>ՊՆԴՈՒՄ (STATEMENT)</span>
          </div>
          
          <h3 className="text-lg font-black text-white leading-relaxed">
            {questions[currentIdx].statement}
          </h3>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => handleTFReply(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base py-4 rounded-xl shadow-lg border border-emerald-500 hover:scale-[1.02] transform transition-all active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="text-2xl">👍</span>
              <span>ՃԻՇՏ Է (TRUE)</span>
            </button>

            <button
              onClick={() => handleTFReply(false)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base py-4 rounded-xl shadow-lg border border-rose-500 hover:scale-[1.02] transform transition-all active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="text-2xl">👎</span>
              <span>ՍԽԱԼ Է (FALSE)</span>
            </button>
          </div>
        </div>
      )}

      {/* Alert logs and swim statistics */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-sky-400 shrink-0" />
          <span className={`text-xs font-mono ${feedbackColor}`}>{feedback}</span>
        </div>
        <div className="text-xs text-slate-500 font-mono whitespace-nowrap">
          Gor: {swimGor}m · Gayane: {swimGayane}m
        </div>
      </div>
    </div>
  );
}
