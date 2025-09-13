import app from "./src/app";
import http, { createServer } from "http";
import { envConfig } from "./src/config/config";

function startServer()
{
  const port = envConfig.port || 5000;
    const server= createServer(app);
    server.listen(port, () => {
        console.log('Server is running on port 3000')
    })
}
startServer();