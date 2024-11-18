import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CalendarSkeleton = () => {
  const [isLoading, setIsLoading] = useState(true);

  const styles = {
    calendar: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "1rem",
      padding: "1rem",
    },
    dayCell: {
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "1rem",
      minHeight: "120px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    dayHeader: {
      marginBottom: "0.5rem",
    },
    skeletonEvent: {
      marginTop: "0.5rem",
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={styles.calendar}>
        {Array.from({ length: 35 }).map((_, index) => (
          <div style={styles.dayCell} key={index}>
            <div style={styles.dayHeader}>
              <Skeleton width={50} height={20} />
            </div>
            <div style={styles.skeletonEvent}>
              <Skeleton width="80%" height={15} />
            </div>
            <div style={styles.skeletonEvent}>
              <Skeleton width="70%" height={15} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.calendar}>
      {Array.from({ length: 35 }).map((_, index) => (
        <div style={styles.dayCell} key={index}>
          <div style={styles.dayHeader}>Day {index + 1}</div>
        </div>
      ))}
    </div>
  );
};

export default CalendarSkeleton;
