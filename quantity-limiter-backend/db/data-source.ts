import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import * as env from 'dotenv';
env.config();

export const dataSourceOptions: DataSourceOptions = {
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  logging: process.env.TYPEORM_LOGGING === 'true',
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  type: 'mariadb',
  database: process.env.DB_NAME || '',
  entityPrefix: process.env.DB_ENTITY_PREFIX || '',
  entities: ['dist/**/*.entity.js'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  charset: 'utf8mb4',
  migrations: ['dist/db/migrations/*.js'],
  namingStrategy: new SnakeNamingStrategy(),
};
const myDataSource = new DataSource(dataSourceOptions);

export default myDataSource;
