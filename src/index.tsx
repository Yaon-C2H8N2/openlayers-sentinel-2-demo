import { serve, type BunRequest } from "bun";
import index from "./index.html";
import { serveCarto } from "./api/carto/carto";

const server = serve({
  routes: {
    "/": index,
    "/api/carto/*": (request: BunRequest) => {
      return serveCarto(request);
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
