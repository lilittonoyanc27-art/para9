import { useEffect, useState } from 'react';
import { getRandomQuizQuestions, QuizQuestion } from './data';
import { Trophy, HelpCircle, Zap, FastForward, Info } from 'lucide-react';

interface RacingGameProps {
  playerGor: { name: string; score: number };
  playerGayane: { name: string; score: number };
  onUpdateScores: (gorScore: number, gayaneScore: number) => void;
}

export default function RacingGame({
  playerGor,
  playerGayane,
  onUpdateScores
}: RacingGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [questionList, setQuestionList] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState<number>(0);

  // Cars positions in meters (0 to 300)
  const [posGor, setPosGor] = useState<number>(20);
  const [posGayane, setPosGayane] = useState<number>(20);

  const [winner, setWinner] = useState<'gor' | 'gayane' | null>(null);
  const [feedback, setFeedback] = useState<string>('Սկսե՛լ մրցույթը: Ով առաջինը ճիշտ պատասխանի, նրա ավտոմեքենան կառաջանա:');
  const [feedbackColor, setFeedbackColor] = useState<string>('text-amber-400');

  const FINISH_LINE = 300;

  // Initialize questions
  const loadNextQuestions = () => {
    const list = getRandomQuizQuestions(25);
    setQuestionList(list);
    setQIndex(0);
    setCurrentQuestion(list[0]);
    setPosGor(20);
    setPosGayane(20);
    setWinner(null);
    setFeedback('Նոր մրցավազքը պատրաստ է: Մրցակիցնե՛ր, պատրաստվե՛ք:');
    setFeedbackColor('text-slate-300');
  };

  useEffect(() => {
    loadNextQuestions();
  }, []);

  // Keyboard controls listener for swift buzzer action
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (winner || !currentQuestion) return;

      const key = e.key.toLowerCase();
      // Gor keys: q, w, e, r mapped to indices 0, 1, 2, 3
      const gorKeys = ['q', 'w', 'e', 'r'];
      // Gayane keys: u, i, o, p mapped to indices 0, 1, 2, 3
      const gayaneKeys = ['u', 'i', 'o', 'p'];

      if (gorKeys.includes(key)) {
        const optionIdx = gorKeys.indexOf(key);
        if (optionIdx < currentQuestion.options.length) {
          handleAnswer('gor', currentQuestion.options[optionIdx]);
        }
      } else if (gayaneKeys.includes(key)) {
        const optionIdx = gayaneKeys.indexOf(key);
        if (optionIdx < currentQuestion.options.length) {
          handleAnswer('gayane', currentQuestion.options[optionIdx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, winner, qIndex, questionList]);

  const handleAnswer = (player: 'gor' | 'gayane', selectedOption: string) => {
    if (winner || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.answer;

    if (isCorrect) {
      if (player === 'gor') {
        const newPos = Math.min(FINISH_LINE, posGor + 40);
        setPosGor(newPos);
        setFeedback(`⚡ ԳՈՌԸ ճիշտ պատասխանեց («${selectedOption}»)! Մեքենան արագացավ:`);
        setFeedbackColor('text-red-400 font-bold');
        if (newPos >= FINISH_LINE && !winner) {
          setWinner('gor');
          onUpdateScores(playerGor.score + 30, playerGayane.score);
        }
      } else {
        const newPos = Math.min(FINISH_LINE, posGayane + 40);
        setPosGayane(newPos);
        setFeedback(`⚡ ԳԱՅԱՆԵՆ ճիշտ պատասխանեց («${selectedOption}»)! Մեքենան արագացավ:`);
        setFeedbackColor('text-blue-400 font-bold');
        if (newPos >= FINISH_LINE && !winner) {
          setWinner('gayane');
          onUpdateScores(playerGor.score, playerGayane.score + 30);
        }
      }

      // Roll to next question
      setTimeout(() => {
        const nextIdx = qIndex + 1;
        if (nextIdx < questionList.length) {
          setQIndex(nextIdx);
          setCurrentQuestion(questionList[nextIdx]);
        } else {
          // Wrap around of questions if long race
          const fresh = getRandomQuizQuestions(15);
          setQuestionList(fresh);
          setQIndex(0);
          setCurrentQuestion(fresh[0]);
        }
      }, 900);

    } else {
      // Wrong answer penalty
      if (player === 'gor') {
        setPosGor(prev => Math.max(20, prev - 25));
        setFeedback(`❌ Գոռը սխալվեց («${selectedOption}»): Մեքենան դանդաղեց:`);
        setFeedbackColor('text-rose-500');
      } else {
        setPosGayane(prev => Math.max(20, prev - 25));
        setFeedback(`❌ Գայանեն սխալվեց («${selectedOption}»): Մեքենան դանդաղեց:`);
        setFeedbackColor('text-rose-500');
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-6 shadow-2xl">
      {/* Visual Racing Track Canvas Simulation (CSS styled grid) */}
      <div className="relative bg-slate-950 border-y-4 border-slate-700/60 p-4 rounded-xl mb-6 overflow-hidden">
        {/* Road Lanes */}
        <div className="relative flex flex-col gap-8 py-4">
          
          {/* Lane 1: Gor (Red) */}
          <div className="relative h-16 flex items-center border-b border-dashed border-slate-700">
            <div className="absolute right-12 top-0 bottom-0 w-2 bg-yellow-400" title="FINISH LINE" />
            <div className="absolute right-6 top-1 bottom-1 text-slate-600 font-mono text-[9px] select-none text-center flex flex-col justify-center animate-pulse">
              🏁<br />F<br />I<br />N<br />I<br />S<br />H
            </div>

            {/* Gor's Car */}
            <div
              className="absolute transition-all duration-500 ease-out flex items-center"
              style={{ left: `${(posGor / FINISH_LINE) * 82}%` }}
            >
              {/* Retro Car Sprite */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-md mb-1 shadow-md">
                  ԳՈՌ
                </span>
                <div className="relative w-16 h-8 bg-gradient-to-r from-red-600 to-red-400 rounded-lg shadow-lg flex items-center justify-between px-2">
                  <div className="w-4 h-2 bg-slate-900 rounded-sm" /> {/* Wheel */}
                  <div className="w-6 h-4 bg-slate-300 opacity-60 rounded-md" /> {/* Cabin wind */}
                  <div className="w-4 h-2 bg-slate-900 rounded-sm" /> {/* Wheel */}
                  {/* Exhaust smoke on speed */}
                  <span className="absolute -left-2 w-2 h-2 rounded-full bg-slate-500 opacity-50 animate-ping" />
                </div>
              </div>
            </div>
          </div>

          {/* Lane 2: Gayane (Yellow) */}
          <div className="relative h-16 flex items-center">
            <div className="absolute right-12 top-0 bottom-0 w-2 bg-yellow-400" />
            <div className="absolute right-6 top-1 bottom-1 text-slate-600 font-mono text-[9px] select-none text-center flex flex-col justify-center animate-pulse">
              🏁<br />F<br />I<br />N<br />I<br />S<br />H
            </div>

            {/* Gayane's Car */}
            <div
              className="absolute transition-all duration-500 ease-out flex items-center"
              style={{ left: `${(posGayane / FINISH_LINE) * 82}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-md mb-1 shadow-md">
                  ԳԱՅԱՆԵ
                </span>
                <div className="relative w-16 h-8 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-lg shadow-lg flex items-center justify-between px-2">
                  <div className="w-4 h-2 bg-slate-900 rounded-sm" /> {/* Wheel */}
                  <div className="w-6 h-4 bg-slate-300 opacity-60 rounded-md" /> {/* Cabin wind */}
                  <div className="w-4 h-2 bg-slate-900 rounded-sm" /> {/* Wheel */}
                  <span className="absolute -left-2 w-2 h-2 rounded-full bg-slate-500 opacity-50 animate-ping" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Milestone flags */}
        <div className="flex justify-between text-[11px] text-slate-600 font-mono px-2 mt-2">
          <span>START</span>
          <span>100m</span>
          <span>200m</span>
          <span className="text-yellow-400 font-bold">FINISH (300m)</span>
        </div>
      </div>

      {/* Checkered Winner Screen */}
      {winner && (
        <div className="p-6 bg-slate-800/90 border border-yellow-500 text-center rounded-2xl mb-6 shadow-2xl animate-bounce">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3 animate-pulse" />
          <h3 className="text-3xl font-black text-white">
            🏆 ՄՐՑԱՎԱԶՔԻ ՀԱՂԹՈՂ՝ {winner === 'gor' ? 'ԳՈՌ' : 'ԳԱՅԱՆԵ'}
          </h3>
          <p className="text-slate-300 mt-2 text-sm">
            {winner === 'gor' ? 'Գոռի' : 'Գայանեի'} կայծակնային արագությամբ մեքենան առաջինը հատեց ֆինիշի գիծը (+30 միավոր):
          </p>
          <button
            onClick={loadNextQuestions}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-black py-2.5 px-6 rounded-xl shadow-lg shadow-yellow-500/20 transition-all text-sm uppercase"
          >
            ԿՐԿԻՆ ԽԱՂԱԼ
          </button>
        </div>
      )}

      {/* Central Question Deck */}
      {!winner && currentQuestion && (
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
            <HelpCircle className="w-4 h-4 text-rose-400" />
            <span>ՀԱՐՑ {qIndex + 1}-ՐԴ</span>
          </div>
          <h2 className="text-xl font-black text-white leading-relaxed">
            {currentQuestion.question}
          </h2>
          {currentQuestion.context && (
            <p className="text-slate-400 italic text-xs mt-1 bg-slate-900/40 p-2 rounded-lg">
              🎯 Օրինակ՝ {currentQuestion.context}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500 font-mono bg-slate-950/60 px-3 py-1.5 rounded-md">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Հուշում. Գոռը կարող է արագ սեղմել ստեղնաշարի <b className="text-red-400">Q, W, E, R</b> տառերը, իսկ Գայանեն ՝ <b className="text-blue-400">U, I, O, P</b>:
            </span>
          </div>
        </div>
      )}

      {/* Head-to-Head Double Playing Control Decks */}
      {!winner && currentQuestion && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left panel: Gor Dashboard */}
          <div className="bg-slate-950/50 border border-red-500/10 p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono text-slate-400">ԳՈՌԻ ՎԱՀԱՆԱԿ</span>
              <span className="text-[10px] bg-red-500/25 text-red-400 uppercase font-bold px-2 py-0.5 rounded">
                Կառավարում: Q, W, E, R
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((opt, i) => {
                const keys = ['Q', 'W', 'E', 'R'];
                return (
                  <button
                    key={`gor-opt-${i}`}
                    onClick={() => handleAnswer('gor', opt)}
                    className="bg-slate-800 hover:bg-slate-700/80 active:bg-red-500/10 border border-slate-700 hover:border-red-500 text-left p-3.5 rounded-xl transition-all transform active:scale-95 text-sm text-slate-200 font-medium flex items-center justify-between gap-2"
                  >
                    <span>{opt}</span>
                    <span className="text-[9px] font-mono bg-red-500/10 text-red-400 border border-red-500/30 w-5 h-5 flex items-center justify-center rounded">
                      {keys[i]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Gayane Dashboard */}
          <div className="bg-slate-950/50 border border-blue-500/10 p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono text-slate-400">ԳԱՅԱՆԵԻ ՎԱՀԱՆԱԿ</span>
              <span className="text-[10px] bg-blue-500/25 text-blue-400 uppercase font-bold px-2 py-0.5 rounded">
                Կառավարում: U, I, O, P
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((opt, i) => {
                const keys = ['U', 'I', 'O', 'P'];
                return (
                  <button
                    key={`gayane-opt-${i}`}
                    onClick={() => handleAnswer('gayane', opt)}
                    className="bg-slate-800 hover:bg-slate-700/80 active:bg-blue-500/10 border border-slate-700 hover:border-blue-500 text-left p-3.5 rounded-xl transition-all transform active:scale-95 text-sm text-slate-200 font-medium flex items-center justify-between gap-2"
                  >
                    <span>{opt}</span>
                    <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 w-5 h-5 flex items-center justify-center rounded">
                      {keys[i]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Dynamic Action Live Feed Log */}
      <div className="mt-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400 animate-bounce shrink-0" />
          <span className={feedbackColor}>{feedback}</span>
        </div>
      </div>
    </div>
  );
}
