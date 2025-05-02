// const path = require("path");
import path from "path";
import { HttpMethod } from "../constants/HttpMethod";
import toCamelCase from "../utils/toCamelCase";
import logger from "../utils/logger";

type MakeFileArgs = {
  controller?: string;
  route?: string;
  controllerMethod?: string;
  middleware?: string;
};

enum MakeTypes {
  controller = "controller",
  route = "route",
  middleware = "middleware",
}

const httpMethods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
  "TRACE",
  "CONNECT",
  "LINK",
  "UNLINK",
];

function firstLetterChangeCase(string: string, letterCase: "upper" | "lower") {
  if (letterCase === "upper") {
    if (string.charAt(0) !== string.charAt(0).toUpperCase()) {
      string = string.charAt(0).toUpperCase() + string.slice(1);
    }

    return string;
  }

  if (letterCase === "lower") {
    if (string.charAt(0) !== string.charAt(0).toLowerCase()) {
      string = string.charAt(0).toLowerCase() + string.slice(1);
    }

    return string;
  }

  return string;
}

/**
 * Main make script
 * @returns
 */
function make() {
  const args = getArgs() as MakeFileArgs;

  if (args.controller && !args.route) {
    logger
      .verbose()
      .error(
        `Provide a route for your controller. e.g. "make --route users --controller GetUsers"`
      );
    return;
  }

  if (!Object.keys(args).length) {
    console.log("Nothing created. Please provide valid arguments");
    return;
  }

  if (args.route) {
    makeRoute(args.route, args.controller, args.controllerMethod);
  }

  if (args.middleware) {
    makeMiddleware(args.middleware);
  }
}

/**
 * Get arguments
 */
function getArgs(): MakeFileArgs {
  const args = process.argv.slice(2);
  const argsObj: MakeFileArgs = {};
  const validFlags = [
    "--route",
    "--controller",
    "--middleware",
    "-c",
    "-r",
    "-m",
  ];
  const invalidFlag = args.find(
    (flag) => flag.startsWith("-") && !validFlags.includes(flag)
  );

  if (invalidFlag) {
    logger.verbose().error(`Flag "${invalidFlag}" not supported`);
    return {};
  }

  const routeFlagIndex =
    args.indexOf("--route") > -1 ? args.indexOf("--route") : args.indexOf("-r");

  const controllerFlagIndex =
    args.indexOf("--controller") > -1
      ? args.indexOf("--controller")
      : args.indexOf("-c");

  const middlewareFlagIndex =
    args.indexOf("--middleware") > -1
      ? args.indexOf("--middleware")
      : args.indexOf("-m");

  if (routeFlagIndex !== -1) {
    argsObj.route = args[routeFlagIndex + 1];
  }

  if (controllerFlagIndex !== -1) {
    argsObj.controller = args[controllerFlagIndex + 1];
    const method = args[controllerFlagIndex + 2] ?? "GET";

    if (!method?.startsWith("--")) {
      if (!httpMethods.includes(method.toUpperCase())) {
        logger.verbose().error(`The http method "${method}" is not supported`);
        return {};
      }

      argsObj.controllerMethod = args[controllerFlagIndex + 2];
    }
  }

  if (middlewareFlagIndex !== -1) {
    argsObj.middleware = args[middlewareFlagIndex + 1];
  }

  const isValid = Object.values(argsObj).every(
    (val) => !val?.startsWith("-") || !validFlags.includes(val)
  );

  if (!isValid) {
    logger
      .verbose()
      .error(
        `Arguments not valid. Please make sure that you are not adding a flag as the name of your route, controller, or middleware`
      );
    return {};
  }

  return argsObj;
}

/**
 * Get names for the files to be created
 */
function getNames(name: string, makeType: MakeTypes) {
  let fileName = "";
  let className = "";

  if (!name.toLowerCase().endsWith(makeType)) {
    fileName = `${name}.${makeType}.ts`;
    className =
      toCamelCase(name) + makeType.charAt(0).toUpperCase() + makeType.slice(1);
  } else {
    className = toCamelCase(name);
    let lastIndex = name.toLowerCase().lastIndexOf(makeType);

    if (lastIndex !== -1) {
      let firstPart = name.slice(0, lastIndex);
      let secondPart = makeType;

      fileName = `${firstPart}.${secondPart}.ts`;
    }
  }

  className = firstLetterChangeCase(className, "upper");
  fileName = firstLetterChangeCase(fileName, "lower");

  return {
    folderName: fileName.split(".")[0],
    fileName,
    className,
  };
}

/**
 * Make controller
 * @param {object} options
 * @param {string} options.name
 * @param {string} options.folder
 * @param {string} options.method
 * @param {string} options.routeName
 */
