
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bomb, 
  Users, 
  Trophy, 
  Skull, 
  ChevronRight, 
  Delete, 
  RotateCcw, 
  Crown, 
  Zap,
  Gamepad2,
  AlertTriangle,
  CheckCircle2,
  Home,
  ArrowDownCircle,
  ArrowUpCircle,
  Info
} from 'lucide-react';
import { GameState, Player, GuessEntry, Range, GameMode } from './types';
import { Card, Button, Confetti } from './components/UI';

const App: React.FC = () => {
  // Configuración del juego
  const [gameState, setGameState] = useState<GameState>('setup');
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.EASY);
  const [isElimination, setIsElimination] = useState(false);
  
  // Jugadores
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(1);
  
  // Lógica del juego
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [range, setRange] = useState<Range>({ min: 1, max: 100 });
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState<GuessEntry[]>([]);
  const [lastLoserId, setLastLoserId] = useState<number | null>(null);
  
  // Estados de UI
  const [statusMessage, setStatusMessage] = useState('¡Empieza la partida!');
  const [lastFeedback, setLastFeedback] = useState<{msg: string, type: 'high' | 'low' | null}>({msg: '', type: null});
  const [shake, setShake] = useState(false);

  // Inicializar jugadores
  const setupGame = (count: number) => {
    const newPlayers: Player[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Jugador ${i + 1}`,
      isAlive: true
    }));
    setPlayers(newPlayers);
    startNewRound(newPlayers, 1);
  };

  const startNewRound = (currentPlayers: Player[], startingPlayerId: number) => {
    // La elección del número es arbitraria/aleatoria por la app
    const target = Math.floor(Math.random() * gameMode) + 1;
    setTargetNumber(target);
    setRange({ min: 1, max: gameMode });
    setCurrentPlayerId(startingPlayerId);
    setHistory([]);
    setGuess('');
    setGameState('playing');
    setLastLoserId(null);
    setLastFeedback({msg: 'Bomba activa. ¡Cuidado!', type: null});
    setStatusMessage(`El número secreto está entre 1 y ${gameMode}`);
  };

  const handleKeypad = useCallback((char: string) => {
    setGuess(prev => {
      if (prev.length >= (gameMode === 1000 ? 4 : 3)) return prev;
      if (prev === '' && char === '0') return prev; 
      return prev + char;
    });
  }, [gameMode]);

  const handleBackspace = useCallback(() => {
    setGuess(prev => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(async () => {
    const val = parseInt(guess);
    if (isNaN(val) || val < range.min || val > range.max) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const newEntry: GuessEntry = {
      playerId: currentPlayerId,
      value: val,
      timestamp: Date.now()
    };
    
    setHistory(prev => [newEntry, ...prev]);

    if (val === targetNumber) {
      setLastLoserId(currentPlayerId);
      if (isElimination) {
        const updatedPlayers = players.map(p => 
          p.id === currentPlayerId ? { ...p, isAlive: false } : p
        );
        setPlayers(updatedPlayers);
        
        const survivors = updatedPlayers.filter(p => p.isAlive);
        if (survivors.length === 1) {
          setGameState('champion');
        } else {
          setGameState('round_over');
        }
      } else {
        setGameState('gameover');
      }
    } else {
      const newRange = { ...range };
      let feedbackType: 'high' | 'low' = 'low';
      let feedbackMsg = '';

      if (val < targetNumber) {
        newRange.min = val + 1;
        feedbackType = 'low';
        feedbackMsg = `Número BAJO. Rango: ${newRange.min} - ${newRange.max}`;
      } else {
        newRange.max = val - 1;
        feedbackType = 'high';
        feedbackMsg = `Número ALTO. Rango: ${newRange.min} - ${newRange.max}`;
      }
      
      setLastFeedback({ msg: feedbackMsg, type: feedbackType });
      setRange(newRange);
      setGuess('');

      const survivors = players.filter(p => p.isAlive);
      const currentIndex = survivors.findIndex(p => p.id === currentPlayerId);
      const nextIndex = (currentIndex + 1) % survivors.length;
      const nextId = survivors[nextIndex].id;
      
      setCurrentPlayerId(nextId);
      setStatusMessage(`Turno del Jugador ${nextId}`);
    }
  }, [guess, range, currentPlayerId, players, isElimination, targetNumber]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key >= '0' && e.key <= '9') handleKeypad(e.key);
      if (e.key === 'Backspace') handleBackspace();
      if (e.key === 'Enter') handleSubmit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleKeypad, handleBackspace, handleSubmit]);

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-y-auto">
        <Card className="max-w-md w-full p-8 border-slate-700/50 backdrop-blur-xl bg-slate-900/80 my-auto">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-indigo-500/10 rounded-full mb-4 ring-1 ring-indigo-500/20">
              <Bomb size={48} className="text-indigo-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Bomba Numérica</h1>
            <p className="text-slate-400 text-sm">Evita el número secreto para sobrevivir.</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsElimination(false)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${!isElimination ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-500'}`}
              >
                <Gamepad2 size={24} />
                <span className="font-bold text-sm">Clásico</span>
                <span className="text-[10px] opacity-60">1 Ronda</span>
              </button>
              <button 
                onClick={() => setIsElimination(true)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isElimination ? 'border-rose-500 bg-rose-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-500'}`}
              >
                <Skull size={24} />
                <span className="font-bold text-sm">Eliminación</span>
                <span className="text-[10px] opacity-60">Supervivencia</span>
              </button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-950 rounded-xl">
              <button onClick={() => setGameMode(GameMode.EASY)} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${gameMode === GameMode.EASY ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>1-100</button>
              <button onClick={() => setGameMode(GameMode.HARD)} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${gameMode === GameMode.HARD ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>1-1000</button>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-3">Jugadores</p>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5, 6, 7, 8, 10].map(n => (
                  <button 
                    key={n} 
                    onClick={() => setupGame(n)}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white font-bold transition-all active:scale-90"
                  >
                    {n}P
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'playing') {
    const progress = ((range.max - range.min + 1) / gameMode) * 100;
    const currentSurvivor = players.find(p => p.id === currentPlayerId);

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col p-4 md:p-8 overflow-hidden">
        {/* HUD Superior */}
        <header className="flex justify-between items-center mb-4 max-w-lg mx-auto w-full shrink-0">
          <button 
            onClick={() => setGameState('setup')}
            className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Volver al Menú Principal"
          >
            <Home size={20} />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 flex items-center gap-2">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
               <span className="text-indigo-400 font-bold text-xs md:text-sm tracking-tight uppercase">TURNO: {currentSurvivor?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-500" />
            <span className="text-sm font-bold text-white leading-none">{players.filter(p => p.isAlive).length}</span>
          </div>
        </header>

        {/* Tablero de Juego */}
        <div className="flex-1 max-w-lg mx-auto w-full flex flex-col gap-4 overflow-y-auto pb-4 no-scrollbar">
          
          {/* Feedback Visual del último intento */}
          <div className={`shrink-0 p-3 rounded-2xl border flex items-center gap-3 transition-all ${
            lastFeedback.type === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
            lastFeedback.type === 'low' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 
            'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            {lastFeedback.type === 'high' && <ArrowDownCircle size={24} className="animate-bounce" />}
            {lastFeedback.type === 'low' && <ArrowUpCircle size={24} className="animate-bounce" />}
            {!lastFeedback.type && <Bomb size={20} className="text-indigo-400" />}
            <span className="text-xs md:text-sm font-bold tracking-tight uppercase">{lastFeedback.msg}</span>
          </div>

          <Card className={`p-5 md:p-6 flex flex-col gap-5 shrink-0 relative border-slate-800 transition-transform ${shake ? 'animate-shake' : ''}`}>
            
            {/* Status Panel */}
            <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0">
                <Info size={20} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 leading-none">Estado del Sistema</p>
                <p className="text-xs md:text-sm text-slate-300 font-medium leading-tight">{statusMessage}</p>
              </div>
            </div>

            {/* Visualización de Rango */}
            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">
                <span>Zona de Seguridad</span>
                <span className="text-indigo-400 font-black">{range.min} — {range.max}</span>
              </div>
              <div className="h-4 bg-slate-950 rounded-full border border-slate-800 p-0.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                  style={{ 
                    width: `${Math.max(2, progress)}%`, 
                    marginLeft: `${((range.min - 1) / gameMode) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Pantalla de Input */}
            <div className="relative group">
               <div className="absolute inset-0 bg-indigo-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative bg-slate-950 border-2 border-slate-800 rounded-2xl py-4 md:py-6 text-center text-5xl md:text-6xl font-black text-white tracking-tighter flex items-center justify-center gap-4">
                  {guess || <span className="text-slate-900 font-thin opacity-30">?</span>}
                  {guess && (
                    <button 
                      onClick={handleBackspace}
                      className="absolute right-4 text-slate-600 hover:text-rose-500 transition-colors p-2"
                    >
                      <Delete size={24} />
                    </button>
                  )}
               </div>
            </div>

            {/* Teclado Numérico */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'OK'].map((key, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (key === 'CLR') setGuess('');
                    else if (key === 'OK') handleSubmit();
                    else handleKeypad(key);
                  }}
                  className={`py-3 md:py-4 rounded-xl text-xl font-bold transition-all active:scale-90 border flex items-center justify-center ${
                    !isNaN(parseInt(key))
                      ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' 
                      : key === 'CLR' 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20 text-xs' 
                        : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <Button onClick={handleSubmit} disabled={!guess} className="w-full h-14 md:h-16 text-lg bg-emerald-600 hover:bg-emerald-500 border-none shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              Confirmar Número <CheckCircle2 size={20} />
            </Button>
          </Card>

          {/* Historial rápido */}
          <div className="px-2 space-y-2 opacity-60">
             {history.slice(0, 2).map((h, i) => (
               <div key={i} className="flex justify-between items-center p-2 bg-slate-900/40 rounded-xl border border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500">J{h.playerId}</span>
                    <span className="text-sm font-bold text-white">{h.value}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${h.value > targetNumber ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {h.value > targetNumber ? 'BAJA ↓' : 'SUBE ↑'}
                  </span>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'round_over' || gameState === 'gameover') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <Card className={`max-w-md w-full p-8 border-rose-500/30 bg-slate-950 ${gameState === 'gameover' ? 'pulse-bomb' : ''}`}>
           <div className="mb-6">
              <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                {gameState === 'gameover' ? <Bomb size={40} className="text-rose-500" /> : <Skull size={40} className="text-rose-500" />}
              </div>
              <h1 className="text-5xl font-black text-white mb-2 tracking-tight italic">¡BOOM!</h1>
              <p className="text-slate-400 text-sm">La bomba estalló en el <span className="text-rose-400 font-black text-2xl px-2">{targetNumber}</span></p>
           </div>

           <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-rose-500" />
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Eliminado</p>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Jugador {lastLoserId}</h2>
              
              {isElimination ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.filter(p => p.isAlive).map(p => (
                    <span key={p.id} className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold border border-emerald-500/20">
                      J{p.id} Vive
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Fin de la partida.</p>
              )}
           </div>

           <div className="flex flex-col gap-3">
              {isElimination && gameState === 'round_over' ? (
                <Button onClick={() => startNewRound(players, players.find(p => p.isAlive)?.id || 1)}>
                  Siguiente Ronda <ChevronRight size={18} />
                </Button>
              ) : (
                <Button onClick={() => setGameState('setup')}>
                  <Home size={18} /> Menú Principal
                </Button>
              )}
           </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'champion') {
    const winner = players.find(p => p.isAlive);
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center relative overflow-hidden">
        <Confetti />
        <Card className="max-w-md w-full p-10 border-yellow-500/30 bg-slate-900 relative z-10 shadow-[0_0_50px_rgba(234,179,8,0.15)]">
           <div className="mb-8">
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30 animate-bounce">
                <Crown size={56} className="text-yellow-500" />
              </div>
              <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic">¡VENCEDOR!</h1>
              <p className="text-slate-400 text-sm">Has sobrevivido a la última bomba.</p>
           </div>

           <div className="py-10 px-6 bg-slate-950/50 rounded-3xl border border-slate-800 mb-8 relative">
              <Zap className="absolute -top-3 -right-3 text-yellow-500 fill-yellow-500" size={32} />
              <p className="text-5xl font-black text-white drop-shadow-lg leading-none">{winner?.name}</p>
              <div className="mt-4 flex justify-center gap-1">
                {Array.from({length: 3}).map((_, i) => <Trophy key={i} size={18} className="text-yellow-500" />)}
              </div>
           </div>

           <Button variant="primary" className="w-full bg-yellow-600 hover:bg-yellow-500 border-none" onClick={() => setGameState('setup')}>
             <Home size={18} /> Volver al Menú
           </Button>
        </Card>
      </div>
    );
  }

  return null;
};

export default App;
