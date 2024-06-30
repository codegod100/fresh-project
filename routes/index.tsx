import { defineRoute } from "$fresh/server.ts";
import { serverClient } from "./lib.ts";

export default defineRoute(async (req, ctx) => {
  const client = serverClient(req);
  const { data: posts, error: postsError } = await client
    .from("posts")
    .select("id, title, users(username), communities(name)")
    .order("created_at", { ascending: true })
    .limit(5);
  const { data: communities, error } = await client
    .from("communities")
    .select();
  const postRender = posts?.map((post) => (
    <div class="mb-2">
      <div>
        <a href={`/communities/${post.communities.name}/${post.id}`}>
          Title: {post.title}
        </a>
      </div>
      <div>Author: {post.users.username}</div>
    </div>
  ));
  const render = communities.map((community) => (
    <div>
      <div>Recent Posts</div>
      <div>{postRender}</div>
      <div>Communities</div>
      <a href={`/communities/${community.name}`}>
        {community.name}
      </a>
    </div>
  ));
  return <div>{render}</div>;
});
