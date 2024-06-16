import { PageProps } from "$fresh/server.ts";
import { getPostsByUser, Post, User } from "../lib.ts";
import { Effect } from "npm:effect";

type Result = {
    posts: Post[];
};
export default function ShowPosts(props: PageProps<Result>) {
    console.log({ what: props.data.posts });
    const posts = props.data.posts.map((post) => (
        <div>{JSON.stringify(post)}</div>
    ));
    return (
        <div>
            Posts
            <div>{posts}</div>
        </div>
    );
}

export const handler = {
    async GET(req, ctx) {
        const user = ctx.state.user as User;
        console.log({ list_post_user: user });
        const posts = await Effect.runPromise(getPostsByUser(user.username));
        console.log({ posts });
        return ctx.render({ posts });
    },
};
