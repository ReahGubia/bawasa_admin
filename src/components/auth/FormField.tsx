interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  helpText?: string;
  placeholder?: string;
}

export function FormField({
  label,
  name,
  type,
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  helpText,
  placeholder,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="mt-1">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          className={`
            appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
            ${error 
              ? 'border-red-300 dark:border-red-500' 
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          aria-invalid={error ? 'true' : 'false'}
        />
      </div>
      
      {helpText && !error && (
        <p id={`${name}-help`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
