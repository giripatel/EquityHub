
const AskTable = ({ asks }: { asks: [string,string][] }) => {

  let currentTotal = 0;
  const relevantAsks = asks.slice(0, 15);
  
  relevantAsks.reverse();
  let asksWithTotal: [string, string, number][] = relevantAsks.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
  const maxTotal = relevantAsks.reduce((acc, [_, quatity]) => acc += Number(quatity),0);
  asksWithTotal.reverse()
  
  return (
    <div className=' text-lg h-72 flex justify-end flex-col'>
      {"Map executing............."}
      {asksWithTotal.map(([price, quantity, total],index) => <div key={index}> <Ask maxTotal={maxTotal} key={price} price={price} quantity={quantity} total={total} /> </div>)}
  </div>
  )
}

function Ask({price, quantity, total, maxTotal}: {price: string, quantity: string, total: number, maxTotal: number}) {
  
  return <div
    style={{
      display: "flex",
      position: "relative",
      width: "100%",
      backgroundColor: "transparent",
      overflow: "hidden",
    }}
    
    >
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: `${(100 * total )/ maxTotal}%`,
        height: '100%',
        background: "rgba(228, 75, 68, 0.325)",
        transition: "width 0.3s ease-in-out",
      }}
      >

      </div>
    <div className="flex justify-between text-xs w-full ps-1">
      <div className="text-red-500">
          {price}
      </div>
      <div className="text-white">
          {quantity}
      </div>
      <div className="text-white">
          {total?.toFixed(2)}
      </div>
    </div>
    </div>

    }

export default AskTable;
