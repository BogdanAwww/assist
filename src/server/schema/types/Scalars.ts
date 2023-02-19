import {schemaComposer} from 'graphql-compose';

export const Void = schemaComposer.createScalarTC(`
    scalar Void
`);

export const ObjectID = schemaComposer.createScalarTC(`
    scalar ObjectID
`);

export const NumberType = schemaComposer.createScalarTC(`
    scalar Number
`);

export const UploadInput = schemaComposer.createScalarTC(`
    scalar UploadInput
`);
