import TradeList from "./TradeList";
import CreateOrder from "./CreateOrder";
import Depth from "./Depth";
import Kline from "./Kline";

export default function() {
    return (
        <div className="flex h-full" >
            <div className="w-[75%] h-full border-b border-gray-800" >
                {/* -- Details Nav --  */}
                < div className="flex gap-2 border-b border-gray-800 h-max items-center px-10  py-2 " >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6" >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                    </svg>
                    < div className="text-white font-semibold text-lg" >
                        TATA / INR
                    </div>
                    < div className="px-8" >
                        <div>
                            <span className="font-medium text-[#fd4b4e] text-md" > $140.23 </span>
                        </div>
                        < div >
                            <span className="text-white" > $140.21 </span>
                        </div>
                    </div>
                </div>
                {/* -- Kline and Books Trades Tab -- */}
                <div className="w-full flex border border-gray-800" >
                    <div className="Chart flex-1" >
                        <Kline />
                    </div>
                    {/* -- Books Trades Tabs --  */}
                    <div className="w-[30%] border-l border-gray-800 p-4 text-white" >
                        <div className="py-3 text-[16px] flex gap-4" >
                            <div className="border-b-2 pb-1 border-[#4c94ff]" >
                                Book
                            </div>
                            <div>
                                Trades
                            </div>
                        </div>
                        {/* <Depth />*/}
                        <TradeList />
                    </div>
                </div>
            </div >
            < CreateOrder />
        </div >
    )
}
