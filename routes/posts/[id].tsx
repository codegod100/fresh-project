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

interface Post {
    id: number;
    title: string;
    body: string;
    username: string;
    category: string;
}
interface Comment {
    user_id: number;
    id: number;
    body: string;
    username: string;
    children?: Comment[];
}

interface Data {
    post: Post;
    comments: Comment[];
    childFunc: (post: Post, signal: Signal) => JSXInternal.Element;
}

async function fillChildren(comments: Comment[]) {
    for (const comment of comments) {
        comment.children = [];
        const resp = await supabase
            .from("comments")
            .select()
            .eq("comment_id", comment.id);
        if (resp.error) {
            return;
        }
        for (const c of resp.data) {
            const resp = await supabase
                .from("users")
                .select()
                .eq("id", c.user_id)
                .single();
            c.username = resp.data.username;
            comment.children.push(c);
        }
        await fillChildren(comment.children);
    }
    function childTags(children: Comment[], post: Post, signal: Signal) {
        console.log("in childtags");
        console.log({ post });
        return children.map((child) => {
            return (
                <div class="pl-2">
                    {child.username}: {child.body}{" "}
                    <Reply post_id={post.id} client={signal} />
                    <div class="mt-2">
                        {childTags(child.children, post, signal)}
                    </div>
                </div>
            );
        });
    }

    const tags = (post, signal) => childTags(comments, post, signal);
    return (post, signal) => (
        <div>
            {tags(post, signal)}
        </div>
    );
}
export default function ({ data }: PageProps<Data>, ctx: RouteContext) {
    let empty: SupabaseClient;
    const signal = useSignal(empty);
    const { post, comments, childFunc } = data;

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
                {childFunc(post, signal)}
            </div>
        </div>
    );
}

export const handler = {
    async GET(req, ctx) {
        let resp = await supabase
            .from("users")
            .select(
                "username, posts ( title, body, category, id ), comments ( id, body, user_id,comment_id )",
            )
            .eq("posts.id", ctx.params.id)
            .is("comments.comment_id", null);
        if (!resp.data) return;
        console.log(resp.data);
        let post: Post;
        let comments: Comment[] = [];
        for (const result of resp.data) {
            for (const p of result.posts) {
                post = { username: result.username, ...p };
            }
            for (const c of result.comments) {
                comments.push({ username: result.username, ...c });
            }
        }
        let childFunc = await fillChildren(comments);
        return await ctx.render({ post, comments, childFunc });
    },
};
