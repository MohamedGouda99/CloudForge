"""
Value Detector - Intelligent detection of Terraform value types

This module determines whether a user-provided value is:
1. A hardcoded literal value (wrap in quotes)
2. A Terraform resource reference (no quotes) - e.g., aws_subnet.main.id
3. A Terraform variable reference (no quotes) - e.g., var.subnet_id
4. A Terraform data source reference (no quotes) - e.g., data.aws_ami.latest.id
5. A Terraform local reference (no quotes) - e.g., local.subnet_id

This is critical for generating correct Terraform code.
"""

import re
from typing import Any, Tuple
from enum import Enum


class ValueType(Enum):
    """Type of Terraform value"""
    LITERAL = "literal"  # Hardcoded value - needs quotes
    RESOURCE_REFERENCE = "resource_reference"  # aws_*, azurerm_*, google_* - no quotes
    VARIABLE_REFERENCE = "variable_reference"  # var.* - no quotes
    DATA_REFERENCE = "data_reference"  # data.* - no quotes
    LOCAL_REFERENCE = "local_reference"  # local.* - no quotes
    EXPRESSION = "expression"  # ${...} interpolation - no quotes
    NONE_VALUE = "none"  # None/null - omit from output


class ValueDetector:
    """
    Detects the type of Terraform value and determines proper formatting.

    Examples:
        "subnet-12345" -> (LITERAL, "subnet-12345")
        "aws_subnet.main.id" -> (RESOURCE_REFERENCE, "aws_subnet.main.id")
        "var.subnet_id" -> (VARIABLE_REFERENCE, "var.subnet_id")
        "${var.region}-subnet" -> (EXPRESSION, "${var.region}-subnet")
    """

    # Terraform resource prefixes by cloud provider
    RESOURCE_PREFIXES = {
        'aws': 'aws_',
        'azure': 'azurerm_',
        'gcp': 'google_',
    }

    # Regex patterns for different value types
    PATTERNS = {
        # Terraform interpolation: ${...}
        'expression': re.compile(r'^\$\{.+\}$'),

        # Variable reference: var.something
        'variable': re.compile(r'^var\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*$'),

        # Data source: data.provider_type.name.attribute
        'data': re.compile(r'^data\.[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*$'),

        # Local value: local.something
        'local': re.compile(r'^local\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*$'),

        # AWS resource: aws_type.name.attribute
        'aws_resource': re.compile(r'^aws_[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*$'),

        # Azure resource: azurerm_type.name.attribute
        'azure_resource': re.compile(r'^azurerm_[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*$'),

        # GCP resource: google_type.name.attribute
        'gcp_resource': re.compile(r'^google_[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*$'),
    }

    @staticmethod
    def detect(value: Any) -> Tuple[ValueType, Any]:
        """
        Detect the type of value and return it with proper type.

        Args:
            value: The value to detect

        Returns:
            Tuple of (ValueType, processed_value)

        Examples:
            >>> ValueDetector.detect("subnet-12345")
            (ValueType.LITERAL, "subnet-12345")

            >>> ValueDetector.detect("aws_subnet.main.id")
            (ValueType.RESOURCE_REFERENCE, "aws_subnet.main.id")

            >>> ValueDetector.detect("var.subnet_id")
            (ValueType.VARIABLE_REFERENCE, "var.subnet_id")

            >>> ValueDetector.detect(None)
            (ValueType.NONE_VALUE, None)
        """
        # Handle None/null
        if value is None:
            return (ValueType.NONE_VALUE, None)

        # Handle non-string values (numbers, booleans, etc.)
        if not isinstance(value, str):
            return (ValueType.LITERAL, value)

        # Strip whitespace
        value_str = value.strip()

        # Empty string
        if not value_str:
            return (ValueType.NONE_VALUE, None)

        # Check for Terraform interpolation ${...}
        if ValueDetector.PATTERNS['expression'].match(value_str):
            return (ValueType.EXPRESSION, value_str)

        # Check for variable reference
        if ValueDetector.PATTERNS['variable'].match(value_str):
            return (ValueType.VARIABLE_REFERENCE, value_str)

        # Check for data source reference
        if ValueDetector.PATTERNS['data'].match(value_str):
            return (ValueType.DATA_REFERENCE, value_str)

        # Check for local reference
        if ValueDetector.PATTERNS['local'].match(value_str):
            return (ValueType.LOCAL_REFERENCE, value_str)

        # Check for resource references (AWS, Azure, GCP)
        if ValueDetector.PATTERNS['aws_resource'].match(value_str):
            return (ValueType.RESOURCE_REFERENCE, value_str)

        if ValueDetector.PATTERNS['azure_resource'].match(value_str):
            return (ValueType.RESOURCE_REFERENCE, value_str)

        if ValueDetector.PATTERNS['gcp_resource'].match(value_str):
            return (ValueType.RESOURCE_REFERENCE, value_str)

        # Default to literal value
        return (ValueType.LITERAL, value_str)

    @staticmethod
    def should_quote(value: Any) -> bool:
        """
        Determine if a value should be quoted in Terraform HCL.

        Args:
            value: The value to check

        Returns:
            True if value should be quoted, False otherwise
        """
        value_type, _ = ValueDetector.detect(value)

        # Only literals get quoted (strings)
        # All references, expressions, etc. are unquoted
        return value_type == ValueType.LITERAL and isinstance(value, str)

    @staticmethod
    def is_reference(value: Any) -> bool:
        """
        Check if value is any kind of Terraform reference.

        Args:
            value: The value to check

        Returns:
            True if value is a reference (resource, variable, data, local)
        """
        value_type, _ = ValueDetector.detect(value)
        return value_type in {
            ValueType.RESOURCE_REFERENCE,
            ValueType.VARIABLE_REFERENCE,
            ValueType.DATA_REFERENCE,
            ValueType.LOCAL_REFERENCE,
            ValueType.EXPRESSION
        }

    @staticmethod
    def format_for_terraform(value: Any) -> str:
        """
        Format value for Terraform HCL output.

        Args:
            value: The value to format

        Returns:
            Formatted string ready for Terraform HCL

        Examples:
            >>> ValueDetector.format_for_terraform("subnet-12345")
            '"subnet-12345"'

            >>> ValueDetector.format_for_terraform("aws_subnet.main.id")
            'aws_subnet.main.id'

            >>> ValueDetector.format_for_terraform(True)
            'true'

            >>> ValueDetector.format_for_terraform(42)
            '42'
        """
        value_type, processed_value = ValueDetector.detect(value)

        # Handle None/null - should be omitted from output
        if value_type == ValueType.NONE_VALUE:
            return ""

        # Handle booleans
        if isinstance(processed_value, bool):
            return "true" if processed_value else "false"

        # Handle numbers
        if isinstance(processed_value, (int, float)):
            return str(processed_value)

        # Handle strings
        if isinstance(processed_value, str):
            if value_type == ValueType.LITERAL:
                # Escape quotes in string literals
                escaped = processed_value.replace('"', '\\"')
                return f'"{escaped}"'
            else:
                # References, variables, expressions - no quotes
                return processed_value

        # Fallback - quote it
        return f'"{str(processed_value)}"'
