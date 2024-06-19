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
            .insert({ title, body, user_id: dataResp.data.id });
        console.log({ insertResp });
    };

    return (
        <div>
            <form onSubmit={processForm}>
                Title
                <input type="input" id="title" name="title"></input>
                Body
                <input type="textarea" name="body"></input>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}
