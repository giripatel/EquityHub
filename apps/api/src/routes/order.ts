import {  Request, Response, Router } from "express";
import { RedisManager } from "../RedisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_OPEN_ORDERS } from "../types";

export const orderRoute = Router();

orderRoute.post("/", async (req: Request, res: Response) => {
  const { market, price, quantity, side, userId } = req.body;
  
  const response = await RedisManager.getInstance().sendMessage({
    type: CREATE_ORDER,
    data: {
      market,
      price,
      quantity,
      side,
      userId,
    },
  });

  res.status(200).json(response.payload);
});

orderRoute.delete("/", async (req: Request, res: Response) => {
  const {orderId, market} = req.body;

  const response = await RedisManager.getInstance().sendMessage({
    type: CANCEL_ORDER,
    data: {
      orderId,
      market,
    },
  });

  res.json(response.payload)
});

orderRoute.get('/open', async (req: Request, res: Response) => {
    const {userId, market} = req.query;
    const response = await RedisManager.getInstance().sendMessage({
        type: GET_OPEN_ORDERS,
        data: {
            userId: userId as string,
            market: market as string
        }
    })
})