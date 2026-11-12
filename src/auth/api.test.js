import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

import { apiUrl, getApiErrorMessage, isDuplicateRegistrationError } from "./api";

describe("auth api helpers", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  describe("apiUrl", () => {
    it("prefixes relative paths with the configured API base", () => {
      expect(apiUrl("/auth/login/")).toContain("/auth/login/");
    });

    it("returns absolute urls untouched", () => {
      expect(apiUrl("https://auth.example.com/login")).toBe("https://auth.example.com/login");
    });
  });

  describe("isDuplicateRegistrationError", () => {
    it("detects duplicate account messages", () => {
      expect(isDuplicateRegistrationError({ detail: "User with this email already exists." })).toBe(true);
      expect(isDuplicateRegistrationError({ detail: ["Username is already taken"] })).toBe(true);
    });

    it("does not flag unrelated errors", () => {
      expect(isDuplicateRegistrationError({ detail: "Invalid credentials" })).toBe(false);
    });
  });

  describe("getApiErrorMessage", () => {
    it("maps duplicate registration errors to a friendly message", () => {
      expect(getApiErrorMessage({ detail: "Username is already taken" }, "fallback")).toBe(
        "This email is already registered. Try logging in instead.",
      );
    });

    it("falls back when there is no message", () => {
      expect(getApiErrorMessage({}, "fallback")).toBe("fallback");
    });
  });
});
