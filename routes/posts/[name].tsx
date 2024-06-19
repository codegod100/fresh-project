import { FreshContext, RouteContext } from "$fresh/src/server/types.ts";
import { getPostsByUser, getUser, Post, supabase, User } from "../lib.ts";
import { Effect } from "npm:effect";

export default async function ShowPosts(req: Request, ctx: RouteContext) {
    const username = ctx.params.name;

    let { data, error } = await supabase
        .from("users")
        .select("username, posts ( title, body )")
        .eq("username", username).single();
    console.log(username, { data }, { error });
    const posts = data?.posts.map((post) => (
        <div>
            <div>Title: {post.title}</div>
            <div>Body: {post.body}</div>
        </div>
    ));
    // const res = await getUser();
    // console.log({ res });

    return (
        <div>
            Posts for {username}
            {posts}
        </div>
    );
}
