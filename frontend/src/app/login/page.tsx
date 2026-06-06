"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Landmark, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingText, setLoadingText] = useState("Authenticating...");
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://skandaedutech-taxpilot.hf.space/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setLoadingText("Authenticating Secure Identity...");
        
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 1.5;
          if (currentProgress <= 100) setProgress(currentProgress);
        }, 45);

        setTimeout(() => setLoadingText("Provisioning Mock Practice Portals..."), 1000);
        setTimeout(() => setLoadingText("Initializing Taxpilot Workspace..."), 2000);
        setTimeout(() => {
          clearInterval(interval);
          login(data.user);
        }, 3000);
      } else {
        setError(data.detail || "Invalid email or password");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while logging in.");
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="flex flex-col items-center space-y-12 max-w-sm w-full z-10">
          <div className="relative flex items-center justify-center">
            {/* Orbital Rings */}
            <div className="absolute inset-[-50px] border border-blue-500/10 rounded-full animate-[spin_8s_linear_infinite]"></div>
            <div className="absolute inset-[-30px] border border-blue-400/30 rounded-full animate-[spin_4s_linear_infinite_reverse] border-t-blue-500"></div>
            
            {/* Core Logo Matrix */}
            <div className="h-24 w-24 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[20px] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)] relative z-10 transition-all duration-700 ease-in-out scale-100">
              <div className="absolute inset-0 bg-white/10 rounded-[20px] animate-pulse"></div>
              <Landmark className="h-10 w-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="text-center space-y-8 w-full px-4">
            <h2 className="text-3xl font-extrabold text-white tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-indigo-200">
              Taxpilot
            </h2>
            
            <div className="space-y-4">
              {/* Sleek Progress Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden backdrop-blur-md border border-slate-700/50">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              {/* Typewriter status text */}
              <div className="h-6 flex items-center justify-center">
                <p className="text-blue-300/80 font-medium text-sm tracking-widest uppercase transition-opacity duration-300">
                  {loadingText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
          <Landmark className="h-12 w-12 mx-auto mb-4 text-blue-100" />
          <h1 className="text-2xl font-bold">Taxpilot Simulator</h1>
          <p className="text-blue-100 mt-2 text-sm">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
        
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">Educational Purposes Only</p>
        </div>
      </div>
    </div>
  );
}
