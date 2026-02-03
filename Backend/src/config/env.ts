import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  BCRYPT_ROUNDS: number;
  LOG_LEVEL: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const config: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '5000')),
  API_VERSION: getEnvVariable('API_VERSION', 'v1'),
  DB_HOST: getEnvVariable('DB_HOST', 'localhost'),
  DB_PORT: parseInt(getEnvVariable('DB_PORT', '5432')),
  DB_NAME: getEnvVariable('DB_NAME', 'wdupms_db'),
  DB_USER: getEnvVariable('DB_USER', 'postgres'),
  DB_PASSWORD: getEnvVariable('DB_PASSWORD'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN', '24h'),
  JWT_REFRESH_SECRET: getEnvVariable('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: getEnvVariable('JWT_REFRESH_EXPIRES_IN', '7d'),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', 'http://localhost:3000'),
  BCRYPT_ROUNDS: parseInt(getEnvVariable('BCRYPT_ROUNDS', '10')),
  LOG_LEVEL: getEnvVariable('LOG_LEVEL', 'info'),
};

export default config;
