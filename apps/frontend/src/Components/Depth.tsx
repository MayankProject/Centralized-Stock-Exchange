import { useRecoilValue } from "recoil"
import { DepthState } from "../state"
export default function() {
    const Depth = useRecoilValue(DepthState)
    return (
        <div className="Depth text-[12px]" >
            <div className="asks" >
                <div className="flex font-semibold justify-between mb-3 mr-2" >
                    <h1>Price(INR) </h1>
                    < h1 className="opacity-50" > Size(TATA) </h1>
                    < h1 className="opacity-50" > TOTAL(TATA) </h1>
                </div>
                {
                    Depth.asks.map((ask) => {
                        return ask.length ? <div className="flex p-1 px-1 pl-0 my-[2px] relative opacity-75 text-[13px] font-medium justify-between" >
                            <div className="w-[40%] h-full graph top-0 right-0 bg-[#291419] absolute" > </div>
                            < h1 className="text-[#fd4b4e]" > {ask[0]} </h1>
                            < h1 className="" > {ask[1]} </h1>
                            < h1 className="" > 227.56 </h1>
                        </div> : ""
                    })
                }
            </div>
            < h1 className="text-xl text-[#02a166] my-2 font-semibold" > 50.125 </h1>
            < div className="bids" >
                {
                    Depth.bids.map((bid) => {
                        return bid.length ? <div className="flex p-1 px-1 pl-0 my-[2px] relative opacity-75 text-[13px] font-medium justify-between" >
                            <div className="w-[10%] h-full graph top-0 right-0 bg-[#0d1d1b] absolute" > </div>
                            < h1 className="text-[#02a166]" > {bid[0]} </h1>
                            < h1 className="" > {bid[1]} </h1>
                            < h1 className="" > 21.56 </h1>
                        </div> : ""
                    })
                }

            </div>
        </div>
    )

}
