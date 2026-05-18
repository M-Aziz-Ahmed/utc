import { cookies } from "next/headers";

const Me = async () => {
  const cookieStore = await cookies();
  const user = cookieStore.get("user") || null;
  return { user };
};

export default Me;