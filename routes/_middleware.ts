import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "jsr:@std/http/cookie";
import { User, userBySession } from "./lib.ts";
import { Effect } from "npm:effect";

interface State {
    data: string;
    user: User;
}

export async function handler(req: Request, ctx: FreshContext<State>) {
    const program = Effect.gen(function* () {
        const cookies = getCookies(req.headers);
        const session_id = cookies["session_id"];
        console.log({ session_id });
        if (session_id) {
            const user = yield* userBySession(session_id);
            ctx.state.user = user;
        }
    });
    await Effect.runPromise(program);
    return await ctx.next();
}
