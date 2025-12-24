"""
Schema Loader - Dynamically load and parse frontend service schemas

This module reads the TypeScript service definition files from the frontend
and converts them into Python data structures that the Terraform generator can use.

The frontend schemas define:
- All available cloud services (AWS, Azure, GCP)
- Required and optional inputs for each service
- Nested blocks and their attributes
- Output values
- Resource references between services
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field


@dataclass
class ServiceInput:
    """Represents an input field for a service"""
    name: str
    type: str
    description: str = ""
    example: Optional[str] = None
    default: Any = None
    options: List[str] = field(default_factory=list)
    reference: Optional[str] = None  # e.g., "aws_subnet.id" - indicates this should reference another resource
    required: bool = False


@dataclass
class BlockAttribute:
    """Represents an attribute within a nested block"""
    name: str
    type: str
    description: str = ""
    options: List[str] = field(default_factory=list)
    default: Any = None
    required: bool = False


@dataclass
class ServiceBlock:
    """Represents a nested block in Terraform (e.g., root_block_device, vpc_config)"""
    name: str
    description: str = ""
    multiple: bool = False  # Can this block appear multiple times?
    attributes: List[BlockAttribute] = field(default_factory=list)
    nested_blocks: List['ServiceBlock'] = field(default_factory=list)


@dataclass
class ServiceOutput:
    """Represents an output value from a resource"""
    name: str
    type: str
    description: str


@dataclass
class ServiceSchema:
    """Complete schema definition for a cloud service"""
    id: str
    name: str
    description: str
    terraform_resource: str  # e.g., "aws_instance", "aws_subnet"
    icon: str
    required_inputs: List[ServiceInput] = field(default_factory=list)
    optional_inputs: List[ServiceInput] = field(default_factory=list)
    blocks: List[ServiceBlock] = field(default_factory=list)
    outputs: List[ServiceOutput] = field(default_factory=list)

    @property
    def all_inputs(self) -> List[ServiceInput]:
        """Get all inputs (required + optional)"""
        return self.required_inputs + self.optional_inputs

    def get_input(self, name: str) -> Optional[ServiceInput]:
        """Get input by name"""
        for inp in self.all_inputs:
            if inp.name == name:
                return inp
        return None


class SchemaLoader:
    """
    Loads and parses frontend TypeScript service schemas.

    This loader reads the service definition files from the frontend
    and makes them available to the backend Terraform generator.
    """

    def __init__(self, frontend_path: str = "/app/../frontend/src/lib"):
        """
        Initialize schema loader.

        Args:
            frontend_path: Path to frontend lib directory containing service schemas
        """
        self.frontend_path = Path(frontend_path)
        self._schemas_cache: Dict[str, Dict[str, ServiceSchema]] = {}

    def load_aws_schemas(self) -> Dict[str, ServiceSchema]:
        """
        Load all AWS service schemas from frontend.

        Returns:
            Dictionary mapping terraform_resource -> ServiceSchema
        """
        if 'aws' in self._schemas_cache:
            return self._schemas_cache['aws']

        schemas = {}
        aws_path = self.frontend_path / "aws"

        if not aws_path.exists():
            # For development/testing, return empty dict
            # In production, this would be an error
            return schemas

        # Load schemas from all category files
        category_files = [
            'computeServicesData.ts',
            'networkingServicesData.ts',
            'storageServicesData.ts',
            'databaseServicesData.ts',
            'securityServicesData.ts',
            'serverlessServicesData.ts',
            'containersServicesData.ts',
            'messagingServicesData.ts',
            'analyticsServicesData.ts',
            'machineLearningServicesData.ts',
            'managementServicesData.ts',
            'developerToolsServicesData.ts',
        ]

        for category_file in category_files:
            file_path = aws_path / category_file
            if file_path.exists():
                category_schemas = self._parse_typescript_schema_file(file_path)
                schemas.update(category_schemas)

        self._schemas_cache['aws'] = schemas
        return schemas

    def _parse_typescript_schema_file(self, file_path: Path) -> Dict[str, ServiceSchema]:
        """
        Parse a TypeScript service schema file.

        This is a simplified parser that extracts the service definitions
        from TypeScript files. In production, you might want to:
        1. Have the frontend export JSON schemas alongside TS files
        2. Use a proper TypeScript parser
        3. Generate schemas at build time

        For now, we'll use regex-based parsing for the structured format.
        """
        schemas = {}

        try:
            content = file_path.read_text(encoding='utf-8')

            # Extract the array definition (e.g., export const COMPUTE_SERVICES = [...])
            # This regex finds the service array
            array_match = re.search(
                r'export const \w+_SERVICES(?::\s*\w+ServiceDefinition\[\])?\s*=\s*\[(.*?)\];',
                content,
                re.DOTALL
            )

            if not array_match:
                return schemas

            # For now, we'll implement a simple JSON-like parser
            # In production, consider exporting JSON from frontend or using a TS parser
            # This is a placeholder - we'll need to implement proper parsing

            # TODO: Implement full TypeScript object parsing
            # For MVP, we can have frontend also export JSON schemas

        except Exception as e:
            # Log error but don't fail - allow graceful degradation
            print(f"Warning: Failed to parse {file_path}: {e}")

        return schemas

    def get_schema(self, terraform_resource: str, cloud_provider: str = "aws") -> Optional[ServiceSchema]:
        """
        Get schema for a specific Terraform resource.

        Args:
            terraform_resource: e.g., "aws_instance", "aws_subnet"
            cloud_provider: "aws", "azure", or "gcp"

        Returns:
            ServiceSchema if found, None otherwise
        """
        if cloud_provider == "aws":
            schemas = self.load_aws_schemas()
            return schemas.get(terraform_resource)

        # TODO: Implement Azure and GCP
        return None

    def is_schema_available(self, terraform_resource: str, cloud_provider: str = "aws") -> bool:
        """Check if schema is available for a resource"""
        return self.get_schema(terraform_resource, cloud_provider) is not None


# Singleton instance
_schema_loader: Optional[SchemaLoader] = None


def get_schema_loader() -> SchemaLoader:
    """Get singleton schema loader instance"""
    global _schema_loader
    if _schema_loader is None:
        _schema_loader = SchemaLoader()
    return _schema_loader
