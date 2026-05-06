/* SkyPulse — single-file static server.
 *
 * Sharing options:
 *   1. Same Wi-Fi (LAN)     → friends open http://<your-LAN-IP>:8080
 *                              (this script prints the LAN URL on boot)
 *                              Note: Windows Firewall must allow inbound 8080
 *                              the first time you bind. If your friends can't
 *                              reach you, run once as Administrator:
 *                                 netsh advfirewall firewall add rule ^
 *                                   name="SkyPulse" dir=in action=allow ^
 *                                   protocol=TCP localport=8080
 *   2. Public tunnel        → npx localtunnel --port 8080
 *                              or `cloudflared tunnel --url http://localhost:8080`
 *                              Gives a public https URL that works anywhere.
 *   3. Free static deploy   → drag-and-drop index.html to:
 *                                Cloudflare Pages · Vercel · Netlify · GitHub Pages
 *                              No server needed; pure client-side app.
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const PORT = 8080;
const HOST = '0.0.0.0';   // bind all interfaces so LAN access works
const DIR  = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2'
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(DIR, url === '/' ? 'index.html' : url);
  if (!filePath.startsWith(DIR)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath)] || 'text/plain',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}).listen(PORT, HOST, () => {
  const lanIps = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) lanIps.push({ name, addr: net.address });
    }
  }
  const line = '─'.repeat(58);
  console.log('\n  ' + line);
  console.log('  ✦  SkyPulse running');
  console.log('  ' + line);
  console.log('     Local      → http://localhost:' + PORT);
  if (!lanIps.length) {
    console.log('     LAN        → (no external network interface detected)');
  } else {
    lanIps.forEach((ip, i) => {
      const label = i === 0 ? 'LAN        →' : '            →';
      console.log('     ' + label + ' http://' + ip.addr + ':' + PORT + '   (' + ip.name + ')');
    });
    console.log('                  share with friends on the same Wi-Fi network');
  }
  console.log('  ' + line);
  console.log('     Public tunnel: npx localtunnel --port ' + PORT);
  console.log('     Free deploy:   drag index.html to Cloudflare Pages / Vercel');
  console.log('  ' + line + '\n');
});
