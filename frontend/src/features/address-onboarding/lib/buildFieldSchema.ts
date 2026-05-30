import { z } from 'zod';
import type { MetadataField } from '@features/address-onboarding/types';

export function buildFieldSchema(fields: MetadataField[]) {
  const shape: Record<string, z.ZodType<string>> = {};

  for (const field of fields) {
    let schema = z.string();

    if (field.required) {
      schema = schema.trim().min(1, `${field.title} is required`);
    } else {
      schema = schema.trim();
    }

    if (field.type === 'select' && field.options && field.options.length > 0) {
      const allowedValues = new Set(field.options.map((option) => option.value));
      schema = schema.refine(
        (value) => value.length === 0 || allowedValues.has(value),
        `${field.title} has an invalid option`
      );
    }

    if (field.rules?.length !== undefined) {
      schema = schema.refine(
        (value) => value.length === 0 || value.length === field.rules?.length,
        `${field.title} must be exactly ${field.rules.length} characters`
      );
    }

    if (field.rules?.minLength !== undefined) {
      schema = schema.refine(
        (value) => value.length === 0 || value.length >= field.rules!.minLength!,
        `${field.title} must be at least ${field.rules.minLength} characters`
      );
    }

    if (field.rules?.maxLength !== undefined) {
      schema = schema.refine(
        (value) => value.length === 0 || value.length <= field.rules!.maxLength!,
        `${field.title} must be at most ${field.rules.maxLength} characters`
      );
    }

    if (field.rules?.pattern) {
      const pattern = new RegExp(field.rules.pattern);
      schema = schema.refine(
        (value) => value.length === 0 || pattern.test(value),
        `${field.title} format is invalid`
      );
    }

    shape[field.key] = schema;
  }

  return z.object(shape);
}
