import { createServer } from 'https';
import { existsSync, readFileSync } from 'fs';
import app from '../Connections/Express';
import { HTTPSConnection } from '../Interface';

let httpsServer: any;

const HttpsConnection = (HTTPS: HTTPSConnection) => {
  try {
    if (existsSync(HTTPS.CertPath) && existsSync(HTTPS.KeyPath)) {
      const KeyData = readFileSync(HTTPS.KeyPath, 'utf-8');
      const CertData = readFileSync(HTTPS.CertPath, 'utf-8');
      const ServerOptions = { key: KeyData, cert: CertData };

      httpsServer = createServer(ServerOptions, app);
      httpsServer.listen(HTTPS.Port, () => {
        // Logger.info(`Https Server listening on port ${HTTPS.Port} !`);
      });
      // Logger.info('Https Connected !');
    } else {
      if (!existsSync(HTTPS.CertPath)) {
        // Logger.error(`HttpsConnection Error : Certificate File Not Found`);
      }
      if (!existsSync(HTTPS.KeyPath)) {
        // Logger.error(`HttpsConnection Error : Key File Not Found`);
      }
    }
  } catch (e: any) {
    // Logger.error(` Eroor At HttpsConnection : ${e.message}`);
  }
};

export { HttpsConnection, httpsServer };
