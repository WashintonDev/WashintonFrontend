import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./CalendarDispatch.css";
import useWarehouseTransfers from "../../hooks/useWarehouseTransfers";
import CalendarSkeleton from "../../components/CardSkeleton/CalendatSkeleton";
import Navbar from "../../components/Navbar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Modal,
  Button,
  DatePicker,
  Input,
  Form,
  Row,
  Col,
  Spin,
  notification,
  Select,
  Card,
  Statistic,
} from "antd";
const { RangePicker } = DatePicker;

import { GoldOutlined, CheckCircleOutlined } from "@ant-design/icons";
import useTransfer from "../../hooks/useTransfer";
import daysjs from "dayjs";
import ModalSkeleton from "../../components/CardSkeleton/ModalSkeleton";
import { API_URL_UPDATE_WAREHOUSES_TRANSFERS } from "../../services/ApisConfig";
import { Option } from "antd/es/mentions";
// import StatisticsChart from "./StatisticsChart";
const CalendarDispatch = () => {
  const { events, loading, error, refetchTransfers } = useWarehouseTransfers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All"); // Estado del filtro
  const [dateRange, setDateRange] = useState(null); // Guardar rango de fechas

 

  const exportToExcel = (events, format = "csv") => {
    const mappedData = events.map((event) => ({
      ID: event.id,
      Título: event.title,
      Fecha: event.start,
      Estado: event.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transfers");

    const fileType =
      format === "csv"
        ? "text/csv;charset=utf-8;"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = format === "csv" ? ".csv" : ".xlsx";

    const fileData = XLSX.write(workbook, {
      bookType: format === "csv" ? "csv" : "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([fileData], { type: fileType }),
      `WarehouseTransfers${fileExtension}`
    );
  };

  const exportToPDF = (events) => {
    const doc = new jsPDF();

    const tableColumn = ["ID", "Título", "Fecha", "Estado"];
    const tableRows = events.map((event) => [
      event.id,
      event.title,
      event.start,
      event.status,
    ]);

    doc.text("Warehouse Transfers", 14, 20);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("WarehouseTransfers.pdf");
  };

  const {
    error: errorTransfer,
    loading: loadingTransfer,
    fetchTransfers,
    transfer,
  } = useTransfer();
  const [isEdit, setIsEdit] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (transfer) {
      form.setFieldsValue({
        transfer_date: transfer.transfer_date
          ? daysjs(transfer.transfer_date)
          : null,
        status: transfer.status || "Pending",
        store_id: transfer.store_id || "",
        id: transfer.id || "",
      });
    }
  }, [transfer, form]);

  const handleEventClick = (info) => {
    const eventId = info.event.id;
    setIsModalOpen(true);
    fetchTransfers(eventId);
  };
  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
    form.resetFields();
  };
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); // Valida los campos y obtiene los valores
      if (isEdit) {
        setLoadingSpin(true);
        console.log("Guardando cambios en modo edición", values);
        await fetch(API_URL_UPDATE_WAREHOUSES_TRANSFERS, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        setIsEdit(false);
        console.log("Transferencia creada exitosamente");
        form.resetFields();
        notification.success({
          message: "Transferencia actualizada exitosamente",
        });
        // agregar la actualización de la transferencia
        refetchTransfers();
      } else {
        setIsEdit(false);
        setIsModalOpen(false);
      }
      setIsModalOpen(false);
      setLoadingSpin(false);
    } catch (error) {
      form.resetFields();

      console.error("Error en la validación de campos:", error);
      notification.error({
        message: error.message || "Error al guardar transferencia",
      });
      setIsEdit(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates); // Actualizar rango de fechas seleccionado
  };

const filteredEvents = events.filter((event) => {
  const eventDate = new Date(event.start);
  if (filterStatus !== "All" && event.status !== filterStatus) {
    return false; // Filtrar por estado
  }
  if (dateRange) {
    const [start, end] = dateRange;
    return eventDate >= start.toDate() && eventDate <= end.toDate(); // Filtrar por rango
  }
  return true; // Mostrar todo si no hay filtros
});
 const totalPending = filteredEvents.filter(
   (event) => event.status === "Pending"
 ).length;
 const totalDelivered = filteredEvents.filter(
   (event) => event.status === "Delivered"
 ).length;
  // Manejador del cambio en el filtro
  const handleFilterChange = (value) => {
    setFilterStatus(value);
  };
  if (loading) return <CalendarSkeleton />;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <Navbar title="Dispatch Calendar" showSearch={false} showAdd={false} />

      <div className="calendar-wrapper">
        <div
          className="cards-container"
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            justifyContent: "space-between",
          }}
        >
          {/* Card de Pendientes */}
          <Card
            style={{
              flex: 1,
              backgroundColor: "#fff3e6",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
              padding: "20px",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            hoverable
            bodyStyle={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Statistic
              title="Transferencias Pendientes"
              value={totalPending}
              valueStyle={{ color: "#faad14" }}
              prefix={
                <GoldOutlined style={{ fontSize: "24px", color: "#faad14" }} />
              }
            />
          </Card>

          {/* Card de Entregadas */}
          <Card
            style={{
              flex: 1,
              backgroundColor: "#e6f7e6",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
              padding: "20px",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            hoverable
            bodyStyle={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Statistic
              title="Transferencias Entregadas"
              value={totalDelivered}
              valueStyle={{ color: "#52c41a" }}
              prefix={
                <CheckCircleOutlined
                  style={{ fontSize: "24px", color: "#52c41a" }}
                />
              }
            />
          </Card>
        </div>
        <h2 className="calendar-title">Warehouse Transfer</h2>
        <div className="filter-container">
          <label htmlFor="status-filter">Filtrar por Estatus:</label>
          <Select
            id="status-filter"
            value={filterStatus}
            onChange={handleFilterChange}
            style={{ width: 200, marginLeft: 10 }}
          >
            <Option value="All">Todos</Option>
            <Option value="Pending">Pendientes</Option>
            <Option value="Delivered">Entregados</Option>
          </Select>
          <label htmlFor="date-filter" style={{ marginLeft: 20, marginRight:20 }}>
            Filtrar por Fechas: 
          </label>
          <RangePicker onChange={handleDateRangeChange} />
        </div>
        <div style={{ margin: "20px 0" }}>
          <Button
            type="primary"
            onClick={() => exportToExcel(filteredEvents, "xlsx")}
            style={{ marginRight: 10 }}
          >
            Exportar a Excel
          </Button>
          <Button
            type="primary"
            onClick={() => exportToExcel(filteredEvents, "csv")}
            style={{ marginRight: 10 }}
          >
            Exportar a CSV
          </Button>
          <Button type="primary" onClick={() => exportToPDF(filteredEvents)}>
            Exportar a PDF
          </Button>
        </div>
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
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
          }}
          events={filteredEvents} // Usar eventos filtrados
          eventClick={handleEventClick}
          eventClassNames={(arg) => {
            if (arg.event.status === "Delivered") {
              return "event-delivered";
            } else if (arg.event.status === "Pending") {
              return "event-pending";
            }
            return "not-event";
          }}
        />
        {/* <button className="floating-button" onClick={toggleModal}>
          +
        </button> */}
      </div>

      {/* Modal de Ant Design */}
      <Modal
        onOk={handleSubmit}
        title="Detalles del Evento"
        open={isModalOpen}
        onCancel={toggleModal}
        footer={[
          <Button key="back" onClick={toggleModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            disabled={loadingSpin}
          >
            {loadingSpin ? <Spin /> : "Save"}
          </Button>,
        ]}
      >
        {loadingTransfer ? (
          <ModalSkeleton />
        ) : (
          <Form
            layout="vertical"
            form={form}
            initialValues={{
              transfer_date: transfer?.transfer_date
                ? daysjs(transfer.transfer_date)
                : null,
              status: transfer?.status || "Pending",
              store_id: transfer?.store_id || "",
              id: transfer?.id || "",
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="transfer_date"
                  label="Fecha de envío"
                  rules={[
                    {
                      required: true,
                      message: "Por favor selecciona una fecha",
                    },
                  ]}
                >
                  <DatePicker onChange={() => setIsEdit(true)} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Estado">
                  <Input
                    disabled
                    style={{
                      color:
                        transfer?.status === "Delivered"
                          ? "green"
                          : transfer?.status === "Cancelled"
                          ? "red"
                          : "black",
                      backgroundColor:
                        transfer?.status === "Delivered"
                          ? "lightgreen"
                          : transfer?.status === "Cancelled"
                          ? "lightcoral"
                          : "lightyellow",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="store_id" label="Nombre de la tienda">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="id" label="ID de la transferencia">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
        {errorTransfer && <p>Error al cargar datos del transfer</p>}
      </Modal>
    </>
  );
};

export default CalendarDispatch;
