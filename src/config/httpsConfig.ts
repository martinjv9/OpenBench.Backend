import fs from "fs";
import path from "path";

export const httpsOptions = {
  key: fs.readFileSync(path.resolve("/etc/letsencrypt/live/openbenches.com/privkey.pem")),
  cert: fs.readFileSync(path.resolve("/etc/letsencrypt/live/openbenches.com/fullchain.pem")),
};
