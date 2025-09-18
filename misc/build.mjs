import esbuild from 'esbuild';

import path from 'path';

esbuild.build({
  entryPoints: [path.resolve('../src/main.jsx')], // Update this to your entry file
  bundle: true,
  outfile: 'out.js',
  loader: { '.png': 'file',
    '.js': 'jsx'
   },
}).catch(() => process.exit(1));
