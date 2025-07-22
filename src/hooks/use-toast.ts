"use client";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = (props: Toast) => {
    // Placeholder - replace with actual toast implementation
    console.log('Toast:', props);
    // For now, just use native alert as a fallback
    alert(`${props.title}: ${props.description || ''}`);
  };

  return { toast };
} 