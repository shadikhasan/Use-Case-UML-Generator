import { useMemo, type ReactElement } from "react";

type Actor = {
  id: string;
  label: string;
  side?: "left" | "right";
};

type UseCase = {
  id: string;
  label: string;
};

type RelationshipType = "association" | "include" | "extend" | "generalization";

type Relationship = {
  from: string;
  to: string;
  type?: RelationshipType;
  label?: string;
};

type UseCaseGroup = {
  id: string;
  label: string;
  useCaseIds: string[];
  fill?: string;
  stroke?: string;
};

type UseCaseUMLProps = {
  actors: Actor[];
  useCases: UseCase[];
  relationships: Relationship[];
  groups?: UseCaseGroup[];
  systemName?: string;
  width?: number;
  actorWidth?: number;
  actorHeight?: number;
  useCaseWidth?: number;
  useCaseHeight?: number;
};

type Point = { x: number; y: number };

type NodeLayout = {
  id: string;
  label: string;
  kind: "actor" | "usecase";
  x: number;
  y: number;
  width: number;
  height: number;
};

type GroupLayout = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
};

const DEFAULT_WIDTH = 1200;
const HORIZONTAL_GAP = 90;
const VERTICAL_GAP = 26;
const USECASE_VERTICAL_GAP = 32;
const MARGIN = 36;

const normalize = (dx: number, dy: number) => {
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
};

const getEdgePoint = (node: NodeLayout, toward: Point): Point => {
  const cx = node.x + node.width / 2;
  const cy = node.y + node.height / 2;
  const dir = normalize(toward.x - cx, toward.y - cy);

  if (node.kind === "usecase") {
    return {
      x: cx + (node.width / 2) * dir.x,
      y: cy + (node.height / 2) * dir.y,
    };
  }

  // Anchor actor relationships from the hand (end of the arm), not the box edge.
  const armY = node.y + 44;
  const rightHandX = cx + 20;
  const leftHandX = cx - 20;
  return {
    x: toward.x >= cx ? rightHandX : leftHandX,
    y: armY,
  };

};

const estimateLabelWidth = (label: string, min = 120) => Math.max(min, label.length * 9 + 28);

