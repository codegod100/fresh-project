import { defineRoute } from "$fresh/server.ts";
import Reply from "../../islands/Reply.tsx";
import { supabase } from "../lib.ts";
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
export default defineRoute(async (req, ctx) => {
    let resp = await supabase
        .from("users")
        .select(
            "username, posts ( title, body, category, id ), comments ( body )",
        )
        .eq("posts.id", ctx.params.id);

    console.log(resp);

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

    console.log({ comments });
    console.log(post);
    return (
        <div class="mb-2">
            <div>
                Title: <a href={`/posts/${post.id}`}>{post.title}</a>
                {post.category && <span>[{post.category}]</span>}
            </div>
            <div>Body: {post.body}</div>
            <div>User: {post.username}</div>
            <div>
                <Reply />
            </div>
            <div>
                <div class="mt-5">Comments:</div>
                {comments.map((comment) => (
                    <div>
                        <div>Body: {comment.body}</div>
                        <div>User: {comment.username}</div>
                        <div>
                            <Reply />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
