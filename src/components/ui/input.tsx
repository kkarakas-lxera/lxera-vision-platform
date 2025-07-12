
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 min-h-[48px] w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-future-green disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          // Webkit autofill override styles
          "autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] autofill:[-webkit-text-fill-color:inherit]",
          "[&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] [&:-webkit-autofill]:[-webkit-text-fill-color:inherit]",
          "[&:-webkit-autofill:hover]:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:inherit]",
          "[&:-webkit-autofill:focus]:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:inherit]",
          "[&:-webkit-autofill:active]:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] [&:-webkit-autofill:active]:[-webkit-text-fill-color:inherit]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
