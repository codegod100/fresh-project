import { PageProps } from "$fresh/server.ts";
import { getUser, saveUser, User } from "../lib.ts";
import { Effect } from "npm:effect";

export default function Greet(props: PageProps<User>) {
  return (
    <div>
      <div>You are {props.params?.name}</div>
      {props.data.email &&
        <div>with email {props.data.email}</div>}
      <div>
        <form class="max-w-sm mx-auto" method="POST">
          <div class="mb-5">
            <label
              for="email"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="name@flowbite.com"
              required
            />
          </div>

          <button
            type="submit"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export const handler: Handlers<User> = {
  async GET(req, ctx) {
    const program = Effect.gen(function* () {
      let user = yield* getUser(ctx.params.name);
      console.log({ user });
      if (!user) {
        user = { username: ctx.params.name, email: "testing" };
        user = yield* saveUser(user);
      }
      return user;
    });

    const user = await Effect.runPromise(program);

    return ctx.render(user);
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email");
    const program = Effect.gen(function* () {
      let user = yield* getUser(ctx.params.name);
      user.email = email;
      console.log({ user });
      user = yield* saveUser(user);
      return user;
    });
    await Effect.runPromise(program);
    const headers = new Headers();
    headers.set("location", `/greet/${ctx.params.name}`);
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};
