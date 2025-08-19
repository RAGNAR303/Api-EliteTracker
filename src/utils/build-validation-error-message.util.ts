import { ZodIssue } from 'zod-validation-error';

//
export function buildValidationErrorMessage(issues: ZodIssue[]): string[] {
  const errors = issues.map(
    (item) => `${item.path.join('.')}: ${item.message}`,
  );

  return errors;
}
