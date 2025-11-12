"""
Node Type Registry System

Provides a pluggable architecture for registering and executing different workflow node types.
Each node type defines its execution logic, Docker image, and configuration schema.
"""
from typing import Dict, Any, Callable, Optional
from dataclasses import dataclass


@dataclass
class NodeTypeDefinition:
    """
    Defines a workflow node type with its metadata and execution logic.
    """
    # Unique identifier (e.g., "terraform_validate", "tfsec_scan")
    type_id: str

    # Human-readable name for UI
    display_name: str

    # Node category for grouping in palette
    category: str  # "terraform", "security", "cost", "notification", "control", "custom"

    # Icon identifier (for frontend rendering)
    icon: str

    # Description shown in UI
    description: str

    # Docker image to use for execution (if None, runs in worker directly)
    docker_image: Optional[str] = None

    # Default configuration schema (JSON schema format)
    config_schema: Dict[str, Any] = None

    # Execution function: async callable that takes (node_execution_id, config, context)
    # Returns dict with output_data
    executor: Optional[Callable] = None

    def __post_init__(self):
        if self.config_schema is None:
            self.config_schema = {}


class NodeTypeRegistry:
    """
    Central registry for all available node types.
    Supports registration and lookup of node type definitions.
    """
    def __init__(self):
        self._registry: Dict[str, NodeTypeDefinition] = {}

    def register(self, node_type: NodeTypeDefinition):
        """Register a new node type"""
        if node_type.type_id in self._registry:
            raise ValueError(f"Node type '{node_type.type_id}' is already registered")
        self._registry[node_type.type_id] = node_type

    def get(self, type_id: str) -> Optional[NodeTypeDefinition]:
        """Get a node type definition by ID"""
        return self._registry.get(type_id)

    def list_all(self) -> Dict[str, NodeTypeDefinition]:
        """Get all registered node types"""
        return self._registry.copy()

    def list_by_category(self, category: str) -> Dict[str, NodeTypeDefinition]:
        """Get all node types in a specific category"""
        return {
            type_id: node_type
            for type_id, node_type in self._registry.items()
            if node_type.category == category
        }


# Global registry instance
node_registry = NodeTypeRegistry()


def register_node_type(
    type_id: str,
    display_name: str,
    category: str,
    icon: str,
    description: str,
    docker_image: Optional[str] = None,
    config_schema: Optional[Dict[str, Any]] = None,
    executor: Optional[Callable] = None,
):
    """
    Decorator to register a node type executor function.

    Usage:
        @register_node_type(
            type_id="terraform_validate",
            display_name="Terraform Validate",
            category="terraform",
            icon="check-circle",
            description="Validate Terraform configuration syntax"
        )
        async def execute_terraform_validate(node_execution_id, config, context):
            # Implementation
            return {"valid": True}
    """
    def decorator(func: Callable):
        node_type = NodeTypeDefinition(
            type_id=type_id,
            display_name=display_name,
            category=category,
            icon=icon,
            description=description,
            docker_image=docker_image,
            config_schema=config_schema or {},
            executor=func,
        )
        node_registry.register(node_type)
        return func

    # If called without a function (direct registration)
    if executor is not None:
        node_type = NodeTypeDefinition(
            type_id=type_id,
            display_name=display_name,
            category=category,
            icon=icon,
            description=description,
            docker_image=docker_image,
            config_schema=config_schema or {},
            executor=executor,
        )
        node_registry.register(node_type)
        return lambda f: f

    return decorator
