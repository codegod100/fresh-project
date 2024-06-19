import { useSignal } from "@preact/signals";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { Signal } from "@preact/signals";
interface ReplyProps {
    client: Signal<SupabaseClient>;
    post_id: number;
}
export default function (props: ReplyProps) {
    console.log({ props });
    const client = props.client.value;
    async function submitComment() {
        const user = await client.auth.getUser();
        console.log({ user });
        const user_id = user.data.user?.id;
        const u = await client
            .from("users")
            .select()
            .eq("user_id", user_id)
            .single();
        console.log({ u });
        const resp = await client
            .from("comments").insert({
                body: "test",
                user_id: u.data.id,
                post_id: props.post_id,
            })
            .single();
        console.log({ resp });
    }
    let clicked = useSignal(false);
    function showReply() {
        clicked.value = true;
    }
    const post = (
        <div>
        </div>
    );
    return (
        <div>
            <div id="response">
                <div>
                    <button onClick={showReply}>Reply</button>
                </div>
            </div>
            <div>
                {clicked.value && (
                    <div>
                        <textarea class="border"></textarea>
                        <button onClick={submitComment}>Submit</button>
                    </div>
                )}
            </div>
        </div>
    );
}
