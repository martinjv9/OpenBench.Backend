import fs from 'fs';

export const httpsOptions = {
  key: fs.readFileSync('./certs/private-key.pem'),
  cert: fs.readFileSync('./certs/certificate.pem')
};
