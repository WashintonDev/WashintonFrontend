import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./CalendarDispatch.css";
import useWarehouseTransfers from "../../hooks/useWarehouseTransfers";
import CalendarSkeleton from "../../components/CardSkeleton/CalendatSkeleton";
import Navbar from "../../components/Navbar";

const CalendarDispatch = () => {
  const { events, loading, error } = useWarehouseTransfers();

  const handleEventClick = (info) => {
    alert(`Evento: ${info.event.title}`);
  };

  if (loading) return <CalendarSkeleton />;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <Navbar title="Dispatch Calendar" showSearch={false} showAdd={false} />
      <div className="calendar-wrapper">
        <h2 className="calendar-title">Warehouse Transfer Schedule</h2>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          editable={true}
          droppable={true}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
          }}
          events={events}
          eventDisplay="block"
          eventClick={handleEventClick}
          eventClassNames={(arg) => {
            if (arg.event.extendedProps.status === "pending") {
              return "event-pending";
            } else if (arg.event.extendedProps.status === "completed") {
              return "event-completed";
            } else if (arg.event.extendedProps.status === "cancelled") {
              return "event-cancelled";
            }
            return "";
          }}
        />
      </div>
    </>
  );
};

export default CalendarDispatch;
