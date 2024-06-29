import { defineRoute } from "$fresh/server.ts";
import { serverClient } from "./lib.ts";

export default defineRoute(async (req, ctx) => {
  const client = serverClient(req);
  const { data: communities, error } = await client
    .from("communities")
    .select();
  const render = communities.map((community) => (
    <div>
      <a href={`/communities/${community.id}`}>
        {community.id} {community.name}
      </a>
    </div>
  ));
  return <div>{render}</div>;
});
