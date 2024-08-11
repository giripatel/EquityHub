import { RedisManager } from "../RedisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_DEPTH, GET_OPEN_ORDERS, MessageFromApi, ON_RAMP } from "../types/fromAPI";
import { Fill, Order, Orderbook } from "./Orderbook";
import fs from "fs";
import { BASE_CURRENCY } from "./Orderbook";
interface UserBalance {
  [key: string]: {
    available: number;
    locked: number;
  };
}

export class Engine {
  orderbooks: Orderbook[] = [];
  balances: Map<string, UserBalance> = new Map();

  constructor() {
    let snapshot = null;
    try {
      snapshot = fs.readFileSync("./    .json", { encoding: "utf-8" });
    } catch {
      console.log("Snap shot not found");
    }

    if (snapshot) {
      const snapShotData = JSON.parse(snapshot.toString());
      this.orderbooks = snapShotData.orderbooks.map(
        (o: Orderbook) =>
          new Orderbook(
            o.baseAsset,
            o.bids,
            o.asks,
            o.lastTradedId,
            o.currentPrice
          )
      );
      this.balances = new Map(snapShotData.balances);
    } else {
      this.orderbooks = [new Orderbook("TATA", [], [], 0, 0)];
      this.setBaseBalances();
    }

    setInterval(() => {
      this.saveSnapshot();
    }, 3);
  }

  saveSnapshot() {
    const snapShotData = {
      orderbooks: this.orderbooks.map((o) => o.getSnapShot()),
      balances: Array.from(this.balances.entries()),
    };
    fs.writeFileSync("./snapshot.json", JSON.stringify(snapShotData));
  }

  process({message, clientId}: {message: MessageFromApi, clientId: string}) {

    switch(message.type){
        case CREATE_ORDER: 
            try {
                const {executedQty, fills, orderId} = this.createOrder(message.data.market,message.data.price,message.data.quantity,message.data.side,message.data.userId);
                
                RedisManager.getInstance().publishToAPI(clientId,{
                    type: "ORDER_PLACED",
                    payload: {
                        executedQty,
                        fills,
                        orderId
                    }
                }
                );

            } catch (error) {
                console.log(error);
                RedisManager.getInstance().publishToAPI(clientId,{
                    type: "ORDER_CANCELLED",
                    payload: {
                        executedQty: 0,
                        remainingQty: 0,
                        orderId: ""
                    }
                })
            }
            break;
        case CANCEL_ORDER:
            try {
                const market = message.data.market;
                const orderId = message.data.market;
                const cancleOrderBook = this.orderbooks.find(o => o.ticker() === market);
                const quoteAsset = market.split("_")[1];
                if(!cancleOrderBook){
                    throw new Error("Orderbook not found");
                }

                const order = cancleOrderBook.asks.find(ask => ask.orderId === orderId) || cancleOrderBook.bids.find(bid => bid.orderId === orderId);
                if(!order) {
                    throw new Error("Order not found");
                }
                if (order.side === "buy") {
                   const price = cancleOrderBook.cancelBid(order);
                   const quantityLeft = order.price * (order.quantity - order.filled);
                    //@ts-ignore
                    this.balances.get(order.userId)[BASE_CURRENCY].available += quantityLeft;
                    //@ts-ignore
                    this.balances.get(order.userId)[BASE_CURRENCY].locked -= quantityLeft;
                    if (price) {
                        this.sendUpdatedDepthAt(price.toString(),market)
                    }
                } else {
                    const price =  cancleOrderBook.cancelAsk(order);
                    const quantityLeft = order.price * (order.quantity - order.filled);

                    //@ts-ignore
                    this.balances.get(order.userId)[quoteAsset].available += quantityLeft;
                    //@ts-ignore
                    this.balances.get(order.userId)[quoteAsset].locked -= quantityLeft;
                    if (price) {
                        this.sendUpdatedDepthAt(price.toString(), market);
                    }
                }

                RedisManager.getInstance().publishToAPI(clientId,{
                    type: "ORDER_CANCELLED",
                    payload: {
                        orderId,
                        executedQty: 0,
                        remainingQty: 0
                    }
                })

            } catch (error) {
                console.log(error);
                console.log("Error while canceling order");
            }
            break;
        case GET_DEPTH:
            try {
                const orderbook = this.orderbooks.find(o => o.ticker() === message.data.market);
                if (!orderbook) {
                    throw new Error("Market not found");
                }
                RedisManager.getInstance().publishToAPI(clientId,{
                    type: GET_DEPTH,
                    paylod:{
                        asks: orderbook.getDepth().asks,
                        bids: orderbook.getDepth().bids,
                    }
                })
            } catch (error) {
                console.log("Error while fetching depth");
                RedisManager.getInstance().publishToAPI(clientId, {
                    type: "DEPTH",
                    payload: {
                        bids: [],
                        asks: []
                    }
                });
            }
            break;
        case ON_RAMP:
            const userId = message.data.userId;
            const amount = message.data.amount;
            this.onRamp(userId,Number(amount));
            break;
        case GET_OPEN_ORDERS:
            try {                
                const market = message.data.market
                const id = message.data.userId;
                const orderbook = this.orderbooks.find(o => o.ticker() === market)
                if(!orderbook){
                    throw new Error("Orderbook not found");
                }
                const openOrders = orderbook.getOpenOrders(id);
                RedisManager.getInstance().publishToAPI(clientId,{
                    type: "OPEN_ORDERS",
                    payload: {
                        openOrders
                    }
                })
            } catch (error) {
                console.log(error);
                    
            }
            break;
    }

  }

