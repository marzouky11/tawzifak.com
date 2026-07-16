'use client'

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export function ThemeToggleButton({ className, ...props }: Omit<React.ComponentProps<typeof Button>, 'onClick'>) {
  const { setTheme, theme } = useTheme()

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    (e.currentTarget as HTMLButtonElement).blur();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggleTheme}
      {...props}
    >
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export function ThemeToggleSwitch({ className, ...props }: React.ComponentProps<typeof Switch>) {
  const { setTheme, theme } = useTheme()
  
  const handleCheckedChange = (newChecked: boolean) => {
    setTheme(newChecked ? "dark" : "light")
  }

  return (
    <Switch
      checked={theme === "dark"}
      onCheckedChange={handleCheckedChange}
      className={className}
      {...props}
    />
  )
}
