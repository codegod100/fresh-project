import { defineRoute, FreshContext, PageProps } from "$fresh/server.ts";
import {
    createSession,
    getUser,
    saveUser,
    serverClient,
    supabase,
    User,
} from "../lib.ts";
import { Effect } from "npm:effect";
import { Cookie, getCookies, setCookie } from "jsr:@std/http/cookie";

export default defineRoute(async (req, ctx) => {
    const client = serverClient(req);
    const { data: posts, error } = await client
        .from("posts")
        .select("title, id, users(username)")
        .order("created_at", { ascending: false })
        .eq("community_id", ctx.params.id);
    console.log({ error });
    const { data: community, error: communityError } = await client
        .from("communities")
        .select()
        .eq("id", ctx.params.id)
        .single();
    const postsJSX = posts?.map((post) => (
        <div class="mb-2">
            <div>
                Title: <a href={`/posts/${post.id}`}>{post.title}</a>{" "}
                {post.category && <span>[{post.category}]</span>}
            </div>
            <div>
                Author: {post.users?.username}
            </div>
        </div>
    ));
    return (
        <div>
            <div>
                <div>Community: {community.name}</div>
            </div>
            <div>
                <div class="text-2xl font-extrabold  mb-3">
                    <a href="/create/post">Create new post</a>
                </div>
                <h2 class="text-2xl font-extrabold  mb-3">
                    Recent Posts
                </h2>
                <div class="pl-2">
                    {postsJSX}
                </div>
            </div>
        </div>
    );
});

export const handler = {
    async GET(req, ctx) {
        return ctx.render();
    },
    async POST(req: Request, ctx: FreshContext) {
        const form = await req.formData();
        const username = form.get("username") as string;
        console.log({ username });
        const resp = await ctx.render();
        const program = Effect.gen(function* () {
            let user = yield* getUser(username);
            console.log({ gotuser: user });
            if (!user) {
                user = yield* saveUser({ username } as User);
                console.log({ newuser: user });
            }
            const session = yield* createSession(user);
            const cookie: Cookie = { name: "session_id", value: session.id };
            setCookie(resp.headers, cookie);
        });
        await Effect.runPromise(program);
        return resp;
    },
};
