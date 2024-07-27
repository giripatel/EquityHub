"use client"
import React, { use, useEffect, useState } from 'react'
import { getDepth, getTicker } from '../../utils/httpClient';
import { Ticker } from '../../utils/types';
import AskTable from './AskTable';

const Depth = (market: string) => {
    const [asks, setAsks] = useState<[string,string][]>();
    const [bids, setBids] = useState<[string,string][]>();
    const [price, setPrice] = useState<Ticker>();

    useEffect(()=> {
        
        (async ()=> {
            const depth = await getDepth("SOL_USDC");
            const ticker = await getTicker("SOL_USDC");
            setAsks(depth.asks);
            setBids(depth.bids);
            setPrice(ticker)
        })()
    },[])
  return (
    <div>
      { asks && <AskTable asks={asks} />}
      
    </div>
  )
}

export default Depth
