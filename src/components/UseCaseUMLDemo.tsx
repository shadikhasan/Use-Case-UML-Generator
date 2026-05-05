"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import UseCaseUML, {
  type Actor,
  type Relationship,
  type RelationshipType,
  type UseCase,
  type UseCaseGroup,
} from "@/components/UseCaseUML";

type EditableActor = {
  id: string;
  label: string;
  side: "left" | "right";
};

type EditableUseCase = {
  id: string;
  label: string;
  module: string;
};

type EditableRelationship = {
  from: string;
  to: string;
  type: RelationshipType;
  label: string;
};

type DiagramState = {
  systemName: string;
  actors: EditableActor[];
  useCases: EditableUseCase[];
  relationships: EditableRelationship[];
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `id-${Date.now()}`;

const initialActors: EditableActor[] = [
  { id: "customer", label: "Customer", side: "left" },
  { id: "admin", label: "Admin", side: "right" },
];

const initialUseCases: EditableUseCase[] = [
  { id: "browse-products", label: "Browse Products", module: "Shopping" },
  { id: "place-order", label: "Place Order", module: "Shopping" },
  { id: "manage-orders", label: "Manage Orders", module: "Administration" },
];

const initialRelationships: EditableRelationship[] = [
  { from: "customer", to: "browse-products", type: "association", label: "" },
  { from: "customer", to: "place-order", type: "association", label: "" },
  { from: "admin", to: "manage-orders", type: "association", label: "" },
  { from: "place-order", to: "browse-products", type: "include", label: "" },
];

const cardCls = "space-y-3 rounded-lg border border-border bg-card p-4";
const inputCls = "rounded-md border border-input bg-background px-3 py-2 text-sm";
const btnCls = "rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-muted";

const UseCaseUMLDemo = () => {
  const initialState: DiagramState = {
    systemName: "Online Shop",
    actors: initialActors,
    useCases: initialUseCases,
    relationships: initialRelationships,
  };
  const [present, setPresent] = useState<DiagramState>(initialState);
  const [past, setPast] = useState<DiagramState[]>([]);
  const [future, setFuture] = useState<DiagramState[]>([]);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [jsonDirty, setJsonDirty] = useState(false);
  const diagramWrapRef = useRef<HTMLDivElement | null>(null);

  const applyChange = (updater: (current: DiagramState) => DiagramState) => {
    setPresent((current) => {
      const next = updater(current);
      if (next === current) return current;
      setPast((p) => [...p, current]);
      setFuture([]);
      return next;
    });
  };

  const normalizeImportedState = (raw: unknown): DiagramState => {
    if (!raw || typeof raw !== "object") {
      throw new Error("Invalid JSON: expected an object.");
    }

    const data = raw as Record<string, unknown>;
    const systemNameRaw = typeof data.systemName === "string" ? data.systemName : "System";
    const actorsRaw = Array.isArray(data.actors) ? data.actors : [];
    const useCasesRaw = Array.isArray(data.useCases) ? data.useCases : [];
    const relationshipsRaw = Array.isArray(data.relationships) ? data.relationships : [];

    const actors: EditableActor[] = actorsRaw
      .map((a, idx) => {
        if (!a || typeof a !== "object") return null;
        const row = a as Record<string, unknown>;
        const label = typeof row.label === "string" ? row.label.trim() : "";
        if (!label) return null;
        const side = row.side === "right" ? "right" : "left";
        return {
          id: slugify(label || `actor-${idx}`),
          label,
          side,
        } as EditableActor;
      })
      .filter(Boolean) as EditableActor[];

    const useCases: EditableUseCase[] = useCasesRaw
      .map((u, idx) => {
        if (!u || typeof u !== "object") return null;
        const row = u as Record<string, unknown>;
        const label = typeof row.label === "string" ? row.label.trim() : "";
        if (!label) return null;
        const module = typeof row.module === "string" && row.module.trim() ? row.module.trim() : "General";
        return {
          id: slugify(label || `usecase-${idx}`),
          label,
          module,
        } as EditableUseCase;
      })
      .filter(Boolean) as EditableUseCase[];

    const nodeByLabel = new Map<string, string>();
    actors.forEach((a) => nodeByLabel.set(a.label, a.id));
    useCases.forEach((u) => nodeByLabel.set(u.label, u.id));

    const relationships: EditableRelationship[] = relationshipsRaw
      .map((r) => {
        if (!r || typeof r !== "object") return null;
        const row = r as Record<string, unknown>;
        const fromRaw = typeof row.from === "string" ? row.from.trim() : "";
        const toRaw = typeof row.to === "string" ? row.to.trim() : "";
        if (!fromRaw || !toRaw) return null;
        const from = nodeByLabel.get(fromRaw) ?? fromRaw;
        const to = nodeByLabel.get(toRaw) ?? toRaw;
        const type: RelationshipType =
          row.type === "include" || row.type === "extend" || row.type === "generalization" ? row.type : "association";
        const label = typeof row.label === "string" ? row.label : "";
        return { from, to, type, label } as EditableRelationship;
      })
      .filter(Boolean) as EditableRelationship[];

    return {
      systemName: systemNameRaw || "System",
      actors,
      useCases,
      relationships,
    };
  };

  const importFromJsonString = (text: string) => {
    if (!text.trim()) {
      applyChange(() => ({
        systemName: "",
        actors: [],
        useCases: [],
        relationships: [],
      }));
      setImportError("");
      return true;
    }

    try {
      const parsed = JSON.parse(text);
      const nextState = normalizeImportedState(parsed);
      applyChange(() => nextState);
      setImportError("");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON input.";
      setImportError(message);
      return false;
    }
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [present, ...f]);
    setPresent(previous);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, present]);
    setPresent(next);
  };

  const { systemName, actors, useCases, relationships } = present;

  const actorOptions = actors.filter((a) => a.label.trim().length > 0);
  const useCaseOptions = useCases.filter((u) => u.label.trim().length > 0);
  const allNodeOptions = [...actorOptions, ...useCaseOptions];

  const actorNodes: Actor[] = actorOptions.map((a) => ({ id: a.id, label: a.label, side: a.side }));
  const useCaseNodes: UseCase[] = useCaseOptions.map((u) => ({ id: u.id, label: u.label }));

  const groupMap = new Map<string, string[]>();
  useCaseOptions.forEach((u) => {
    const moduleName = u.module.trim() || "General";
    groupMap.set(moduleName, [...(groupMap.get(moduleName) ?? []), u.id]);
  });
  const groups: UseCaseGroup[] = Array.from(groupMap.entries()).map(([moduleName, useCaseIds]) => ({
    id: slugify(moduleName),
    label: moduleName,
    useCaseIds,
  }));
  const groupedModules = groups.length > 1 ? groups : undefined;

  const relationEdges: Relationship[] = relationships
    .filter((r) => r.from && r.to)
    .map((r) => ({
      from: r.from,
      to: r.to,
      type: r.type,
      label: r.label.trim() || undefined,
    }));

  const statsText = useMemo(
    () => `${actorOptions.length} actor(s) • ${useCaseOptions.length} use case(s) • ${relationEdges.length} relation(s)`,
    [actorOptions.length, useCaseOptions.length, relationEdges.length],
  );

  const exportJsonText = useMemo(() => {
    const idToLabel = new Map<string, string>();
    present.actors.forEach((a) => {
      if (a.label.trim()) idToLabel.set(a.id, a.label.trim());
    });
    present.useCases.forEach((u) => {
      if (u.label.trim()) idToLabel.set(u.id, u.label.trim());
    });

    const payload = {
      systemName: present.systemName,
      actors: present.actors.map((a) => ({ label: a.label, side: a.side })),
      useCases: present.useCases.map((u) => ({ label: u.label, module: u.module })),
      relationships: present.relationships.map((r) => ({
        from: idToLabel.get(r.from) ?? r.from,
        to: idToLabel.get(r.to) ?? r.to,
        type: r.type,
        label: r.label,
      })),
    };

    return JSON.stringify(payload, null, 2);
  }, [present]);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    downloadFile(exportJsonText, "use-case-diagram.json", "application/json");
  };

  const handleExportSVG = () => {
    const svg = diagramWrapRef.current?.querySelector("svg");
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    downloadFile(serialized, "use-case-diagram.svg", "image/svg+xml;charset=utf-8");
  };

  const handleExportPNG = async () => {
    if (!diagramWrapRef.current) return;
    const dataUrl = await toPng(diagramWrapRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "use-case-diagram.png";
    a.click();
  };

  const handleExportPDF = async () => {
    if (!diagramWrapRef.current) return;
    const dataUrl = await toPng(diagramWrapRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to prepare image for PDF export."));
    });

    const pdf = new jsPDF({
      orientation: img.width >= img.height ? "landscape" : "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
    const renderWidth = img.width * ratio;
    const renderHeight = img.height * ratio;
    const offsetX = (pageWidth - renderWidth) / 2;
    const offsetY = (pageHeight - renderHeight) / 2;

    pdf.addImage(dataUrl, "PNG", offsetX, offsetY, renderWidth, renderHeight);
    pdf.save("use-case-diagram.pdf");
  };

  useEffect(() => {
    if (!jsonDirty) {
      setImportText(exportJsonText);
    }
  }, [exportJsonText, jsonDirty]);

  useEffect(() => {
    if (!jsonDirty) return;
    const timer = window.setTimeout(() => {
      importFromJsonString(importText);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [importText, jsonDirty]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isMetaOrCtrl = event.ctrlKey || event.metaKey;

      if (!isMetaOrCtrl) return;

      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [past.length, future.length]);

  useEffect(() => {
    setImportText(exportJsonText);
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Use Case UML Builder</h1>
          <p className="text-sm text-muted-foreground">Fill left form or edit JSON on right. Both stay synced.</p>
          <p className="mt-1 text-xs text-muted-foreground">{statsText}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className={btnCls} onClick={undo} disabled={past.length === 0}>
              Undo
            </button>
            <button type="button" className={btnCls} onClick={redo} disabled={future.length === 0}>
              Redo
            </button>
            <button type="button" className={btnCls} onClick={handleExportPNG}>
              Export PNG
            </button>
            <button type="button" className={btnCls} onClick={handleExportPDF}>
              Export PDF
            </button>
            <button type="button" className={btnCls} onClick={handleExportSVG}>
              Export SVG
            </button>
            <button type="button" className={btnCls} onClick={handleExportJSON}>
              Export JSON
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <section className={`${cardCls} py-2`}>
              <div className="flex items-center gap-3">
                <h2 className="shrink-0 text-sm font-semibold">System</h2>
                <input
                  value={systemName}
                  onChange={(e) => applyChange((state) => ({ ...state, systemName: e.target.value }))}
                  className={`${inputCls} h-9 w-full`}
                  placeholder="Reunion Hub"
                />
              </div>
            </section>

            <section className={cardCls}>
              <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Actors</h2>
              <button
                type="button"
                className={btnCls}
                onClick={() =>
                  applyChange((state) => ({
                    ...state,
                    actors: [...state.actors, { id: `actor-${Date.now()}`, label: "", side: "left" }],
                  }))
                }
              >
                + Add Person
              </button>
            </div>
            {actors.map((actor, idx) => (
              <div key={actor.id} className="grid gap-2 md:grid-cols-12">
                <input
                  value={actor.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    applyChange((state) => {
                      const next = [...state.actors];
                      next[idx] = { ...next[idx], label, id: slugify(label) };
                      return { ...state, actors: next };
                    });
                  }}
                  placeholder="Name (e.g., Student, Admin)"
                  className={`${inputCls} md:col-span-7`}
                />
                <select
                  value={actor.side}
                  onChange={(e) => {
                    const side = e.target.value as "left" | "right";
                    applyChange((state) => {
                      const next = [...state.actors];
                      next[idx] = { ...next[idx], side };
                      return { ...state, actors: next };
                    });
                  }}
                  className={`${inputCls} md:col-span-3`}
                >
                  <option value="left">Left side</option>
                  <option value="right">Right side</option>
                </select>
                <button
                  type="button"
                  className="rounded-md border border-destructive px-3 py-2 text-xs text-destructive hover:bg-destructive/10 md:col-span-2"
                  onClick={() => applyChange((state) => ({ ...state, actors: state.actors.filter((_, i) => i !== idx) }))}
                >
                  Remove
                </button>
              </div>
            ))}
            </section>

            <section className={cardCls}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Use Cases</h2>
              <button
                type="button"
                className={btnCls}
                onClick={() =>
                  applyChange((state) => ({
                    ...state,
                    useCases: [...state.useCases, { id: `usecase-${Date.now()}`, label: "", module: "General" }],
                  }))
                }
              >
                + Add Action
              </button>
            </div>
            {useCases.map((item, idx) => (
              <div key={item.id} className="grid gap-2 md:grid-cols-12">
                <input
                  value={item.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    applyChange((state) => {
                      const next = [...state.useCases];
                      next[idx] = { ...next[idx], label, id: slugify(label) };
                      return { ...state, useCases: next };
                    });
                  }}
                  placeholder="Action (e.g., Register for Reunion)"
                  className={`${inputCls} md:col-span-7`}
                />
                <input
                  value={item.module}
                  onChange={(e) => {
                    const module = e.target.value;
                    applyChange((state) => {
                      const next = [...state.useCases];
                      next[idx] = { ...next[idx], module };
                      return { ...state, useCases: next };
                    });
                  }}
                  placeholder="Group/Module (e.g., Registration)"
                  className={`${inputCls} md:col-span-3`}
                />
                <button
                  type="button"
                  className="rounded-md border border-destructive px-3 py-2 text-xs text-destructive hover:bg-destructive/10 md:col-span-2"
                  onClick={() => applyChange((state) => ({ ...state, useCases: state.useCases.filter((_, i) => i !== idx) }))}
                >
                  Remove
                </button>
              </div>
            ))}
            </section>

            <section className={cardCls}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Relationships</h2>
              <button
                type="button"
                className={btnCls}
                onClick={() =>
                  applyChange((state) => ({
                    ...state,
                    relationships: [
                      ...state.relationships,
                      {
                        from: actorOptions[0]?.id ?? useCaseOptions[0]?.id ?? "",
                        to: useCaseOptions[0]?.id ?? actorOptions[0]?.id ?? "",
                        type: "association",
                        label: "",
                      },
                    ],
                  }))
                }
              >
                + Add Connection
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Use `include` and `extend` for dashed UML relations.</p>
            {relationships.map((rel, idx) => (
              <div key={`${rel.from}-${rel.to}-${idx}`} className="grid gap-2 md:grid-cols-12">
                <select
                  value={rel.from}
                  onChange={(e) => {
                    const from = e.target.value;
                    applyChange((state) => {
                      const next = [...state.relationships];
                      next[idx] = { ...next[idx], from };
                      return { ...state, relationships: next };
                    });
                  }}
                  className={`${inputCls} md:col-span-3`}
                >
                  <option value="">Who/What starts?</option>
                  {allNodeOptions.map((n) => (
                    <option key={`from-${n.id}`} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
                <select
                  value={rel.type}
                  onChange={(e) => {
                    const type = e.target.value as RelationshipType;
                    applyChange((state) => {
                      const next = [...state.relationships];
                      next[idx] = { ...next[idx], type };
                      return { ...state, relationships: next };
                    });
                  }}
                  className={`${inputCls} md:col-span-2`}
                >
                  <option value="association">association</option>
                  <option value="include">include</option>
                  <option value="extend">extend</option>
                  <option value="generalization">generalization</option>
                </select>
                <select
                  value={rel.to}
                  onChange={(e) => {
                    const to = e.target.value;
                    applyChange((state) => {
                      const next = [...state.relationships];
                      next[idx] = { ...next[idx], to };
                      return { ...state, relationships: next };
                    });
                  }}
                  className={`${inputCls} md:col-span-3`}
                >
                  <option value="">Connects to?</option>
                  {allNodeOptions.map((n) => (
                    <option key={`to-${n.id}`} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
                <input
                  value={rel.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    applyChange((state) => {
                      const next = [...state.relationships];
                      next[idx] = { ...next[idx], label };
                      return { ...state, relationships: next };
                    });
                  }}
                  placeholder="Optional note"
                  className={`${inputCls} md:col-span-3`}
                />
                <button
                  type="button"
                  className="rounded-md border border-destructive px-3 py-2 text-xs text-destructive hover:bg-destructive/10 md:col-span-1"
                  onClick={() =>
                    applyChange((state) => ({ ...state, relationships: state.relationships.filter((_, i) => i !== idx) }))
                  }
                >
                  X
                </button>
              </div>
            ))}
            </section>
          </div>

          <section className={cardCls}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">JSON</h2>
              <label className={btnCls}>
                Import File
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    setImportText(text);
                    importFromJsonString(text);
                    setJsonDirty(false);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setJsonDirty(true);
              }}
              placeholder='Paste JSON here. Example: {"systemName":"Reunion Hub","actors":[],"useCases":[],"relationships":[]}'
              className={`${inputCls} min-h-[560px] w-full font-mono text-xs`}
              spellCheck={false}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={btnCls}
                onClick={() => {
                  setImportText(exportJsonText);
                  setImportError("");
                  setJsonDirty(false);
                }}
              >
                Reset JSON
              </button>
              {importError ? <p className="text-xs text-destructive">{importError}</p> : null}
            </div>
          </section>
        </div>

        <div ref={diagramWrapRef}>
          <UseCaseUML
            systemName={systemName || "System"}
            actors={actorNodes}
            useCases={useCaseNodes}
            relationships={relationEdges}
            groups={groupedModules}
          />
        </div>
      </div>
    </div>
  );
};

export default UseCaseUMLDemo;
