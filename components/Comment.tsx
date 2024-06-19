import Comment from "./Comment.tsx";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";

interface CommentProp {
    comment: Comment;
    client: SupabaseClient;
}
interface Comment {
    id: number;
    body: string;
    username: string;
    comment_id?: number;
}
export default function (props: CommentProp) {
    if (props.comment.comment_id) {
        const resp = await props.client
            .from("comments")
            .select()
            .eq("id", props.comment.comment_id)
            .single();
        const comment = resp.data.comment as Comment;
        return <Comment comment={comment} client={props.client} />;
    }
    return <div>{props.comment.body}</div>;
}
