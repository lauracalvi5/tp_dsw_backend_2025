import { MikroORM, EntityManager } from '@mikro-orm/core'
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter'
import { MongoDriver } from '@mikro-orm/mongodb'

export const DI = {} as {
  orm: MikroORM,
  em: EntityManager
}

export const initORM = async () => {
  DI.orm = await MikroORM.init({
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    dbName: 'parkEasy',
    clientUrl: 'mongodb://127.0.0.1:27017/?directConnection=true',
    driver: MongoDriver,
    highlighter: new MongoHighlighter(),
    debug: true,
    schemaGenerator: {
      disableForeignKeys: true,
      createForeignKeyConstraints: true,
      ignoreSchema: [],
    },
  });
  DI.em = DI.orm.em.fork();
}

export const syncSchema = async () => {
  const generator = DI.orm.getSchemaGenerator()
  await generator.updateSchema()
}

export const closeORM = async () => {
  if (DI.orm) {
    await DI.orm.close(true);
  }
};