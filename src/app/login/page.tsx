"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Vault3DProp } from "@/components/ui/FinancialProps";
import { Compass, Mail, Lock, KeyRound, Sparkles, ArrowRight, RefreshCw, CheckCircle2, ShieldCheck } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

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
          router.replace("/");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => setCheckingAuth(false));
  }, [router]);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Submit Password Form
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.needsSetup) {
          router.push("/setup");
          return;
        }
        setError(data.error || "Invalid email or password");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // Submit Send OTP Form
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setDevOtp(null);

    if (!otpEmail.trim()) {
      setError("Please enter your email address.");
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

      setOtpStep("verify");
      setSuccessMsg(data.message || `Verification code sent to ${otpEmail}`);
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

  // Submit Verify OTP Form
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

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full shadow-lg shadow-emerald-500/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#030712] relative overflow-hidden p-4 bg-grid-pattern">
      {/* 3D Ambient Neon Glow Orbs */}
      <div className="fixed top-[-15%] left-[25%] w-[550px] h-[550px] rounded-full bg-emerald-500/15 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[20%] w-[550px] h-[550px] rounded-full bg-teal-500/10 blur-[150px] pointer-events-none" />

      {/* Floating 3D Vault Illustration in background corner */}
      <div className="hidden md:block absolute bottom-8 right-12 opacity-40 pointer-events-none animate-float">
        <Vault3DProp className="w-40 h-40" />
      </div>

      <div className="w-full max-w-md bg-slate-900/75 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-shimmer overflow-hidden">
        {/* Specular Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />

        {/* App Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
            <Compass className="w-7 h-7 drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {APP_CONFIG.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Institutional Financial OS • Authentication
          </p>
        </div>

        {/* 3D Glass Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/70 border border-white/5 rounded-2xl mb-6 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setAuthMode("otp");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
              authMode === "otp"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Email OTP (Live)
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
              authMode === "password"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Master Password
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-xs text-rose-300 mb-4 shadow-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 mb-4 flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dev OTP Helper Banner if in local simulation */}
        {devOtp && (
          <div className="p-3.5 bg-amber-950/50 border border-amber-800/80 rounded-2xl text-xs text-amber-200 mb-4 shadow-sm">
            <div className="font-bold flex items-center justify-between">
              <span>Dev Console Code:</span>
              <span className="font-mono text-base font-black tracking-widest text-emerald-400">
                {devOtp}
              </span>
            </div>
            <p className="text-[10px] text-amber-400 mt-1">
              (Auto-generated for your current session)
            </p>
          </div>
        )}

        {/* OTP AUTH MODE */}
        {authMode === "otp" && (
          <div>
            {otpStep === "send" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
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
                  className="w-full mt-2 font-black tracking-wide shadow-lg shadow-emerald-500/25 rounded-2xl py-3"
                  loading={loading}
                >
                  <span>Dispatch One-Time Code</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  Delivered safely via Resend / Gmail SMTP. Valid for 10 minutes.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Target: <b className="text-white">{otpEmail}</b>
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
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-[14px] text-3xl font-mono font-black py-3.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-inner"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 font-black shadow-lg shadow-emerald-500/25 rounded-2xl py-3"
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
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 disabled:opacity-50 font-semibold"
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
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
              className="w-full mt-2 font-black shadow-lg shadow-emerald-500/25 rounded-2xl py-3"
              loading={loading}
            >
              Sign In with Master Password
            </Button>

            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-[11px] text-slate-400">
                CLI emergency password recovery:<br />
                <code className="text-emerald-400 font-mono text-[10px]">
                  node scripts/reset-password.js &lt;email&gt; &lt;new-pass&gt;
                </code>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
