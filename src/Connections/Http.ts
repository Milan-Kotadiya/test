import { createServer } from 'http';
import app from '../Connections/Express';
import { HTTPSConnection } from '../Interface';
const httpServer: any = createServer(app);

const HttpConnection = (HTTPS: HTTPSConnection) => {
  try {
    httpServer.listen(HTTPS.Port);
  } catch (e: any) {
    // Logger.error(` Eroor At HttpConnection : ${e.message}`);
  }
};

export { httpServer, HttpConnection };
