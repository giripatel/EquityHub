type TickerUpdateMessage = {
  type: "ticker";
  data: {
    V: string;
    c: string;
    h: string;
    l: string;
    n: 2946;
    s: string;
    v: string;
    e: "ticker";
  };
};

type DepthUpdateMessage = {
  type: "depth";
  data: {
    a: [[string, string]];
    b: [[string, string]];
    e: "depth";
  };
};

type OutgoingMessage = TickerUpdateMessage | DepthUpdateMessage;
