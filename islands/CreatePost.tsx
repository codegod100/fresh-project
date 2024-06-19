import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";

interface SupaConfig {
    supabase_url: string;
    anon_key: string;
}
export default function (props: SupaConfig) {
    const supabase = createClient(
        props.supabase_url,
        props.anon_key,
    );
    const processForm = async (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        const title = form.get("title");
        const body = form.get("body");
        let userResp = await supabase.auth.getUser();
        console.log({ userResp });
        let dataResp = await supabase
            .from("users")
            .select()
            .eq("user_id", userResp.data.user?.id)
            .single();
        console.log({ dataResp });
        let insertResp = await supabase
            .from("posts")
            .insert({ title, body, user_id: dataResp.data.id })
            .select()
            .single();
        console.log({ insertResp });
        const id = insertResp.data.id;
        window.location.href = `/posts/${id}`;
    };

    return (
        <div>
            <form onSubmit={processForm} class="max-w-sm mx-auto">
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
}
