"use client";

import { authClient } from "@/lib/auth-client";
import { authToasts } from "@/lib/toast";
import {
  ArrowLeft,
  Envelope,
  Eye,
  EyeSlash,
  Lock,
  Person,
} from "@gravity-ui/icons";
import { Button, Description, Radio, RadioGroup } from "@heroui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function resolveNextPath(raw) {
  if (typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")) {
    if (raw !== "/auth/signin" && raw !== "/auth/signup") return raw;
  }
  return "/dashboard";
}

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "seeker",
    plan: "free",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const newErrors = {};
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
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await authClient.signUp.email({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        plan: formData.plan,
      });
      if (authError) {
        authToasts.signUpFailed(authError);
        setLoading(false);
        return;
      }
      authToasts.signUpSuccess({ name: formData.name, role: formData.role });
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setTimeout(() => {
        router.push(resolveNextPath(searchParams.get("next")));
      }, 1200);
    } catch (err) {
      authToasts.networkError();
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 text-sm font-medium text-(color-text-muted) hover:text-(color-text) transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Sign In</span>
        </Link>
        <Link href="/" className="flex items-center text-lg font-bold">
          <span className="text-[#0072FF]">Hire</span>
          <span className="text-[#FF6A00]">Sphere</span>
        </Link>
      </div>

      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold text-(color-text) tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-(color-text-muted)">
          Join HireSphere and accelerate your career with AI matching.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-(color-text-muted) uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative flex items-center">
            <Person className="w-5 h-5 text-(color-text-muted) absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-11 pr-4 py-2.5 bg-(color-surface-2) rounded-xl text-(color-text) placeholder-(color-text-muted) text-sm focus:outline-none transition-colors border ${
                errors.name
                  ? "border-red-500 focus:border-red-500"
                  : "border-(color-border) focus:border-indigo-500"
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-(color-text-muted) uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Envelope className="w-5 h-5 text-(color-text-muted) absolute left-3.5 pointer-events-none" />
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
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
          <label className="block text-xs font-semibold text-(color-text-muted) uppercase tracking-wider mb-1.5">
            Password
          </label>
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
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-(color-text-muted) uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-5 h-5 text-(color-text-muted) absolute left-3.5 pointer-events-none" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-11 pr-11 py-2.5 bg-(color-surface-2) rounded-xl text-(color-text) placeholder-(color-text-muted) text-sm focus:outline-none transition-colors border ${
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500"
                  : "border-(color-border) focus:border-indigo-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 text-(color-text-muted) hover:text-(color-text) focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeSlash className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="mt-4">
          <RadioGroup
            value={formData.role}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, role: value }))
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
              <Description>Hunt Talent</Description>
            </Radio>
          </RadioGroup>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          radius="md"
          className="w-full mt-2 h-[48px] bg-gradient-to-r border-none text-md from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-foreground font-medium px-4 shadow-md transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-(color-text-muted) mt-6">
        Already have an account?{" "}
        <Link
          href={(() => {
            const next = searchParams.get("next");
            return next
              ? `/auth/signin?next=${encodeURIComponent(next)}`
              : "/auth/signin";
          })()}
          className="text-indigo-500 font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
