import { useEffect, useState } from "react";

export function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const handleIntersections = (entries: IntersectionObserverEntry[]) => {
      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visibleSections.length > 0) {
        setActiveId(visibleSections[0].target.id);
      }
    };

    const observer = new window.IntersectionObserver(handleIntersections, {
      root: null,
      rootMargin: "0px 0px -60% 0px",
      threshold: 0.1,
    });
    
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}