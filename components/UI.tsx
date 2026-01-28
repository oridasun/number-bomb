
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, variant = 'primary', className = "", disabled }) => {
  const base = "px-4 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300",
    outline: "bg-transparent border-2 border-slate-700 hover:border-indigo-500 hover:text-indigo-400 text-slate-400"
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

export const Confetti: React.FC = () => {
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    bg: ['#FFD700', '#FF6347', '#4169E1', '#32CD32', '#FF69B4'][Math.floor(Math.random() * 5)],
    delay: Math.random() * 2 + 's',
    duration: Math.random() * 3 + 2 + 's'
  }));

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.bg,
            animation: `confetti-fall ${p.duration} linear ${p.delay} infinite`
          }}
        />
      ))}
    </>
  );
};
