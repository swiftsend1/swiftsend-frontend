import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the brand and minimal help link", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText("SwiftSend")).toBeInTheDocument();
    expect(screen.getByText("Help centre")).toBeInTheDocument();
    expect(screen.queryByText("Send money")).not.toBeInTheDocument();
    expect(screen.queryByText("Create account")).not.toBeInTheDocument();
  });
});
