import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
});

server.listen(PORT, () => {
  console.log(`[Server] HTTP server escuchando en puerto ${PORT}`);
});
