
const page = () => {
  return (
    <div className="mt-10">
        <div className="flex gap-x-11 justify-center">
            <Card title="New" />
            <Card title="Top Gainers" />
            <Card title="Experimental" />
        </div>
    </div>
  )
}


function Card({ title }: { title: string }){
    
    return (
        <div className="w-96 h-44 bg-neutral-800 shadow-lg p-4 rounded-md">
            <h3 className="text-lg text-slate-300">{title}</h3>
            <div>
                <div>
                    <p></p>
                </div>
            </div>
        </div>
    )
}

export default page