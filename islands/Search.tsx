import { Signal, signal, useSignal } from "@preact/signals";
import { Database, Tables } from "../types/supabase.ts";
import { JSXInternal } from "https://esm.sh/v128/preact@10.19.6/src/jsx.d.ts";
import Results from "../components/Results.tsx";

export default function (props) {
    const sig = signal(<div></div>);
    async function search() {
        const search = document.getElementById("search");
        const term = search.value;
        const resp = await fetch("/search", {
            method: "post",
            body: JSON.stringify({ term }),
        });
        const result = await resp.json();
        console.log({ result });
        sig.value = result.map((entry) => (
            <div>
                <a
                    href={`/communities/${entry.community_name}/${entry.id}`}
                >
                    Title: {entry.title}; Body: {entry.body}
                </a>
            </div>
        ));
        if (result.length === 0) {
            sig.value = <div>No results found</div>;
        }
        console.log(sig.value);
    }

    return (
        <div class="p-2">
            <form onSubmit={search}>
                <input
                    class="input border"
                    type="search"
                    id="search"
                    incremental
                    onSearch={search}
                />
                <button
                    class="ml-2 btn bg-blue-500 rounded py-1 px-2 text-white"
                    type="submit"
                >
                    Search
                </button>
            </form>
            <div>{sig}</div>
        </div>
    );
}
