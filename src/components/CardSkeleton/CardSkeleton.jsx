import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const TableSkeleton = () => {
  const [isLoading, setIsLoading] = useState(true);

  const styles = {
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    headerCell: {
      padding: "0.5rem",
      borderBottom: "1px solid #ddd",
    },
    row: {
      display: "flex",
      alignItems: "center",
      padding: "0.5rem",
      borderBottom: "1px solid #ddd",
    },
    cell: {
      padding: "0.5rem",
      flex: 1,
      display: "flex",
      alignItems: "center",
    },
    imageCell: {
      width: "50px",
      height: "50px",
      marginRight: "1rem",
    },
    quantityCell: {
      width: "80px",
      marginRight: "1rem",
    },
    selectCell: {
      width: "100px",
      marginRight: "1rem",
    },
  };

  // Número de filas de esqueleto que quieres mostrar
  const skeletonRows = 14;

  // Simula la carga de datos con un temporizador
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Cambia el tiempo según tus necesidades

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    // Renderizar el Skeleton cuando los datos están cargando
    return (
      <div>
        <div style={styles.row}>
          <div style={styles.headerCell}>
            <Skeleton width={80} height={20} />
          </div>
          <div style={styles.headerCell}>
            <Skeleton width={80} height={20} />
          </div>
          <div style={styles.headerCell}>
            <Skeleton width={150} height={20} />
          </div>
          <div style={styles.headerCell}>
            <Skeleton width={100} height={20} />
          </div>
          <div style={styles.headerCell}>
            <Skeleton width={50} height={20} />
          </div>
        </div>

        {Array.from({ length: skeletonRows }).map((_, index) => (
          <div style={styles.row} key={index}>
            <div style={styles.selectCell}>
              <Skeleton width="100%" height={30} />
            </div>
            <div style={styles.quantityCell}>
              <Skeleton width="100%" height={30} />
            </div>
            <div style={styles.cell}>
              <Skeleton width="100%" height={20} />
            </div>
            <div style={styles.cell}>
              <Skeleton width="100%" height={20} />
            </div>
            <div style={styles.imageCell}>
              <Skeleton width="100%" height="100%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Renderizar el contenido con la clase `fade-in` cuando los datos están cargados
  return (
    <div className="fade-in">
      <div style={styles.row}>
        <div style={styles.headerCell}>Select</div>
        <div style={styles.headerCell}>Quantity</div>
        <div style={styles.headerCell}>Product Name</div>
        <div style={styles.headerCell}>Category</div>
        <div style={styles.headerCell}>Image</div>
      </div>

      {Array.from({ length: skeletonRows }).map((_, index) => (
        <div style={styles.row} key={index}>
          <div style={styles.selectCell}>Select</div>
          <div style={styles.quantityCell}>0</div>
          <div style={styles.cell}>Product {index + 1}</div>
          <div style={styles.cell}>Category {index + 1}</div>
          <div style={styles.imageCell}>
            <img src="https://via.placeholder.com/50" alt="product" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
