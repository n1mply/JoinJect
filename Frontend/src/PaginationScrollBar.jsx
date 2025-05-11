import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaginationSkrollBar({ pagInfo, pages }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pages]);

  useEffect(() => {
    const container = containerRef.current;
    
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY + e.deltaX;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    containerRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    containerRef.current.style.cursor = "grab";
  };

  useEffect(() => {
    if (containerRef.current) {
      const activeBtn = containerRef.current.querySelector(".active");
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }
  }, [pages]);

  return (
    <div
      ref={containerRef}
      className="pagination-scroll-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="pagination-scroll">
        {pagInfo &&
          Array.from({ length: pagInfo.total_pages }, (_, i) => i + 1).map((num) => (
            <div
              className={`pag-button ${num == pages ? "active" : ""}`}
              key={num}
              onClick={() => navigate(`/projects/p/${num}`)}
            >
              <p>{num}</p>
            </div>
          ))}
      </div>
    </div>
  );
}