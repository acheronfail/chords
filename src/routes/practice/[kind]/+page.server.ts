import { base } from "$app/paths";
import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export const load = ({ params }: RequestEvent) => {
  switch (params.kind) {
    case "notes":
    case "symbols":
      return;
    default:
      redirect(308, base);
  }
};
