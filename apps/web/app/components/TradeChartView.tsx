"use client"
import React, { useEffect, useRef } from "react";
import { ChartManager } from "../utils/ChartManager";
import { KLine } from "../utils/types";
import { getKlines } from "../utils/httpClient";

const TradeChartView = ({ market }: { market: string }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager>(null);

  const init =  () => {
    let klineData: KLine[] = [];
    try {
      getKlines(
        market,
        "1h",
        Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24) / 1000),
        Math.floor(new Date().getTime() / 1000)
      ).then(data=> klineData=data);
    } catch (e) {}

    if (chartRef) {
      if (chartManagerRef.current) {
        chartManagerRef.current.destroy();
      }
      const chartManager = new ChartManager(
        chartRef.current,
        [
          ...klineData?.map((x) => ({
            close: parseFloat(x.close),
            high: parseFloat(x.high),
            low: parseFloat(x.low),
            open: parseFloat(x.open),
            timestamp: new Date(x.end),
          })),
        ].sort((x, y) => (x.timestamp < y.timestamp ? -1 : 1)) || [],
        {
          background: "#0e0f14",
          color: "white",
        }
      );
      //@ts-ignore
      chartManagerRef.current = chartManager;
    }
  };

  useEffect(() => {
    init();
  },[market,chartRef]);

  return <div>
    <div ref={chartRef} style={{ height: "520px", width: "100%", marginTop: 4 }}></div>
  </div>;
};

export default TradeChartView;
