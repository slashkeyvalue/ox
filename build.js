import esbuild from "esbuild";

const production = process.argv.includes("--mode=production");

const onRebuild = (context) => {
  return async (err, res) => {
    if (err) {
      return console.error(`[${context}]: Rebuild failed`, err);
    }

    console.log(`[${context}]: Rebuild succeeded, warnings:`, res.warnings);
  };
};

const server = {
  platform: "node",
  target: ["node16"],
  format: "cjs",
};

const client = {
  platform: "browser",
  target: ["chrome93"],
  format: "iife",
};

const buildCmd = production ? esbuild.build : esbuild.context;

for (const context of ["client", "server"]) {
  buildCmd({
    bundle: true,
    entryPoints: [`${context}/index.ts`],
    outfile: `dist/${context}.js`,
    keepNames: true,
    plugins: production
      ? undefined
      : [
          {
            name: "rebuild",
            setup(build) {
              const cb = (result) => {
                if (!result || result.errors.length === 0)
                  console.log(`Successfully built ${context}`);
              };
              build.onEnd(cb);
            },
          },
        ],
    ...(context === "client" ? client : server),
  })
    .then((build) => {
      if (production) return console.log(`Successfully built ${context}`);

      build.watch();
    })
    .catch(() => process.exit(1));
}
