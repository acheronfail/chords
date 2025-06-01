// Based on: https://github.com/Rich-Harris/local-storage-test/blob/main/src/lib/storage.svelte.ts

import { tick } from "svelte";
import { z } from "zod/v4";

export type StorageType = "localStorage" | "sessionStorage";
export interface Options<T> {
  key: string;
  initialise: () => T;
  schema?: z.ZodType<T>;
  storageType?: StorageType;
}

export class PersistentState<T> {
  #key: string;
  #schema?: z.ZodType<T>;
  #version = $state(0);
  #listeners = 0;
  #initialise: () => T;
  #value: T;
  #storage: Storage;

  #handler = (e: StorageEvent) => {
    if (e.storageArea !== this.#storage) return;
    if (e.key !== this.#key) return;

    this.#version += 1;
  };

  constructor({ key, initialise, schema, storageType = "localStorage" }: Options<T>) {
    this.#key = key;
    this.#schema = schema;
    this.#initialise = initialise;
    this.#value = initialise();
    this.#storage = storageType === "localStorage" ? localStorage : sessionStorage;

    if (typeof this.#storage !== "undefined") {
      if (this.#storage.getItem(key) === null) {
        this.#storage.setItem(key, JSON.stringify(this.#value));
      }
    }
  }

  #read(): T {
    if (typeof this.#storage === "undefined") {
      return this.#value;
    }

    const stored = this.#storage.getItem(this.#key);
    if (stored === null) {
      return this.#value;
    }

    let value = this.#value;
    try {
      value = JSON.parse(stored);
    } catch (error) {
      console.warn("failed to read value", { error, key: this.#key });
      this.reset();
    }

    if (this.#schema) {
      const result = this.#schema.safeParse(value);
      if (result.success) {
        value = result.data;
      } else {
        console.warn("failed to validate value", { error: result.error, value });
        this.reset();
      }
    }

    return value;
  }

  #write(value: T) {
    if (typeof this.#storage === "undefined") {
      return;
    }

    if (this.#schema) {
      const result = this.#schema.safeParse(value);
      if (result.success) {
        value = result.data;
      } else {
        console.warn("failed to validate value", { error: result.error, value });
        return;
      }
    }

    this.#storage.setItem(this.#key, JSON.stringify(value));
  }

  reset() {
    this.current = this.#initialise();
    if (typeof this.#storage !== "undefined") {
      this.#storage.removeItem(this.#key);
    }
  }

  get current(): T {
    this.#version;

    const root = this.#read();

    if ($effect.tracking()) {
      $effect(() => {
        if (this.#listeners === 0) {
          window.addEventListener("storage", this.#handler);
        }

        this.#listeners += 1;

        return () => {
          tick().then(() => {
            this.#listeners -= 1;
            if (this.#listeners === 0) {
              window.removeEventListener("storage", this.#handler);
            }
          });
        };
      });
    }

    return makeDeepProxy(
      root,
      () => this.#version,
      () => {
        this.#version += 1;
        this.#write(root);
      },
    );
  }

  set current(value: T) {
    this.#write(value);
    this.#version += 1;
  }
}

function makeDeepProxy(root: unknown, onRead: () => void, onWrite: () => void) {
  const proxies = new WeakMap();
  const walk = (value: unknown) => {
    if (typeof value !== "object" || value === null) {
      return value;
    }

    let p = proxies.get(value);
    if (!p) {
      p = new Proxy(value, {
        get: (target, property) => {
          onRead();
          return walk(Reflect.get(target, property));
        },
        set: (target, property, value) => {
          Reflect.set(target, property, value);
          onWrite();

          return true;
        },
      });

      proxies.set(value, p);
    }

    return p;
  };

  return walk(root);
}
