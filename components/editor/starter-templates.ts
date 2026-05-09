import { CanvasNode, CanvasEdge, NODE_COLORS } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

const COLORS = {
  primary: NODE_COLORS[1].fill,
  secondary: NODE_COLORS[6].fill,
  accent: NODE_COLORS[3].fill,
  neutral: NODE_COLORS[0].fill,
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "A standard 3-tier microservices setup with gateway and databases.",
    nodes: [
      { id: "n1", type: "canvasNode", position: { x: 400, y: 100 }, data: { label: "API Gateway", color: COLORS.primary, shape: "rectangle" }, width: 120, height: 60 },
      { id: "n2", type: "canvasNode", position: { x: 200, y: 300 }, data: { label: "Auth Service", color: COLORS.secondary, shape: "pill" }, width: 100, height: 50 },
      { id: "n3", type: "canvasNode", position: { x: 400, y: 300 }, data: { label: "Order Service", color: COLORS.secondary, shape: "pill" }, width: 100, height: 50 },
      { id: "n4", type: "canvasNode", position: { x: 600, y: 300 }, data: { label: "User Service", color: COLORS.secondary, shape: "pill" }, width: 100, height: 50 },
      { id: "n5", type: "canvasNode", position: { x: 400, y: 500 }, data: { label: "Primary DB", color: COLORS.accent, shape: "cylinder" }, width: 100, height: 60 },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n1", target: "n3" },
      { id: "e3", source: "n1", target: "n4" },
      { id: "e4", source: "n3", target: "n5" },
    ],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "Linear deployment pipeline from source to production.",
    nodes: [
      { id: "c1", type: "canvasNode", position: { x: 100, y: 200 }, data: { label: "GitHub", color: COLORS.neutral, shape: "rectangle" }, width: 100, height: 50 },
      { id: "c2", type: "canvasNode", position: { x: 300, y: 200 }, data: { label: "Build", color: COLORS.primary, shape: "rectangle" }, width: 100, height: 50 },
      { id: "c3", type: "canvasNode", position: { x: 500, y: 200 }, data: { label: "Test", color: COLORS.primary, shape: "rectangle" }, width: 100, height: 50 },
      { id: "c4", type: "canvasNode", position: { x: 700, y: 200 }, data: { label: "Deploy", color: COLORS.secondary, shape: "rectangle" }, width: 100, height: 50 },
    ],
    edges: [
      { id: "ec1", source: "c1", target: "c2" },
      { id: "ec2", source: "c2", target: "c3" },
      { id: "ec3", source: "c3", target: "c4" },
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Publish/subscribe pattern using a message broker.",
    nodes: [
      { id: "e1", type: "canvasNode", position: { x: 200, y: 200 }, data: { label: "Producer", color: COLORS.secondary, shape: "rectangle" }, width: 100, height: 50 },
      { id: "e2", type: "canvasNode", position: { x: 400, y: 200 }, data: { label: "Message Broker", color: COLORS.accent, shape: "hexagon" }, width: 120, height: 80 },
      { id: "e3", type: "canvasNode", position: { x: 600, y: 100 }, data: { label: "Consumer A", color: COLORS.primary, shape: "rectangle" }, width: 100, height: 50 },
      { id: "e4", type: "canvasNode", position: { x: 600, y: 300 }, data: { label: "Consumer B", color: COLORS.primary, shape: "rectangle" }, width: 100, height: 50 },
    ],
    edges: [
      { id: "ee1", source: "e1", target: "e2" },
      { id: "ee2", source: "e2", target: "e3" },
      { id: "ee3", source: "e2", target: "e4" },
    ],
  },
];
