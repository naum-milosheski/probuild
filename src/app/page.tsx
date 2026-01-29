import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl mx-auto space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-bg-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            ProBuild Supply
          </h1>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <p className="text-xl text-text-secondary">
            B2B Operating System for Trade Supply
          </p>
          <p className="text-text-tertiary">
            HVAC • Electrical • Plumbing
          </p>
        </div>

        {/* Feature Highlight */}
        <div className="bg-bg-secondary border border-border-subtle rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-orange-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            <span className="font-semibold">Magic Import</span>
          </div>
          <p className="text-text-secondary text-sm">
            Paste messy contractor text → AI parses it → Structured order in seconds
          </p>
          <div className="bg-bg-tertiary rounded-md p-3 text-left font-mono text-xs text-text-tertiary">
            &quot;Send 30ft of half-inch copper pipe and 2 boxes of those red wire nuts to Job Site A&quot;
          </div>
          <div className="flex items-center justify-center text-text-tertiary">
            <ArrowLeft className="w-4 h-4 rotate-[-90deg]" />
          </div>
          <div className="flex justify-center gap-2 text-xs">
            <span className="px-2 py-1 bg-success/10 text-success rounded">COP-050-L × 30ft</span>
            <span className="px-2 py-1 bg-success/10 text-success rounded">WNC-RED-100 × 2 box</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="btn btn-primary inline-flex text-lg px-8 py-3"
        >
          Enter Dashboard
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Footer */}
        <p className="text-text-tertiary text-xs">
          Industrial SaaS • Built for power users • Zero lag
        </p>
      </div>
    </div>
  )
}
