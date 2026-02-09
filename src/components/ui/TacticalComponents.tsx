import React from 'react';
import { ArrowRight } from 'lucide-react';

// --- BUTTONS ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  withArrow?: boolean;
}

export const CorporateButton: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', withArrow = false, className = '', ...props 
}) => {
  const base = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 focus:outline-none disabled:opacity-50 rounded-sm";
  
  const variants = {
    primary: "bg-corporate-blue text-white hover:bg-blue-700 shadow-sm border border-transparent",
    secondary: "bg-corporate-navy text-white hover:bg-slate-800 shadow-sm border border-transparent",
    outline: "bg-transparent border border-slate-300 text-slate-600 hover:border-corporate-blue hover:text-corporate-blue",
    link: "bg-transparent text-corporate-blue hover:text-blue-800 hover:underline p-0 justify-start"
  };

  const sizes = {
    sm: "text-xs py-1.5 px-3",
    md: "text-sm py-2 px-4",
    lg: "text-base py-3 px-6"
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${variant !== 'link' ? sizes[size] : ''} ${className}`}
      {...props}
    >
      {children}
      {withArrow && <ArrowRight className="ml-2 h-4 w-4" />}
    </button>
  );
};

// --- INPUTS ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const CorporateInput: React.FC<InputProps> = ({ label, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-corporate-blue transition-colors">
            {icon}
          </div>
        )}
        <input 
          className={`w-full bg-white border border-slate-300 text-slate-800 text-sm font-sans placeholder:text-slate-400 focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue focus:outline-none py-2.5 rounded-sm ${icon ? 'pl-9' : 'pl-3'} pr-3 transition-all shadow-sm ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

// --- SELECT ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const CorporateSelect: React.FC<SelectProps> = ({ label, children, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">{label}</label>}
      <div className="relative">
        <select 
          className={`appearance-none w-full bg-white border border-slate-300 text-slate-800 text-sm font-sans focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue focus:outline-none py-2.5 pl-3 pr-8 rounded-sm cursor-pointer shadow-sm ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>
  );
};

// --- CARD ---
export const CorporateCard: React.FC<{ children: React.ReactNode; className?: string; hoverEffect?: boolean }> = ({ 
  children, className = '', hoverEffect = true 
}) => {
  return (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden flex flex-col ${hoverEffect ? 'hover:shadow-md hover:border-slate-300 transition-all duration-300' : ''} ${className}`}>
      {children}
    </div>
  );
};

// --- SECTION HEADER ---
export const SectionHeader: React.FC<{ title: string; subtitle?: string; align?: 'left' | 'center' }> = ({ title, subtitle, align = 'left' }) => {
  return (
    <div className={`mb-8 ${align === 'center' ? 'text-center' : ''}`}>
      <h2 className="text-2xl font-bold text-corporate-navy mb-2 uppercase tracking-tight flex items-center gap-3">
        {title}
        {align !== 'center' && <div className="h-px flex-1 bg-slate-200"></div>}
      </h2>
      {subtitle && (
        <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
};