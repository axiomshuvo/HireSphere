"use client";

import {
  ArrowLeft,
  Check,
  Envelope,
  Eye,
  EyeSlash,
  Lock,
  Person,
  TriangleExclamation,
} from "@gravity-ui/icons";
import Link from "next/link";
import { useState } from "react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Form Validations
    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify again.");
      return;
    }

    // Simulate API Sign Up Request
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("Account created successfully! Welcome to HireSphere.");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    }, 1000);
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      {/* Sign Up Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#121316] border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl relative">
        {/* Navigation Top Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Sign In</span>
          </Link>

          {/* HireSphere Brand Logo */}
          <Link href="/" className="flex items-center text-lg font-bold">
            <span className="text-[#0072FF]">Hire</span>
            <span className="text-[#FF6A00]">Sphere</span>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Join HireSphere and accelerate your career with AI matching.
          </p>
        </div>

        {/* Error Feedback Message */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
            <TriangleExclamation className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Feedback Message */}
        {success && (
          <div className="mb-5 p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-600 dark:text-green-400 text-sm">
            <Check className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative flex items-center">
              <Person className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#1b1c1e] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Email Address */}
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
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#1b1c1e] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Password with Show/Hide Toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-11 py-2.5 bg-gray-50 dark:bg-[#1b1c1e] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlash className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password with Show/Hide Toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 pointer-events-none" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-11 pr-11 py-2.5 bg-gray-50 dark:bg-[#1b1c1e] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeSlash className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Navigation to Sign In Page */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-[#4f46e5] dark:text-[#818cf8] font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
