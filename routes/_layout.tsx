import { PageProps } from "$fresh/server.ts";

export default function ({ Component, state }: PageProps) {
    return (
        <div class="layout">
            <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                <a href="/">{Deno.env.get("SITE_NAME")}</a>
            </h1>
            <Component />
        </div>
    );
}
