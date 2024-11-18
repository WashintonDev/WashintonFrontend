import { Routes, Route } from "react-router-dom";
import CalendarDispatch from "./CalendarDispatch";

const Dispatch = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={< CalendarDispatch />} />
      </Routes>
    </div>
  );
};

export default Dispatch;
