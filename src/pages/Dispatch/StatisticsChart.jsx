// import React from "react";
// import { Bar, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Legend
// );

// const StatisticsChart = ({ events }) => {
//   const transferCounts = events.reduce(
//     (acc, event) => {
//       acc[event.status] = (acc[event.status] || 0) + 1;
//       return acc;
//     },
//     { Pending: 0, Delivered: 0, Cancelled: 0 }
//   );

//   const transfersByDate = events.reduce((acc, event) => {
//     const date = event.start.split("T")[0]; // Formato YYYY-MM-DD
//     acc[date] = (acc[date] || 0) + 1;
//     return acc;
//   }, {});

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "space-between",
//         gap: "20px",
//         marginTop: "20px",
//       }}
//     >
//       {/* Gráfico de Barras */}
//       <div style={{ flex: "1", maxWidth: "45%" }}>
//         <Bar
//           data={{
//             labels: Object.keys(transferCounts),
//             datasets: [
//               {
//                 label: "Transferencias por Estado",
//                 data: Object.values(transferCounts),
//                 backgroundColor: ["#3498db", "#2ecc71", "#e74c3c"],
//                 borderRadius: 8, // Bordes redondeados en las barras
//               },
//             ],
//           }}
//           options={{
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: { position: "top", labels: { font: { size: 12 } } },
//               tooltip: { bodyFont: { size: 12 }, titleFont: { size: 14 } },
//             },
//             scales: {
//               y: { beginAtZero: true },
//             },
//           }}
//           height={200} // Altura más pequeña
//         />
//       </div>

//       {/* Gráfico de Líneas */}
//       <div style={{ flex: "1", maxWidth: "45%" }}>
//         <Line
//           data={{
//             labels: Object.keys(transfersByDate),
//             datasets: [
//               {
//                 label: "Transferencias por Fecha",
//                 data: Object.values(transfersByDate),
//                 borderColor: "#9b59b6",
//                 borderWidth: 2,
//                 tension: 0.4,
//                 fill: true,
//                 backgroundColor: "rgba(155, 89, 182, 0.2)",
//               },
//             ],
//           }}
//           options={{
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: { position: "top", labels: { font: { size: 12 } } },
//               tooltip: { bodyFont: { size: 12 }, titleFont: { size: 14 } },
//             },
//             scales: {
//               y: { beginAtZero: true },
//             },
//           }}
//           height={200} // Altura más pequeña
//         />
//       </div>
//     </div>
//   );
// };

// export default StatisticsChart;
