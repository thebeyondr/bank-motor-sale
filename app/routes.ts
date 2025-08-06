import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("vehicle/:id", "routes/vehicle/$id.tsx"),
  route("listing/:id", "routes/listing/$id.tsx"),
  route("vehicle-card-demo", "routes/vehicle-card-demo.tsx"),

  // Dashboard routes with auth barriers
  route("dashboard", "routes/dashboard.tsx", [
    index("routes/dashboard-index.tsx"),
    route(":bankId/listings/new", "routes/new-listing.tsx"),
  ]),
] satisfies RouteConfig;