  addOrderbook(orderbook: Orderbook) {
    this.orderbooks.push(orderbook);
  }

  createOrder(
    market: string,
    price: string,
    quantity: string,
    side: "buy" | "sell",
    userId: string
  ) {
    const orderbook = this.orderbooks.find((o) => market === o.ticker());
    const baseAsset = market.split("_")[0];
    const quoteAsset = market.split("_")[0];
    
    if (!orderbook) {
      throw new Error("Market not found");
    }

    this.checkAndLockFunds(userId,Number(quantity),baseAsset,quoteAsset,Number(price),side);
    
    const randmonOrderId = Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
    const order: Order = {
        price: Number(price),
        quantity: Number(quantity),
        side: side,
        userId: userId,
        filled: 0,
        orderId: randmonOrderId
    }
    
    const {executedQty, fills} = orderbook.addOrder(order);
    
    // this.updateBalance(userId, baseAsset, quoteAsset, side, fills,  executedQty);
    this.publishWsTrades(fills,userId,market);
    this.publishWsDepthUpdates(fills, price, side, market);
    // this.createDbTrades(fills, market, userId);
    // this.updateDbOrders(market,executedQty,fills,order)
    return { 
        executedQty, 
        fills,
        orderId: randmonOrderId
    }
  }

  updateDbOrders(market: string, executedQty: number, fills: Fill[], order: Order) {
    RedisManager.getInstance().pushToDb({
        type: "ORDER_UPDATE",
        data: {
            orderId: order.orderId,
            executedQty: executedQty,
            quantity: order.quantity,
            price: order.price.toString(),
            market: market,
            side: order.side
        }
    })

    fills.forEach(fill => {
        RedisManager.getInstance().pushToDb({
            type: "ORDER_UPDATE",
            data: {
                orderId: fill.markerOrdereId,
                executedQty: fill.quantity
            }
        })
    })
  }

  createDbTrades(fills: Fill[], market: string, userId: string) {
    fills.forEach(fill => {
        RedisManager.getInstance().pushToDb({
            type: "TRADE_ADDED",
            data: {
                market: market,
                price: fill.price,
                quantity: fill.quantity,
                id: fill.tradedId,
                quoteQuantity: (fill.quantity * Number(fill.price)).toString(),
                timestmap: Date.now()
            }
        })
    })
  }

  publishWsTrades(fills: Fill[], userId: string, market: string) {
    fills.forEach(fill => {
        RedisManager.getInstance().publishMessage(`trade@${market}`,{
            stream: `@trade@${market}`,
            data: {
                e: `trade`,
                t: fill.tradedId,
                p: fill.price,
                q: fill.quantity.toString(),
                s: market,
                m: fill.otherUserId == userId
            }
        })
    } )
  }

  sendUpdatedDepthAt(price: string,market: string) {
    const ordebook = this.orderbooks.find(o => o.ticker() === market);

    if(!ordebook){
        return;
    }

    const depth = ordebook.getDepth();
    const bids = depth.bids.filter(bid => bid[0] === price);
    const asks = depth.asks.filter(ask => ask[0] === price);

    RedisManager.getInstance().publishMessage(`depth@${market}`,{
        stream: `depth@${market}`,
        data: {
            a: asks.length? asks : [['price','0']],
            b: bids.length? bids : [['price','0']],
            e: "depth"
        }
    })
  }

