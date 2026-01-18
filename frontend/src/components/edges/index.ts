import AnimatedEdge from './AnimatedEdge';

export const edgeTypes = {
  animated: AnimatedEdge,
  smoothstep: AnimatedEdge, // Override default smoothstep with our animated version
};

export { AnimatedEdge };
