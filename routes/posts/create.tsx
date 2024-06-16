import { Post, savePost, User } from "../lib.ts";
import { Effect } from "npm:effect";
export default function CreatePost() {
    return (
        <div>
            <form method="POST">
                Title
                <input type="input" name="title"></input>
                Body
                <input type="textarea" name="body"></input>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export const handler = {
    async GET(req, ctx) {
        const user = ctx.state.user;
        console.log({ user });
        return ctx.render();
    },
    async POST(req: Request, ctx) {
        const form = await req.formData();
        const title = form.get("title") as string;
        const body = form.get("body") as string;
        const user = ctx.state.user as User;
        const post = { user, title, body } as Post;
        await Effect.runPromise(savePost(post));
        return new Response("", {
            status: 307,
            headers: { Location: `/posts/${user.username}` },
        });
    },
};
