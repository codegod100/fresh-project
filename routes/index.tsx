import { FreshContext, PageProps } from "$fresh/server.ts";
import { createSession, getUser, saveUser, supabase, User } from "./lib.ts";
import { Effect } from "npm:effect";
import { Cookie, getCookies, setCookie } from "jsr:@std/http/cookie";

export default async function Home(props: PageProps) {
  const user = props.state?.user as User;
  const login = (
    <div>
      <form method="POST">
        <input name="username"></input>
        <button type="submit">Login</button>
      </form>
    </div>
  );
  let resp = await supabase
    .from("users")
    .select("username, posts ( title, body, category,id )")
    .single();
  const posts = resp.data?.posts.map((post) => (
    <div class="mb-2">
      <div>
        Title: <a href={`/posts/${post.id}`}>{post.title}</a>{" "}
        {post.category && <span>[{post.category}]</span>}
      </div>
      <div>
        Author: {resp.data.username}
      </div>
      {/* <div>Body: {post.body}</div> */}
    </div>
  ));
  return (
    <div>
      <div>
        <h2 class="text-2xl font-extrabold dark:text-white mb-3">
          Recent Posts
        </h2>
        <div class="pl-2">
          {posts}
        </div>
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
