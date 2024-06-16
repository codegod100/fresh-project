export default function Home() {
  return (
    <div>
      <h1>{Deno.env.get("SITE_NAME")}</h1>
      <div>
        <h2>Recent Posts</h2>
      </div>
    </div>
  );
}

export const handler = {
  async GET({ cookies }: Request, ctx) {
  },
};
