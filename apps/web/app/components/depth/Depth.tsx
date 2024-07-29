"use client"
import React, { use, useEffect, useState } from 'react'
import { getDepth, getTicker } from '../../utils/httpClient';
import { Ticker } from '../../utils/types';
import AskTable from './AskTable';
import BidTable from './BidTable';

const Depth = ({ market }:{market: string}) => {
    const [asks, setAsks] = useState<[string,string][]>();
    const [bids, setBids] = useState<[string,string][]>();
    const [price, setPrice] = useState<any>();

    useEffect(()=> {
        getDepth(market)
        .then(d => setAsks(d.asks));
        getDepth(market)
        .then(d => setBids(d.bids));
        getTicker(market)
        .then(setPrice)
    },[])
    
  return (
    <div>
      <TableHeader />
      { asks && <AskTable asks={asks} />}
      {/* { asks && <AskTable asks={asks} />} */}
      { price && <div>{price}</div>}
      { bids && <BidTable bids={bids}/>}
      
    </div>
  )
}

export default Depth

function TableHeader() {
  return <div className="flex justify-between text-xs">
  <div className="text-white">Price</div>
  <div className="text-slate-500">Size</div>
  <div className="text-slate-500">Total</div>
</div>
}
