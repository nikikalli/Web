import { Application } from "./deps.js";
import { router } from "./routes/routes.js";
import * as middleware from './middlewares/middlewares.js';
import { viewEngine, engineFactory, adapterFactory } from "./deps.js";
import { Session } from "./deps.js";


const app = new Application();


const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();

app.use(viewEngine(oakAdapter, ejsEngine, {
    viewRoot: "./views"
}));

const session = new Session({ framework: "oak" });
await session.init();
app.use(session.use()(session));

app.use(middleware.errorMiddleware);
app.use(middleware.undefinedUser);
app.use(middleware.requestTimingMiddleware);
app.use(middleware.serveStaticFilesMiddleware);
app.use(router.routes());
app.use(middleware.staticFunction);


let port = 7777;

if (Deno.args.length > 0) {  
    const lastArgument = Deno.args[Deno.args.length - 1];  
    port = Number(lastArgument);
}

app.listen({ port: port });

export { app };