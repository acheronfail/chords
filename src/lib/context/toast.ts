import { getContext, setContext } from "svelte";
import { createToaster } from "@skeletonlabs/skeleton-svelte";

const key = {};

export interface Context {
  toaster: ReturnType<typeof createToaster>;
}

export function getToaster(): Context {
  return getContext(key);
}

export function initToasterContext() {
  setContext(key, {
    toaster: createToaster({
      placement: "bottom-start",
      pauseOnPageIdle: true,
    }),
  } satisfies Context);
}
