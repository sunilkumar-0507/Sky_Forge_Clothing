export const env = {
  /** Use the in-browser mock services. Defaults to true until the ASP.NET Core API exists. */
  useMock: (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false',
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, ''),
};

export const SHOP = {
  freeShippingThreshold: 2999,
  standardShipping: 149,
  expressShipping: 299,
} as const;
