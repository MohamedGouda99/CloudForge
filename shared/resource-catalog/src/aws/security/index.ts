/**
 * AWS Security Resources Index
 */

// IAM resources
export { awsIamRole } from './iam-role';
export { awsIamUser } from './iam-user';
export { awsIamGroup } from './iam-group';
export { awsIamPolicy } from './iam-policy';
export { awsIamRolePolicyAttachment } from './iam-role-policy-attachment';
export { awsIamInstanceProfile } from './iam-instance-profile';

// Identity resources
export { awsCognitoUserPool } from './cognito-user-pool';

// Encryption & secrets
export { awsKmsKey } from './kms-key';
export { awsSecretsmanagerSecret } from './secrets-manager';
export { awsAcmCertificate } from './acm-certificate';

// Security services
export { awsInspector2Enabler } from './inspector';
export { awsShieldProtection } from './shield';
export { awsMacie2Account } from './macie';
export { awsGuarddutyDetector } from './guardduty';
export { awsWafv2WebAcl } from './waf';

// Aggregate all security resources
import { awsIamRole } from './iam-role';
import { awsIamUser } from './iam-user';
import { awsIamGroup } from './iam-group';
import { awsIamPolicy } from './iam-policy';
import { awsIamRolePolicyAttachment } from './iam-role-policy-attachment';
import { awsIamInstanceProfile } from './iam-instance-profile';
import { awsCognitoUserPool } from './cognito-user-pool';
import { awsKmsKey } from './kms-key';
import { awsSecretsmanagerSecret } from './secrets-manager';
import { awsAcmCertificate } from './acm-certificate';
import { awsInspector2Enabler } from './inspector';
import { awsShieldProtection } from './shield';
import { awsMacie2Account } from './macie';
import { awsGuarddutyDetector } from './guardduty';
import { awsWafv2WebAcl } from './waf';

export const securityResources = [
  awsIamRole,
  awsIamUser,
  awsIamGroup,
  awsIamPolicy,
  awsIamRolePolicyAttachment,
  awsIamInstanceProfile,
  awsCognitoUserPool,
  awsKmsKey,
  awsSecretsmanagerSecret,
  awsAcmCertificate,
  awsInspector2Enabler,
  awsShieldProtection,
  awsMacie2Account,
  awsGuarddutyDetector,
  awsWafv2WebAcl,
];
