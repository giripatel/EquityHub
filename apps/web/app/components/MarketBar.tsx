"use client"
import React, { useEffect, useState } from 'react'
// import { getDepth, getKlines, getMarkets, getTicker } from '../ut    ils/httpClient'
import Asks from './depth/AskTable';
import Depth from './depth/Depth';
import { Ticker as TickerType} from '../utils/types';
import { SignalingManager } from '../utils/SignalingManager';


const MarketBar = ({market}: { market: string }) => {

  const [ticker, setTicker] = useState<TickerType | null>(null);
  useEffect(()=> {
    // getTicker(market)
    // .then(ticker => setTicker(ticker))

    SignalingManager.getInstance().registerCallback("ticker", (data: Partial<TickerType>) => setTicker(prev => ({
    firstPrice: data.firstPrice ?? prev?.firstPrice ?? "",
    high: data.high ?? prev?.high ?? "",
    lastPrice: data.lastPrice ?? prev?.lastPrice ?? "",
    low: data.low ?? prev?.low ?? "",
    priceChange: data.priceChange ?? prev?.priceChange ?? "",
    priceChangePercent: data.priceChangePercent ?? prev?.priceChangePercent ?? "",
    quoteVolume: data.quoteVolume ?? prev?.quoteVolume ?? "",
    symbol: data.symbol ?? prev?.symbol ?? "",
    trades: data.trades ?? prev?.trades ?? "",
    volume: data.volume ?? prev?.volume ?? ""
    })), market)
    
    SignalingManager.getInstance().sendMessage(`{"method":"SUBSCRIBE","params":["ticker.${market}"],"id":1}`)
console.log("Reaching h");

    return () => {
        SignalingManager.getInstance().deregisterCallback("ticker",market)
        SignalingManager.getInstance().sendMessage(`{"method":"UNSUBSCRIBE","params":["ticker.${market}"],"id":4}`)
    }
  },[market])   
  
  return <div>
  <div className="flex items-center flex-row relative w-full overflow-hidden border-b border-slate-800">
      <div className="flex items-center justify-between flex-row no-scrollbar overflow-auto pr-4">
              <Ticker market={market} />
              <div className="flex items-center flex-row space-x-8 pl-4">
                  <div className="flex flex-col h-full justify-center">
                      <p className={`font-medium tabular-nums text-greenText text-md text-green-500`}>${ticker?.lastPrice}</p>
                      <p className="font-medium text-white text-sm tabular-nums">${ticker?.lastPrice}</p>
                  </div>
                  <div className="flex flex-col">
                      <p className={`font-medium text-slate-400 text-sm`}>24H Change</p>
                      <p className={` font-medium tabular-nums leading-5 text-sm text-greenText ${Number(ticker?.priceChange) > 0 ? "text-green-500" : "text-red-500"}`}>{Number(ticker?.priceChange) > 0 ? "+" : ""} {ticker?.priceChange} {Number(ticker?.priceChangePercent)?.toFixed(2)}%</p></div><div className="flex flex-col">
                          <p className="font-medium text-slate-400 text-sm">24H High</p>
                          <p className="font-medium tabular-nums leading-5 text-white text-sm ">{ticker?.high}</p>
                          </div>
                          <div className="flex flex-col">
                              <p className="font-medium text-slate-400 text-sm">24H Low</p>
                              <p className="font-medium tabular-nums leading-5 text-white text-sm ">{ticker?.low}</p>
                          </div>
                      <button type="button" className="font-medium transition-opacity hover:opacity-80 hover:cursor-pointer text-base text-left" data-rac="">
                          <div className="flex flex-col">
                              <p className="font-medium text-slate-400 text-sm">24H Volume</p>
                              <p className="mt-1 font-medium tabular-nums text-white leading-5 text-sm ">{(Number(ticker?.volume) || 0).toLocaleString()}
                          </p>
                      </div>
                  </button>
              </div>
          </div>
      </div>
  </div>
}

function Ticker({market}: {market: string}) {
  return <div className="flex h-[60px] shrink-0 space-x-4">
      <div className="flex flex-row relative ml-2 -mr-4">
          <img alt="SOL Logo" loading="lazy" decoding="async" data-nimg="1" className="z-10 rounded-full h-6 w-6 mt-4 outline-baseBackgroundL1"  src="/sol.webp" />
          <img alt="USDC Logo" loading="lazy"decoding="async" data-nimg="1" className="h-6 w-6 -ml-2 mt-4 rounded-full" src="/usdc.webp" />
      </div>
  <button type="button" className="react-aria-Button" data-rac="">
      <div className="flex items-center justify-between flex-row cursor-pointer rounded-lg p-3 hover:opacity-80">
          <div className="flex items-center flex-row gap-2 undefined">
              <div className="flex flex-row relative">
                  <p className="font-medium text-white text-sm undefined">{market.replace("_", " / ")}</p>
              </div>
          </div>
      </div>
  </button>
  </div>
}
export default MarketBar
