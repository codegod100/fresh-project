import { PageProps } from "$fresh/server.ts";
import Yolo from "../../islands/Yolo.tsx";
const kv = await Deno.openKv();
const prefs = {
  username: "ada",
  theme: "dark",
  language: "en-US",
};

const result = await kv.set(["preferences", "ada"], prefs);
const pdata = await kv.get(["preferences", "ada"]);
// import { Database } from "jsr:@db/sqlite@0.11";

// const db = new Database("test.db");

// const [version] = db.prepare("select sqlite_version()").value<[string]>()!;
// console.log({ version });

// db.close();
export default function Greet(props: PageProps) {
  console.log({ result });
  return (
    <div>
      Hello {props.params.name}
      <div>
        <Yolo name={pdata.value.username}></Yolo>
      </div>
      <div>
        <form method="POST">
          New name: <input class="input" name="name" type="text"></input>
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}

export const handler = {
  async POST(req, ctx) {
    const form = await req.formData();
    const name = form.get("name");
    const data = await kv.get(["preferences", name]);
    if (data?.value?.score) {
      console.log("got score", data.value.score);
    } else {
      const encoder = new TextEncoder();
      const view = encoder.encode("€");
      await kv.set(["preferences", name], { score: "amazing", view });
    }
    // const headers = new Headers();
    console.log({ name });
    return new Response("Thanks for your data");
  },
};
