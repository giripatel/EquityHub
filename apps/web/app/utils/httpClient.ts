import axios from 'axios';
import {Depth, Ticker, Trade, KLine} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getDepth(market:string): Promise<Depth> {
    // const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`)
    const response = await axios.get(`http://localhost:3000/api/v1/depth?symbol=${market}`)
    return response.data;
}

export async function getTrades(market:string): Promise<Trade[]> {
    const response = await axios.get(`${BASE_URL}/trade?symbol=${market}`);
    return response.data;
}

export async function getKlines(market:string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
    const response = await axios.get(`${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
    const data: KLine[] = response.data;
    return data.sort((x,y) => (Number(x.end) < Number(y.end) ? -1 : 1));
}
export async function getMarkets(): Promise<string[]> {
    const response = await axios.get(`${BASE_URL}/markets`);
    return response.data;
}

export async function getTicker(market: string): Promise<Ticker> {
    const tickers = await getTickers();
    const ticker = tickers.find((t: any) => t.symbol === market);
    if(!ticker){
        throw new Error(`No ticker found for ${market}`);
    }
    return ticker;
}

export async function getTickers() {
    const response = await axios.get(`${BASE_URL}/tickers`);
    return response.data;
}