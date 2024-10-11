import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

import swaggerOpts from './swaggerOpts.js';

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerOpts));

app.listen(PORT, () => {
  console.log(`Server located at: http://localhost:${PORT}`);
});
