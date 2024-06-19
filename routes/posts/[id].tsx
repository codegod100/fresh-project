import { defineRoute, FreshContext, RouteContext } from "$fresh/server.ts";
import Reply from "../../islands/Reply.tsx";
import SupaClient from "../../islands/SupaClient.tsx";
import { supabase } from "../lib.ts";
import { useSignal } from "@preact/signals";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";

interface Post {
    id: number;
    title: string;
    body: string;
    username: string;
    category: string;
}
interface Comment {
    body: string;
    username: string;
}
const comments: Comment[] = [];
let post: Post;
export default function (req: Request, ctx: RouteContext) {
    let empty: SupabaseClient;
    const signal = useSignal(empty);
    const creds: [string, string] = [
        Deno.env.get("SUPABASE_URL") as string,
        Deno.env.get("ANON_KEY") as string,
    ];

    // console.log(resp);

    return (
        <div class="mb-2">
            <SupaClient supaCreds={creds} signal={signal} />

            <div>
                Title: <a href={`/posts/${post.id}`}>{post.title}</a>
                {post.category && <span>[{post.category}]</span>}
            </div>
            <div>Body: {post.body}</div>
            <div>User: {post.username}</div>
            <div>
                <Reply post_id={post.id} client={signal} />
            </div>

            <div>
                <div class="mt-5 mb-1">Comments:</div>
                {comments.map((comment) => (
                    <div class="mb-5">
                        <div>Body: {comment.body}</div>
                        <div>User: {comment.username}</div>
                        <div>
                            <Reply client={signal} post_id={post.id} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const handler = {
    async GET(req, ctx) {
        let resp = await supabase
            .from("users")
            .select(
                "username, posts ( title, body, category, id ), comments ( body )",
            )
            .eq("posts.id", ctx.params.id);

        resp.data?.forEach((entry) => {
            entry.comments.forEach((comment) => {
                comments.push({ username: entry.username, body: comment.body });
            });
            entry.posts.forEach((p) => {
                post = {
                    id: p.id,
                    username: entry.username,
                    title: p.title,
                    category: p.category,
                    body: p.body,
                };
            });
        });
        return await ctx.render();
    },
};
