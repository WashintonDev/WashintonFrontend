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

  if (loading) return <CalendarSkeleton/>
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <Navbar title="Dispatch" showSearch={false} showAdd={false} />
      <div
        style={{justifyContent: "center", alignItems: "center" }}
      >
        <div className="calendar-container">
          {/* <div className="sidebar">
            <h3>Opciones</h3>
            <ul>
              <li>Drag-n-Drop Events</li>
              <li>Resource Timeline</li>
              <li>Year Views</li>
              <li>Selectable Dates</li>
              <li>Background Events</li>
              <li>Time Zones</li>
            </ul>
          </div> */}
          <div className="calendar">
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
              eventColor="rgba(0, 123, 255, 0.5)"
              eventTextColor="#fff"
              eventClick={handleEventClick}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarDispatch;
