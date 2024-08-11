"use client"
import React, { use, useEffect, useState } from 'react'
import { getDepth, getTicker } from '../../utils/httpClient';
import { Depth as DepthType, Ticker } from '../../utils/types';
import AskTable from './AskTable';
import BidTable from './BidTable';
import { SignalingManager } from '../../utils/SignalingManager';

const Depth = ({ market }:{market: string}) => {
    const [asks, setAsks] = useState<[string,string][]>([[
      "180.58",
      "13.84"
  ],
  [
      "180.62",
      "144.73"
  ],
  [
      "180.63",
      "30.24"
  ]]);
    const [bids, setBids] = useState<[string,string][]>([[
      "180.58",
      "13.84"
  ],
  [
      "180.62",
      "144.73"
  ],
  [
      "180.63",
      "30.24"
  ]]);
    const [price, setPrice] = useState<any>(180.58);

    useEffect(()=> {
        // getDepth(market)
        // .then(d => setAsks(d.asks));
        // getDepth(market)
        // .then(d => setBids(d.bids));
        // getTicker(market)
        // .then(setPrice)
        SignalingManager.getInstance().registerCallback("depth", ({asks, bids}: Partial<DepthType>) => {
          asks?.map(ask => {
            setAsks(prevAsks => [...prevAsks,ask])
          })  
          bids?.map(bid => {
            setBids(prev => [...prev,bid])
          })
        }, market)
        SignalingManager.getInstance().sendMessage(`{"method":"SUBSCRIBE","params":["depth@${market}"],"id":3}`);

        return () => {
        SignalingManager.getInstance().deregisterCallback("depth",market)
        SignalingManager.getInstance().sendMessage(`{"method":"UNSUBSCRIBE","params":["depth@${market}"],"id":3}`)

        }
    },[])
    
  return (
    <div className='w-[320px] border-[1px] border-neutral-800 h-full'>
      <TableHeader />
      { asks && <AskTable asks={asks.sort()} />}
      {/* { asks && <AskTable asks={asks} />} */}
      { price && <div className='text-emerald-500 text-lg'>{price}</div>}
      <div className=''>
      { bids && <BidTable bids={bids.sort()}/>}
      </div>
    </div>
  )
}

export default Depth

function TableHeader() {
  return <div className="flex justify-between text-xs p-1">
  <div className="text-white">Price</div>
  <div className="text-slate-500">Size</div>
  <div className="text-slate-500">Total</div>
</div>
}
