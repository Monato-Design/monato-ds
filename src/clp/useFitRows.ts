import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Measures a container and returns how many uniform-height rows fit in it,
 * so a table's page size adapts to the available screen height instead of a
 * fixed count. Recomputes on resize.
 *
 * @param rowHeight  height of a single row (px)
 * @param headerHeight height of the (sticky) table header (px)
 * @param minRows    floor so a very short viewport still shows something
 */
export function useFitRows(rowHeight: number, headerHeight: number, minRows = 3) {
  const ref = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(minRows);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => {
      const usable = el.clientHeight - headerHeight;
      setRows(Math.max(minRows, Math.floor(usable / rowHeight)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rowHeight, headerHeight, minRows]);

  return { ref, rows };
}
