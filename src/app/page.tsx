import Link from "next/link"
import Image from "next/image"
import { Mic, CheckCircle2, User, Shield, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      
      {/* Left Column - Content */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 z-10 relative">
        {/* Top Nav */}
        <nav className="w-full flex items-center justify-between mb-20">
          <span className="font-bold text-xl tracking-[0.25em] uppercase text-white">Jackie Jeans</span>
        </nav>

        {/* Hero Content */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 text-xs font-bold tracking-widest uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Smart Fit AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6 text-white">
            Find jeans that <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">actually fit.</span>
          </h1>
          
          <p className="text-zinc-400 text-lg md:text-xl max-w-md leading-relaxed mb-12 font-light">
            No tape measure required. Answer a few quick questions or chat with our AI stylist, and we&apos;ll calculate your exact master fit.
          </p>

          {/* Premium CTA Cards */}
          <div className="flex flex-col gap-4 max-w-md">
            <Link href="/quiz" className="block">
              <button className="w-full group relative overflow-hidden bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 rounded-2xl p-6 text-left flex items-center justify-between backdrop-blur-sm">
                <div className="relative z-10">
                  <h3 className="font-semibold text-white text-lg mb-1">Fill it yourself</h3>
                  <p className="text-sm text-zinc-400">A quick 10-question guided quiz.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-orange-500 flex items-center justify-center transition-colors duration-300 relative z-10">
                  <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
                </div>
              </button>
            </Link>

            <Link href="/voice" className="block">
              <button className="w-full group relative overflow-hidden bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 rounded-2xl p-6 text-left flex items-center justify-between backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <div className="relative z-10">
                  <h3 className="font-semibold text-white text-lg mb-1 flex items-center gap-2">
                    Talk to AI stylist
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-orange-500/20 text-orange-400 font-bold">New</span>
                  </h3>
                  <p className="text-sm text-zinc-400">Just speak. Our AI listens and tailors.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-orange-500 flex items-center justify-center transition-colors duration-300 relative z-10">
                  <Mic className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
                </div>
              </button>
            </Link>
          </div>
        </div>

        {/* Footer features */}
        <div className="mt-20 pt-8 border-t border-zinc-900 flex flex-wrap gap-x-8 gap-y-4 text-xs font-medium tracking-widest uppercase text-zinc-500">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-zinc-400" /> Perfect Fit</span>
          <span className="flex items-center gap-2"><User className="w-4 h-4 text-zinc-400" /> Women&apos;s Denim</span>
          <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-zinc-400" /> Made in India</span>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:block w-1/2 relative bg-zinc-900">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10" />
        <Image
          src="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=100&w=2000" 
          alt="High fashion denim" 
          fill
          sizes="50vw"
          priority
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute bottom-12 right-12 z-20 bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-xs">
          <div className="flex -space-x-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-zinc-800">
                <Image src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" width={40} height={40} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <p className="text-white text-sm font-medium leading-tight">
            Over <span className="text-orange-400">10,000+ women</span> have found their flawless fit this month.
          </p>
        </div>
      </div>

    </main>
  )
}
