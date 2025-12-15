"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ulid } from "ulid";
import { useRegistration } from "@/lib/hooks/auth/useRegistration";

import { registerSchema } from "@/lib/validations/register.validation";

import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";

type RegisterFormValues = z.infer<typeof registerSchema>;

const SignUp = function () {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isPending, error } = useRegistration();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });
  const user = generateUsername();

  function onSubmit(values: RegisterFormValues) {
    setServerError(null);

    mutate(
      {
        username: user,
        name: values.name,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (error) => {
          console.log(user);
          console.error("Registration failed:", error);
          setServerError("Registration failed. Please try again.");
        },
      }
    );
  }

  return (
    <div className="size-full">
      <h2 className="text-2xl font-bold text-center  mb-6">
        Create Your Account
      </h2>

      {/* Global Error Alert */}
      {serverError && (
        <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-x-2">
          <AlertCircle className="h-4 w-4" />
          <p>{serverError}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    type="text"
                    placeholder="Your Name"
                    className="h-11 rounded-lg border-gray-300/30 focus:border-[#003087] focus:ring-[#003087] transition"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 rounded-lg border-gray-300/[.3] focus:border-[#003087] focus:ring-[#003087] transition"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      disabled={isPending}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 pr-10 rounded-lg border-gray-300/30 focus:border-[#003087] focus:ring-[#003087] transition"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      className=""
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      disabled={isPending}
                      type={showPasswordConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 pr-10 rounded-lg border-gray-300/30 focus:border-[#003087] focus:ring-[#003087] transition"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowPasswordConfirm((prev) => !prev)}
                    >
                      {showPasswordConfirm ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                      <span className="sr-only">
                        {showPasswordConfirm
                          ? "Hide password"
                          : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant={"default"}
            disabled={isPending}
            className=""
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className={` font-semibold hover:underline ${
            isPending ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export function generateUsername() {
  return `@user_${ulid().toLowerCase()}`;
}

export default SignUp;
