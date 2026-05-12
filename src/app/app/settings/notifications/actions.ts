"use server";

import { revalidatePath } from "next/cache";
import { setCadence } from "@/lib/preferences";
import type { Cadence } from "@/lib/db/schema";

export async function updateCadenceAction(cadence: Cadence) {
  await setCadence(cadence);
  revalidatePath("/app/settings/notifications");
}
