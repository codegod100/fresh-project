import {
    defineRoute,
    FreshContext,
    PageProps,
    RouteContext,
} from "$fresh/server.ts";
import Reply from "../../../islands/Reply.tsx";
import { serverClient, supabase } from "../../lib.ts";
import { Signal, useSignal } from "@preact/signals";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { Tables } from "../../../types/supabase.ts";
import { getCookies } from "jsr:@std/http/cookie";
import community from "../../create/community.tsx";

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
    user: User;
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
                <a href={`/communities/${post.community}`}>
                    Community: {post.community}
                </a>
            </div>
            {
                /* <div>
                {data.user && <Reply post_id={post.id} />}
            </div> */
            }
            <div>
                <form method="POST">
                    <div>
                        <textarea
                            name="comment"
                            id="comment"
                            class="border-2 m-1 w-full h-28"
                            placeholder="Enter comment..."
                        >
                        </textarea>
                    </div>

                    <div class="mt-2">
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
            {comments.length > 0 &&
                (
                    <div>
                        <div class="mt-5 mb-1">Comments:</div>
                        {comments.map((comment) =>
                            fillElements(comment, data.user)
                        )}
                    </div>
                )}
        </div>
    );
}

function fillElements(comment: Comment, user: User) {
    return (
        <div class="pl-2 border-dotted border border-black">
            {comment.username}: {comment.body}
            <div class="mb-2">
                {user && (
                    <Reply
                        post_id={comment.post_id}
                        parent_comment_id={comment.id}
                    />
                )}
            </div>
            {comment.children?.map((comment) => (
                fillElements(comment, user)
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

        const client = serverClient(req);
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
        const record = {
            body: comment,
            user_id: user.id,
            post_id: ctx.params.id,
        };
        const { data: post, error: postError } = await client
            .from("posts")
            .select("communities(id,name)")
            .eq("id", ctx.params.id)
            .single();
        if (parent_id) {
            record["parent_comment_id"] = parent_id;
        }
        const result = await client
            .from("comments").insert(record)
            .single();
        console.log({ result });
        // return <script>window.location.href="/"</script>;
        // return <div>Whatttt</div>;
        // return await ctx.render();
        const headers = new Headers();
        headers.set(
            "location",
            `/communities/${post.communities.name}/${ctx.params.id}`,
        );
        return new Response(null, {
            status: 303, // See Other
            headers,
        });
    },
    async GET(req: Request, ctx: FreshContext) {
        const client = serverClient(req);
        const { data: userData, error: userError } = await client.auth
            .getUser();
        const { data, error } = await client
            .from("posts")
            .select(
                "title, body, category, id, comments(id, created_at, body, parent_comment_id, users(username)), users(username, id), communities(id,name)",
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
            community: data.communities.name,
            community_id: data.communities.id,
        };
        return ctx.render({
            user: userData.user,
            post,
            comments: base_comments,
            signal: ctx.state.signal,
        });
    },
};
