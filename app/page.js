import { redirect } from "next/navigation";
import Me from "./hooks/Me";

export default async function Home() {
  const { user } = await Me()

  if (!user) {
    redirect("/login")
  }

  return (
    <span className='text-[white!important]'>{user?.email}</span>
  )

}
