import React, { useState, useEffect, useRef, useCallback } from "react";
import { RotateCw, Trash2, Plus, Ruler, Home, X, Move } from "lucide-react";

// ---------- Default data (from plano, approximate — editable) ----------
const DEFAULT_ROOMS = [
  { id: "comedor", name: "Comedor", floor: 1, w: 330, l: 410, floorColor: "#ecdcc0" },
  { id: "terraza", name: "Terraza", floor: 1, w: 200, l: 350, floorColor: "#e2ecdf" },
  { id: "living", name: "Living", floor: 1, w: 400, l: 450, floorColor: "#f0e2d0" },
  { id: "dorm1", name: "Dormitorio 1", floor: 1, w: 400, l: 400, floorColor: "#e5e7f2" },
  { id: "wc1", name: "Walk-closet 1", floor: 1, w: 150, l: 200, floorColor: "#f0e6ee" },
  { id: "wc2", name: "Walk-closet 2", floor: 1, w: 150, l: 200, floorColor: "#f0e6ee" },
  { id: "cocina", name: "Cocina", floor: 1, w: 300, l: 300, floorColor: "#dcecec" },
  { id: "lavanderia", name: "Lavandería", floor: 1, w: 200, l: 200, floorColor: "#e7e3da" },
  { id: "dormserv", name: "Dormitorio servicio", floor: 1, w: 250, l: 300, floorColor: "#e5e7f2" },
  { id: "banoserv", name: "Baño servicio", floor: 1, w: 150, l: 200, floorColor: "#dcecec" },
  { id: "escritorio", name: "Escritorio", floor: 1, w: 250, l: 250, floorColor: "#eef0da" },
  { id: "banoprin", name: "Baño 1", floor: 1, w: 200, l: 250, floorColor: "#dcecec" },
  { id: "dorm2", name: "Dormitorio 2", floor: 2, w: 350, l: 350, floorColor: "#f4e3dc" },
  { id: "dorm3", name: "Dormitorio 3", floor: 2, w: 350, l: 350, floorColor: "#e5e7f2" },
  { id: "dorm4", name: "Dormitorio 4", floor: 2, w: 300, l: 300, floorColor: "#eef0da" },
  { id: "estar", name: "Estar", floor: 2, w: 250, l: 300, floorColor: "#f0e2d0" },
  { id: "bano3", name: "Baño 3", floor: 2, w: 180, l: 220, floorColor: "#dcecec" },
  { id: "bano4", name: "Baño 4", floor: 2, w: 180, l: 220, floorColor: "#dcecec" },
  { id: "cl1", name: "Closet 1", floor: 2, w: 120, l: 180, floorColor: "#f0e6ee" },
  { id: "cl2", name: "Closet 2", floor: 2, w: 120, l: 180, floorColor: "#f0e6ee" },
  { id: "cl3", name: "Closet 3", floor: 2, w: 120, l: 180, floorColor: "#f0e6ee" },
];

const FURNITURE_PRESETS = [
  { name: "Cama 2 plazas", w: 140, d: 190, color: "#c17a3d" },
  { name: "Cama queen", w: 150, d: 200, color: "#b5533c" },
  { name: "Cama king", w: 180, d: 200, color: "#9c3f2e" },
  { name: "Velador", w: 40, d: 40, color: "#d9a441" },
  { name: "Sofá 3 cuerpos", w: 200, d: 90, color: "#2f8f7a" },
  { name: "Sofá 2 cuerpos", w: 150, d: 90, color: "#3aa38a" },
  { name: "Mesa comedor 6p", w: 160, d: 90, color: "#7a4f9c" },
  { name: "Silla", w: 45, d: 45, color: "#9c6fc2" },
  { name: "Escritorio", w: 120, d: 60, color: "#2f6d8f" },
  { name: "Mesa centro", w: 100, d: 50, color: "#5c8a3f" },
  { name: "Refrigerador", w: 70, d: 70, color: "#4a7a8c" },
  { name: "Cómoda", w: 100, d: 45, color: "#c2609a" },
  { name: "Ropero / closet", w: 120, d: 60, color: "#8b6f4e" },
  { name: "Mesón cocina", w: 200, d: 60, color: "#e08e45" },
  { name: "Lavadora", w: 60, d: 60, color: "#5b7c8d" },
  { name: "Personalizado…", w: 60, d: 60, color: "#b5533c" },
];

