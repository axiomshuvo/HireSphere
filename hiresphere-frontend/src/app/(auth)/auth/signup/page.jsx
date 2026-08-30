import { Suspense } from "react";
import SignUpForm from "./SignUpForm";

export const dynamic = "force-dynamic";

export default function SignUp() {
  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="h-[600px] w-full max-w-md" />}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
