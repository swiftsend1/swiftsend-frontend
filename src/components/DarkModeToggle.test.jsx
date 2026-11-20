import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DarkModeToggle from "./DarkModeToggle";
import { ThemeProvider } from "../theme/ThemeContext";

describe("DarkModeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("defaults to light mode and can switch to dark", () => {
    render(<ThemeProvider><DarkModeToggle /></ThemeProvider>);

    const toggle = screen.getByRole("button", { name: "Switch to dark mode" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("swiftsend-theme")).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("switches back to light mode", () => {
    localStorage.setItem("swiftsend-theme", "dark");
    render(<ThemeProvider><DarkModeToggle /></ThemeProvider>);

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toHaveAttribute("aria-pressed", "false");
    expect(localStorage.getItem("swiftsend-theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
