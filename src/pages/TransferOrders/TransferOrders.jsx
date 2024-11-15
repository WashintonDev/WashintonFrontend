import React from "react";
import {Route, Routes} from "react-router-dom";
import OrdersPage from "./OrdersPage";

const TransferOrders = () => {

return (
    <Routes>
        <Route path="/" element={<OrdersPage/>}/>
    </Routes>
)

}

export default TransferOrders;