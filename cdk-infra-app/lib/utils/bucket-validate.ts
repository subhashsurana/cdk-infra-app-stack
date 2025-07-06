// lib/utils/validation.ts

/**
 * Validates an S3 bucket name against AWS naming rules.
 * @param name The S3 bucket name to validate.
 * @returns true if the name is valid, false otherwise.
 */
export function isValidBucketName(name: string): boolean {
  // Rule: Must be between 3 and 63 characters long
  if (name.length < 3 || name.length > 63) {
    console.error("Bucket name must be between 3 and 63 characters.");
    return false;
  }
  // Rule: Must not be formatted as an IP address
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(name)) {
    console.error("Bucket name cannot be formatted as an IP address.");
    return false;
  }
  // Rule: Can only contain lowercase letters, numbers, dots, and hyphens
  // and must start and end with a letter or number.
  if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(name)) {
    console.error("Bucket name can only contain lowercase letters, numbers, dots (.), and hyphens (-), and must begin and end with a letter or number.");
    return false;
  }
  // Rule: Must not contain two adjacent periods
  if (name.includes('..')) {
    console.error("Bucket name cannot contain two adjacent periods.");
    return false;
  }
  // Rule: Must not start with 'xn--'
  if (name.startsWith('xn--')) {
    console.error("Bucket name cannot start with 'xn--'.");
    return false;
  }
    // Rule: Must not end with '-s3alias' or '--ol-s3'
    if (name.endsWith('-s3alias') || name.endsWith('--ol-s3')) {
        console.error("Bucket name cannot end with '-s3alias' or '--ol-s3'.");
        return false;
    }

  return true;
}