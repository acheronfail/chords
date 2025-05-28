import { describe, test, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import Page from "./+page.svelte";

describe("/+page.svelte", () => {
  test("should render grid", () => {
    render(Page);
    expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(1);
  });
});
