function Card({ children, className = "", onClick, hoverEffect = true }) {
  return (
    <div
      onClick={onClick}
      className={`
        glass-card rounded-2xl p-6 lg:p-7
        transition-all duration-300
        ${hoverEffect ? "hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;