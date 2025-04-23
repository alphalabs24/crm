export const getEnv = (key: string) => {
  const env = window._env_?.[key] ?? process.env[key];
  if (!env) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return env;
};
