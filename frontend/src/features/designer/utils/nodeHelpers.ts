/**
 * Helper utilities for node/edge manipulation in the Designer
 */

import type { Node, Edge, MarkerType } from 'reactflow';
import { NODE_CONFIG } from '../../../lib/nodeFactory';

const { GRID_SIZE, DEFAULT_RESOURCE_SIZE } = NODE_CONFIG;

export const DEFAULT_EDGE_COLOR = '#2A8BFF';

export const DEFAULT_EDGE_STYLE = {
  stroke: DEFAULT_EDGE_COLOR,
  strokeWidth: 1.5,
} as const;

export const DEFAULT_EDGE_MARKER = {
  type: 'arrowclosed' as MarkerType,
  width: 18,
  height: 18,
  color: DEFAULT_EDGE_COLOR,
} as const;

export const defaultEdgeOptions = {
  type: 'smoothstep',
  style: DEFAULT_EDGE_STYLE,
  markerEnd: DEFAULT_EDGE_MARKER,
} as const;

/**
 * Decorate a single edge with default styles
 */
export function decorateEdge(edge: Edge): Edge {
  const style = { ...DEFAULT_EDGE_STYLE, ...(edge.style ?? {}) };
  const markerEnd = edge.markerEnd
    ? { ...DEFAULT_EDGE_MARKER, ...(edge.markerEnd as object) }
    : DEFAULT_EDGE_MARKER;
  return {
    ...edge,
    style,
    markerEnd,
  };
}

/**
 * Decorate multiple edges with default styles
 */
export function decorateEdges(edges: Edge[]): Edge[] {
  return edges.map(decorateEdge);
}

/**
 * Sanitize a node for saving to the backend
 * Strips unnecessary runtime data while preserving essential properties
 */
export function sanitizeNodeForSave(node: Node): Record<string, unknown> {
  const data = (node.data || {}) as Record<string, unknown>;
  const baseSize =
    data.size ??
    (node.type === 'default'
      ? {
          width: (node.style?.width as number) ?? DEFAULT_RESOURCE_SIZE,
          height: (node.style?.height as number) ?? DEFAULT_RESOURCE_SIZE,
        }
      : undefined);

  const sanitized: Record<string, unknown> = {
    id: node.id,
    type: node.type,
    position: {
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    },
    data: {
      resourceType: data.resourceType,
      resourceLabel: data.resourceLabel ?? data.resourceType,
      resourceCategory: data.resourceCategory,
      resourceDescription: data.resourceDescription,
      displayName: data.displayName ?? data.resourceLabel ?? data.resourceType,
      config: data.config ?? {},
      size: baseSize,
    },
  };

  if (node.parentNode) {
    sanitized.parentNode = node.parentNode;
  }

  if (node.extent) {
    sanitized.extent = node.extent;
  }

  const width =
    (node.style?.width as number | undefined) ??
    (node.type === 'default' ? (baseSize as { width?: number })?.width : undefined);
  const height =
    (node.style?.height as number | undefined) ??
    (node.type === 'default' ? (baseSize as { height?: number })?.height : undefined);

  if (width !== undefined || height !== undefined) {
    const style: Record<string, number> = {};
    if (width !== undefined) style.width = width;
    if (height !== undefined) style.height = height;
    sanitized.style = style;
  }

  return sanitized;
}

/**
 * Sanitize an edge for saving to the backend
 */
export function sanitizeEdgeForSave(edge: Edge): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {
    id: edge.id,
    source: edge.source,
    target: edge.target,
  };

  if (edge.type) sanitized.type = edge.type;
  if (edge.sourceHandle) sanitized.sourceHandle = edge.sourceHandle;
  if (edge.targetHandle) sanitized.targetHandle = edge.targetHandle;
  if (edge.label) sanitized.label = edge.label;
  if (edge.data) sanitized.data = edge.data;

  return sanitized;
}

/**
 * Snap a position to the grid
 */
export function snapToGrid(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.round(x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(y / GRID_SIZE) * GRID_SIZE,
  };
}

/**
 * Generate a unique node ID
 */
export function generateNodeId(resourceType: string): string {
  return `${resourceType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique edge ID
 */
export function generateEdgeId(source: string, target: string): string {
  return `edge_${source}_${target}_${Date.now()}`;
}
