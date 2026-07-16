"use client"

import { CircleCheck, CircleX } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === "destructive"
        const resolvedVariant = isDestructive ? "destructive" : "success"
        return (
          <Toast key={id} variant={resolvedVariant} {...props}>
            {isDestructive ? (
              <CircleX className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
            ) : (
              <CircleCheck className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
            )}
            <div className="grid flex-1 gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
