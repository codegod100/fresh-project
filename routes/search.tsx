import { defineRoute } from "$fresh/server.ts";
import { FreshContext } from "$fresh/src/server/types.ts";
import { serverClient } from "./lib.ts";

export default defineRoute((req, ctx) => {
});

export const handler = {
    async POST(req: Request, ctx: FreshContext) {
        console.log("searching");
        // const form = await req.formData();
        const struct = await req.json();
        // const term = form.get("term");
        const term = struct.term as string;
        if (!term) {
            throw "no search term";
        }
        const client = serverClient(req);
        let results: { id: number; title: string; body: string }[] = [];
        const { data: postsData, error: postsError } = await client
            .from("posts")
            .select()
            .textSearch("body", term);
        if (!postsData) {
            throw postsError;
        }
        const posts = postsData.map((post) => ({
            id: post.id as number,
            title: post.title as string,
            body: post.body as string,
        }));
        results = results.concat(posts);

        const { data: commentsData, error: commentsError } = await client
            .from("comments")
            .select("body, posts(id,title)")
            .textSearch("body", term);
        if (!commentsData) {
            throw commentsError;
        }
        const comments = commentsData.map((comment) => ({
            id: comment.posts?.id as number,
            title: comment.posts?.title as string,
            body: comment.body as string,
        }));
        results = results.concat(comments);

        return Response.json(results);
    },
};
