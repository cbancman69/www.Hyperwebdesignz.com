const getPort = require('get-port');
const { start } = require('./server');

(async () => {
  try {
    // pick an available port in the 4000-4999 range to avoid common defaults like 3000
    const port = await getPort({ port: getPort.makeRange(4000, 4999) });
    await start(port);
    const url = `http://localhost:${port}`;
    console.log(`Started on ${url}`);
    const fs = require('fs');
    try{ fs.writeFileSync(require('path').join(__dirname,'last_url.txt'), url, 'utf8'); }catch(e){}

    // optionally open the default browser (Edge on Windows) when --open flag present
    const openFlag = process.argv.includes('--open') || process.env.FP_OPEN === '1';
    if (openFlag) {
      const { exec } = require('child_process');
      if (process.platform === 'win32') {
        // Use cmd start to open msedge; the empty title avoids issues with quoted paths
        exec(`cmd /c start "" msedge "${url}"`, (err) => { if (err) console.error('Failed to open browser:', err); });
      } else if (process.platform === 'darwin') {
        exec(`open "${url}"`, (err) => { if (err) console.error('Failed to open browser:', err); });
      } else {
        exec(`xdg-open "${url}"`, (err) => { if (err) console.error('Failed to open browser:', err); });
      }
    }
  } catch (err) {
    console.error('Failed to start locally:', err);
    process.exit(1);
  }
})();
