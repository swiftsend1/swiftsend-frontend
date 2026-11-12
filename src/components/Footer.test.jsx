import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the brand and navigation links", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText("SwiftSend")).toBeInTheDocument();
    expect(screen.getByText("Send money")).toBeInTheDocument();
    expect(screen.getByText("Receive money")).toBeInTheDocument();
    expect(screen.getByText("Exchange rates")).toBeInTheDocument();
    expect(screen.getByText("Track a transfer")).toBeInTheDocument();
    expect(screen.getByText("Help centre")).toBeInTheDocument();
    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.getByText("Create account")).toBeInTheDocument();
  });
});
