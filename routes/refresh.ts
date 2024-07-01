import { FreshContext } from "$fresh/server.ts";
import { serverClient } from "./lib.ts";

export const handler = (req: Request, _ctx: FreshContext) => {
    const client = serverClient(req);
    client.realtime.setAuth("fresh-token");
    return Response.json("ok");
};
