import React from "react";

/* ---------- Button ---------- */
export function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  let variantClasses = "";
  let sizeClasses = "";

  // 🔹 Variant stilleri
  if (variant === "default") {
    variantClasses =
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
  } else if (variant === "outline") {
    variantClasses =
      "border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300";
  } else if (variant === "ghost") {
    variantClasses =
      "text-gray-600 hover:bg-gray-100 focus:ring-gray-200 border-none shadow-none";
  }

  // 🔹 Boyut stilleri
  if (size === "sm") sizeClasses = "px-3 py-1.5 text-sm";
  else if (size === "lg") sizeClasses = "px-5 py-3 text-lg";
  else sizeClasses = "px-4 py-2";

  const baseClasses =
    "font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({
  children,
  className = "",
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- CardContent ---------- */
export function CardContent({
  children,
  className = "",
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
