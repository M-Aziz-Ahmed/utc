import Image from "next/image";
import Me from "./hooks/Me";
import Loading from "./loading";

export default function Home() {
  const {user} = Me()

  if(!user){return (<Loading/>)}

}
