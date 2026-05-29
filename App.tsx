import { useState } from 'react';
import BilliardsGame from './BilliardsGame';
import BowlingGame from './BowlingGame';
import RacingGame from './RacingGame';
import SwimmingGame from './SwimmingGame';
import { THEORY_ARMENIAN } from './data';
import {
  Trophy,
  BookOpen,
  Gamepad2,
  Trash2,
  ChevronRight,
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'games' | 'theory'>('games');
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  // Tournament Player state - Gor & Gayane
  const [playerGor, setPlayerGor] = useState({ name: 'Գոռ', score: 0 });
  const [playerGayane, setPlayerGayane] = useState({ name: 'Գայանե', score: 0 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Update Scoreboards callback
  const handleUpdateScores = (gorScore: number, gayaneScore: number) => {
    setPlayerGor(prev => ({ ...prev, score: gorScore }));
    setPlayerGayane(prev => ({ ...prev, score: gayaneScore }));
  };

  const handleResetTournament = () => {
    setPlayerGor({ name: 'Գոռ', score: 0 });
    setPlayerGayane({ name: 'Գայանե', score: 0 });
    setSelectedGameId(null);
    setShowResetConfirm(false);
  };

  const gameList = [
    {
      id: 1,
      title: 'Բիլիարդ 3D (Billiards)',
      desc: 'Խոցիր այն գնդակները, որոնց վրա գրված է տրված participio-ի ճիշտ infinitivo-ն:',
      emoji: '🎱',
      color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/20 text-emerald-400'
    },
    {
      id: 2,
      title: 'Բոուլինգ 3D (Bowling)',
      desc: 'Կառավարիր գնդակն ու ուղղիր այն այնտեղ, որտեղ տրված բայի իսկական անկանոն participio-ն է:',
      emoji: '🎳',
      color: 'border-purple-500/30 hover:border-purple-500 bg-purple-950/20 text-purple-400'
    },
    {
      id: 3,
      title: 'Ավտոմրցարշավ (Racing)',
      desc: 'Գոռի և Գայանեի մեքենաների արագության մրցույթ: Ով առաջինը արագ ու ճիշտ պատասխանի, կհասնի ֆինիշին:',
      emoji: '🏎️',
      color: 'border-rose-500/30 hover:border-rose-500 bg-rose-950/20 text-rose-400'
    },
    {
      id: 4,
      title: 'Լողավազանի Սպրինտ (Swimming)',
      desc: 'Արագ արձագանքիր True/False (Ճիշտ/Սխալ) հարցերին և սլացիր առաջ լողի մրցաշարում:',
      emoji: '🏊',
      color: 'border-blue-500/30 hover:border-blue-500 bg-blue-950/20 text-blue-400'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-[#2c3e50] font-sans selection:bg-[#c0392b]/20 selection:text-[#c0392b] pb-16">
      
      {/* Upper Brand Header */}
      <header className="bg-[#c0392b] border-b-4 border-[#a93226] text-white shadow-lg sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-[#c0392b] font-serif font-black text-sm shadow-md shrink-0">
              ESP
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase font-sans">
                Իսպաներենի Անցյալ Ժամանակներ
              </h1>
              <p className="text-[11px] text-yellow-100 font-serif italic font-medium">
                Gor vs Gayane • Գրավոր մրցաշար և 4 զվարճալի խաղեր
              </p>
            </div>
          </div>

          {/* Header mini scores & tabs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Quick scoring badges in header */}
            <div className="flex bg-[#a93226] p-1 rounded-xl border border-white/10 gap-1.5 select-none text-[12px]">
              <div className="px-3 py-1 bg-[#c0392b]/60 rounded-lg text-center min-w-[70px] border border-white/5">
                <span className="text-[8px] block text-rose-200 font-bold uppercase tracking-wider">Գոռ</span>
                <span className="font-mono font-bold text-sm text-yellow-300">{playerGor.score}</span>
              </div>
              <div className="px-3 py-1 bg-[#c0392b]/60 rounded-lg text-center min-w-[70px] border border-white/5">
                <span className="text-[8px] block text-rose-200 font-bold uppercase tracking-wider">Գայանե</span>
                <span className="font-mono font-bold text-sm text-yellow-300">{playerGayane.score}</span>
              </div>
            </div>

            {/* Navigation Tab Pills */}
            <div className="flex bg-[#a93226] p-1 rounded-xl border border-white/20 self-stretch md:self-auto justify-center">
              <button
                onClick={() => {
                  setActiveTab('games');
                  setSelectedGameId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wide transition uppercase ${
                  activeTab === 'games'
                    ? 'bg-yellow-400 text-[#c0392b] shadow font-black'
                    : 'text-white hover:text-yellow-105'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Խաղեր
              </button>
              <button
                onClick={() => setActiveTab('theory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wide transition uppercase ${
                  activeTab === 'theory'
                    ? 'bg-yellow-400 text-[#c0392b] shadow font-black'
                    : 'text-white hover:text-yellow-105'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Տեսություն
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tournament Scoreboard Widget */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
        <div className="bg-white border border-[#ebd9ab] rounded-3xl p-6 shadow-md relative overflow-hidden text-[#2c3e50]">
          {/* Subtle background graphics */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c0392b]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Red Player: Gor */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#c0392b] to-red-400 flex items-center justify-center text-white text-3xl font-black shadow-md ring-4 ring-red-100">
                  Գ
                </div>
                {playerGor.score > playerGayane.score && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 border border-[#c0392b]/25 p-1 rounded-full shadow-md text-xs">
                    👑
                  </span>
                )}
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#c0392b] font-black uppercase tracking-wider">Խաղացող 1</div>
                <h3 className="text-xl font-bold font-serif text-[#2c3e50]">ԳՈՌ (Gor)</h3>
                <div className="text-xs text-stone-500 mt-0.5">Արագ արձագանք, սուր միտք</div>
              </div>
            </div>

            {/* Score Tracker Panel */}
            <div className="flex items-center gap-4 bg-[#fcfaf7] border border-[#e6dfcf] p-4 rounded-2xl w-full md:w-auto justify-around shadow-inner min-w-[280px]">
              <div className="text-center">
                <div className="text-[10px] text-stone-500 font-bold mb-1 tracking-wider">ԳՈՌԻ ՄԻԱՎՈՐԸ</div>
                <span className="text-4xl font-extrabold text-[#c0392b] font-mono">{playerGor.score}</span>
              </div>

              <div className="h-10 w-[1px] bg-[#e6dfcf]" />

              <div className="text-center">
                <div className="text-[10px] text-stone-500 font-bold mb-1 tracking-wider">ԳԱՅԱՆԵԻ ՄԻԱՎՈՐԸ</div>
                <span className="text-4xl font-extrabold text-[#2980b9] font-mono">{playerGayane.score}</span>
              </div>

              <div className="h-10 w-[1px] bg-[#e6dfcf]" />

              {/* Tournament Leader Icon */}
              <div className="flex flex-col items-center">
                <Trophy className="w-6 h-6 text-yellow-600 animate-bounce" />
                <span className="text-[9px] text-yellow-700 font-black tracking-widest mt-1">LEADER</span>
              </div>
            </div>

            {/* Blue Player: Gayane */}
            <div className="flex items-center gap-4 w-full md:w-auto md:flex-row-reverse text-left md:text-right font-sans">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#2980b9] to-blue-400 flex items-center justify-center text-white text-3xl font-black shadow-md ring-4 ring-blue-100">
                  Գ
                </div>
                {playerGayane.score > playerGor.score && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 border border-blue-200/50 p-1 rounded-full shadow-md text-xs">
                    👑
                  </span>
                )}
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#2980b9] font-black uppercase tracking-wider">Խաղացող 2</div>
                <h3 className="text-xl font-bold font-serif text-[#2c3e50]">ԳԱՅԱՆԵ (Gayane)</h3>
                <div className="text-xs text-stone-500 mt-0.5">Ճշգրտություն, խորը վերլուծություն</div>
              </div>
            </div>

          </div>

          {/* Reset button inside banner */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-[#ebd9ab] text-[11px] text-stone-500 gap-2 font-sans">
            <span className="italic flex items-center gap-1.5 text-stone-600">
              <Zap className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
              * Յուրաքանչյուր խաղից հետո հաղթողի հիմնական միավորներն ավտոմատ ավելանում են այստեղ:
            </span>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1 text-stone-500 hover:text-[#c0392b] transition font-bold tracking-wider text-[10px]"
                title="Զրոյացնել մրցակցային միավորները"
              >
                <Trash2 className="w-3.5 h-3.5" /> ԶՐՈՅԱՑՆԵԼ ՄԻԱՎՈՐՆԵՐԸ
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
                <span className="text-red-700 font-semibold text-[10px]">Զրոյացնե՞լ.</span>
                <button
                  onClick={handleResetTournament}
                  className="bg-red-600 hover:bg-red-700 text-white rounded px-2 py-0.5 font-bold transition text-[9px]"
                >
                  ԱՅՈ
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 rounded px-2 py-0.5 font-bold transition text-[9px]"
                >
                  ՈՉ
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Container Wrapper */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
        
        {/* TAB 1: Games Hub */}
        {activeTab === 'games' && (
          <div>
            {/* If no game is selected, show beautiful card invitations */}
            {selectedGameId === null ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-[#2c3e50] font-sans">4 Մասնագիտական Խաղեր Գոռի և Գայանեի համար</h2>
                  <p className="text-stone-600 text-sm mt-1 font-serif italic">
                    Ընտրե՛ք մրցույթը և սկսե՛ք մարտահրավերը՝ կիրառելով իսպաներեն անցյալ ժամանակների անկանոն ձևերը։
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gameList.map((game) => {
                    // Custom decorative parameters for the Artistic theme
                    let accentColor = "bg-[#c0392b]";
                    let badgeColor = "bg-red-50 text-red-800 border-red-200/50";
                    let hoverRing = "hover:border-red-400 shadow-sm hover:shadow-md";
                    let tagText = "Լեվել 1";
                    
                    if (game.id === 1) {
                      accentColor = "bg-green-600";
                      badgeColor = "bg-green-50 text-green-800 border-green-200/50";
                      hoverRing = "hover:border-green-400";
                      tagText = "Լեվել 4 🎱";
                    } else if (game.id === 2) {
                      accentColor = "bg-orange-500";
                      badgeColor = "bg-orange-50 text-orange-800 border-orange-200/50";
                      hoverRing = "hover:border-orange-400";
                      tagText = "Լեվել 2 🎳";
                    } else if (game.id === 3) {
                      accentColor = "bg-[#c0392b]";
                      badgeColor = "bg-red-50 text-red-800 border-red-200/50 font-bold";
                      hoverRing = "hover:border-red-400";
                      tagText = "Gor-ը առաջ է 🏎️";
                    } else if (game.id === 4) {
                      accentColor = "bg-blue-500";
                      badgeColor = "bg-blue-50 text-blue-800 border-blue-200/50";
                      hoverRing = "hover:border-blue-400";
                      tagText = "ser, ir, ver 🏊";
                    }

                    return (
                      <div
                        key={game.id}
                        onClick={() => setSelectedGameId(game.id)}
                        className={`bg-white border border-[#e6dfcf] p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 block relative overflow-hidden group ${hoverRing}`}
                      >
                        {/* Artistic line at top margin of card */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${accentColor}`}></div>
                        
                        <div className={`w-14 h-14 rounded-full ${badgeColor} border flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                          {game.emoji}
                        </div>
                        
                        <h3 className="text-lg font-black text-[#2c3e50] mb-2 flex items-center gap-1.5 font-sans group-hover:text-[#c0392b] transition-colors">
                          {game.title}
                          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-stone-500 text-xs leading-relaxed font-sans mb-12">
                          {game.desc}
                        </p>

                        {/* Top-aligned badge embedded cleanly in lower margin */}
                        <span className={`absolute bottom-4 left-6 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeColor}`}>
                          {tagText}
                        </span>
                        
                        {/* Active badge */}
                        <span className="absolute bottom-4 right-6 text-[10px] font-black uppercase text-stone-400 group-hover:text-[#c0392b] transition-colors">
                          Խաղալ ➔
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Inside Selected Game */
              <div>
                {/* Back Link */}
                <div className="mb-6 flex items-center justify-between bg-white border border-[#e6dfcf] p-4 rounded-2xl shadow-sm">
                  <button
                    onClick={() => setSelectedGameId(null)}
                    className="flex items-center gap-2 text-xs font-black tracking-widest text-[#c0392b] hover:text-[#a93226] transition-all uppercase"
                  >
                    ⬅ ՎԵՐԱԴԱՌՆԱԼ ԽԱՂԵՐԻ ՑԱՆԿԻՆ
                  </button>
                  <span className="text-xs text-stone-500 font-mono">
                    Այժմ խաղում եք՝ <strong className="text-[#c0392b]">Game {selectedGameId} / 4</strong>
                  </span>
                </div>

                {/* Draw corresponding game component */}
                {selectedGameId === 1 && (
                  <BilliardsGame
                    playerGor={playerGor}
                    playerGayane={playerGayane}
                    onUpdateScores={handleUpdateScores}
                  />
                )}
                {selectedGameId === 2 && (
                  <BowlingGame
                    playerGor={playerGor}
                    playerGayane={playerGayane}
                    onUpdateScores={handleUpdateScores}
                  />
                )}
                {selectedGameId === 3 && (
                  <RacingGame
                    playerGor={playerGor}
                    playerGayane={playerGayane}
                    onUpdateScores={handleUpdateScores}
                  />
                )}
                {selectedGameId === 4 && (
                  <SwimmingGame
                    playerGor={playerGor}
                    playerGayane={playerGayane}
                    onUpdateScores={handleUpdateScores}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Armenian Spanish Past Tense Theory Document */}
        {activeTab === 'theory' && (
          <div className="bg-white border-2 border-[#eae1d0] rounded-3xl p-6 md:p-8 shadow-md text-[#2c3e50]">
            <div className="flex items-center gap-3 border-b border-[#e6dfcf] pb-5 mb-6">
              <div className="p-3 bg-red-100 text-[#c0392b] rounded-2xl">
                <BookOpen className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif text-[#2c3e50]">Իսպաներենի Անցյալ Ժամանակների Ուսումնական Ձեռնարկ</h2>
                <p className="text-xs text-stone-500 mt-1 font-serif italic">
                  Գրավոր կանոնները, ձևավորման սկզբունքները և անկանոն participio-ների ամբողջական բացատրությունը:
                </p>
              </div>
            </div>

            {/* Split panels: text representation + quick interactive quiz prep */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Theory sheet */}
              <div className="lg:col-span-8 bg-[#fdfaf2] border-l-4 border-[#c0392b] p-6 rounded-r-2xl max-h-[700px] overflow-y-auto custom-scrollbar shadow-inner">
                <div className="text-stone-800 whitespace-pre-line leading-relaxed max-w-none text-sm font-serif">
                  {THEORY_ARMENIAN}
                </div>
              </div>

              {/* Quick grammar card list for swift study checks */}
              <div className="lg:col-span-4 flex flex-col gap-6 font-sans">
                
                {/* Visual reminder card */}
                <div className="p-5 bg-red-50/70 border border-red-200/60 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#c0392b] font-mono mb-2">
                    <Zap className="w-4 h-4" />
                    <span>ԱՐԱԳ ՅՈՒՐԱՑՈՒՄ</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#2c3e50] mb-2">Pretérito Perfecto Exceptions</h4>
                  <ul className="text-xs text-stone-700 space-y-1 bg-white p-3 rounded-xl border border-red-100 font-mono">
                    <li>abrir ➔ <b className="text-[#c0392b]">abierto</b></li>
                    <li>decir ➔ <b className="text-[#c0392b]">dicho</b></li>
                    <li>escribir ➔ <b className="text-[#c0392b]">escrito</b></li>
                    <li>hacer ➔ <b className="text-[#c0392b]">hecho</b></li>
                    <li>poner ➔ <b className="text-[#c0392b]">puesto</b></li>
                    <li>romper ➔ <b className="text-[#c0392b]">roto</b></li>
                    <li>ver ➔ <b className="text-[#c0392b]">visto</b></li>
                    <li>volver ➔ <b className="text-[#c0392b]">vuelto</b></li>
                  </ul>
                </div>

                {/* Pretérito Imperfecto Card */}
                <div className="p-5 bg-blue-50/70 border border-blue-200/40 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-800 font-mono mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>IMPERFECTO (Միայն 3 բացառություն)</span>
                  </div>
                  <ul className="text-xs text-stone-700 space-y-1.5 bg-white p-3 rounded-xl border border-blue-100 font-sans">
                    <li><b>SER (լինել)</b> ➔ <span className="font-mono text-blue-700">era, eras, era...</span></li>
                    <li><b>IR (գնալ)</b> ➔ <span className="font-mono text-blue-700">iba, ibas, iba...</span></li>
                    <li><b>VER (տեսնել)</b> ➔ <span className="font-mono text-blue-700">veía, veías, veía...</span></li>
                  </ul>
                </div>

                {/* Indefinido irregular stems */}
                <div className="p-5 bg-amber-50/80 border border-amber-200/60 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 font-mono mb-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>INDEFINIDO Stem changes</span>
                  </div>
                  <p className="text-[11px] text-[#2c3e50] leading-relaxed bg-white p-3 rounded-xl border border-amber-100 font-sans">
                    Ինդեֆինիդոյում արմատները ամբողջությամբ փոխվում են՝ tener ➔ <b className="text-amber-800">tuv-</b>, estar ➔ <b className="text-amber-800">estuv-</b>, hacer ➔ <b className="text-amber-800">hic- / hiz-</b>, decir ➔ <b className="text-amber-800">dij-</b>:
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer Reference Bar matching Artistic Flair */}
      <footer className="max-w-6xl mx-auto px-4 md:px-6 mt-8 p-4 bg-white border border-[#e6dfcf] rounded-2xl flex flex-col md:flex-row items-center gap-6 overflow-hidden shadow-sm font-sans">
        <div className="flex gap-3 items-center whitespace-nowrap">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Հիշիր՝</span>
          <div className="flex gap-2 text-xs">
            <span className="bg-[#fcfaf7] border border-[#e6dfcf] px-2 py-1 rounded text-[#2c3e50] font-mono">hacer ➔ <strong>hice</strong></span>
            <span className="bg-[#fcfaf7] border border-[#e6dfcf] px-2 py-1 rounded text-[#2c3e50] font-mono">poner ➔ <strong>puse</strong></span>
            <span className="bg-[#fcfaf7] border border-[#e6dfcf] px-2 py-1 rounded text-[#2c3e50] font-mono">decir ➔ <strong>dije</strong></span>
          </div>
        </div>
        <div className="flex-1 bg-[#fcfaf7] h-8 rounded-lg border border-[#e6dfcf] overflow-hidden flex items-center px-4">
          <span className="text-[9px] uppercase font-black text-stone-400 mr-4 shrink-0">Ընթացիկ Բացառություններ՝</span>
          <div className="flex gap-4 text-[11px] font-mono whitespace-nowrap overflow-hidden text-stone-500 italic">
            descubierto, descrito, devuelto, resuelto, compuesto, propuesto, roto, escrito, dicho, hecho, visto...
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Կենդանի ռեժիմ</span>
        </div>
      </footer>

    </div>
  );
}
