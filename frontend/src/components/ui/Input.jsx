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
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-slate-400"
        >
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full bg-slate-900/60 border border-slate-700/60 rounded-xl
            px-4 py-3 text-sm text-slate-100 placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
            transition-all duration-200
            ${Icon ? "pl-11" : ""}
            ${error ? "border-rose-500/60 focus:ring-rose-500/40" : ""}
          `}
        />
      </div>
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
}

export default Input;