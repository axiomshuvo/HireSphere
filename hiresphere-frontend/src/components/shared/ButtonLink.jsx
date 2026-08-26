"use client";

import Link from "next/link";

const variantClasses = {
  primary: "button button--primary",
  secondary: "button button--secondary",
  tertiary: "button button--tertiary",
  ghost: "button button--ghost",
  outline: "button button--outline",
  danger: "button button--danger",
};

const sizeClasses = {
  sm: "button--sm",
  md: "",
  lg: "button--lg",
};

export default function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  const base = variantClasses[variant] ?? variantClasses.primary;
  const sizeClass = sizeClasses[size] ?? "";

  return (
    <Link
      href={href}
      className={`${base} ${sizeClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Link>
  );
}
