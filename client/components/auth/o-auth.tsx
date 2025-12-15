"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useGoogleOAuth } from "@/lib/hooks/auth/useGoogleOAuth";
import { useRouter } from "next/navigation";

export default function OAuth() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: signInWithGoogle, isPending, error } = useGoogleOAuth();

  const handleOAuth = () => {
    setServerError(null);

    signInWithGoogle(undefined, {
      onSuccess: (data) => {
        toast.success("Login successful");
        router.push("/");
      },

      onError: (err: any) => {
        console.error("Google OAuth failed:", err);

        setServerError(
          err?.response?.data?.message ??
            "Google login failed. Please try again."
        );
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Server Error Box */}
      {serverError && (
        <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm flex items-center gap-x-2 border border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <p>{serverError}</p>
        </div>
      )}

      <Button
        className="text-black flex items-center gap-3 w-full h-11 rounded-lg"
        variant={"outline"}
        onClick={handleOAuth}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
          </>
        ) : (
          <>
            <span>Continue With Google</span>
            <Image
              src={"/icons/google.svg"}
              alt="google"
              width={18}
              height={18}
              className="ml-2"
            />
          </>
        )}
      </Button>
    </div>
  );
}
