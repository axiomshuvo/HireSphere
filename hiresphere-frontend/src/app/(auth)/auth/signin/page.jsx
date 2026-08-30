import { Suspense } from "react";
import SignInForm from "./SignInForm";

export const dynamic = "force-dynamic";

export default function SignIn() {
  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="h-96 w-full max-w-md" />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