const COLOR_SWATCHES = [
  "#b5533c", "#d9a441", "#4f6d5a", "#5b7c8d",
  "#8b6f4e", "#6b5b73", "#c2609a", "#3f8f7a",
  "#7a7a7a", "#2f4858", "#e08e45", "#5c8a3f",
];

const FLOOR_COLORS = [
  { name: "Celeste plano", value: "#eef3f6" },
  { name: "Cemento", value: "#e7e3da" },
  { name: "Madera clara", value: "#ecdcc0" },
  { name: "Madera oscura", value: "#d9c19f" },
  { name: "Verde suave", value: "#e2ecdf" },
  { name: "Blanco", value: "#f7f6f2" },
];

const CANVAS_MAX = 480;
const MIN_ITEM_CM = 20;
let uid = 1;
const nextId = () => `f${uid++}`;

export default function App() {
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [furnitureMap, setFurnitureMap] = useState({});
  const [floor, setFloor] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState("living");
  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);
  const [presetIdx, setPresetIdx] = useState(0);
  const [customName, setCustomName] = useState("Mueble");
  const [customW, setCustomW] = useState(60);
  const [customD, setCustomD] = useState(60);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [snap, setSnap] = useState(true);
  const canvasRef = useRef(null);
  const dragState = useRef(null);
  const resizeState = useRef(null);
  const isDirty = useRef(false);
  const isEditing = useRef(false);

  const snapVal = (v) => (snap ? Math.round(v / 10) * 10 : Math.round(v));

  const applyServerState = (data) => {
    if (!data) return;
    if (data.rooms) {
      setRooms((prevDefaults) =>
        prevDefaults.map((def) => {
          const saved = data.rooms.find((r) => r.id === def.id);
          return saved ? { ...def, ...saved } : def;
        })
      );
    }
    if (data.furnitureMap) setFurnitureMap(data.furnitureMap);
    let maxId = 0;
    Object.values(data.furnitureMap || {}).forEach((list) =>
      list.forEach((it) => {
        const n = parseInt(String(it.id).replace("f", ""), 10);
        if (!isNaN(n) && n > maxId) maxId = n;
      })
    );
    if (maxId + 1 > uid) uid = maxId + 1;
  };

  // ---- load shared state from the database on mount ----
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/state");
        if (res.ok) {
          const { data } = await res.json();
          applyServerState(data);
        }
      } catch (e) {
        // first run / offline — start from defaults
      }
      setLoaded(true);
    })();
  }, []);

  // ---- save shared state (debounced) whenever it changes ----
  useEffect(() => {
    if (!loaded) return;
    isDirty.current = true;
    const t = setTimeout(async () => {
      try {
        setSyncing(true);
        await fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rooms, furnitureMap }),
        });
        setSaveError(false);
        isDirty.current = false;
      } catch (e) {
        setSaveError(true);
      } finally {
        setSyncing(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [rooms, furnitureMap, loaded]);

  // ---- poll every few seconds so both viewers stay in sync ----
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(async () => {
      if (isDirty.current || isEditing.current) return; // don't clobber local edits
      try {
        const res = await fetch("/api/state");
        if (res.ok) {
          const { data } = await res.json();
          applyServerState(data);
        }
      } catch (e) {
        // ignore transient network errors
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [loaded]);

  const room = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const items = furnitureMap[room.id] || [];
  const scale = Math.min(CANVAS_MAX / room.w, CANVAS_MAX / room.l);
  const canvasW = room.w * scale;
  const canvasH = room.l * scale;

  const updateRoomDim = (field, value) => {
    const v = Math.max(50, Math.min(1200, Number(value) || 0));
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== room.id) return r;
        const nr = { ...r, [field]: v };
        return nr;
      })
    );
    // reclamp furniture after resize
    setFurnitureMap((prev) => {
      const list = prev[room.id] || [];
      const newW = field === "w" ? v : room.w;
      const newL = field === "l" ? v : room.l;
      const clamped = list.map((it) => ({
        ...it,
        x: Math.min(Math.max(0, it.x), Math.max(0, newW - it.w)),
        y: Math.min(Math.max(0, it.y), Math.max(0, newL - it.d)),
      }));
      return { ...prev, [room.id]: clamped };
    });
  };

  const addFurniture = () => {
    const preset = FURNITURE_PRESETS[presetIdx];
    const isCustom = preset.name.startsWith("Personalizado");
    const w = isCustom ? Math.max(10, Number(customW) || 60) : preset.w;
    const d = isCustom ? Math.max(10, Number(customD) || 60) : preset.d;
    const name = isCustom ? customName || "Mueble" : preset.name;
    const item = {
      id: nextId(),
      name,
      w: Math.min(w, room.w),
      d: Math.min(d, room.l),
      x: Math.max(0, (room.w - w) / 2),
      y: Math.max(0, (room.l - d) / 2),
      color: preset.color,
    };
    setFurnitureMap((prev) => ({
      ...prev,
      [room.id]: [...(prev[room.id] || []), item],
    }));
    setSelectedFurnitureId(item.id);
  };

  const setItemColor = (id, color) => {
    setFurnitureMap((prev) => ({
      ...prev,
      [room.id]: (prev[room.id] || []).map((it) =>
        it.id === id ? { ...it, color } : it
      ),
    }));
  };

  const duplicateFurniture = (id) => {
    const src = (furnitureMap[room.id] || []).find((it) => it.id === id);
    if (!src) return;
    const copy = {
      ...src,
      id: nextId(),
      x: Math.min(Math.max(0, src.x + 15), Math.max(0, room.w - src.w)),
      y: Math.min(Math.max(0, src.y + 15), Math.max(0, room.l - src.d)),
    };
    setFurnitureMap((prev) => ({
      ...prev,
      [room.id]: [...(prev[room.id] || []), copy],
    }));
    setSelectedFurnitureId(copy.id);
  };

  const updateRoomColor = (color) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, floorColor: color } : r))
    );
  };

  const removeFurniture = (id) => {
    setFurnitureMap((prev) => ({
      ...prev,
      [room.id]: (prev[room.id] || []).filter((it) => it.id !== id),
    }));
    if (selectedFurnitureId === id) setSelectedFurnitureId(null);
  };

  const rotateFurniture = (id) => {
    setFurnitureMap((prev) => ({
      ...prev,
      [room.id]: (prev[room.id] || []).map((it) => {
        if (it.id !== id) return it;
        const nw = it.d;
        const nd = it.w;
        return {
          ...it,
          w: nw,
          d: nd,
          x: Math.min(it.x, Math.max(0, room.w - nw)),
          y: Math.min(it.y, Math.max(0, room.l - nd)),
        };
      }),
    }));
  };

  const onPointerDownItem = (e, item) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvasRef.current.getBoundingClientRect();
    const pointerXcm = (e.clientX - rect.left) / scale;
    const pointerYcm = (e.clientY - rect.top) / scale;
    dragState.current = {
      id: item.id,
      offX: pointerXcm - item.x,
      offY: pointerYcm - item.y,
    };
    isEditing.current = true;
    setSelectedFurnitureId(item.id);
    setActiveId(item.id);
  };

  const onPointerDownResize = (e, item) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeState.current = { id: item.id, startX: item.x, startY: item.y };
    isEditing.current = true;
    setSelectedFurnitureId(item.id);
    setActiveId(item.id);
  };

  const onPointerMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const pointerXcm = (e.clientX - rect.left) / scale;
    const pointerYcm = (e.clientY - rect.top) / scale;

    if (dragState.current) {
      const { id, offX, offY } = dragState.current;
      setFurnitureMap((prev) => ({
        ...prev,
        [room.id]: (prev[room.id] || []).map((it) => {
          if (it.id !== id) return it;
          const nx = Math.min(Math.max(0, snapVal(pointerXcm - offX)), Math.max(0, room.w - it.w));
          const ny = Math.min(Math.max(0, snapVal(pointerYcm - offY)), Math.max(0, room.l - it.d));
          return { ...it, x: nx, y: ny };
        }),
      }));
    } else if (resizeState.current) {
      const { id, startX, startY } = resizeState.current;
      setFurnitureMap((prev) => ({
        ...prev,
        [room.id]: (prev[room.id] || []).map((it) => {
          if (it.id !== id) return it;
          const nw = Math.min(Math.max(MIN_ITEM_CM, snapVal(pointerXcm - startX)), room.w - startX);
          const nd = Math.min(Math.max(MIN_ITEM_CM, snapVal(pointerYcm - startY)), room.l - startY);
          return { ...it, w: nw, d: nd };
        }),
      }));
    }
  };

  const onPointerUp = () => {
    dragState.current = null;
    resizeState.current = null;
    isEditing.current = false;
    setActiveId(null);
  };

  const floorRooms = rooms.filter((r) => r.floor === floor);
  const areaM2 = ((room.w * room.l) / 10000).toFixed(1);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f2ec] font-mono text-[#1c3d5a]">
        Cargando plano…
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-[#1c3d5a]"
      style={{
        background:
          "linear-gradient(160deg, #f4f2ec 0%, #eef3f2 45%, #f0ece0 100%)",
      }}
    >
      <header
        className="border-b-2 border-[#1c3d5a] text-[#f4f2ec] px-5 py-4"
        style={{
          background: "linear-gradient(120deg, #1c3d5a 0%, #2f6d8f 55%, #3aa38a 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <Home size={20} />
          <h1 className="text-lg tracking-wide font-semibold">
            Planificador — Casa A1
          </h1>
        </div>
        <p className="text-xs text-[#dcecec] mt-1 font-mono">
          Medidas aproximadas desde el plano · toca un mueble para pintarlo, rotarlo o redimensionarlo
        </p>
      </header>

      <div className="max-w-5xl mx-auto p-4 grid md:grid-cols-[220px_1fr] gap-4">
        {/* Room selector */}
        <aside className="space-y-3">
          <div className="flex rounded-lg overflow-hidden border-2 border-[#1c3d5a] shadow-sm">
            {[1, 2].map((f) => (
              <button
                key={f}
                onClick={() => setFloor(f)}
                style={
                  floor === f
                    ? { background: "linear-gradient(120deg, #1c3d5a, #3aa38a)" }
                    : {}
                }
                className={`flex-1 py-2 text-sm font-mono font-semibold transition-colors ${
                  floor === f
                    ? "text-white"
                    : "bg-[#f0ece0] text-[#1c3d5a] hover:bg-[#e4ded0]"
                }`}
              >
                Piso {f}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {floorRooms.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRoomId(r.id);
                  setSelectedFurnitureId(null);
                }}
                style={{
                  background: r.id === room.id ? r.floorColor || "#fff" : `${r.floorColor || "#fff"}99`,
                  borderLeftColor: r.id === room.id ? "#b5533c" : "#1c3d5a55",
                }}
                className={`w-full text-left px-3 py-2 rounded border-l-4 text-sm font-mono transition-all ${
                  r.id === room.id
                    ? "shadow-md scale-[1.02] font-semibold"
                    : "hover:brightness-95 hover:border-l-[#1c3d5a]"
                }`}
              >
                {r.name}
                <span className="block text-[10px] opacity-70">
                  {r.w}×{r.l} cm
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main panel */}
        <main className="space-y-4">
          <div className="bg-white border border-[#d8d2c0] border-t-4 border-t-[#3aa38a] rounded p-4 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
              <div>
                <h2 className="text-xl font-semibold">{room.name}</h2>
                <span className="text-xs font-mono text-[#6b6454]">
                  {areaM2} m² aprox.
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm font-mono">
                <Ruler size={16} />
                <label className="flex items-center gap-1">
                  ancho
                  <input
                    type="number"
                    value={room.w}
                    onChange={(e) => updateRoomDim("w", e.target.value)}
                    className="w-16 border border-[#d8d2c0] rounded px-1 py-0.5"
                  />
                  cm
                </label>
                <label className="flex items-center gap-1">
                  largo
                  <input
                    type="number"
                    value={room.l}
                    onChange={(e) => updateRoomDim("l", e.target.value)}
                    className="w-16 border border-[#d8d2c0] rounded px-1 py-0.5"
                  />
                  cm
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-[#6b6454]">piso:</span>
                {FLOOR_COLORS.map((fc) => (
                  <button
                    key={fc.value}
                    title={fc.name}
                    onClick={() => updateRoomColor(fc.value)}
                    className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                      (room.floorColor || FLOOR_COLORS[0].value) === fc.value
                        ? "border-[#1c3d5a] ring-2 ring-[#1c3d5a] ring-offset-1"
                        : "border-[#d8d2c0]"
                    }`}
                    style={{ background: fc.value }}
                  />
                ))}
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={snap}
                  onChange={(e) => setSnap(e.target.checked)}
                  className="accent-[#b5533c]"
                />
                ajustar a grilla (10 cm)
              </label>
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onClick={() => setSelectedFurnitureId(null)}
              className="relative mx-auto border-2 border-[#1c3d5a] touch-none transition-colors duration-300"
              style={{
                width: canvasW,
                height: canvasH,
                background: room.floorColor || FLOOR_COLORS[0].value,
                backgroundImage:
                  "linear-gradient(rgba(28,61,90,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(28,61,90,0.15) 1px, transparent 1px)",
                backgroundSize: `${50 * scale}px ${50 * scale}px`,
              }}
            >
              {items.map((it) => (
                <div
                  key={it.id}
                  onPointerDown={(e) => onPointerDownItem(e, it)}
                  className={`absolute flex flex-col items-center justify-center text-white text-[10px] font-mono leading-tight rounded-sm cursor-move select-none shadow-md ${
                    activeId === it.id ? "" : "transition-all duration-150 ease-out"
                  } ${
                    selectedFurnitureId === it.id
                      ? "ring-2 ring-[#b5533c] ring-offset-1 z-10 scale-[1.02]"
                      : "hover:brightness-110"
                  }`}
                  style={{
                    left: it.x * scale,
                    top: it.y * scale,
                    width: it.w * scale,
                    height: it.d * scale,
                    background: it.color,
                  }}
                >
                  <span className="px-1 text-center pointer-events-none">{it.name}</span>
                  <span className="opacity-80 pointer-events-none">
                    {it.w}×{it.d}
                  </span>
                  {selectedFurnitureId === it.id && (
                    <div
                      onPointerDown={(e) => onPointerDownResize(e, it)}
                      className="absolute -right-1.5 -bottom-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#b5533c] cursor-nwse-resize"
                      title="arrastra para cambiar el tamaño"
                    />
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-[#8aa1af] px-6 text-center">
                  Agrega muebles abajo y arrástralos aquí
                </div>
              )}
            </div>

            {selectedFurnitureId && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => rotateFurniture(selectedFurnitureId)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#1c3d5a] text-white text-xs font-mono hover:opacity-90"
                  >
                    <RotateCw size={14} /> rotar 90°
                  </button>
                  <button
                    onClick={() => duplicateFurniture(selectedFurnitureId)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#4f6d5a] text-white text-xs font-mono hover:opacity-90"
                  >
                    <Plus size={14} /> duplicar
                  </button>
                  <button
                    onClick={() => removeFurniture(selectedFurnitureId)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#b5533c] text-white text-xs font-mono hover:opacity-90"
                  >
                    <Trash2 size={14} /> quitar
                  </button>
                  <button
                    onClick={() => setSelectedFurnitureId(null)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded border border-[#1c3d5a] text-xs font-mono hover:bg-[#e4ded0]"
                  >
                    <X size={14} /> cerrar
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setItemColor(selectedFurnitureId, c)}
                      className="w-5 h-5 rounded-full border border-white shadow hover:scale-125 transition-transform"
                      style={{ background: c }}
                    />
                  ))}
                  <input
                    type="color"
                    onChange={(e) => setItemColor(selectedFurnitureId, e.target.value)}
                    className="w-6 h-6 rounded-full border-none cursor-pointer bg-transparent"
                    title="color personalizado"
                  />
                </div>
              </div>
            )}
            <p className="text-center text-[10px] font-mono text-[#8aa1af] mt-2 flex items-center justify-center gap-1">
              <Move size={12} /> arrastra un mueble para moverlo · tócalo para seleccionar
            </p>
          </div>

          {/* Add furniture */}
          <div className="bg-white border border-[#d8d2c0] border-t-4 border-t-[#d9a441] rounded p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-2 font-mono">Agregar mueble</h3>
            <div className="flex flex-wrap gap-2 items-end">
              <select
                value={presetIdx}
                onChange={(e) => setPresetIdx(Number(e.target.value))}
                className="border border-[#d8d2c0] rounded px-2 py-1.5 text-sm font-mono"
              >
                {FURNITURE_PRESETS.map((p, i) => (
                  <option key={p.name} value={i}>
                    {p.name}
                    {!p.name.startsWith("Personalizado") ? ` (${p.w}×${p.d})` : ""}
                  </option>
                ))}
              </select>

              {FURNITURE_PRESETS[presetIdx].name.startsWith("Personalizado") && (
                <>
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="nombre"
                    className="w-28 border border-[#d8d2c0] rounded px-2 py-1.5 text-sm font-mono"
                  />
                  <input
                    type="number"
                    value={customW}
                    onChange={(e) => setCustomW(e.target.value)}
                    placeholder="ancho cm"
                    className="w-20 border border-[#d8d2c0] rounded px-2 py-1.5 text-sm font-mono"
                  />
                  <input
                    type="number"
                    value={customD}
                    onChange={(e) => setCustomD(e.target.value)}
                    placeholder="largo cm"
                    className="w-20 border border-[#d8d2c0] rounded px-2 py-1.5 text-sm font-mono"
                  />
                </>
              )}

              <button
                onClick={addFurniture}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#4f6d5a] text-white text-sm font-mono hover:opacity-90"
              >
                <Plus size={14} /> agregar
              </button>
            </div>

            {items.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {items.map((it) => (
                  <li key={it.id}>
                    <button
                      onClick={() => setSelectedFurnitureId(it.id)}
                      className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border transition-colors ${
                        selectedFurnitureId === it.id
                          ? "border-[#b5533c] bg-[#fbeae5]"
                          : "border-[#d8d2c0] bg-[#f4f2ec] hover:border-[#1c3d5a]"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ background: it.color }}
                      />
                      {it.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-[#8aa1af]">
              {syncing ? "Sincronizando…" : "Guardado — visible para todos los que abran este link"}
            </p>
            {saveError && (
              <p className="text-xs font-mono text-[#b5533c]">
                No se pudo guardar — revisa tu conexión.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
