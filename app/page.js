import { redirect } from "next/navigation";
import Me from "./hooks/Me";

export default async function Home() {
  const { user } = Me()

  if (!user) {
    redirect("/login")
  }

  // Redirect authenticated users to admin dashboard
  redirect("/admin")
}
