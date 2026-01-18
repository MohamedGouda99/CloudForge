/**
 * AWS ACM Certificate Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsAcmCertificate: ServiceDefinition = {
  id: 'acm_certificate',
  terraform_resource: 'aws_acm_certificate',
  name: 'ACM Certificate',
  description: 'AWS Certificate Manager SSL/TLS certificate',
  icon: SECURITY_ICONS.KMS, // Using KMS icon as a proxy for certificates
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'domain_name',
        type: 'string',
        description: 'Domain name for the certificate',
        example: 'example.com',
        group: 'basic',
      },
      {
        name: 'subject_alternative_names',
        type: 'set(string)',
        description: 'Subject Alternative Names (SANs)',
        example: '["*.example.com", "www.example.com"]',
        group: 'basic',
      },
      {
        name: 'validation_method',
        type: 'string',
        description: 'Method of domain validation',
        default: 'DNS',
        options: ['DNS', 'EMAIL', 'NONE'],
        group: 'basic',
      },
      {
        name: 'certificate_body',
        type: 'string',
        description: 'Certificate body (for imported certificates)',
        sensitive: true,
        group: 'advanced',
      },
      {
        name: 'private_key',
        type: 'string',
        description: 'Private key (for imported certificates)',
        sensitive: true,
        group: 'advanced',
      },
      {
        name: 'certificate_chain',
        type: 'string',
        description: 'Certificate chain (for imported certificates)',
        group: 'advanced',
      },
      {
        name: 'certificate_authority_arn',
        type: 'string',
        description: 'ARN of a private CA for issuing certificates',
        group: 'advanced',
      },
      {
        name: 'early_renewal_duration',
        type: 'string',
        description: 'Duration before expiration to renew (e.g., 30d)',
        example: '30d',
        group: 'advanced',
      },
      {
        name: 'key_algorithm',
        type: 'string',
        description: 'Cryptographic algorithm for the key pair',
        default: 'RSA_2048',
        options: ['RSA_2048', 'RSA_3072', 'RSA_4096', 'EC_prime256v1', 'EC_secp384r1', 'EC_secp521r1'],
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the certificate',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'options',
        description: 'Certificate options',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'certificate_transparency_logging_preference',
            type: 'string',
            description: 'CT logging preference',
            default: 'ENABLED',
            options: ['ENABLED', 'DISABLED'],
          },
        ],
      },
      {
        name: 'validation_option',
        description: 'Validation options for each domain',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'domain_name',
            type: 'string',
            description: 'Domain to validate',
          },
          {
            name: 'validation_domain',
            type: 'string',
            description: 'Domain to use for validation',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Certificate ARN' },
    { name: 'arn', type: 'string', description: 'ARN of the certificate' },
    { name: 'domain_name', type: 'string', description: 'Domain name of the certificate' },
    { name: 'domain_validation_options', type: 'set', description: 'Domain validation options' },
    { name: 'not_after', type: 'string', description: 'Expiration date' },
    { name: 'not_before', type: 'string', description: 'Start date' },
    { name: 'pending_renewal', type: 'bool', description: 'Whether renewal is pending' },
    { name: 'renewal_eligibility', type: 'string', description: 'Renewal eligibility status' },
    { name: 'renewal_summary', type: 'list', description: 'Renewal summary information' },
    { name: 'status', type: 'string', description: 'Certificate status' },
    { name: 'type', type: 'string', description: 'Certificate type' },
    { name: 'validation_emails', type: 'list(string)', description: 'Validation email addresses' },
  ],

  terraform: {
    resourceType: 'aws_acm_certificate',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      domain_name: 'domain_name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
