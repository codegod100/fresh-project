import {
    defineRoute,
    FreshContext,
    PageProps,
    RouteContext,
} from "$fresh/server.ts";
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
    id: number;
    body: string;
    username: string;
    nested: Comment[];
}

interface Data {
    post: Post;
    comments: Comment[];
}

export default function ({ data }: PageProps<Data>, ctx: RouteContext) {
    const { post, comments } = data;
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
                            <Reply
                                client={signal}
                                post_id={post.id}
                                comment_id={comment.id}
                            />
                        </div>
                        {comment.nested.map((nested) => {
                            return (
                                <div class="pl-2 mt-2">
                                    <div>Body: {nested.body}</div>
                                    <div>User: {nested.username}</div>
                                    <div>
                                        <Reply
                                            client={signal}
                                            post_id={post.id}
                                            comment_id={nested.id}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

export const handler = {
    async GET(req, ctx) {
        const comments: Comment[] = [];
        let nestedComments = {};
        let post: Post;
        let resp = await supabase
            .from("users")
            .select(
                "username, posts ( title, body, category, id ), comments ( id, body, comment_id )",
            )
            .eq("posts.id", ctx.params.id);
        console.log(JSON.stringify(resp, null, 2));
        resp.data?.forEach((entry) => {
            entry.comments.forEach((comment) => {
                if (comment.comment_id) {
                    if (!nestedComments[comment.comment_id]) {
                        nestedComments[comment.comment_id] = [];
                    }
                    comment.username = entry.username;
                    nestedComments[comment.comment_id].push(comment);
                }
                comments.push({
                    username: entry.username,
                    body: comment.body,
                    id: comment.id,
                    nested: [],
                });
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
        comments.forEach((comment) => {
            if (nestedComments[comment.id]) {
                comment.nested = nestedComments[comment.id];
            }
        });
        return await ctx.render({ post, comments });
    },
};
