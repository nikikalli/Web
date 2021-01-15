import { send } from '../deps.js';

const errorMiddleware = async(context, next) => {
    try {
      await next();
    } catch (e) {
      console.log(e);
    }
  }
  
  const requestTimingMiddleware = async({ request, session }, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    let usr = 'anonymous';
    if(await session.get('user')) {
        
        usr = (await session.get('user')).id
    };
    console.log(`${request.method} ${request.url.pathname} - ${ms} ms, userId: ${usr}`);
  }

  const undefinedUser = async({request, session, response}, next) => {
    if (request.url.pathname.startsWith('/behavior')) {
        if(await session.get('authenticated')) {
            await next();
        } else {
        response.redirect('/auth/login')
        }
    } else {
        await next();
    }
  }
  
  const serveStaticFilesMiddleware = async(context, next) => {
    if (context.request.url.pathname.startsWith('/static')) {
      const path = context.request.url.pathname.substring(7);
    
      await send(context, path, {
        root: `${Deno.cwd()}/static`
      });
    
    } else {
      await next();
    }
  }

  const staticFunction = async (ctx,next) => {
    await send(ctx, ctx.request.url.pathname,{
     root: `${Deno.cwd()}/static`
      })
    next();
   };
  
  export { errorMiddleware, requestTimingMiddleware, serveStaticFilesMiddleware, staticFunction, undefinedUser};