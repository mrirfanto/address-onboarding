import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { buildFieldSchema } from '@features/address-onboarding/lib/buildFieldSchema';
import type { MetadataField } from '@features/address-onboarding/types';

type UseAddressFormOptions = {
  fields: MetadataField[];
  enabled: boolean;
};

export function useAddressForm({ fields, enabled }: UseAddressFormOptions) {
  const schema = useMemo(() => buildFieldSchema(fields), [fields]);
  const resolver = zodResolver(schema) as Resolver<Record<string, string>>;

  const form = useForm<Record<string, string>>({
    resolver,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {},
  });

  useEffect(() => {
    const nextValues: Record<string, string> = {};
    for (const field of fields) {
      nextValues[field.key] = '';
    }

    form.reset(nextValues);
    void form.trigger();
  }, [fields, form]);

  const onSubmit = form.handleSubmit(() => {
    // API submission is implemented in a later slice.
  });

  const canSubmit = enabled && form.formState.isValid && !form.formState.isSubmitting;

  return {
    ...form,
    canSubmit,
    onSubmit,
  };
}

export type AddressFormState = ReturnType<typeof useAddressForm>;
