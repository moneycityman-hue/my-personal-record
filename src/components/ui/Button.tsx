import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  iconOnly?: boolean;
};

export function Button({
  className,
  variant = "secondary",
  iconOnly = false,
  type = "button",
  ...props
}: ButtonProps) {
  return <button className={cn("button", variant, iconOnly && "icon", className)} type={type} {...props} />;
}
