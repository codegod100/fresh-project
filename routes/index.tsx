import { FreshContext, PageProps } from "$fresh/server.ts";
import { createSession, getUser, saveUser, User } from "./lib.ts";
import { Effect } from "npm:effect";
import { Cookie, getCookies, setCookie } from "jsr:@std/http/cookie";

export default function Home(props: PageProps) {
  const user = props.state.user as User;
  const login = (
    <div>
      <form method="POST">
        <input name="username"></input>
        <button type="submit">Login</button>
      </form>
    </div>
  );
  console.log({ user: props.state.user });
  return (
    <div>
      <h1>{Deno.env.get("SITE_NAME")}</h1>
      {user && <div>Hello {user.username}</div>}
      {!user && login}
      <div>
        <h2>Recent Posts</h2>
      </div>
    </div>
  );
}

export const handler = {
  async GET(req, ctx) {
    return ctx.render();
  },
  async POST(req: Request, ctx: FreshContext) {
    const form = await req.formData();
    const username = form.get("username") as string;
    console.log({ username });
    const resp = await ctx.render();
    const program = Effect.gen(function* () {
      let user = yield* getUser(username);
      console.log({ gotuser: user });
      if (!user) {
        user = yield* saveUser({ username } as User);
        console.log({ newuser: user });
      }
      const session = yield* createSession(user);
      const cookie: Cookie = { name: "session_id", value: session.id };
      setCookie(resp.headers, cookie);
    });
    await Effect.runPromise(program);
    return resp;
  },
};
