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

export type CountryMetadata = {
  countryCode: CountryCode;
  fields: MetadataField[];
};

export type AddressRecord = {
  id: string;
  countryCode: CountryCode;
  placeId?: string;
  values: Record<string, string>;
  display: string;
  createdAt: string;
};

export type ValidationDetail = {
  field: string;
  message: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: ValidationDetail[];
};
