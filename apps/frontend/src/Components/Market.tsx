import CreateOrder from "./CreateOrder";
import Kline from "./Kline";
import BooksAndTrades from "./BooksAndTrades";
import MarketDetails from "./MarketDetails";

export default function() {
    return (
        <div className="flex h-full" >
            <div className="w-[75%] h-full border-b border-gray-800" >
                {/* -- Details Nav --  */}
                <MarketDetails />
                {/* -- Kline and Books Trades Tab -- */}
                <div className="w-full flex border border-gray-800" >
                    <div className="Chart flex-1" >
                        <Kline />
                    </div>
                    {/* -- Books Trades Tabs --  */}
                    <BooksAndTrades />
                </div>
            </div >
            < CreateOrder />
        </div >
    )
}
