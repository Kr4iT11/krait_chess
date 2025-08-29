import type React from "react";
import type { FC } from "react";
import type { UseFormRegisterReturn } from 'react-hook-form';

interface InputProps {
    type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
    id?: string;
    name?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    min?: string;
    max?: string;
    step?: number;
    disabled?: boolean;
    success?: boolean;
    hint?: string;
    register?: UseFormRegisterReturn
    error?: string | undefined;

}

const InputField: FC<InputProps> = ({
    type = "text",
    id,
    name,
    placeholder,
    value,
    onChange,
    className = "",
    min,
    max,
    step,
    disabled = false,
    hint,
    register,
    error,
    success

}) => {
    // for now lets comment this out and check if its working or not 
    // let inputClass = 'w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-shadow';
    return (
        <div className="relative">
            <input
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                {...register}
                className={`w-full bg-gray-700 text-white p-3 rounded-lg border transition-all
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-yellow-500'}
          focus:outline-none focus:ring-2`}
                aria-invalid={!!error} // Accessibility improvement
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {/* {hint && (
                <p
                    className={`mt-1.5 text-xs ${error
                        ? "text-error-500"
                        : success
                            ? "text-success-500"
                            : "text-gray-500"
                        }`}
                >
                    {hint}
                </p>
            )} */}
        </div>
    );
}
export default InputField;