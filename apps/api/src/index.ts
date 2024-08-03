import express from "express";
import { orderRoute } from "./routes/order";

const app = express();
app.use(express.json());

const PORT = 3000;

app.use("/api/v1/order",orderRoute)
// app.use("/api/v1/ticker",)
// app.use("/api/v1/depth",)

app.listen(PORT);