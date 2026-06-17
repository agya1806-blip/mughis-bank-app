"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Email harus diisi");
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      setSent(true);
      toast.success("Password berhasil direset!");
    }
  }

  return (
    <Card className="w-full max-w-md p-8 animate-scale-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl font-bold text-white font-heading">MB</span>
        </div>
        <h1 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
          Reset <span className="text-gradient">Password</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {sent ? "Password Anda sudah direset, silakan login dengan password baru" : "Masukkan email untuk reset password"}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="Email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            <Send className="w-4 h-4" />
            Kirim Reset Link
          </Button>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Password untuk <strong className="text-slate-700 dark:text-slate-300">{email}</strong> telah direset
          </p>
        </div>
      )}

      <div className="text-center mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-teal-600 dark:text-teal-400 font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </Link>
      </div>
    </Card>
  );
}
