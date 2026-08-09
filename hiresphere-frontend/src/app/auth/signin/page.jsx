"use client";

import { authClient } from "@/lib/auth-client";
import { ArrowLeft, Envelope, Eye, EyeSlash, Lock } from "@gravity-ui/icons";
// Strictly V3 API: using global `toast`
import { Button, toast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State to hold field-specific inline validation errors
  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear the specific inline error when the user starts typing again
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Inline Form Validations (NO Toasts here)
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password.";
    }

    // If there are validation errors, update the inputs and stop execution
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Execute standard Better-Auth payload request
      const { error: authError } = await authClient.signIn.email({
        email: formData.email.trim(),
        password: formData.password,
      });

      // 2. Server API Error Response -> Shown in v3 Toast
      if (authError) {
        toast.danger("Sign In Failed", {
          description: authError.message || "Invalid email or password.",
        });
        setLoading(false);
        return;
      }

      // 3. Server API Success Response -> Shown in v3 Toast
      toast.success("Welcome Back!", {
        description: "Signed in successfully. Redirecting...",
      });

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      console.error("Critical Signin Error:", err);
      // Fallback Network Error -> Shown in v3 Toast
      toast.danger("Network Error", {
        description: "A critical network error occurred. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-[#121316] border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl relative">
        {/* Navigation Top Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <Link href="/" className="flex items-center text-lg font-bold">
            <span className="text-[#0072FF]">Hire</span>
            <span className="text-[#FF6A00]">Sphere</span>
          </Link>
        </div>

        {/* Title Block */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to your HireSphere account to continue.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Email Wrapping UI Block */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Envelope className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#1b1c1e] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none transition-colors border ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-white/10 focus:border-indigo-500"
                }`}
              />
            </div>
            {/* Inline Validation Error */}
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
            )}
          </div>

          {/* Password Wrapping UI Block */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#4f46e5] dark:text-[#818cf8] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-11 pr-11 py-2.5 bg-gray-50 dark:bg-[#1b1c1e] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none transition-colors border ${
                  errors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-white/10 focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? (
                  <EyeSlash className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {/* Inline Validation Error */}
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
            )}
          </div>

          {/* V3 Requisite loading UI swap inside HeroUI Components */}
          <Button
            type="submit"
            isLoading={loading}
            radius="md"
            className="w-full mt-2 h-[48px] bg-gradient-to-r border-none text-md from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white font-medium px-4 shadow-md transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-[#4f46e5] dark:text-[#818cf8] font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
