import Image from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import AppBar from "./components/depth/AppBar";
import MarketBar from "./components/MarketBar";

export default function Home() {
  return (
    <>
      <AppBar />
      <MarketBar />
    </>
  );
}
