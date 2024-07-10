import { defineRoute, FreshContext, PageProps } from "$fresh/server.ts";
import { serverClient } from "../lib.ts";
import { Effect } from "npm:effect";
import { Cookie, setCookie } from "jsr:@std/http/cookie";
import RecentPosts from "../../components/RecentPosts.tsx";

export default defineRoute(async (req, ctx) => {
    const client = serverClient(req);
    const { data, error } = await client.auth.getUser();
    const { data: community, error: communityError } = await client
        .from("communities")
        .select(
            "name, posts(id, title, created_at, body, category, users(username), communities(name))",
        )
        .eq("name", ctx.params.name)
        .order("created_at", { ascending: false, referencedTable: "posts" })
        .single();
    if (communityError) {
        throw communityError;
    }
    const postsJSX = community?.posts?.map((post) => (
        <div class="mb-2">
            <div>
                Title:{" "}
                <a href={`/communities/${community.name}/${post.id}`}>
                    {post.title}
                </a>{" "}
                {post.category && <span>[{post.category}]</span>}
            </div>
            <div>Body: {post.body}</div>
            <div>
                Author: {post.users?.username}
            </div>
        </div>
    ));
    return (
        <div>
            <div>
                <div class="text-3xl mb-2">Community: {community?.name}</div>
            </div>
            <div>
                {data.user &&
                    (
                        <div class="btn ml-1  mb-3">
                            <a
                                class="bg-blue-500 text-white rounded p-1"
                                href={`/create/post/${ctx.params.name}`}
                            >
                                Create new post
                            </a>
                        </div>
                    )}
                <h2 class="text-2xl font-extrabold  mb-3">
                    Recent Posts
                </h2>
                <div class="pl-2">
                    <RecentPosts
                        posts={community.posts}
                    />
                </div>
            </div>
        </div>
    );
});

export const handler = {
    async GET(req, ctx) {
        return ctx.render();
    },
};
