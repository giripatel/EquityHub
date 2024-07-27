
const AskTable = ({ asks }: { asks: [string,string][] }) => {
  let currentTotal = 0;
  const relevantAsks = asks.slice(0, 15);
  relevantAsks.reverse();
  let asksWithTotal: [string, string, number][] = relevantAsks.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
  const maxTotal = relevantAsks.reduce((acc, [_, quatity]) => acc += Number(quatity),0);

  return (
    <div className='bg-emerald-500 text-lg'>
      {asksWithTotal.map(([price, quantity, total]) => <Ask maxTotal={maxTotal} key={price} price={price} quantity={quantity} total={total} />)}
  </div>
  )
}

function Asks(){
  return <div>
</div>
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
    <div className="flex justify-between text-xs w-full">
      <div>
          {price}
      </div>
      <div>
          {quantity}
      </div>
      <div>
          {total?.toFixed(2)}
      </div>
    </div>
    </div>

    }

export default AskTable;
