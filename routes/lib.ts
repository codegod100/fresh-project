import { Console, Effect } from "npm:effect";
import { v4 } from "jsr:@std/uuid";
const kv = await Deno.openKv();
import { Database } from "../types/supabase.ts";

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";

import { createServerClient } from "npm:@supabase/ssr";

import { getCookies, setCookie } from "jsr:@std/http/cookie";

const supabase_url = Deno.env.get("SUPABASE_URL") as string;
const anon_key = Deno.env.get("ANON_KEY") as string;
export const supabase = createClient<Database>(
    supabase_url,
    anon_key,
);

export async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
}

export type User = {
    id: string;
    username: string;
    email?: string;
    buffer?: ArrayBuffer;
};

export type Session = {
    id: string;
    user: User;
};

export type Post = {
    user: User;
    title: string;
    body: string;
    tags?: string[];
    replies?: Post[];
};

export function createSession(user: User): Effect.Effect<Session, Error> {
    const uuid = crypto.randomUUID();
    const session: Session = { id: uuid, user };
    return Effect.tryPromise(async () => {
        await kv.set(["session", uuid], session);
        return session;
    });
}
export function userBySession(session_id: string): Effect.Effect<User, Error> {
    return Effect.tryPromise(async () => {
        const s = await kv.get(["session", session_id]);
        return s.value.user;
    });
}
export function savePost(post: Post): Effect.Effect<Post, Error> {
    return Effect.tryPromise(async () => {
        await kv.set(["posts", post.user.username, post.title], post);
        const s = await kv.get(["posts", post.user.username]);
        let posts = s.value as Post[];
        if (!posts) {
            posts = [];
        }
        posts = Array.from(posts);
        posts.push(post);
        await kv.set(["posts", post.user.username], posts);
        return post;
    });
}

export function getPostsByUser(username: string): Effect.Effect<Post[], Error> {
    return Effect.tryPromise(async () => {
        const s = await kv.get(["posts", username]);
        let posts = s.value as Post[];
        if (!posts) {
            posts = [];
        }
        posts = posts.filter((obj1, i, arr) =>
            arr.findIndex((obj2) =>
                JSON.stringify(obj2) === JSON.stringify(obj1)
            ) === i
        );
        return Array.from(posts);
    });
}
// export function getUser(username: string): Effect.Effect<User, Error> {
//     return Effect.tryPromise(async () => {
//         const s = await kv.get(["users", username]);
//         return s.value as User;
//     });
// }

export function saveUser(user: User): Effect.Effect<User, Error> {
    return Effect.tryPromise(async () => {
        await kv.set(["users", user.username], user);
        return user;
    });
}

interface Cookie {
    name: string;
    value: string;
}
export function serverClient(req: Request) {
    const cookies = getCookies(req.headers);
    const supabase_url = Deno.env.get("SUPABASE_URL") as string;
    const anon_key = Deno.env.get("ANON_KEY") as string;
    // console.log({ cookies });
    const allCookies: Cookie[] = [];
    for (const cookie in cookies) {
        allCookies.push({ name: cookie, value: cookies[cookie] });
    }
    function getAllCookies(): Promise<Cookie[]> {
        return new Promise((resolve) => {
            // console.log({ allCookies });
            resolve(allCookies);
        });
    }
    return createServerClient<Database>(supabase_url, anon_key, {
        cookies: {
            getAll: getAllCookies,
            setAll: (cookies) => {
                console.log({ cookies });
            },
        },
    });
}

export function redirect(path: string) {
    const headers = new Headers();
    headers.set("location", path);
    return new Response(null, {
        status: 303, // See Other
        headers,
    });
}
