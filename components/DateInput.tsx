import React from 'react';

// Classes are identical to 'baseInputClasses' in other files for consistency
const dateInputWrapperClasses = 'relative mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg placeholder-gray-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 text-base text-left';

interface DateInputProps {
  id: string;
  value: string; // YYYY-MM-DD
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DateInput: React.FC<DateInputProps> = ({ id, value, onChange }) => {
  // If a value is present, format it. Otherwise, show a placeholder.
  // The `T00:00:00` is crucial to prevent timezone-related date shifts.
  const displayValue = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Select a date';
  
  // Use a different text color for the placeholder vs. the selected date
  const textColorClass = value ? 'text-white' : 'text-gray-500';

  return (
    // This wrapper is styled to look exactly like a text input
    <div className={dateInputWrapperClasses}>
      <span className={textColorClass}>{displayValue}</span>
      
      {/* The actual date input is invisible but layered on top to receive clicks */}
      <input
        type="date"
        id={id}
        value={value}
        onChange={onChange}
        // This makes the input invisible but functional, covering the entire area
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Date" // For accessibility
      />
    </div>
  );
};
