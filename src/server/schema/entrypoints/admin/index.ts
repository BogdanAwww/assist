import {astToSchema, directoryToAst} from 'graphql-compose-modules';
import {SchemaComposer} from 'graphql-compose';
import {schema as baseSchema} from '..';

const adminSC = new SchemaComposer();
adminSC.merge(baseSchema);

const ast = directoryToAst(module);
const sc = astToSchema(ast);
const adminSchema = sc.buildSchema();

adminSC.merge(adminSchema);

export const schema = adminSC.buildSchema();