const createLinePath = (from: Point, to: Point) => `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

const getGroupColors = (index: number) => {
  const hue = (index * 57) % 360;
  return {
    fill: `hsl(${hue} 45% 90%)`,
    stroke: `hsl(${hue} 52% 72%)`,
  };
};

const UseCaseUML = ({
  actors,
  useCases,
  relationships,
  groups,
  systemName = "System",
  width = DEFAULT_WIDTH,
  actorWidth = 150,
  actorHeight = 120,
  useCaseWidth = 220,
  useCaseHeight = 56,
}: UseCaseUMLProps) => {
  const { nodes, relationElements, systemBox, height, groupLayouts, svgWidth } = useMemo(() => {
    const leftActors = actors.filter((a) => (a.side ?? "left") === "left");
    const rightActors = actors.filter((a) => a.side === "right");

    const top = MARGIN;
    const systemX = MARGIN + actorWidth + HORIZONTAL_GAP;
    const systemY = top;
    const availableSystemWidth = width - 2 * MARGIN - 2 * actorWidth - 2 * HORIZONTAL_GAP;
    const systemWidth = Math.max(520, availableSystemWidth);

    const grouped = (groups?.length ?? 0) > 0;
    const usecaseNodes: NodeLayout[] = [];
    const groupLayouts: GroupLayout[] = [];

    if (grouped && groups) {
      const cols = groups.length > 1 ? 2 : 1;
      const colGap = 38;
      const rowGap = 36;
      const contentW = systemWidth - 44;
      const groupW = (contentW - colGap * (cols - 1)) / cols;
      const baseX = systemX + 22;
      const baseY = systemY + 38;

      const heightsByGroup = groups.map((g) => {
        const count = g.useCaseIds.length;
        return 46 + count * useCaseHeight + Math.max(0, count - 1) * USECASE_VERTICAL_GAP + 24;
      });

      groups.forEach((g, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const yBefore = heightsByGroup
          .slice(0, row * cols)
          .reduce((acc, h, i) => (i % cols === 0 ? acc + Math.max(h, heightsByGroup[i + 1] ?? h) + rowGap : acc), 0);

        const gx = baseX + col * (groupW + colGap);
        const gy = baseY + yBefore;
        const gh = heightsByGroup[index];
        const palette = getGroupColors(index);

        groupLayouts.push({
          id: g.id,
          label: g.label,
          x: gx,
          y: gy,
          width: groupW,
          height: gh,
          fill: g.fill ?? palette.fill,
          stroke: g.stroke ?? palette.stroke,
        });

        g.useCaseIds.forEach((useCaseId, ucIndex) => {
          const found = useCases.find((u) => u.id === useCaseId);
          if (!found) return;
          const w = estimateLabelWidth(found.label, useCaseWidth);
          usecaseNodes.push({
            id: found.id,
            label: found.label,
            kind: "usecase",
            width: Math.min(w, groupW - 30),
            height: useCaseHeight,
            x: gx + (groupW - Math.min(w, groupW - 30)) / 2,
            y: gy + 34 + ucIndex * (useCaseHeight + USECASE_VERTICAL_GAP),
          });
        });
      });
    } else {
      useCases.forEach((u, idx) => {
        const w = estimateLabelWidth(u.label, useCaseWidth);
        usecaseNodes.push({
          id: u.id,
          label: u.label,
          kind: "usecase",
          width: w,
          height: useCaseHeight,
          x: systemX + (systemWidth - w) / 2,
          y: systemY + 40 + idx * (useCaseHeight + USECASE_VERTICAL_GAP),
        });
      });
    }

    const useCaseBottom = usecaseNodes.reduce((m, n) => Math.max(m, n.y + n.height), systemY + 220);
    const groupBottom = groupLayouts.reduce((m, g) => Math.max(m, g.y + g.height), systemY + 220);
    const contentBottom = Math.max(useCaseBottom, groupBottom);
    const systemHeight = Math.max(260, contentBottom - systemY + 24);

    const leftActorRows = Math.max(leftActors.length, 1);
    const rightActorRows = Math.max(rightActors.length, 1);
    const leftActorBlockHeight = leftActorRows * actorHeight + Math.max(0, leftActorRows - 1) * VERTICAL_GAP;
    const rightActorBlockHeight = rightActorRows * actorHeight + Math.max(0, rightActorRows - 1) * VERTICAL_GAP;
    const leftActorStartY = systemY + (systemHeight - leftActorBlockHeight) / 2;
    const rightActorStartY = systemY + (systemHeight - rightActorBlockHeight) / 2;

    const leftNodes: NodeLayout[] = leftActors.map((a, idx) => ({
      id: a.id,
      label: a.label,
      kind: "actor",
      width: actorWidth,
      height: actorHeight,
      x: MARGIN,
      y: leftActorStartY + idx * (actorHeight + VERTICAL_GAP),
    }));

    const rightX = systemX + systemWidth + HORIZONTAL_GAP;
    const rightNodes: NodeLayout[] = rightActors.map((a, idx) => ({
      id: a.id,
      label: a.label,
      kind: "actor",
      width: actorWidth,
      height: actorHeight,
      x: rightX,
      y: rightActorStartY + idx * (actorHeight + VERTICAL_GAP),
    }));

    const allNodes = [...leftNodes, ...rightNodes, ...usecaseNodes];
    const byId = new Map(allNodes.map((n) => [n.id, n]));

    const relationElements = relationships
      .map((rel, idx) => {
        const fromNode = byId.get(rel.from);
        const toNode = byId.get(rel.to);
        if (!fromNode || !toNode) return null;

        const fromCenter = { x: fromNode.x + fromNode.width / 2, y: fromNode.y + fromNode.height / 2 };
        const toCenter = { x: toNode.x + toNode.width / 2, y: toNode.y + toNode.height / 2 };

        const start = getEdgePoint(fromNode, toCenter);
        const end = getEdgePoint(toNode, fromCenter);
        const type = rel.type ?? "association";
        const dashed = type === "include" || type === "extend";

        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const dir = normalize(end.x - start.x, end.y - start.y);
        const normal = { x: -dir.y, y: dir.x };
        const labelX = midX + normal.x * (idx % 2 === 0 ? 16 : -16);
        const labelY = midY + normal.y * (idx % 2 === 0 ? 16 : -16);
        const labelText = rel.label || (type === "include" || type === "extend" ? `<<${type}>>` : "");

        return (
          <g key={`${rel.from}-${rel.to}-${idx}`}>
            <path
              d={createLinePath(start, end)}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              strokeDasharray={dashed ? "6 5" : undefined}
              markerEnd={type === "association" ? undefined : type === "generalization" ? "url(#arrow-empty)" : "url(#arrow-filled)"}
            />
            {labelText ? (
              type === "include" || type === "extend" ? (
                <g>
                  <rect
                    x={labelX - Math.max(20, labelText.length * 3.6)}
                    y={labelY - 7}
                    width={Math.max(40, labelText.length * 7.2)}
                    height={14}
                    rx={3}
                    fill="#ffffff"
                    opacity={0.96}
                  />
                  <text x={labelX} y={labelY} fontSize={10} fill="currentColor" textAnchor="middle" dominantBaseline="middle">
                    {labelText}
                  </text>
                </g>
              ) : (
                <text x={labelX} y={labelY} fontSize={10} fill="currentColor" textAnchor="middle" dominantBaseline="middle">
                  {labelText}
                </text>
              )
            ) : null}
          </g>
        );
      })
      .filter(Boolean) as ReactElement[];

    const neededWidth = rightX + actorWidth + MARGIN;
    return {
      nodes: allNodes,
      relationElements,
      groupLayouts,
      systemBox: { x: systemX, y: systemY, width: systemWidth, height: systemHeight },
      svgWidth: neededWidth,
      height: systemY + systemHeight + MARGIN,
    };
  }, [actors, relationships, groups, useCases, width, actorHeight, actorWidth, useCaseHeight, useCaseWidth]);

  return (
    <div className="w-full overflow-x-auto rounded-md border border-border bg-card p-3 text-foreground">
      <div className="flex justify-center">
      <svg className="shrink-0" width={svgWidth} height={height} role="img" aria-label={`${systemName} use case diagram`}>
        <defs>
          <marker id="arrow-filled" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
          <marker id="arrow-empty" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="currentColor" strokeWidth="1.1" />
          </marker>
        </defs>

        <rect
          x={systemBox.x}
          y={systemBox.y}
          width={systemBox.width}
          height={systemBox.height}
          rx={14}
          fill="#efefef"
          stroke="currentColor"
          strokeWidth={1.2}
        />
        <text x={systemBox.x + systemBox.width / 2} y={systemBox.y + 16} fontSize={11} className="font-semibold" fill="currentColor" textAnchor="middle">
          {systemName}
        </text>

        {groupLayouts.map((g) => (
          <g key={g.id}>
            <rect x={g.x} y={g.y} width={g.width} height={g.height} fill={g.fill} stroke={g.stroke} strokeWidth={1.1} />
            <text x={g.x + g.width / 2} y={g.y + 12} fontSize={10} textAnchor="middle" className="font-semibold" fill="currentColor">
              {g.label}
            </text>
          </g>
        ))}

        {relationElements}

        {nodes.map((node) => {
          if (node.kind === "usecase") {
            return (
              <g key={node.id}>
                <ellipse
                  cx={node.x + node.width / 2}
                  cy={node.y + node.height / 2}
                  rx={node.width / 2}
                  ry={node.height / 2}
                  fill="white"
                  stroke="currentColor"
                  strokeWidth={1.2}
                />
                <text x={node.x + node.width / 2} y={node.y + node.height / 2} fontSize={9.8} fill="currentColor" textAnchor="middle" dominantBaseline="middle">
                  {node.label}
                </text>
              </g>
            );
          }

          const centerX = node.x + node.width / 2;
          const headY = node.y + 16;
          const bodyY1 = node.y + 30;
          const bodyY2 = node.y + 62;
          const armY = node.y + 44;
          const legY = node.y + 94;

          return (
            <g key={node.id}>
              <circle cx={centerX} cy={headY} r={10} fill="none" stroke="currentColor" strokeWidth={1.2} />
              <line x1={centerX} y1={bodyY1} x2={centerX} y2={bodyY2} stroke="currentColor" strokeWidth={1.2} />
              <line x1={centerX - 20} y1={armY} x2={centerX + 20} y2={armY} stroke="currentColor" strokeWidth={1.2} />
              <line x1={centerX} y1={bodyY2} x2={centerX - 18} y2={legY} stroke="currentColor" strokeWidth={1.2} />
              <line x1={centerX} y1={bodyY2} x2={centerX + 18} y2={legY} stroke="currentColor" strokeWidth={1.2} />
              <text x={centerX} y={node.y + node.height} fontSize={11} textAnchor="middle" fill="currentColor">
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      </div>
    </div>
  );
};

export type { Actor, UseCase, Relationship, RelationshipType, UseCaseGroup, UseCaseUMLProps };
export default UseCaseUML;
