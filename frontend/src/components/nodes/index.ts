import ResourceNodeEnhanced from './ResourceNodeEnhanced';
import ContainerNodeEnhanced from './ContainerNodeEnhanced';

export const nodeTypes = {
  vpc: ContainerNodeEnhanced,
  subnet: ContainerNodeEnhanced,
  region: ContainerNodeEnhanced,
  availability_zone: ContainerNodeEnhanced,
  container: ContainerNodeEnhanced,
  resource: ResourceNodeEnhanced,
  default: ResourceNodeEnhanced,
};

export { ResourceNodeEnhanced, ContainerNodeEnhanced };