  publishWsDepthUpdates(fills: Fill[], price: string, side: "buy" | "sell", market: string) {
    
    const orderbook = this.orderbooks.find(o => o.ticker() === market);
    if (!orderbook) {
        return;
    }

    const depth = orderbook.getDepth();
    if (side === "buy") {  
        const updatedAsks = depth?.asks.filter( ask => fills.map(f => f.price).includes(ask[0].toString()));
        const updatedBids = depth?.bids.find(bid => bid[0] === price);
        RedisManager.getInstance().publishMessage(`dpeth@${market}`,{
            stream: `depth@${market}`,
            data: {
                a: updatedAsks,
                b: updatedBids? [updatedBids]: [],
                e: 'depth'
            }
            
        })
    } else {
        const updatedBids = depth?.bids.filter(bid => fills.map(f => f.price).includes(bid[0].toString()));
        const updatedAsks = depth?.asks.filter(ask => ask[0] === price);

        RedisManager.getInstance().publishMessage(`depth@${market}`,{
            stream: `depth@${market}`,
            data: {
                a: updatedAsks,
                b: updatedBids,
                e: 'depth'
            }
        })
    }
  }

  updateBalance(userId: string, baseAsset: string, quoteAsset: string, side: "buy" | "sell", fills: Fill[],  executedQty: number) {
    
      
      if (side === "buy") {
            fills?.forEach(fill => {
            
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].available = this.balances.get(fill.otherUserId)[quoteAsset].available + (fill.quantity * fill.price);
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)[quoteAsset].locked - (fill.quantity * fill.price)
                //@ts-ignore
                this.balances.get(fill.markerOrdereId)[baseAsset].available = this.balances.get(fill.otherUserId)[baseAsset].locked - (fill.quantity * fill.price);
                //@ts-ignore
                this.balances.get(userId)[baseAsset].available = this.balances.get(userId)[baseAsset].available + (fill.quantity * fill.price);
            })
        } else {
            fills?.forEach(fill => {
                 //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].available = this.balances.get(fill.otherUserId)[quoteAsset].available - (fill.quantity * fill.price);
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)[quoteAsset].locked - (fill.quantity * fill.price)
                //@ts-ignore
                this.balances.get(fill.markerOrdereId)[baseAsset].available = this.balances.get(fill.otherUserId)[baseAsset].locked - (fill.quantity * fill.price);
                //@ts-ignore
                this.balances.get(userId)[baseAsset].available = this.balances.get(userId)[baseAsset].available + (fill.quantity * fill.price);
            })
        }
  }

  checkAndLockFunds(userId: string, quantity: number, baseAsset: string, quoteAsset: string, price: number, side: "buy" | "sell") {

    const user = this.balances.get(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (side == "buy") {
        
        if(user[quoteAsset].available < (price * quantity)){
            throw new Error("Insufficient funds");
        }

        user[quoteAsset].available = user[quoteAsset].available - (price * quantity);
        user[quoteAsset].locked = user[quoteAsset].locked + (price * quantity);
    } else {
        if(user[baseAsset].available < (quantity)) {
            throw new Error("Insufficient funds");
        }
        user[baseAsset].available = user[baseAsset].available - quantity;
        user[baseAsset].available = user[baseAsset].locked + quantity;
    }
  }

  onRamp(userId: string, amount: number) {
    const userBalance = this.balances.get(userId);
    if(!userBalance){
        this.balances.set(userId,{
            BASE_CURRENCY: {
                available : amount,
                locked: 0
            }
        })
    }else {
        userBalance[BASE_CURRENCY].available += Number(amount);
    }
  }

  setBaseBalances() {
    this.balances.set("1", {
        [BASE_CURRENCY]: {
            available: 10000000,
            locked: 0
        },
        "TATA": {
            available: 10000000,
            locked: 0
        }
    });

    this.balances.set("2", {
        [BASE_CURRENCY]: {
            available: 10000000,
            locked: 0
        },
        "TATA": {
            available: 10000000,
            locked: 0
        }
    });

    this.balances.set("3", {
        [BASE_CURRENCY]: {
            available: 10000000,
            locked: 0
        },
        "TATA": {
            available: 10000000,
            locked: 0
        }
    });
}
}
