import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = false,
  className = "",
  error,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const actualType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-600"
          style={{ marginBottom: "2px" }}
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div
            className="absolute left-4 flex items-center justify-center text-slate-400 pointer-events-none z-10"
            style={{ width: "20px", height: "20px" }}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          id={inputId}
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
          style={{
            width: "100%",
            height: "48px",
            lineHeight: "48px",
            paddingLeft: Icon ? "46px" : "16px",
            paddingRight: isPasswordType ? "46px" : "16px",
            borderRadius: "14px",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
            outline: "none",
          }}
          className={`
            border transition-all duration-200
            ${error ? "border-rose-500 ring-1 ring-rose-500/50" : ""}
          `}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-4 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors z-10"
            style={{ width: "20px", height: "20px", background: "none", border: "none", cursor: "pointer" }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}
    </div>
  );
}

export default Input;