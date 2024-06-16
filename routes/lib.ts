import { Console, Effect } from "npm:effect";
const kv = await Deno.openKv();

export type User = {
    username: string;
    email: string;
};

export function getUser(username: string): Effect.Effect<User, Error> {
    return Effect.tryPromise(async () => {
        const s = await kv.get(["users", username]);
        return s.value as User;
    });
}

export function saveUser(user: User): Effect.Effect<User, Error> {
    return Effect.tryPromise(() => kv.set(["users", user.username], user));
}
