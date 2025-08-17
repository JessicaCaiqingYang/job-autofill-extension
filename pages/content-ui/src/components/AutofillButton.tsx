import React from 'react';

interface AutofillButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const AutofillButton: React.FC<AutofillButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-4 py-2 text-sm font-medium text-white rounded-md transition-colors
        ${disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }
      `}
    >
      {disabled ? 'Set up profile first' : 'Autofill Form'}
    </button>
  );
};