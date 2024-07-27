import React from 'react'
import { getDepth, getKlines, getMarkets } from '../utils/httpClient'
import Asks from './depth/AskTable';
import Depth from './depth/Depth';

const MarketBar = async () => {

  const {bids, asks, lastUpdateId} = await getDepth("SOL_USDC");
  const kLines = await getKlines("SOL_USDC","1h",1720737000,1720843662);
  const markets: string[] = await getMarkets();
  
  return (
    <div>
      <div className='h-14 w-full bg-neutral-900 border-gray-800 border-[1px]'></div>
      {bids.map(bid => {
        return <div className='text-white'>
          {bid}
          </div>
      })}
      {/* {markets.map((market) => {
        const obj = JSON.parse(JSON.stringify(market))
        return <div className='text-emerald-500'>
          {{obj.baseSymbol} }
          {obj.filters.price.tickSize}
          {JSON.stringify(market)} 
        </div>
      })}  */}
      {/* <Asks /> */}
      <Depth />
    </div>
  )
}

export default MarketBar
