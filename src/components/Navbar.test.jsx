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
    expect(screen.getByText("Get started")).toBeInTheDocument();
  });

  it("shows the signed in user and logout action for authenticated users", () => {
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
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Wallet")).toBeInTheDocument();
  });
});
