import { Signal, signal, useSignal } from "@preact/signals";
import { Database, Tables } from "../types/supabase.ts";
import { JSXInternal } from "https://esm.sh/v128/preact@10.19.6/src/jsx.d.ts";
import Results from "../components/Results.tsx";

export default function (props) {
    const testing = signal(<div></div>);
    async function search(event) {
        console.log("searching");
        event.preventDefault();
        const term = document.getElementById("search").value;
        console.log({ term });
        const { client } = props;
        const { data, error } = await client.value.from("posts")
            .select()
            .textSearch(
                "body",
                term,
            );
        console.log(data, error);
        const r = data.map((post) => (
            <div>
                <div>Title:{post.title}</div>
                <div>Body: {post.body}</div>
            </div>
        ));
        testing.value = r;
        if (r.length === 0) {
            testing.value = <div>No results</div>;
        }
    }
    return (
        <div>
            <form onSubmit={search}>
                <input
                    type="search"
                    id="search"
                    incremental
                    onSearch={search}
                />
                <button type="submit">Search</button>
            </form>
            <div id="results">{testing}</div>
        </div>
    );
}
