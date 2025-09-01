import {
  type RouteConfig,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

const routes = flatRoutes({
		rootDirectory: "pages",
}) satisfies RouteConfig;

export default routes;
