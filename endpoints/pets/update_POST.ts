import { schema, OutputType } from "./update_POST.schema";
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
    const { id, ...updateData } = schema.parse(json);

    // First, verify the pet exists and belongs to the user
    const pet = await db
      .selectFrom("pets")
      .select("ownerId")
      .where("id", "=", id)
      .executeTakeFirst();

    if (!pet) {
      return new Response(superjson.stringify({ error: "Pet not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (pet.ownerId !== user.id.toString()) {
      return new Response(superjson.stringify({ error: "You are not authorized to update this pet" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If authorized, perform the update
    const updatedPet = await db
      .updateTable("pets")
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(updatedPet satisfies OutputType), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error updating pet:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: error instanceof NotAuthenticatedError ? 401 : 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}