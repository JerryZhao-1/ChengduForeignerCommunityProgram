export type MobileLocale = "zh" | "en";

export interface LocalizedValues {
  zh?: string | null;
  en?: string | null;
}

export interface LocalizedValueOptions {
  unavailable?: Partial<Record<MobileLocale, string>>;
  optional?: boolean;
}

export interface LocalizedValueResult {
  value: string;
  requestedLocale: MobileLocale;
  resolvedLocale: MobileLocale | null;
  usedFallback: boolean;
  unavailable: boolean;
}

const DEFAULT_UNAVAILABLE: Record<MobileLocale, string> = {
  zh: "暂无信息",
  en: "Unavailable"
};

const normalized = (value: string | null | undefined) => value?.trim() ?? "";

export const resolveLocalized = (
  locale: MobileLocale,
  values: LocalizedValues,
  options: LocalizedValueOptions = {}
): LocalizedValueResult => {
  const counterpart: MobileLocale = locale === "zh" ? "en" : "zh";
  const preferredValue = normalized(values[locale]);

  if (preferredValue) {
    return {
      value: preferredValue,
      requestedLocale: locale,
      resolvedLocale: locale,
      usedFallback: false,
      unavailable: false
    };
  }

  const fallbackValue = normalized(values[counterpart]);
  if (fallbackValue) {
    return {
      value: fallbackValue,
      requestedLocale: locale,
      resolvedLocale: counterpart,
      usedFallback: true,
      unavailable: false
    };
  }

  return {
    value: options.optional
      ? ""
      : normalized(options.unavailable?.[locale]) || DEFAULT_UNAVAILABLE[locale],
    requestedLocale: locale,
    resolvedLocale: null,
    usedFallback: false,
    unavailable: true
  };
};

export function pickLocalized(
  locale: MobileLocale,
  values: LocalizedValues,
  options?: LocalizedValueOptions
): string;
export function pickLocalized(
  locale: MobileLocale,
  zhText: string | null | undefined,
  enText: string | null | undefined,
  options?: LocalizedValueOptions
): string;
export function pickLocalized(
  locale: MobileLocale,
  valuesOrZh: LocalizedValues | string | null | undefined,
  enOrOptions?: string | null | LocalizedValueOptions,
  maybeOptions?: LocalizedValueOptions
) {
  if (typeof valuesOrZh === "object" && valuesOrZh !== null) {
    return resolveLocalized(
      locale,
      valuesOrZh,
      (enOrOptions as LocalizedValueOptions | undefined) ?? {}
    ).value;
  }

  return resolveLocalized(
    locale,
    {
      zh: valuesOrZh,
      en: typeof enOrOptions === "string" ? enOrOptions : null
    },
    maybeOptions
  ).value;
}

export const interpolate = (
  template: string,
  values: Record<string, string | number>
) =>
  template.replace(/\{([a-zA-Z][\w]*)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key)
      ? String(values[key])
      : match
  );

export const localeTag = (locale: MobileLocale) =>
  locale === "zh" ? "zh-CN" : "en";

export const formatLocalizedDate = (
  locale: MobileLocale,
  input: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }
) => new Intl.DateTimeFormat(localeTag(locale), options).format(new Date(input));

export const formatLocalizedNumber = (
  locale: MobileLocale,
  value: number,
  options?: Intl.NumberFormatOptions
) => new Intl.NumberFormat(localeTag(locale), options).format(value);
