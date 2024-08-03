export const CREATE_ORDER = "CREATE_ORDER";
export const CANCEL_ORDER = "CANCEL_ORDER";
export const ON_RAMP = "ON_RAMP"
export const GET_OPEN_ORDERS = "GET_OPEN_ORDERS"
export const GET_DEPTH = "GET_DEPTH";
export const DEPTH = "DEPTH";
export const ORDER_CANCELLED = "ORDER_CANCELLED";
export const OPEN_ORDERS = "OPEN_ORDERS";
export const ORDER_PLACED = "ORDER_PLACED";

export type MessageFromOrderbook = {
    type: typeof DEPTH,
    payload: {
        market: string,
        bids: [string, string][],
        asks: [string, string][],
    }
} | {
    type: typeof ORDER_PLACED,
    payload: {
        orderId: string,
        executedQty: number,
        fills: [
            {
                price: string,
                qty: number,
                tradedId: number
            }
        ]
    }
} | {
    type: typeof OPEN_ORDERS,
    payload: {
        orderId: string,
        executedQty: number,
        price: string,
        quantity: string,
        side: "buy" | "sell",
        userId: string
    }
} | {
    type: typeof ORDER_CANCELLED,
    payload: {
        orderId: string,
        executedQty: number,
        remainingQty: number
    }
}