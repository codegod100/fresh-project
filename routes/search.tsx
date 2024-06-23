import { FreshContext, PageProps } from "$fresh/server.ts";
import { supabase } from "./lib.ts";

export default function (props) {
    return (
        <div>
            {props.data.results.map((post) => (
                <div>
                    {post.title} {post.body}
                </div>
            ))}
        </div>
    );
}

export const handler = {
    async GET(req, ctx: FreshContext) {
        const url = new URL(req.url);
        const query = url.searchParams.get("q") || "";
        const { data, error } = await supabase.from("posts")
            .select()
            .textSearch(
                "body",
                query,
            );
        if (error) {
            throw error;
        }
        console.log({ data });
        return ctx.render({ results: data, query });
    },
};
