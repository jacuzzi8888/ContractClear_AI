"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from "lucide-react";

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showStrength?: boolean;
  error?: string;
  autoComplete?: string;
}

interface StrengthCriterion {
  label: string;
  test: (pwd: string) => boolean;
}

const strengthCriteria: StrengthCriterion[] = [
  { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "One lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "One uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "One number", test: (pwd) => /\d/.test(pwd) },
];

export function PasswordInput({
  id = "password",
  value,
  onChange,
  placeholder = "Enter your password",
  label = "Password",
  required = false,
  showStrength = false,
  error,
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const strength = useMemo(() => {
    if (!value || !showStrength) return null;
    const passed = strengthCriteria.filter((c) => c.test(value)).length;
    const score = (passed / strengthCriteria.length) * 100;
    let color = "bg-red-500";
    let label = "Weak";
    if (score >= 75) {
      color = "bg-green-500";
      label = "Strong";
    } else if (score >= 50) {
      color = "bg-yellow-500";
      label = "Fair";
    }
    return { score, color, label, passed };
  }, [value, showStrength]);

  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" size={18} />
        <input
          type={isVisible ? "text" : "password"}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          className={`w-full bg-[var(--color-surface-50)] border rounded-xl py-3 pl-10 pr-11 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all ${
            error ? "border-red-300" : "border-[var(--color-surface-300)]"
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-surface-400)] hover:text-[var(--color-surface-600)] transition-colors"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1.5 ml-1">{error}</p>
      )}

      {showStrength && value && isFocused && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[var(--color-surface-200)] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strength?.color || "bg-gray-300"}`}
                style={{ width: `${strength?.score || 0}%` }}
              />
            </div>
            <span className="text-xs font-medium text-[var(--color-surface-500)]">
              {strength?.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {strengthCriteria.map((criterion) => {
              const passed = criterion.test(value);
              return (
                <div
                  key={criterion.label}
                  className="flex items-center gap-1.5 text-xs"
                >
                  {passed ? (
                    <CheckCircle2 size={12} className="text-green-500" />
                  ) : (
                    <XCircle size={12} className="text-[var(--color-surface-300)]" />
                  )}
                  <span className={passed ? "text-[var(--color-surface-600)]" : "text-[var(--color-surface-400)]"}>
                    {criterion.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
