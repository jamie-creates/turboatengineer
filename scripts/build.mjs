// Vinext calls process.exit(0) as soon as rendering finishes. On Windows,
// that can race native bundler handle cleanup. Allow the event loop to drain
// on success; preserve every nonzero exit and uncaught failure.
import {fileURLToPath} from 'node:url';
const cli=new URL('../node_modules/vinext/dist/cli.js',import.meta.url);
if(process.platform==='win32'){
 const exit=process.exit.bind(process);
 process.exit=(code=0)=>{if(Number(code)!==0)return exit(code);process.exitCode=0;};
}
process.argv=[process.execPath,fileURLToPath(cli),'build'];
await import(cli.href);
