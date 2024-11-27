import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ModalSkeleton = () => {
  const styles = {
    modal: {
      width: "80%",
      padding: "1.5rem",
      borderRadius: "8px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "1rem",
      display: "flex",
      justifyContent: "space-between",
    },
    fieldRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "1rem",
    },
    field: {
      width: "48%",
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "1rem",
      marginTop: "1rem",
    },
    button: {
      width: "80px",
      height: "36px",
    },
  };

  return (
    <div style={styles.modal}>
      {/* Título */}
      <div style={styles.header}>
        <Skeleton width="60%" height={20} />
        <Skeleton width={20} height={20} />
      </div>

      {/* Filas de campos */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <Skeleton width="100%" height={30} />
        </div>
        <div style={styles.field}>
          <Skeleton width="100%" height={30} />
        </div>
      </div>
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <Skeleton width="100%" height={30} />
        </div>
        <div style={styles.field}>
          <Skeleton width="100%" height={30} />
        </div>
      </div>

      {/* Botones */}
      <div style={styles.footer}>
        <Skeleton style={styles.button} />
        <Skeleton style={styles.button} />
      </div>
    </div>
  );
};

export default ModalSkeleton;
