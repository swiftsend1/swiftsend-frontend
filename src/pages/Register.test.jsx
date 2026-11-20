import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Register from "./Register";
import { AuthProvider } from "../auth/AuthContext";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

const renderRegister = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<div>home page</div>} />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );

const submitRegisterForm = () => {
  const form = screen.getByLabelText(/full name/i).closest("form");
  fireEvent.submit(form);
};

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText(/full name/i), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/^password/i), {
    target: { value: "Strong!pass123" },
  });
};

describe("Register page", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    sessionStorage.clear();
  });

  it("renders the account creation form", () => {
    renderRegister();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create free account/i })).toBeInTheDocument();
  });

  it("creates the account and signs the new user in", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        access: "access-token",
        refresh: "refresh-token",
        user: { email: "ada@example.com", name: "Ada Lovelace" },
        roles: ["individual"],
      }),
    });

    renderRegister();

    fillValidForm();
    submitRegisterForm();

    await waitFor(() => expect(screen.getByText("home page")).toBeInTheDocument());

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/register/"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/register/"),
      expect.objectContaining({
        body: JSON.stringify({
          name: "Ada Lovelace",
          email: "ada@example.com",
          password: "Strong!pass123",
        }),
      }),
    );

    const storedSession = JSON.parse(sessionStorage.getItem("swiftsend.session") || "null");
    expect(storedSession?.authenticated).toBe(true);
  });

  it("shows a friendly error when the email is already registered", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ detail: "An account with this email already exists." }),
    });

    renderRegister();

    fillValidForm();
    submitRegisterForm();

    await waitFor(() =>
      expect(
        screen.getByText("This email is already registered. Try logging in instead."),
      ).toBeInTheDocument(),
    );

    expect(screen.queryByText("home page")).not.toBeInTheDocument();
    expect(sessionStorage.getItem("swiftsend.session")).toBeNull();
  });
});
