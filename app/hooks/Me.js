import { cookies } from "next/headers";

const Me = async () => {
  const cookieStore = await cookies();
  const user = 'aziz'
  return { user };
};

export default Me;