async function makeController({
  name,
  folder,
  method = "GET",
  routeName = "",
}) {
  const { fileName, className } = getNames(name, MakeTypes.controller);

  const formattedMethod = method.toUpperCase();

  if (!HttpMethod[formattedMethod]) method = "GET";

  const boilerplate = `import { Context } from "hono";
import logger from "@/utils/logger";
import { failed, getErrorCode, success } from "@/utils/response";

export default async function ({ req, res, json }: Context) {
  try {
    return json(success({}));
  } catch (err) {
    logger.error(err);
    return json(failed(err), 500);
  }
}`;

  const controllerPath = path.join(__dirname, "..", "controllers", folder);
  const controllerFullPath = path.join(controllerPath, fileName);

  const controllerFile = Bun.file(controllerFullPath);

  await Bun.write(controllerFile, boilerplate);

  logger
    .verbose()
    .success(
      `Created controller "${name}" with the http method ${formattedMethod} under the the "${folder}" route`
    );

  return {
    path: controllerFullPath,
    controllerName: className,
    fileName,
  };
}

/**
 * Make route
 * @param {string} name
 * @param {string} controller
 * @param {string} controllerMethod
 */
async function makeRoute(name, controller, controllerMethod) {
  const { fileName, folderName } = getNames(name, MakeTypes.route);
  const routeName = fileName.split(".route")[0];
  const routePath = path.join(__dirname, "..", "routes");
  const routeFilePath = path.join(routePath, fileName);
  const controllerPath = path.join(__dirname, "..", "controllers", folderName);

  // create route first
  const boilerplate = `import { MiddlewareFunction } from "@/types";
import { Hono } from "hono";

const router = new Hono();
const routeMiddleware: Array<MiddlewareFunction> = [];

if (routeMiddleware.length) {
  router.use(...routeMiddleware);
}

export default {
  route: router,
  path: "/${routeName}",
};
`;

  const routeFile = Bun.file(routeFilePath);
  // const controllerFolder = Bun.file(controllerPath);
  if (!(await routeFile.exists())) {
    await Bun.write(routeFile, boilerplate);
    logger.verbose().success(`Created route "${routeName}"`);
  }

  let controllerBoilerPlateImport = "";
  let controllerBoilerPlate = "";

  if (!controller) {
    return;
  }

  const controllerNameAndRoute: string[] = controller.split("/");
  const controllerRoute =
    "/" +
    controllerNameAndRoute.slice(1, controllerNameAndRoute.length).join("/");

  const makeControllerResult = await makeController({
    name: controllerNameAndRoute[0],
    folder: folderName,
    routeName: controllerRoute,
    method: controllerMethod,
  });

  if (!makeControllerResult) {
    return;
  }

  const makeResultControllerName = makeControllerResult.controllerName;
  const controllerFileName = makeControllerResult?.fileName.replace(".ts", "");
  controllerBoilerPlateImport = `import ${makeResultControllerName} from "@/controllers/${folderName}/${controllerFileName}";\n`;
  controllerBoilerPlate = `"${
    controllerRoute ?? "/"
  }", ${makeResultControllerName}`;

  await appendControllerToRoute(routeFilePath, {
    controllerName: makeResultControllerName,
    controllerImportString: controllerBoilerPlateImport,
    controllerMethod,
    controllerRoute: controllerRoute ?? "/",
  });
}

/**
 * @param routePath
 * @param controllerParams
 */
async function appendControllerToRoute(
  routePath,
  { controllerName, controllerImportString, controllerMethod, controllerRoute }
) {
  const file = Bun.file(routePath);
  let content: string = await file.text(); //fs.readFileSync(routePath, "utf-8");

  // String you want to inject
  const controllerCall = `router.${
    controllerMethod?.toLowerCase() || "get"
  }("${controllerRoute}", ${controllerName});`;

  const exportPattern = /^(.*export\s+default.*)$/m;

  if (exportPattern.test(content)) {
    content =
      controllerImportString +
      content
        .replace(controllerImportString, "")
        .replace(controllerCall, "")
        .replace(exportPattern, `${controllerCall}\n\n$1`);

    await Bun.write(file, content);
    // fs.writeFileSync(routePath, content, "utf-8");
  }
}

/**
 * @param {string} name
 */
async function makeMiddleware(name) {
  const { fileName, className } = getNames(name, MakeTypes.middleware);
  const boilerplate = ` import { MiddlewareHandler } from "hono";

const ${className}: MiddlewareHandler = async (c, next) => {
  try {
    next();
  } catch (err) {}
};

export default ${className};
`;

  const middlewarePath = path.join(__dirname, "..", "middleware");
  const middlewareFile = Bun.file(path.join(middlewarePath, fileName));

  await Bun.write(middlewareFile, boilerplate);

  logger.verbose().success(`Middleware "${name}"`);
}

make();
