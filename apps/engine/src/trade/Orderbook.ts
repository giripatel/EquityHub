export const BASE_CURRENCY = "USDC";

export interface Order {
  price: number;
  quantity: number;
  orderId: string;
  filled: number;
  side: "buy" | "sell";
  userId: string;
}

export interface Fill {
  price: string;
  quantity: number;
  tradedId: number;
  otherUserId: string;
  markerOrdereId: string;
}

export class Orderbook {
  baseAsset: string;
  bids: Order[];
  asks: Order[];
  lastTradedId: number;
  currentPrice: number;
  quoteAsset: string = BASE_CURRENCY;

  public constructor(
    baseAsset: string,
    bids: Order[],
    asks: Order[],
    lastTradedId: number,
    currentPrice: number
  ) {
    this.baseAsset = baseAsset;
    this.bids = bids;
    this.asks = asks;
    this.lastTradedId = lastTradedId;
    this.currentPrice = currentPrice;
  }

  ticker() {
    return `${this.baseAsset}_${this.quoteAsset}`;
  }

  getSnapShot() {
    return {
      asks: this.asks,
      bids: this.bids,
      lastTradedId: this.lastTradedId,
      baseAsset: this.baseAsset,
      currentPrice: this.currentPrice,
    };
  }

  addOrder(order: Order) {
   if(order.side === 'buy') {
        const {executedQty, fills} = this.matchAsk(order);
        order.filled = executedQty;
        if(executedQty === order.quantity){
            return {
                executedQty,
                fills
            }
        }
        this.asks.push(order)
        return {
            executedQty,
            fills
        }
   } else {
        const {executedQty, fills} = this.matchBid(order);
        order.filled = executedQty;
        if(executedQty === order.quantity) {
            return {
                executedQty,
                fills
            }
        }

        this.bids.push(order);
        
        return {
            executedQty,
            fills
        }
   }
  }

  matchAsk(order: Order): { executedQty: number; fills: Fill[] } {
    const fills: Fill[] = [];
    let executedQty = 0;

    for (let i = 0; i < this.asks.length; i++) {
      if (this.asks[i].price <= order.price && executedQty < order.quantity) {
        const filledQuantity = Math.min(
          this.asks[i].quantity,
          order.quantity - executedQty
        );
        executedQty += filledQuantity;
        this.asks[i].filled += filledQuantity;

        fills.push({
          price: this.asks[i].price.toString(),
          quantity: filledQuantity,
          tradedId: this.lastTradedId++,
          otherUserId: this.asks[i].userId,
          markerOrdereId: this.asks[i].orderId,
        });
      }
    }

    for (let i = 0; i < this.asks.length; i++) {
      if (this.asks[i].filled === this.asks[i].quantity) {
        this.asks.splice(i, 1);
        i--;
      }
    }
    return {
      executedQty,
      fills,
    };
  }

  matchBid(order: Order): {executedQty: number, fills: Fill[]} {
        const fills: Fill[] = [];
        let executedQty = 0;

        for(let i = 0; i < this.bids.length; i ++){
            if(this.bids[i].price <= order.quantity && executedQty < order.quantity){
                const filledQuantity = Math.min(order.quantity - executedQty, this.bids[i].quantity);
                executedQty += filledQuantity;
                this.bids[i].filled += filledQuantity;
                fills.push({
                    price: this.bids[i].price.toString(),
                    quantity: filledQuantity,
                    tradedId: this.lastTradedId++,
                    otherUserId: this.bids[i].userId,
                    markerOrdereId: this.bids[i].userId
                })
            }
        }

        for(let i = 0; i < this.bids.length; i ++) {
            if (this.bids[i].filled === this.bids[i].quantity) {
                this.bids.splice(i,1);
                i --;
            }
        }

        return {
            executedQty,
            fills
        }
  }

  getDepth(){
    const bids: [string, string][] = [];
    const asks: [string, string][] = [];

    const bidsObj: {[key: string]: number} = {}
    const asksObj: {[key: string]: number} = {}

    for(let i = 0; i < this.bids.length; i ++){
        const order = this.bids[i];
        if (!bidsObj[order.price]) {
            bidsObj[order.price] = 0;
        }
        bidsObj[order.price] += order.quantity;
    }

    for(let i = 0; i < this.asks.length; i ++) {
        const order = this.asks[i];
        if(!asksObj[order.price]) {
            asksObj[order.price] = 0;
        }
        asksObj[order.price] += order.quantity;
    }

    for (const price in bidsObj) {
        bids.push([price,bidsObj[price].toString()])
    }
    for (const price in asksObj) {
        bids.push([price,asksObj[price].toString()])
    }

    return {
        bids,
        asks
    }
  }

  getOpenOrders(userId: string): Order[] {
    const openBids = this.bids.filter(bid => bid.userId === userId)
    const openAsks = this.asks.filter(ask => ask.userId === userId)

    return [...openBids,...openAsks]
  }

  cancelBid(order: Order) {
    const index = this.bids.findIndex(bid => bid.orderId === order.orderId);
    if (index != -1) {
        const price = this.bids[index].price;
        this.bids.splice(index,1);
        return price;
    }
  }
  cancelAsk(order: Order) {
    const index = this.asks.findIndex(ask => ask.orderId === order.orderId);
    if (index != -1) {
        const price = this.asks[index].price;
        this.asks.splice(index,1);
        return price;
    }
  }
}
