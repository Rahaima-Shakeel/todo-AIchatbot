'use client';

import Link from 'next/link';
import { CheckCircle, Shield, Zap, Layout } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans antialiased selection:bg-blue-500/30 selection:text-blue-200">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-24 py-6 backdrop-blur-md bg-[#020617]/80 border-b border-slate-800">
        <span className="text-2xl font-bold tracking-tight">TodoFlow</span>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-500 transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 md:pt-32 pb-20 px-6 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-12 md:gap-20">
        <div className="w-full md:w-1/2 flex flex-col gap-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-white">
            Stay organized. <br />
            Stay focused. <br />
            Get things done.
          </h1>

          <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
            A simple and powerful to-do app that helps you manage your daily tasks in one clean and distraction-free workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-4 mt-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 text-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-white/10 transition text-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="w-full md:w-1/2 flex justify-center items-center lg:justify-end">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/5 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-transparent rounded-3xl blur opacity-30" />
            <div className="relative space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border rounded-full border-white/10" />
                <div className="h-4 w-3/4 bg-white/5 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 bg-blue-600 flex items-center justify-center rounded-full">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <div className="h-4 w-full bg-white/10 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border rounded-full border-white/10" />
                <div className="h-4 w-1/2 bg-white/5 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 pb-48 md:pb-72 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <FeatureItem
            icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
            title="Simple and clean task management"
          />
          <FeatureItem
            icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
            title="Create, edit, and delete todos easily"
          />
          <FeatureItem
            icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
            title="Mark tasks as completed or pending"
          />
          <FeatureItem
            icon={<Shield className="w-6 h-6 text-blue-400" />}
            title="Secure login and user authentication"
          />
          <FeatureItem
            icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
            title="Tasks saved safely in the database"
          />
          <FeatureItem
            icon={<Layout className="w-6 h-6 text-blue-400" />}
            title="Access your tasks anytime, anywhere"
          />
          <FeatureItem
            icon={<Zap className="w-6 h-6 text-blue-400" />}
            title="Fast and responsive user interface"
          />
          <FeatureItem
            icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
            title="Organized layout for better focus"
          />
          <FeatureItem
            icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
            title="Smooth and user-friendly experience"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#020617] border-t border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <CheckCircle className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">TodoFlow.</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Design the life you want with the minimalist productivity engine. Organize tasks, track progress, and achieve more every single day.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#features" className="hover:text-blue-400 transition-colors">Features</Link></li>
              <li><Link href="/signup" className="hover:text-blue-400 transition-colors">Sign Up</Link></li>
              <li><Link href="/login" className="hover:text-blue-400 transition-colors">Log In</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Connect</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Twitter / X</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Discord</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">GitHub</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-20 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <p>© 2026 TodoFlow. Built for performers.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white transition">Privacy</Link>
            <Link href="#" className="hover:text-white transition">Terms</Link>
            <Link href="#" className="hover:text-white transition">Cookies</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureItem({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/30 hover:scale-105 transition-transform">
      <div className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
  );
}
