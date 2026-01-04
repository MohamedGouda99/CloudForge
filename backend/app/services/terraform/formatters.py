"""
HCL Formatting Utilities.

This module provides utilities for formatting Python values into
valid HCL (HashiCorp Configuration Language) strings.

Single Responsibility: Only handles value formatting.
"""

from typing import Any, List, Dict
import re
from app.services.terraform.value_detector import ValueDetector


class HCLFormatter:
    """
    Formats Python values into HCL-compatible strings.

    Handles:
    - Primitives (strings, numbers, booleans)
    - Collections (lists, dicts)
    - Terraform references (var.*, data.*, resource.*)
    - Nested structures
    """

    @staticmethod
    def format_value(value: Any, indent_level: int = 2) -> str:
        """
        Format a Python value into HCL string.

        Args:
            value: The value to format
            indent_level: Current indentation level

        Returns:
            HCL-formatted string
        """
        indent = " " * indent_level

        # Handle None
        if value is None:
            return "null"

        # Handle booleans (must come before int check since bool is subclass of int)
        if isinstance(value, bool):
            return "true" if value else "false"

        # Handle numbers
        if isinstance(value, (int, float)):
            return str(value)

        # Handle strings - use ValueDetector for intelligent formatting
        if isinstance(value, str):
            return ValueDetector.format_for_terraform(value)

        # Handle lists
        if isinstance(value, list):
            return HCLFormatter._format_list(value, indent_level)

        # Handle dicts
        if isinstance(value, dict):
            return HCLFormatter._format_dict(value, indent_level)

        # Fallback: convert to string
        return f'"{str(value)}"'

    @staticmethod
    def _format_list(values: List[Any], indent_level: int = 2) -> str:
        """Format a list for HCL."""
        if not values:
            return "[]"

        indent = " " * indent_level

        # Simple list (no nested structures)
        if all(not isinstance(item, (dict, list)) for item in values):
            inner = ", ".join(HCLFormatter.format_value(item, 0) for item in values)
            return f"[{inner}]"

        # Complex list with nested structures
        list_lines = ["["]
        for item in values:
            formatted_lines = HCLFormatter.format_value(item, indent_level + 2).split("\n")
            for line in formatted_lines:
                list_lines.append(f"{indent}  {line}")
            list_lines[-1] = f"{list_lines[-1]},"
        if list_lines[-1].endswith(","):
            list_lines[-1] = list_lines[-1][:-1]
        list_lines.append(f"{indent}]")
        return "\n".join(list_lines)

    @staticmethod
    def _format_dict(values: Dict[str, Any], indent_level: int = 2) -> str:
        """Format a dict for HCL."""
        if not values:
            return "{}"

        indent = " " * indent_level

        dict_lines = ["{"]
        for key, val in values.items():
            formatted = HCLFormatter.format_value(val, indent_level + 2)
            formatted_lines = formatted.split("\n")
            dict_lines.append(f"{indent}  {key} = {formatted_lines[0]}")
            for line in formatted_lines[1:]:
                dict_lines.append(f"{indent}  {line}")
        dict_lines.append(f"{indent}}}")
        return "\n".join(dict_lines)

    @staticmethod
    def format_tags(tags: Dict[str, str], name: str, indent: str = "  ") -> str:
        """
        Format a tags block.

        Args:
            tags: Dictionary of tags
            name: Resource name to include as Name tag
            indent: Indentation string

        Returns:
            HCL tags block
        """
        lines = [f"{indent}tags = {{"]
        lines.append(f'{indent}  Name = "{name}"')

        for key, value in tags.items():
            if key != "Name":
                escaped_value = str(value).replace('"', '\\"')
                lines.append(f'{indent}  {key} = "{escaped_value}"')

        lines.append(f"{indent}}}")
        return "\n".join(lines)

    @staticmethod
    def format_block(
        block_name: str,
        block_data: Dict[str, Any],
        indent: str = "  "
    ) -> List[str]:
        """
        Format a nested HCL block.

        Args:
            block_name: Name of the block (e.g., 'vpc_config')
            block_data: Block contents
            indent: Indentation string

        Returns:
            List of HCL lines for the block
        """
        lines = [f"{indent}{block_name} {{"]

        for key, value in block_data.items():
            if value is None or value == '' or value is False:
                continue

            formatted = HCLFormatter.format_value(value)
            lines.append(f"{indent}  {key} = {formatted}")

        lines.append(f"{indent}}}")
        return lines

    @staticmethod
    def format_security_rule(
        rule_type: str,
        rule: Dict[str, Any],
        indent: str = "  "
    ) -> List[str]:
        """
        Format an ingress/egress security rule block.

        Args:
            rule_type: 'ingress' or 'egress'
            rule: Rule configuration
            indent: Indentation string

        Returns:
            List of HCL lines for the rule
        """
        lines = [f"{indent}{rule_type} {{"]

        if 'from_port' in rule:
            lines.append(f"{indent}  from_port = {rule['from_port']}")
        if 'to_port' in rule:
            lines.append(f"{indent}  to_port = {rule['to_port']}")
        if 'protocol' in rule and rule['protocol']:
            lines.append(f'{indent}  protocol = "{rule["protocol"]}"')

        if 'cidr_blocks' in rule and rule['cidr_blocks']:
            cidr = rule['cidr_blocks']
            if isinstance(cidr, list):
                cidr_str = "[" + ", ".join(f'"{c}"' for c in cidr) + "]"
            else:
                cidr_str = f'["{cidr}"]'
            lines.append(f"{indent}  cidr_blocks = {cidr_str}")

        if 'description' in rule and rule['description']:
            lines.append(f'{indent}  description = "{rule["description"]}"')

        lines.append(f"{indent}}}")
        return lines


