/**
 * Unit tests for resource definitions and utilities.
 *
 * Tests cover resource type checking, container hierarchy,
 * and resource definition lookups.
 */
import { describe, it, expect } from 'vitest';
import {
  isContainerType,
  canPlaceResourceIn,
  getContainerLevel,
  getResourceDefinition,
  CONTAINER_TYPES,
  CONTAINER_LEVELS,
} from '../../src/lib/resources/resourceDefinitions';

describe('Resource Definitions', () => {
  describe('CONTAINER_TYPES', () => {
    it('should include region as container type', () => {
      expect(CONTAINER_TYPES).toContain('region');
    });

    it('should include vpc as container type', () => {
      expect(CONTAINER_TYPES).toContain('vpc');
    });

    it('should include subnet as container type', () => {
      expect(CONTAINER_TYPES).toContain('subnet');
    });

    it('should include availability_zone as container type', () => {
      expect(CONTAINER_TYPES).toContain('availability_zone');
    });

    it('should include resource_group as container type', () => {
      expect(CONTAINER_TYPES).toContain('resource_group');
    });
  });

  describe('CONTAINER_LEVELS', () => {
    it('should have region at level 0', () => {
      expect(CONTAINER_LEVELS.region).toBe(0);
    });

    it('should have availability_zone at level 1', () => {
      expect(CONTAINER_LEVELS.availability_zone).toBe(1);
    });

    it('should have vpc at level 2', () => {
      expect(CONTAINER_LEVELS.vpc).toBe(2);
    });

    it('should have subnet at level 3', () => {
      expect(CONTAINER_LEVELS.subnet).toBe(3);
    });

    it('should have resource_group at level 1', () => {
      expect(CONTAINER_LEVELS.resource_group).toBe(1);
    });
  });

  describe('isContainerType', () => {
    it('should return true for vpc type', () => {
      expect(isContainerType('aws_vpc')).toBe(true);
    });

    it('should return true for subnet type', () => {
      expect(isContainerType('aws_subnet')).toBe(true);
    });

    it('should return true for region type', () => {
      expect(isContainerType('region')).toBe(true);
    });

    it('should return true for resource_group type', () => {
      expect(isContainerType('azurerm_resource_group')).toBe(true);
    });

    it('should return false for non-container types', () => {
      expect(isContainerType('aws_instance')).toBe(false);
    });

    it('should return false for ec2 instance', () => {
      expect(isContainerType('aws_ec2_instance')).toBe(false);
    });

    it('should return false for s3 bucket', () => {
      expect(isContainerType('aws_s3_bucket')).toBe(false);
    });

    it('should handle case-insensitive matching', () => {
      expect(isContainerType('AWS_VPC')).toBe(true);
      expect(isContainerType('Aws_Subnet')).toBe(true);
    });
  });

  describe('canPlaceResourceIn', () => {
    describe('VPC placement rules', () => {
      it('should allow VPC in region', () => {
        expect(canPlaceResourceIn('aws_vpc', 'region')).toBe(true);
      });

      it('should not allow VPC in subnet', () => {
        expect(canPlaceResourceIn('aws_vpc', 'aws_subnet')).toBe(false);
      });

      it('should not allow VPC in another VPC', () => {
        expect(canPlaceResourceIn('aws_vpc', 'aws_vpc')).toBe(false);
      });
    });

    describe('Subnet placement rules', () => {
      it('should allow subnet in VPC', () => {
        expect(canPlaceResourceIn('aws_subnet', 'aws_vpc')).toBe(true);
      });

      it('should not allow subnet in region', () => {
        expect(canPlaceResourceIn('aws_subnet', 'region')).toBe(false);
      });

      it('should not allow subnet in another subnet', () => {
        expect(canPlaceResourceIn('aws_subnet', 'aws_subnet')).toBe(false);
      });
    });

    describe('Resource placement rules', () => {
      it('should allow instance in subnet', () => {
        expect(canPlaceResourceIn('aws_instance', 'aws_subnet')).toBe(true);
      });

      it('should allow instance in VPC', () => {
        expect(canPlaceResourceIn('aws_instance', 'aws_vpc')).toBe(true);
      });

      it('should allow lambda in subnet', () => {
        expect(canPlaceResourceIn('aws_lambda_function', 'aws_subnet')).toBe(true);
      });
    });
  });

  describe('getContainerLevel', () => {
    it('should return 0 for region', () => {
      expect(getContainerLevel('region')).toBe(0);
    });

    it('should return 1 for availability_zone', () => {
      expect(getContainerLevel('availability_zone')).toBe(1);
    });

    it('should return 2 for vpc types', () => {
      expect(getContainerLevel('aws_vpc')).toBe(2);
    });

    it('should return 3 for subnet types', () => {
      expect(getContainerLevel('aws_subnet')).toBe(3);
    });

    it('should return 1 for resource_group types', () => {
      expect(getContainerLevel('azurerm_resource_group')).toBe(1);
    });

    it('should return 999 for non-container types', () => {
      expect(getContainerLevel('aws_instance')).toBe(999);
    });

    it('should return 999 for unknown types', () => {
      expect(getContainerLevel('unknown_type')).toBe(999);
    });
  });

  describe('getResourceDefinition', () => {
    it('should return definition for aws_instance', () => {
      const definition = getResourceDefinition('aws_instance');
      expect(definition).toBeDefined();
      expect(definition?.type).toBe('aws_instance');
      expect(definition?.provider).toBe('aws');
    });

    it('should return definition for aws_s3_bucket', () => {
      const definition = getResourceDefinition('aws_s3_bucket');
      expect(definition).toBeDefined();
      expect(definition?.type).toBe('aws_s3_bucket');
      expect(definition?.category).toBe('storage');
    });

    it('should return definition for aws_lambda_function', () => {
      const definition = getResourceDefinition('aws_lambda_function');
      expect(definition).toBeDefined();
      expect(definition?.category).toBe('compute');
    });

    it('should include isContainer property', () => {
      const vpcDef = getResourceDefinition('aws_vpc');
      // Since aws_vpc contains 'vpc', it should be marked as container
      if (vpcDef) {
        expect(typeof vpcDef.isContainer).toBe('boolean');
      }
    });

    it('should return undefined for unknown resource type', () => {
      const definition = getResourceDefinition('unknown_resource_type');
      expect(definition).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const definition = getResourceDefinition('');
      expect(definition).toBeUndefined();
    });

    it('should include icon path in definition', () => {
      const definition = getResourceDefinition('aws_instance');
      expect(definition?.icon).toBeDefined();
      expect(definition?.icon).toContain('/cloud_icons/');
    });

    it('should include label in definition', () => {
      const definition = getResourceDefinition('aws_instance');
      expect(definition?.label).toBe('EC2');
    });

    it('should include description in definition', () => {
      const definition = getResourceDefinition('aws_instance');
      expect(definition?.description).toBeDefined();
    });
  });
});
