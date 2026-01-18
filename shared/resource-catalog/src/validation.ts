/**
 * Schema Validation Utilities
 *
 * Provides runtime validation for resource definitions and configuration values.
 */

import type {
  ServiceDefinition,
  InputAttribute,
  ValidationRule,
  AttributeType,
} from './types';

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// Attribute Value Validation
// ============================================================================

/**
 * Validates a value against the validation rules defined for an attribute
 */
export function validateAttributeValue(
  attribute: InputAttribute,
  value: unknown
): ValidationResult {
  const errors: ValidationError[] = [];

  // Skip validation for undefined/null if not required (handled elsewhere)
  if (value === undefined || value === null) {
    return { valid: true, errors: [] };
  }

  const { validation, type, name } = attribute;

  // Type validation
  const typeError = validateType(value, type, name);
  if (typeError) {
    errors.push(typeError);
    return { valid: false, errors };
  }

  // Validation rules
  if (validation) {
    const ruleErrors = validateRules(value, validation, name);
    errors.push(...ruleErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that a value matches the expected type
 */
function validateType(
  value: unknown,
  expectedType: AttributeType,
  fieldName: string
): ValidationError | null {
  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') {
        return { field: fieldName, message: 'Expected string', value };
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return { field: fieldName, message: 'Expected number', value };
      }
      break;

    case 'bool':
      if (typeof value !== 'boolean') {
        return { field: fieldName, message: 'Expected boolean', value };
      }
      break;

    case 'list(string)':
      if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
        return { field: fieldName, message: 'Expected array of strings', value };
      }
      break;

    case 'list(number)':
      if (
        !Array.isArray(value) ||
        !value.every((v) => typeof v === 'number' && !isNaN(v))
      ) {
        return { field: fieldName, message: 'Expected array of numbers', value };
      }
      break;

    case 'map(string)':
      if (
        typeof value !== 'object' ||
        value === null ||
        Array.isArray(value) ||
        !Object.values(value).every((v) => typeof v === 'string')
      ) {
        return {
          field: fieldName,
          message: 'Expected object with string values',
          value,
        };
      }
      break;

    case 'set(string)':
      if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
        return { field: fieldName, message: 'Expected set of strings', value };
      }
      // Check for duplicates in set
      if (new Set(value).size !== value.length) {
        return { field: fieldName, message: 'Set contains duplicate values', value };
      }
      break;
  }

  return null;
}

/**
 * Validates a value against validation rules
 */
function validateRules(
  value: unknown,
  rules: ValidationRule,
  fieldName: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Pattern validation (for strings)
  if (rules.pattern && typeof value === 'string') {
    const regex = new RegExp(rules.pattern);
    if (!regex.test(value)) {
      errors.push({
        field: fieldName,
        message: `Value does not match pattern: ${rules.pattern}`,
        value,
      });
    }
  }

  // Min/Max validation (for numbers)
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push({
        field: fieldName,
        message: `Value must be at least ${rules.min}`,
        value,
      });
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push({
        field: fieldName,
        message: `Value must be at most ${rules.max}`,
        value,
      });
    }
  }

  // String length validation
  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      errors.push({
        field: fieldName,
        message: `Value must be at least ${rules.minLength} characters`,
        value,
      });
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push({
        field: fieldName,
        message: `Value must be at most ${rules.maxLength} characters`,
        value,
      });
    }
  }

  return errors;
}

// ============================================================================
// Resource Configuration Validation
// ============================================================================

/**
 * Validates a resource configuration against its schema
 */
export function validateResourceConfig(
  definition: ServiceDefinition,
  config: Record<string, unknown>
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check required fields
  for (const attr of definition.inputs.required) {
    if (!(attr.name in config) || config[attr.name] === undefined) {
      errors.push({
        field: attr.name,
        message: `Required field "${attr.name}" is missing`,
      });
    } else {
      const result = validateAttributeValue(attr, config[attr.name]);
      errors.push(...result.errors);
    }
  }

  // Validate optional fields that are present
  for (const attr of definition.inputs.optional) {
    if (attr.name in config && config[attr.name] !== undefined) {
      const result = validateAttributeValue(attr, config[attr.name]);
      errors.push(...result.errors);
    }
  }

  // Validate blocks
  if (definition.inputs.blocks) {
    for (const block of definition.inputs.blocks) {
      const blockValue = config[block.name];

      if (block.required && (blockValue === undefined || blockValue === null)) {
        errors.push({
          field: block.name,
          message: `Required block "${block.name}" is missing`,
        });
        continue;
      }

      if (blockValue !== undefined && blockValue !== null) {
        const blockArray = block.multiple
          ? (blockValue as Record<string, unknown>[])
          : [blockValue as Record<string, unknown>];

        if (!block.multiple && Array.isArray(blockValue) && blockValue.length > 1) {
          errors.push({
            field: block.name,
            message: `Block "${block.name}" does not allow multiple instances`,
          });
        }

        for (const blockInstance of blockArray) {
          if (typeof blockInstance !== 'object' || blockInstance === null) {
            errors.push({
              field: block.name,
              message: `Block "${block.name}" must be an object`,
              value: blockInstance,
            });
            continue;
          }

          for (const attr of block.attributes) {
            if (attr.name in blockInstance) {
              const result = validateAttributeValue(
                attr,
                blockInstance[attr.name]
              );
              errors.push(
                ...result.errors.map((e) => ({
                  ...e,
                  field: `${block.name}.${e.field}`,
                }))
              );
            }
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Service Definition Validation
// ============================================================================

/**
 * Validates that a ServiceDefinition is well-formed
 */
export function validateServiceDefinition(
  definition: ServiceDefinition
): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  if (!definition.id || typeof definition.id !== 'string') {
    errors.push({ field: 'id', message: 'Service definition must have a valid id' });
  }

  if (
    !definition.terraform_resource ||
    !definition.terraform_resource.startsWith('aws_')
  ) {
    errors.push({
      field: 'terraform_resource',
      message: 'terraform_resource must start with "aws_"',
    });
  }

  if (!definition.name || typeof definition.name !== 'string') {
    errors.push({ field: 'name', message: 'Service definition must have a name' });
  }

  if (!definition.icon || !definition.icon.startsWith('/cloud_icons/')) {
    errors.push({
      field: 'icon',
      message: 'Icon path must start with "/cloud_icons/"',
    });
  }

  if (!['icon', 'container'].includes(definition.classification)) {
    errors.push({
      field: 'classification',
      message: 'Classification must be "icon" or "container"',
    });
  }

  // Inputs validation
  if (!definition.inputs) {
    errors.push({ field: 'inputs', message: 'Service definition must have inputs' });
  } else {
    if (!Array.isArray(definition.inputs.required)) {
      errors.push({
        field: 'inputs.required',
        message: 'inputs.required must be an array',
      });
    }
    if (!Array.isArray(definition.inputs.optional)) {
      errors.push({
        field: 'inputs.optional',
        message: 'inputs.optional must be an array',
      });
    }
  }

  // Outputs validation
  if (!Array.isArray(definition.outputs)) {
    errors.push({ field: 'outputs', message: 'outputs must be an array' });
  }

  // Terraform metadata validation
  if (!definition.terraform) {
    errors.push({
      field: 'terraform',
      message: 'Service definition must have terraform metadata',
    });
  } else {
    if (definition.terraform.resourceType !== definition.terraform_resource) {
      errors.push({
        field: 'terraform.resourceType',
        message: 'terraform.resourceType must match terraform_resource',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
