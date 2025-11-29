import VPCNode from './VPCNode';
import SubnetNode from './SubnetNode';
import RegionNode from './RegionNode';
import ResizableContainerNode from './ResizableContainerNode';
import ResizableResourceNode from './ResizableResourceNode';
import ResourceNodeEnhanced from './ResourceNodeEnhanced';
import ContainerNodeEnhanced from './ContainerNodeEnhanced';

export const nodeTypes = {
  vpc: ContainerNodeEnhanced,
  subnet: ContainerNodeEnhanced,
  region: ContainerNodeEnhanced,
  container: ContainerNodeEnhanced,
  resource: ResourceNodeEnhanced,
  default: ResourceNodeEnhanced,
};

export { VPCNode, SubnetNode, RegionNode, ResizableContainerNode, ResizableResourceNode, ResourceNodeEnhanced, ContainerNodeEnhanced };
