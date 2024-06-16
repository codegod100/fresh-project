import { Console, Effect } from "npm:effect";
import { v4 } from "jsr:@std/uuid";
const kv = await Deno.openKv();

export type User = {
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
        return post;
    });
}
export function getUser(username: string): Effect.Effect<User, Error> {
    return Effect.tryPromise(async () => {
        const s = await kv.get(["users", username]);
        return s.value as User;
    });
}

export function saveUser(user: User): Effect.Effect<User, Error> {
    return Effect.tryPromise(async () => {
        await kv.set(["users", user.username], user);
        return user;
    });
}