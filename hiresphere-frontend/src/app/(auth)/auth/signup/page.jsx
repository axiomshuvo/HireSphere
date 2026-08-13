"use client";

import { authClient } from "@/lib/auth-client";
import {
  ArrowLeft,
  Envelope,
  Eye,
  EyeSlash,
  Lock,
  Person,
} from "@gravity-ui/icons";
// STRICTLY V3 API: using global `toast`, absolutely NO `addToast`
import { Button, Description, Radio, RadioGroup, toast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUp() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "seeker", // Default role is "seeker"
  });

  // State to hold field-specific inline validation errors
  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Inline Form Validations (NO Toasts here)
    if (!formData.name.trim()) {
      newErrors.name = "Please enter your full name.";
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // If there are validation errors, update the inputs and stop execution
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Send sign-up request to better-auth endpoints

      const { error: authError } = await authClient.signUp.email({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role, // Default to "seeker" if not provided
      });
      console.log("Attempting to sign up with data:", formData);
      // 2. Server API Error Response -> Shown in v3 Toast
      if (authError) {
        toast.danger("Registration Failed", {
          description:
            authError.message ||
            "Failed to create account. Please check your credentials.",
        });
        setLoading(false);
        return;
      }

      // 3. Server API Success Response -> Shown in v3 Toast
      toast.success("Account Created!", {
        description: "Welcome to HireSphere. Redirecting to sign in...",
      });

      setFormData({ name: "", email: "", password: "", confirmPassword: "" });

      // Redirect the user automatically
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err) {
      console.error("Critical Signup Error:", err);
      // Fallback Network Error -> Shown in v3 Toast
      toast.danger("Network Error", {
        description: "A critical network error occurred. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      {/* Sign Up Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#121316] border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl relative">
        {/* Navigation Top Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/auth/signin"
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

        {/* Form Inputs */}
        <form onSubmit={handleSignUp} className="space-y-4">
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
                className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#1b1c1e] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none transition-colors border ${
                  errors.name
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-white/10 focus:border-indigo-500"
                }`}
              />
            </div>
            {/* Inline Validation Error */}
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
            )}
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

          {/* Password */}
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

          {/* Confirm Password */}
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
                className={`w-full pl-11 pr-11 py-2.5 bg-gray-50 dark:bg-[#1b1c1e] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none transition-colors border ${
                  errors.confirmPassword
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-white/10 focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeSlash className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {/* Inline Validation Error */}
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.confirmPassword}
              </p>
            )}
          </div>
          <div className="mt-4 ">
            <RadioGroup
              value={formData.role}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  role: value,
                }))
              }
              name="role"
              orientation="horizontal"
              className="justify-center"
            >
              <Radio value="seeker">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  Job Seeker
                </Radio.Content>
                <Description>For Hunt Jobs</Description>
              </Radio>
              <Radio value="recruiter">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  Recruiter
                </Radio.Content>
                <Description> Hunt Talent </Description>
              </Radio>
            </RadioGroup>
          </div>

          {/* HeroUI V3 Button */}
          <Button
            type="submit"
            isLoading={loading}
            radius="md"
            className="w-full mt-2 h-[48px] bg-gradient-to-r border-none text-md from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white font-medium px-4 shadow-md transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-[#4f46e5] dark:text-[#818cf8] font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
