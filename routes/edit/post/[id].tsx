import { defineRoute } from "$fresh/server.ts";
import { redirect, serverClient } from "../../lib.ts";

export default defineRoute(async (req, ctx) => {
    const client = serverClient(req);
    const { data: post, error } = await client
        .from("posts")
        .select("*, communities(name)")
        .eq("id", ctx.params.id)
        .single();
    return (
        <div>
            <form method="post" class="max-w-sm mx-auto">
                <input
                    type="hidden"
                    name="community"
                    value={post!.communities!.name!}
                />
                <input type="hidden" name="post_id" value={post!.id} />
                <div class="mb-5">
                    <label
                        for="title"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Post title"
                        required
                        value={post!.title!}
                    />
                </div>
                <div class="mb-5">
                    <label
                        for="body"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Body
                    </label>
                    <textarea
                        name="body"
                        id="message"
                        rows={4}
                        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Leave a comment..."
                        value={post!.body!}
                    >
                    </textarea>
                </div>

                <button
                    type="submit"
                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Submit
                </button>
            </form>
        </div>
    );
});

export const handler = {
    async POST(req: Request, ctx) {
        const form = await req.formData();
        const title = form.get("title") as string;
        const body = form.get("body") as string;
        const community = form.get("community") as string;
        const post_id = form.get("post_id") as string;
        const client = serverClient(req);

        const res = await client
            .from("posts")
            .update({ title, body })
            .eq("id", ctx.params.id)
            .select();
        console.log({ res }, ctx.params.id, body);
        return redirect(`/communities/${community}/${post_id}`);
    },
};
