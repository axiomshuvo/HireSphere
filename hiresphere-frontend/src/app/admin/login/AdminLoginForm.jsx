"use client";

import { DEMO_ACCOUNTS } from "@/lib/api/jobstruture";
import { authClient } from "@/lib/auth-client";
import { authToasts } from "@/lib/toast";
import { ArrowLeft, Envelope, Eye, EyeSlash, Lock, ShieldCheck } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = (role) => {
    setFormData({
      email: DEMO_ACCOUNTS[role].email,
      password: DEMO_ACCOUNTS[role].password,
    });
    setErrors({});
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Please enter your password.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: formData.email.trim(),
        password: formData.password,
      });
      if (authError) {
        authToasts.signInFailed(authError);
        setLoading(false);
        return;
      }
      const role = data?.user?.role;
      if (role !== "admin" && role !== "mod") {
        await authClient.signOut();
        setErrors({ email: "Access denied. Admins and moderators only." });
        setLoading(false);
        return;
      }
      authToasts.signInSuccess(data?.user);
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } catch (err) {
      authToasts.networkError();
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-(color-text-muted) hover:text-(color-text) transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center text-lg font-bold">
          <ShieldCheck className="w-5 h-5 text-indigo-500 mr-2" />
          <span className="text-[#0072FF]">Hire</span>
          <span className="text-[#FF6A00]">Sphere</span>
        </div>
      </div>

      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold text-(color-text) tracking-tight">
          Admin Portal
        </h1>
        <p className="text-sm text-(color-text-muted)">
          Secure command center for administrators and moderators.
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs font-medium text-(color-text-muted) uppercase tracking-wider mb-2">
          Development Access:
        </p>
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="flat"
            onClick={() => handleDemoLogin("admin")}
            className="flex-1 font-medium bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
          >
            Demo Owner
          </Button>
          <Button
            size="sm"
            variant="flat"
            onClick={() => handleDemoLogin("mod")}
            className="flex-1 font-medium bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
          >
            Demo Mod
          </Button>
        </div>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-(color-text-muted) uppercase tracking-wider mb-1.5">
            Admin Email
          </label>
          <div className="relative flex items-center">
            <Envelope className="w-5 h-5 text-(color-text-muted) absolute left-3.5 pointer-events-none" />
            <input
              type="email"
              name="email"
              placeholder="demo@admin.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-11 pr-4 py-2.5 bg-(color-surface-2) rounded-xl text-(color-text) placeholder-(color-text-muted) text-sm focus:outline-none transition-colors border ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-(color-border) focus:border-indigo-500"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-(color-text-muted) uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative flex items-center">
            <Lock className="w-5 h-5 text-(color-text-muted) absolute left-3.5 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-11 pr-11 py-2.5 bg-(color-surface-2) rounded-xl text-(color-text) placeholder-(color-text-muted) text-sm focus:outline-none transition-colors border ${
                errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-(color-border) focus:border-indigo-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-(color-text-muted) hover:text-(color-text) focus:outline-none"
            >
              {showPassword ? (
                <EyeSlash className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          radius="md"
          className="w-full mt-2 h-[48px] bg-gradient-to-r border-none text-md from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white font-medium px-4 shadow-md transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Authenticating..." : "Authenticate"}
        </Button>
      </form>
    </div>
  );
}
