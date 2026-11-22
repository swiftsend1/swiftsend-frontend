import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import { AuthProvider } from "../auth/AuthContext";

const renderNavbar = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Navbar />
      </MemoryRouter>
    </AuthProvider>,
  );

describe("Navbar", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("shows public navigation for unauthenticated visitors", () => {
    renderNavbar();
    expect(screen.getByText("Send money")).toBeInTheDocument();
    expect(screen.getByText("Receive money")).toBeInTheDocument();
    expect(screen.getByText("Exchange rates")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("shows only home and logout controls for authenticated users", () => {
    sessionStorage.setItem(
      "swiftsend.session",
      JSON.stringify({
        authenticated: true,
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { email: "ada@example.com", name: "Ada Lovelace" },
        roles: ["individual"],
      }),
    );

    renderNavbar();
    expect(screen.getByRole("link", { name: "Go to home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
    expect(screen.queryByText("Wallet")).not.toBeInTheDocument();
  });
});
