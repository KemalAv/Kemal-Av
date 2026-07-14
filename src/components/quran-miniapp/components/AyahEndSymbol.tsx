import React from 'react';

interface AyahEndSymbolProps {
  number: number;
  className?: string;
}

export const AyahEndSymbol: React.FC<AyahEndSymbolProps> = ({ number, className = "" }) => {
  const toArabicNumber = (num: number) => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicDigits[parseInt(digit)]).join('');
  };

  return (
    <span className={`inline-flex items-center justify-center mx-2 relative select-none ${className}`} style={{ direction: 'ltr' }}>
      <span className="text-emerald-600/20 dark:text-emerald-400/20 text-4xl leading-none">۝</span>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400 pt-0.5">
        {toArabicNumber(number)}
      </span>
    </span>
  );
};
