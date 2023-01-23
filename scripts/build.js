require('esbuild').buildSync({
    // minify: true,
    entryPoints: [
        '../src/index.ts',
    ],
    bundle: true,
    format: 'esm',
    sourcemap: true,
    target: ['chrome58', 'firefox57', 'safari11', 'edge18'],
    outdir: '../dist',
});
