import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  to?: string;
};

function Button({ children, onClick, variant = "primary", type = "button", disabled = false, to }: ButtonProps) {
  const className = `btn btn-${variant}`;
  if (to && !disabled) {
    return <Link to={to} className={className}>{children}</Link>;
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export default Button;
