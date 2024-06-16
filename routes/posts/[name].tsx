import { FreshContext, RouteContext } from "$fresh/src/server/types.ts";
import { getPostsByUser, Post, User } from "../lib.ts";
import { Effect } from "npm:effect";

export default async function ShowPosts(req: Request, ctx: RouteContext) {
    const username = ctx.params.name;
    const p = await Effect.runPromise(getPostsByUser(username));
    const posts = p.map((post) => <div>{JSON.stringify(post)}</div>);
    return (
        <div>
            Posts
            <div>{posts}</div>
        </div>
    );
}
