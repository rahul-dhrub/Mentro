import Image from "next/image";
import FeedPage from "./feed/page";
import LandingPage from "./landing/LandingPage";
import FloatingContactButton from "./components/FloatingContactButton";

export default function Home() {
  return (
    <div className="relative">
      {/* <FeedPage/> */}
      <LandingPage/>
      <FloatingContactButton />
    </div>
  );
}
