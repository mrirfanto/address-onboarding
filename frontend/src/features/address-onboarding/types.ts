export type CountryCode = 'USA' | 'AUS' | 'IDN';

export type FieldType = 'text' | 'select';

export type FieldRule = {
  length?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type MetadataField = {
  key: string;
  title: string;
  description: string | null;
  type: FieldType;
  required: boolean;
  order: number;
  prefix: string | null;
  suffix: string | null;
  rules?: FieldRule;
  options?: SelectOption[];
};

export type CountryOption = {
  code: CountryCode;
  name: string;
};

export type CountryMetadataResponse = {
  countryCode: CountryCode;
  fields: MetadataField[];
};

export type AddressCreatePayload = {
  countryCode: CountryCode;
  placeId?: string;
  values: Record<string, string>;
};

export type SavedAddress = {
  id: string;
  countryCode: CountryCode;
  placeId?: string;
  values: Record<string, string>;
  display: string;
  createdAt: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
};

export type ApiErrorState = {
  title: string;
  description: string;
};
