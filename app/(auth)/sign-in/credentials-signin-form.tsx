"use client";

import { signInWithCredentials } from "@/lib/actions/user.actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

const CredentialsSigninForm = () => {
  const searchParams = useSearchParams();

  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  });

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const signInDefaultValues = {
    email: "",
    password: "",
  };

  const SignInButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button
        type="submit"
        className="w-full"
        variant="default"
        disabled={pending}
      >
        {pending ? "Signing In..." : "Sign In"}
      </Button>
    );
  };

  return (
    <form action={action}>
      <div className="space-y-6">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={signInDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            defaultValue={signInDefaultValues.password}
          />
        </div>
        <SignInButton />

        {!data?.success && (
          <p className="text-sm text-center text-red-500">{data?.message}</p>
        )}

        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" target="_self" className="link">
            Sign up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSigninForm;
