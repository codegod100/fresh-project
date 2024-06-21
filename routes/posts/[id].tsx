import {
    defineRoute,
    FreshContext,
    PageProps,
    RouteContext,
} from "$fresh/server.ts";
import { JSXInternal } from "https://esm.sh/v128/preact@10.19.6/src/jsx.d.ts";
import Reply from "../../islands/Reply.tsx";
import SupaClient from "../../islands/SupaClient.tsx";
import { supabase } from "../lib.ts";
import { Signal, useSignal } from "@preact/signals";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { Tables } from "../../types/supabase.ts";

interface Post {
    username: string;
}
interface Comment {
    id: number;
    body: string | null;
    parent_comment_id: number | null;
    children?: Comment[];
    username: string;
    post_id: number;
}

interface Data {
    post: Post;
    comments: Comment[];
}

export default function ({ data }: PageProps<Data>) {
    let empty: SupabaseClient;
    const signal = useSignal(empty);
    const { post, comments } = data;

    const creds: [string, string] = [
        Deno.env.get("SUPABASE_URL") as string,
        Deno.env.get("ANON_KEY") as string,
    ];

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
                {comments.map((comment) => fillElements(comment, signal))}
            </div>
        </div>
    );
}

function fillElements(comment: Comment, signal) {
    return (
        <div class="pl-2 border-dashed border-1 border-black">
            {comment.username}: {comment.body}
            <div class="mb-2">
                <Reply
                    post_id={comment.post_id}
                    client={signal}
                    parent_comment_id={comment.id}
                />
            </div>
            {comment.children?.map((comment) => (
                fillElements(comment, signal)
            ))}
        </div>
    );
}

function fillChildren(this_comment: Comment, comments: Comment[]) {
    this_comment.children = comments.filter((c) =>
        c.parent_comment_id === this_comment.id
    );
}
export const handler = {
    async GET(req: Request, ctx: FreshContext) {
        const { data, error } = await supabase
            .from("posts")
            .select(
                "title, body, category, id, comments(id, created_at, body, parent_comment_id, users(username)), users(username, id)",
            )
            .order("created_at", {
                referencedTable: "comments",
                ascending: false,
            })
            .eq("id", ctx.params.id)
            .single();

        console.log({ error });
        if (error) throw error;
        if (!data) return;
        if (!data.users) return;
        console.log({ data });
        const comments = data.comments;
        const base_comments = comments.filter((c) => !c.parent_comment_id);
        for (const c of comments) {
            c.post_id = data.id;
            c.username = c.users.username;
            fillChildren(c, comments);
        }
        console.log({ base_comments });
        const post = {
            id: data.id,
            title: data.title,
            category: data.category,
            body: data.body,
            username: data.users.username,
        };
        return ctx.render({ post, comments: base_comments });
    },
};
