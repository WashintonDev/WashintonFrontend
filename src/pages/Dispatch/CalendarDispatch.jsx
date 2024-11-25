import { useState } from "react";
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

  // Estado del modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (info) => {
    alert(`Evento: ${info.event.title}`);
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
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
            return "not-event";
          }}
        />
        {/* Botón flotante */}
        <button className="floating-button" onClick={toggleModal}>
          +
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Nuevo Evento</h3>
            <p>Aquí puedes agregar detalles para un nuevo evento.</p>
            <button onClick={toggleModal}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarDispatch;
