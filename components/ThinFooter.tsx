'use client'

export function ThinFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-neutral-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-4 text-xs text-neutral-600">
        <span>© {year} Tree of Life Agency</span>
        <span className="hidden sm:inline">All rights reserved</span>
      </div>
    </footer>
  )
}
