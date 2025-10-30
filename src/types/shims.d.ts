// Minimal ambient module shims to avoid needing @types/* packages at build time.
declare module 'express' {
  export type Request = any;
  export type Response = any;
  const e: any;
  export default e;
}
declare module '@nestjs/platform-express' {
  export type NestExpressApplication = any;
}
declare module 'body-parser' { const v: any; export = v; }
declare module 'connect' { const v: any; export = v; }
declare module 'express-serve-static-core' { const v: any; export = v; }
declare module 'http-errors' { const v: any; export = v; }
declare module 'mime' { const v: any; export = v; }
declare module 'qs' { const v: any; export = v; }
declare module 'range-parser' { const v: any; export = v; }
declare module 'send' { const v: any; export = v; }
declare module 'serve-static' { const v: any; export = v; }
declare module 'strip-bom' { const v: any; export = v; }
declare module 'strip-json-comments' { const v: any; export = v; }
declare module 'path' { const v: any; export = v; }

// globals used by Node code in this project
declare var __dirname: string;
declare var process: any;