class VariableFormatter:
    """Formats Terraform variable definitions and tfvars."""

    @staticmethod
    def format_variable_definition(
        name: str,
        var_type: str,
        description: str,
        default: Any = None
    ) -> str:
        """
        Format a variable definition block.

        Args:
            name: Variable name
            var_type: Terraform type (string, number, bool, list(string), etc.)
            description: Variable description
            default: Default value (optional)

        Returns:
            HCL variable block
        """
        lines = [f'variable "{name}" {{']
        lines.append(f'  description = "{description}"')
        lines.append(f'  type        = {var_type}')

        if default is not None:
            formatted_default = VariableFormatter._format_default(default, var_type)
            lines.append(f'  default     = {formatted_default}')

        lines.append('}')
        return '\n'.join(lines)

    @staticmethod
    def _format_default(value: Any, var_type: str) -> str:
        """Format a default value based on type."""
        if var_type == 'string':
            escaped = str(value).replace('"', '\\"')
            return f'"{escaped}"'
        elif var_type == 'number':
            return str(value)
        elif var_type == 'bool':
            return "true" if value else "false"
        elif var_type == 'list(string)':
            return "[" + ", ".join(f'"{v}"' for v in value) + "]"
        else:
            return str(value)

    @staticmethod
    def format_tfvars_entry(name: str, value: Any, var_type: str) -> str:
        """
        Format a single tfvars entry.

        Args:
            name: Variable name
            value: Variable value
            var_type: Variable type

        Returns:
            tfvars line
        """
        formatted = VariableFormatter._format_default(value, var_type)
        return f'{name} = {formatted}'


class OutputFormatter:
    """Formats Terraform output definitions."""

    @staticmethod
    def format_output(
        name: str,
        value: str,
        description: str,
        sensitive: bool = False
    ) -> str:
        """
        Format an output definition.

        Args:
            name: Output name
            value: Output value expression
            description: Output description
            sensitive: Whether the output is sensitive

        Returns:
            HCL output block
        """
        lines = [f'output "{name}" {{']
        lines.append(f'  description = "{description}"')
        lines.append(f'  value       = {value}')

        if sensitive:
            lines.append('  sensitive   = true')

        lines.append('}')
        return '\n'.join(lines)
