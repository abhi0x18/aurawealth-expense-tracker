"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Vault3DProp } from "@/components/ui/FinancialProps";
import Link from "next/link";
import { Layers, Mail, Lock, KeyRound, Sparkles, ArrowRight, RefreshCw, CheckCircle2, ShieldCheck, Play } from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");
  
  // Password Mode state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Mode state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"send" | "verify">("send");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.needsSetup) {
          router.replace("/setup");
        } else if (data.authenticated) {
          router.replace("/dashboard");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => setCheckingAuth(false));
  }, [router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      triggerConfetti();
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otpEmail || !otpEmail.includes("@")) {
      setError("Please provide a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send verification code");
        return;
      }

      setSuccessMsg(data.message || `Verification code sent to ${otpEmail}!`);
      setOtpStep("verify");
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail.trim(),
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid verification code");
        return;
      }

      triggerConfetti();
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14] p-4">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full shadow-lg shadow-emerald-500/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#070b14] relative overflow-hidden p-4">
      {/* Ambient Mesh Gradient */}
      <div className="ambient-mesh" />

      {/* Floating 3D Vault Illustration in background corner */}
      <div className="hidden md:block absolute bottom-10 right-14 opacity-35 pointer-events-none animate-float">
        <Vault3DProp className="w-48 h-48" />
      </div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 overflow-hidden">
        {/* Specular Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />

        {/* App Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-600 p-0.5 shadow-xl shadow-emerald-500/30 mx-auto mb-3">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Layers className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
              AuraWealth
            </h1>
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              3D
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>FinFlow Spatial OS • Encrypted Access</span>
          </p>
        </div>

        {/* 3D Glass Tab Selector */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border border-white/10 rounded-2xl mb-7 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setAuthMode("otp");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              authMode === "otp"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Email OTP (Live)
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              authMode === "password"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" />
            Master Password
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-sm text-rose-300 mb-5 shadow-sm font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-sm text-emerald-300 mb-5 flex items-center gap-2.5 shadow-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dev OTP Helper Banner if in local simulation */}
        {devOtp && (
          <div className="p-4 bg-amber-950/60 border border-amber-800/80 rounded-2xl text-sm text-amber-200 mb-5 shadow-sm">
            <div className="font-bold flex items-center justify-between">
              <span>Dev Console Code:</span>
              <span className="font-mono text-lg font-black tracking-widest text-emerald-400">
                {devOtp}
              </span>
            </div>
            <p className="text-xs text-amber-400 mt-1">
              (Auto-generated for your current development session)
            </p>
          </div>
        )}

        {/* OTP AUTH MODE */}
        {authMode === "otp" && (
          <div>
            {otpStep === "send" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="asgholap371324@kkwagh.edu.in"
                  required
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 font-display font-bold text-base tracking-wide shadow-xl shadow-emerald-500/25 rounded-2xl py-3.5"
                  loading={loading}
                >
                  <span>Dispatch One-Time Code</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                  Delivered safely via Resend / Gmail SMTP. Valid for 10 minutes.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Target: <b className="text-white font-mono">{otpEmail}</b>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep("send");
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-emerald-400 hover:underline font-bold"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-[16px] text-4xl font-mono font-black py-4 bg-slate-950/90 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-inner"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 font-display font-bold text-base shadow-xl shadow-emerald-500/25 rounded-2xl py-3.5"
                  loading={loading}
                  disabled={otpCode.length !== 6}
                >
                  Verify &amp; Sign In
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 disabled:opacity-50 font-semibold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend verification code"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* PASSWORD AUTH MODE */}
        {authMode === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <Input
              label="Master Password"
              type="password"
              placeholder="Enter your master password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-display font-bold text-base shadow-xl shadow-emerald-500/25 rounded-2xl py-3.5"
              loading={loading}
            >
              Sign In with Master Password
            </Button>

            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400 font-medium">
                CLI emergency password recovery:<br />
                <code className="text-emerald-400 font-mono text-xs">
                  node scripts/reset-password.js &lt;email&gt; &lt;new-pass&gt;
                </code>
              </p>
            </div>
          </form>
        )}

        {/* Link back to Cashflow Simulator Intro */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors uppercase tracking-wider px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 shadow-sm hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>← Return to Cashflow Simulator</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
