import { schema, OutputType } from "./add_POST.schema";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import superjson from "superjson";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (!user) {
      throw new NotAuthenticatedError();
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const newPet = await db
      .insertInto("pets")
      .values({
        ...input,
        ownerId: user.id.toString(), // Ensure ownerId is set to the logged-in user's ID
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(newPet satisfies OutputType), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    console.error("Error adding pet:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: error instanceof NotAuthenticatedError ? 401 : 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}