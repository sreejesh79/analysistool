import RemotingMiddleware from "../../config/remoting/middleware";
import RouterConfig from "../../config/router";
import Router from "koa-router";
let middlewares: any;
let routes: any;
const settings = require("../../config/setting");
const router: any = new Router();
const bindRoutes = function(app: any){
    addAllMiddleWares(app);
    addAllRoutes(app);
    app.use(router.routes());
    app.use(router.allowedMethods());
};

const addAllMiddleWares = function(app: any){
    middlewares = RemotingMiddleware.middlewares();
    for (const mw in middlewares) {
        console.log(mw + " mw");
        const contrls = middlewares[mw];
        if (Array.isArray(contrls)) {
            for (let i = 0; i < contrls.length; i++) {
                addMiddleware(app, {path: mw, controller: contrls[i]});
            }
        }else {
            addMiddleware(app, {path: mw, controller: middlewares[mw]});
        }
    }
};
const addMiddleware = async function(app: any, middleware_data: any){
       try {
           app.all(middleware_data.path, await import("../../api/controllers/" + middleware_data.controller));
       } catch (e) {

       }
};

const addAllRoutes = function(app: any){
    routes = RouterConfig.routes();
    for (const r in routes) {
        let route = r;
        const cntrlaction_array = routes[r].split(".");
        const type = "";
        const controller = "";
        if (cntrlaction_array.length > 1) {
            const routetype_array = route.split(" ");
            let type = "";
            let controller = "";

            if (routetype_array.length > 1) {
                type = routetype_array[0];
                route = routetype_array[1];
            }
            else {
                type = "get";
            }

            controller = cntrlaction_array[0];
            const action = cntrlaction_array[1];
            addRoute(app, type, {path: route, controller: controller, action: action});
        }else {

        }
    }
};
const addRoute = async function (app: any, type: any, route_data: any) {
    console.log(type);
    console.log(route_data);
    try {
            const className: any = await import("../../api/controllers/" + route_data.controller);
            console.log("type1: ", type);
            router[type](route_data.path, className.default[route_data.action]);
    }catch (e) {
       // console.log(e);
        try {
            const className: any = await import("../../api/controllers/" + route_data.controller);
            router[type](route_data.path, className["default"][route_data.action]);
        }catch (e) {
            console.log(e);
        }
    }
};
// module.exports = bindRoutes;
export default bindRoutes;