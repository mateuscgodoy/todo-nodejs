import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API',
      version: '1.0.0',
    },
    components: {
      schemas: {
        Todo: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            title: {
              type: 'string',
            },
            assignedTo: {
              type: 'string',
            },
            done: {
              type: 'boolean',
            },
          },
        },
      },
    },
  },
  apis: ['./src/todoRouter.ts'],
};

export default swaggerJSDoc(options);
