interface SubmitButtonProps {
  text: string;
  isLoading: boolean;
  disabled?: boolean;
}

export function SubmitButton({ text, isLoading, disabled = false }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`
        group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-colors duration-200
        ${disabled || isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
      `}
      aria-disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Creating Account...
        </>
      ) : (
        text
      )}
    </button>
  );
}
