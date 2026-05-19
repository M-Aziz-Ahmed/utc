import User from "@/models/User";
import { cookies } from "next/headers";

const Me = async () => {
  const cookieStore = await cookies();
  const cuser = cookieStore.get("user");
  if (!cuser) return { user: null };
  const user = await User.findById(cuser.value)
  return { user };
};

export default Me;