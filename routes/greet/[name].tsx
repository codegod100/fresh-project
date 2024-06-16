import { Handlers, PageProps } from "$fresh/server.ts";
import { getUser, saveUser, User } from "../lib.ts";
import { Effect } from "npm:effect";
type Result = {
  user?: User;
  error?: string;
};
export default function Greet(props: PageProps<Result>) {
  const body = new TextDecoder().decode(props.data.user?.buffer);
  let front;
  let email;
  let buffer;
  if (props.data.error) {
    front = <div class="text-red-500">{props.data.error}</div>;
  } else {
    if (props.data.user?.email) {
      email = <div>with email {props.data.user.email}</div>;
    }
    if (props.data.user?.buffer) {
      buffer = (
        <div>
          <div>Buffer {body}</div>
          <div>
            <form method="POST">
              <input type="hidden" name="delete" value="true"></input>
              <button type="submit">Delete</button>
            </form>
          </div>
        </div>
      );
    }

    front = (
      <div>
        <div>You are {decodeURI(props.params?.name)}</div>
        {email}
        {buffer}
      </div>
    );
  }
  return (
    <div>
      {front}
      <div>
        <form
          class="max-w-sm mx-auto"
          method="POST"
          encType="multipart/form-data"
        >
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
            />
          </div>

          <label
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            for="file_input"
          >
            Upload file
          </label>
          <input
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="file_input"
            type="file"
            name="file"
          />

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

export const handler: Handlers<Result> = {
  async GET(_req, ctx) {
    const program = Effect.gen(function* () {
      const user = yield* getUser(ctx.params.name);
      return user;
    });

    try {
      const user = await Effect.runPromise(program);
      return ctx.render({ user });
    } catch (e) {
      console.log({ e });
      return ctx.render({ error: e.message });
    }
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email") as string;
    const file = form.get("file") as File;
    const del = form.get("delete");
    let buffer: ArrayBuffer;
    if (file) {
      buffer = await file.arrayBuffer();
    }
    const program = Effect.gen(function* () {
      let user = yield* getUser(ctx.params.name);
      if (!user) {
        user = { username: ctx.params.name, email };
      }
      if (email) {
        user.email = email;
      }
      if (buffer) {
        user.buffer = buffer;
      }
      if (del) {
        user.buffer = undefined;
      }
      user = yield* saveUser(user);
      return user;
    });
    try {
      const user = await Effect.runPromise(program);
      return ctx.render({ user });
    } catch (e) {
      return ctx.render({ error: e.message });
    }
  },
};
