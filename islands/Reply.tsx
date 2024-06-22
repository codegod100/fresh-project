import { useSignal } from "@preact/signals";
import { SupabaseClient } from "npm:@supabase/supabase-js";
import { Signal } from "@preact/signals";
interface ReplyProps {
    client: Signal<SupabaseClient>;
    post_id: number;
    parent_comment_id?: number;
}
export default function (props: ReplyProps) {
    const client = props.client.value;
    async function submitComment() {
        const comment = document.getElementById(
            "comment",
        ) as HTMLTextAreaElement;
        if (!comment) throw "fatal";
        setTimeout(() => comment.focus(), 100);
        // comment.focus();
        const body = comment.value;
        const user = await client.auth.getUser();
        console.log({ user });
        const user_id = user.data.user?.id;
        const u = await client
            .from("users")
            .select()
            .eq("user_id", user_id)
            .single();
        await client
            .from("comments").insert({
                body,
                user_id: u.data.id,
                post_id: props.post_id,
                parent_comment_id: props.parent_comment_id,
            })
            .single();
        comment.hidden = true;
        window.location.reload();
    }
    const clicked = useSignal(false);
    function showReply(event) {
        event.preventDefault();

        clicked.value = true;
        setTimeout(() => {
            const comment = document.getElementById(
                "comment",
            );
            comment.focus();
        }, 100);
    }

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
                        <textarea id="comment" class="border w-full h-28">
                        </textarea>
                        <button onClick={submitComment}>Submit</button>
                    </div>
                )}
            </div>
        </div>
    );
}
