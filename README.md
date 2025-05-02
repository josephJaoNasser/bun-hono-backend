# Bun & Hono backend boiler plate
Backend boiler plate is inspired by laravel. This backend is fairly simple to use with the routes and controllers being dynamically imported.

# Creating a route
The route is the endpoint which interfaces the API with the client.

The syntax is as follows:

```
bun make --route <<route name>>
```
or
```
bun make -r <<route name>>
```


This will create a file in the `/routes` directory

### Usage

```
bun make --route example
```
Will create the file `example.route.js` in the /routes directory.

```javascript
import { MiddlewareFunction } from "@/types";
import { Hono } from "hono";

const router = new Hono();
const routeMiddleware: Array<MiddlewareFunction> = [];

if (routeMiddleware.length) {
  router.use(...routeMiddleware);
}

export default {
  route: router,
  path: "/example",
};

```
As you can see, a route is created, however there are no endpoints. In order to create a an endpoint and add a corresponding controller, follow the example below.

<hr />
<br/>


# Creating a controller
A controller is where the logic lies. When a route is being called by a client, the route will point to the controller which executes the request, and sends the response.

The syntax is as follows:
```
bun make --route <<route name>> --controller <<controller name>>/<<controller route>> <<http method>>
```
or
```
bun make -r <<route name>> -c <<controller name>>/<<controller route>> <<http method>>
```

Note: `--route` and `--controller` can be in any order as long as their arguments are


| **Parameter**    | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| route            | the name of the base route                                                                                                                                                                                                                                                                                                                                                                                                                            |
| controller_name  | the name of the controller which will become the filename<br>and the class name of the controller                                                                                                                                                                                                                                                                                                                                                     |
| controller_route | _(optional)_ The route of the controller. If specified, the controller<br>will be called only when adding this to the base route. <br><br>For example, if the base route is `/example` and the <br>controller route is `/test`, this controller will be called <br>via `<<YOUR_API_URL>>/example/test`. If no controller route is specified,<br>the controller will be called via `<<YOUR_API_URL>>/example`<br><br>Default value is an empty string. |
| http_method      | _(optional)_ GET, POST, DELETE, etc. You can modify the available methods in the <br>/constants/HttpMethod.js<br><br>Default value is GET                                                                                                                                                                                                                                                                                                             |

### Example 1
```
bun make --route Example --controller GetExample/test
```
Will create the file `getExample.controller.js` inside `/controllers/example` directory. If the directory doesn't exist, it will be created.
Since the controller route is specified (`/test` in this case) and `example` being the base route, the controller shall be called via `<<API_URL>>/example/test`

The endpoint will automatically be added to your route in `/routes/example.route.ts`
```javascript
/* 
* /routes/example.route.ts 
*/
import GetExampleController from "@/controllers/example/getExample.controller";
import { MiddlewareFunction } from "@/types";
import { Hono } from "hono";

const router = new Hono();
const routeMiddleware: Array<MiddlewareFunction> = [];

if (routeMiddleware.length) {
  router.use(...routeMiddleware);
}

router.get("/", GetExampleController);

export default {
  route: router,
  path: "/example",
};

```

Inside your controller, you will get the following code:
```javascript
/* 
* /controllers/example/getExample.controller.ts 
*/
import { Context } from "hono";
import logger from "@/utils/logger";
import { failed, getErrorCode, success } from "@/utils/response";

export default async function ({ req, res, json }: Context) {
  try {

    // your logic here (note: this comment is only here in this readme)

    return json(success({ }));
  } catch (err) {
    logger.error(err);
    return json(failed(err), 500);
  }
}
```

### Example 2
```
bun make -c PostExample POST -r Example
```
Will create the file `postExample.controller.js` with the http method being post

```javascript
/* 
* /routes/example.route.ts 
*/
import PostExampleController from "@/controllers/example/postExample.controller";
import { MiddlewareFunction } from "@/types";
import { Hono } from "hono";

const router = new Hono();
const routeMiddleware: Array<MiddlewareFunction> = [];

if (routeMiddleware.length) {
  router.use(...routeMiddleware);
}

router.post("/", PostExampleController);

export default {
  route: router,
  path: "/example",
};

```

<hr />
<br/>

# Creating routes and controllers simultaneously
Creating a route and controller file follows the same command as creating a controller. If you execute the command for creating a controller and a route and controller file doesn't exist, the route will be created followed by the controller file. The endpoint will also be automatically appended to the route file.

# Creating your own middleware

Creating middleware is simpler than the aforementioned.

```
bun make --middleware <<middleware name>>
```
or
```
bun make --m <<middleware name>>
```


### Example
```
bun make --middleware example
```
This will result in the file `example.middleware.js` being created in the `/middleware` directory

```javascript
 import { MiddlewareHandler } from "hono";

const ExampleMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    next();
  } catch (err) {}
};

export default ExampleMiddleware;
```

# Using your own middleware
If you have created your middleware, you can use it by adding it to the endpoints in your router.

Below is an example using the `getExample.controller.js` that we generated earlier.

```javascript
/* 
* /routes/example.route.ts 
*/
import IndexController from "@/controllers/index/index.controller";
import { MiddlewareFunction } from "@/types";
import { Hono } from "hono";
import ExampleMiddleware from "@/middleware/example.middleware";

const router = new Hono();
const routeMiddleware: Array<MiddlewareFunction> = [];

if (routeMiddleware.length) {
  router.use(...routeMiddleware);
}

router.get("/", ExampleMiddleware, IndexController);

export default {
  route: router,
  path: "/",
};
```

Or you can add it to the `routeMiddleware` to apply it to all the endpoints. The middleware will be executed **IN ORDER**.

```javascript
/* 
* /routes/example.route.ts 
*/
import IndexController from "@/controllers/index/index.controller";
import { MiddlewareFunction } from "@/types";
import { Hono } from "hono";
import Example1Middleware from "@/middleware/example1.middleware";
import Example2Middleware from "@/middleware/example2.middleware";

const router = new Hono();
const routeMiddleware: Array<MiddlewareFunction> = [
  Example1Middleware, 
  Example2Middleware
];

if (routeMiddleware.length) {
  router.use(...routeMiddleware);
}

router.get("/", IndexController);

export default {
  route: router,
  path: "/",
};
```