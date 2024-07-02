import { defineRoute } from "$fresh/server.ts";
import RecentPosts from "../components/RecentPosts.tsx";
import { serverClient } from "./lib.ts";

export default defineRoute(async (req, ctx) => {
  const client = serverClient(req);
  const { data: posts, error: postsError } = await client
    .from("posts")
    .select("id, title, body, users(username), communities(name)")
    .order("created_at", { ascending: true })
    .limit(5);
  const { data: communities, error } = await client
    .from("communities")
    .select();
  // const postRender = posts?.map((post) => (
  //   <div class="mb-2">
  //     <div>
  //       <a href={`/communities/${post.communities!.name!}/${post.id}`}>
  //         Title: {post.title}
  //       </a>
  //     </div>
  //     <div>Body: {post.body}</div>
  //     <div>Author: {post.users!.username}</div>
  //   </div>
  // ));
  const render = communities!.map((community) => (
    <div>
      <a href={`/communities/${community.name!}`}>
        Community: {community.name!}
      </a>
    </div>
  ));
  return (
    <div class="ml-3">
      <div class="text-3xl mb-2">Recent Posts</div>
      <div>
        <RecentPosts posts={posts} />
      </div>
      <div class="text-3xl mb-2">Communities</div>
      <div>{render}</div>
    </div>
  );
});
