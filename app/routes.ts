import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("vehicle/:id", "routes/vehicle/$id.tsx"),
] satisfies RouteConfig;
