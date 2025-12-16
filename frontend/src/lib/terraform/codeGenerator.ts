import { Node, Edge } from 'reactflow';

export interface GeneratedTerraform {
  main: string;
  variables: string;
  outputs: string;
  providers: string;
}

export function generateTerraformCode(nodes: Node[], edges: Edge[], provider: string): GeneratedTerraform {
  const resources: string[] = [];
  const outputs: string[] = [];

  nodes.forEach((node) => {
    const data = node.data as any;
    const resourceType = data?.resourceType;
    if (!resourceType) return;
    const name = (data?.displayName || node.id).toLowerCase().replace(/[^a-z0-9]/g, '_');
    resources.push(`resource "${resourceType}" "${name}" {\n  tags = { Name = "${data?.displayName || name}" }\n}`);
    outputs.push(`output "${name}_id" { value = ${resourceType}.${name}.id }`);
  });

  return {
    main: resources.join('\n\n'),
    variables: 'variable "aws_region" { default = "us-east-1" }',
    outputs: outputs.join('\n'),
    providers: `provider "${provider}" { region = var.aws_region }`,
  };
}

