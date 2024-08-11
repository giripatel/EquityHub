"use client";

import { useParams } from "next/navigation";
import React from "react";
import MarketBar from "../../components/MarketBar";
import TradeChartView from "../../components/TradeChartView";
import Depth from "../../components/depth/Depth";
import { SwapUI } from "../../components/SwapUI";

const page = () => {
  const { market } = useParams();

  return (
    <div className="flex w-full bg-[#0e0f14]">
      <div className="w-full">
        <MarketBar market={market as string} />
        <div className="flex w-[77rem] h-[620px]">
          <TradeChartView market={market as string} />
          <Depth market={market as string} />
        </div>
      </div>
      <SwapUI market={market as string} />
    </div>
  );
};

export default page;
