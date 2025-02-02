import { getUserById } from "@/lib/actions/user.actions";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UpdateUserForm from "./update-user-form";

export const metadata: Metadata = {
  title: "Edit User",
};

const AdminUserUpdatePage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;

  const user = await getUserById(id);

  if (!user) {
    return notFound();
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <h1 className="h2-bold">Edit User</h1>
      <UpdateUserForm user={user} />
    </div>
  );
};

export default AdminUserUpdatePage;
