import React from "react";
import { CanvasTemplate, CANVAS_TEMPLATES } from "./starter-templates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StarterTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: CanvasTemplate) => void;
}

const TemplatePreview = ({ template }: { template: CanvasTemplate }) => {
  const padding = 20;
  const nodes = template.nodes;
  const getNodeWidth = (node: CanvasTemplate["nodes"][number]) =>
    typeof node.width === "number"
      ? node.width
      : typeof node.style?.width === "number"
        ? node.style.width
        : 100;
  const getNodeHeight = (node: CanvasTemplate["nodes"][number]) =>
    typeof node.height === "number"
      ? node.height
      : typeof node.style?.height === "number"
        ? node.style.height
        : 60;

  const minX = Math.min(...nodes.map((n) => n.position.x));
  const maxX = Math.max(...nodes.map((n) => n.position.x + getNodeWidth(n)));
  const minY = Math.min(...nodes.map((n) => n.position.y));
  const maxY = Math.max(...nodes.map((n) => n.position.y + getNodeHeight(n)));

  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  return (
    <div className="h-32 w-full bg-base-subtle rounded border border-base-border overflow-hidden relative">
      <svg
        viewBox={`${minX - padding} ${minY - padding} ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {template.edges.map((edge) => {
          const source = template.nodes.find((n) => n.id === edge.source);
          const target = template.nodes.find((n) => n.id === edge.target);
          if (!source || !target) return null;
          return (
            <line
              key={edge.id}
              x1={source.position.x + (source.width || 100) / 2}
              y1={source.position.y + (source.height || 50) / 2}
              x2={target.position.x + (target.width || 100) / 2}
              y2={target.position.y + (target.height || 50) / 2}
              stroke="#64748b"
              strokeWidth="2"
            />
          );
        })}
        {template.nodes.map((node) => {
          const nodeWidth = getNodeWidth(node);
          const nodeHeight = getNodeHeight(node);
          const fill = node.data.color;
          const x = node.position.x;
          const y = node.position.y;
          const shape = node.data.shape;

          if (shape === "diamond") {
            return (
              <polygon
                key={node.id}
                points={`${x + nodeWidth / 2},${y} ${x + nodeWidth},${y + nodeHeight / 2} ${x + nodeWidth / 2},${y + nodeHeight} ${x},${y + nodeHeight / 2}`}
                fill={fill}
              />
            );
          }

          if (shape === "hexagon") {
            return (
              <polygon
                key={node.id}
                points={`${x + nodeWidth * 0.25},${y} ${x + nodeWidth * 0.75},${y} ${x + nodeWidth},${y + nodeHeight / 2} ${x + nodeWidth * 0.75},${y + nodeHeight} ${x + nodeWidth * 0.25},${y + nodeHeight} ${x},${y + nodeHeight / 2}`}
                fill={fill}
              />
            );
          }

          if (shape === "cylinder") {
            const rx = nodeWidth / 2 - 6;
            const cx = x + nodeWidth / 2;
            const topY = y + 8;
            const bottomY = y + nodeHeight - 8;
            return (
              <g key={node.id}>
                <rect x={x} y={y + 8} width={nodeWidth} height={nodeHeight - 16} fill={fill} />
                <ellipse cx={cx} cy={topY} rx={rx} ry={8} fill={fill} />
                <ellipse cx={cx} cy={bottomY} rx={rx} ry={8} fill={fill} />
              </g>
            );
          }

          if (shape === "circle") {
            return (
              <ellipse
                key={node.id}
                cx={x + nodeWidth / 2}
                cy={y + nodeHeight / 2}
                rx={nodeWidth / 2}
                ry={nodeHeight / 2}
                fill={fill}
              />
            );
          }

          const radius = shape === "pill" ? nodeHeight / 2 : 6;
          return (
            <rect
              key={node.id}
              x={x}
              y={y}
              width={nodeWidth}
              height={nodeHeight}
              fill={fill}
              rx={radius}
            />
          );
        })}
      </svg>
    </div>
  );
};

export const StarterTemplatesModal = ({
  isOpen,
  onClose,
  onImport,
}: StarterTemplatesModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Starter Templates</DialogTitle>
          <DialogDescription>
            Choose a pre-built template to jumpstart your canvas.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="flex flex-col gap-3 p-4 rounded-lg border border-base-border bg-base"
              >
                <TemplatePreview template={template} />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <p className="text-xs text-base-content-subtle mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => onImport(template)}
                >
                  Import Template
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
