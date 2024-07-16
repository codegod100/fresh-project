import { defineRoute } from "$fresh/server.ts";
import RecentPosts from "../components/RecentPosts.tsx";
import { serverClient } from "./lib.ts";

export default defineRoute(async (req, ctx) => {
  const client = serverClient(req);
  const { data, error: userError } = await client.auth.getUser();
  const { data: posts, error: postsError } = await client
    .from("posts")
    .select("*, users(username), communities(name)")
    .order("created_at", { ascending: false })
    .limit(5);
  const { data: communities, error } = await client
    .from("communities")
    .select();
  const render = communities!.map((community) => (
    <div class="mb-2">
      <a href={`/communities/${community.name!}`}>
        <div>Name: {community.name!}</div>
        {community.description && (
          <div>Description: {community.description}</div>
        )}
      </a>
    </div>
  ));

  const { data: pinnedPosts, error: pinnedError } = await client
    .from("posts")
    .select("*, users(username), communities(name)")
    .order("created_at", { ascending: false })
    .eq("pinned", true);

  const pinned = pinnedPosts!.length > 0;

  return (
    <div class="ml-3">
      {pinned && (
        <div>
          <div class="text-3xl mb-2 ">
            <span class="bg-yellow-100">Pinned Posts</span>
          </div>
          <div>
            <RecentPosts posts={pinnedPosts} />
          </div>
        </div>
      )}
      <div class="text-3xl mb-2">Recent Posts</div>
      <div>
        <RecentPosts posts={posts} />
      </div>
      <div class="text-3xl mb-2">Communities</div>
      {data.user &&
        (
          <div class="mb-2">
            <a
              class="btn rounded bg-blue-500 text-white p-1"
              href="/create/community"
            >
              Create new community
            </a>
          </div>
        )}
      <div>{render}</div>
    </div>
  );
});
