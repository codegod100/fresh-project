import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { PostgrestSingleResponse } from "npm:@supabase/postgrest-js";
import { JSXInternal } from "https://esm.sh/v128/preact@10.19.6/src/jsx.d.ts";
import { h } from "preact";
const supabase_url = Deno.env.get("SUPABASE_URL") as string;
const anon_key = Deno.env.get("ANON_KEY") as string;
const supabase = createClient(
    supabase_url,
    anon_key,
);
interface Comment {
    id: number;
    body: string;
    // username: string;
    comment_id?: number;
    children: Comment[];
}

async function fillChildren(comments: Comment[]) {
    for (const comment of comments) {
        comment.children = [];
        const resp = await supabase
            .from("comments")
            .select()
            .eq("comment_id", comment.id);
        if (resp.error) {
            return;
        }
        for (const c of resp.data) {
            comment.children.push(c);
        }
        await fillChildren(comment.children);
    }
    function childTags(children: Comment[]) {
        return children.map((child) => {
            return (
                <div>{child.id} {child.body} {childTags(child.children)}</div>
            );
        });
    }
    const tags = comments.map((comment) => {
        const children = childTags(comment.children);
        return <div>{comment.id} {comment.body} {children}</div>;
    });
    console.log({ tags });
    return (
        <div>
            {tags}
        </div>
    );
}

export default async function () {
    const rep: PostgrestSingleResponse<Comment[]> = await supabase
        .from("comments")
        .select()
        .is("comment_id", null);
    const comments = rep.data;
    if (!comments) return;
    const children = await fillChildren(comments);

    return children;
}
