import Image from "next/image";
import Loading from "./loading";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
   const cookieStore = await cookies();
  const user = cookieStore.get("user");
 
  if (!user){
    redirect("/login") 
  }

  if(!user){return (<Loading/>)}

}
