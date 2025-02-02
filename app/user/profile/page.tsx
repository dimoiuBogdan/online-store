import { auth } from "@/auth";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";
export const metadata: Metadata = {
  title: "Profile",
  description: "Profile page",
};

const ProfilePage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="h2-bold">Profile</h2>
        <ProfileForm />
      </div>
    </SessionProvider>
  );
};

export default ProfilePage;
