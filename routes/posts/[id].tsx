import {
    defineRoute,
    FreshContext,
    PageProps,
    RouteContext,
} from "$fresh/server.ts";
import Reply from "../../islands/Reply.tsx";
import { serverClient, supabase } from "../lib.ts";
import { Signal, useSignal } from "@preact/signals";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { Tables } from "../../types/supabase.ts";
import { getCookies } from "jsr:@std/http/cookie";

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
    signal: Signal;
}

export default function ({ data }: PageProps<Data>) {
    const { post, comments, signal } = data;

    return (
        <div class="mb-2">
            <div>
                Title: <a href={`/posts/${post.id}`}>{post.title}</a>
                {post.category && <span>[{post.category}]</span>}
            </div>
            <div>Body: {post.body}</div>
            <div>User: {post.username}</div>
            <div>
                <Reply post_id={post.id} />
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
        <div class="pl-2 border-dotted border border-black">
            {comment.username}: {comment.body}
            <div class="mb-2">
                <Reply
                    post_id={comment.post_id}
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
    async POST(req: Request, ctx: FreshContext) {
        const form = await req.formData();
        const comment = form.get("comment");
        const parent_id = form.get("parent_id");
        const cookies = getCookies(req.headers);

        const client = serverClient(cookies);
        let { data, error } = await client.auth.getUser();
        if (error) {
            throw error;
        }
        let { data: user, error: error2 } = await client.from("users").select()
            .eq(
                "user_id",
                data.user.id,
            ).single();
        if (error2) {
            throw error2;
        }
        const result = await client
            .from("comments").insert({
                body: comment,
                user_id: user.id,
                post_id: ctx.params.id,
                parent_comment_id: parent_id,
            })
            .single();
        console.log({ result });
        // return <script>window.location.href="/"</script>;
        // return <div>Whatttt</div>;
        // return await ctx.render();
        const headers = new Headers();
        headers.set("location", `/posts/${ctx.params.id}`);
        return new Response(null, {
            status: 303, // See Other
            headers,
        });
    },
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

        if (error) throw error;
        if (!data) return;
        if (!data.users) return;
        const comments = data.comments;
        const base_comments = comments.filter((c) => !c.parent_comment_id);
        for (const c of comments) {
            c.post_id = data.id;
            c.username = c.users.username;
            fillChildren(c, comments);
        }
        const post = {
            id: data.id,
            title: data.title,
            category: data.category,
            body: data.body,
            username: data.users.username,
        };
        return ctx.render({
            post,
            comments: base_comments,
            signal: ctx.state.signal,
        });
    },
};
