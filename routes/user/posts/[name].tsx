import { FreshContext, RouteContext } from "$fresh/src/server/types.ts";
import { serverClient } from "../../lib.ts";
export default async function ShowPosts(req: Request, ctx: RouteContext) {
    const username = ctx.params.name;
    const client = serverClient(req);
    let { data, error } = await client
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

    return (
        <div>
            Posts for {username}
            {posts}
        </div>
    );
}
