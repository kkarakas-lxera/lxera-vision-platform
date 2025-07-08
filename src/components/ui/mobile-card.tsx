import * as React from "react"
import { cn } from "@/lib/utils"

const MobileCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base styles
      "rounded-3xl border bg-card text-card-foreground",
      // Desktop styles with complex shadows and transitions
      "lg:shadow-lg lg:hover:shadow-xl lg:transition-shadow lg:duration-300",
      // Mobile optimizations
      "max-lg:shadow-md max-lg:rounded-2xl",
      // Performance optimizations
      "mobile-optimize perf-important",
      // CSS containment
      "contain-layout contain-style max-lg:contain-paint",
      className
    )}
    {...props}
  />
))
MobileCard.displayName = "MobileCard"

const MobileCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 lg:p-8", className)}
    {...props}
  />
))
MobileCardHeader.displayName = "MobileCardHeader"

const MobileCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl lg:text-2xl font-semibold leading-none tracking-tight text-business-black",
      className
    )}
    {...props}
  />
))
MobileCardTitle.displayName = "MobileCardTitle"

const MobileCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-business-black/60 leading-relaxed", className)}
    {...props}
  />
))
MobileCardDescription.displayName = "MobileCardDescription"

const MobileCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 lg:p-8 pt-0", className)} {...props} />
))
MobileCardContent.displayName = "MobileCardContent"

const MobileCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 lg:p-8 pt-0", className)}
    {...props}
  />
))
MobileCardFooter.displayName = "MobileCardFooter"

export { 
  MobileCard, 
  MobileCardHeader, 
  MobileCardFooter, 
  MobileCardTitle, 
  MobileCardDescription, 
  MobileCardContent 
}