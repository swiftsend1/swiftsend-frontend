import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicOnlyRoute from "../components/PublicOnlyRoute";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

const SESSION_KEY = "swiftsend.session";

const writeSession = (session) => {
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_KEY);
};

const SessionProbe = () => {
  const { isAuthenticated, roles, user } = useAuth();
  return (
    <div>
      <span data-testid="auth-state">{String(isAuthenticated)}</span>
      <span data-testid="auth-roles">{JSON.stringify(roles)}</span>
      <span data-testid="auth-user">{user?.email ?? "none"}</span>
    </div>
  );
};

const SignOutProbe = () => {
  const { signOut } = useAuth();
  return <button onClick={() => signOut()}>sign out</button>;
};

const AuthFetchProbe = () => {
  const { authFetch } = useAuth();
  const send = async () => {
    await authFetch("/api/withdrawals/");
  };
  return <button onClick={send}>send</button>;
};

const authenticatedSession = (roles = ["individual"]) => ({
  authenticated: true,
  accessToken: "access-token",
  refreshToken: "refresh-token",
  user: { email: "ada@example.com" },
  roles,
});

describe("AuthProvider session handling", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("starts unauthenticated when no session is stored", () => {
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth-state").textContent).toBe("false");
    expect(screen.getByTestId("auth-roles").textContent).toBe("[]");
  });

  it("reads a persisted authenticated session", () => {
    writeSession(authenticatedSession());
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth-state").textContent).toBe("true");
    expect(screen.getByTestId("auth-roles").textContent).toBe('["individual"]');
    expect(screen.getByTestId("auth-user").textContent).toBe("ada@example.com");
  });

  it("ignores persisted sessions that are not authenticated", () => {
    writeSession({ authenticated: false, accessToken: null, refreshToken: null, user: null, roles: [] });
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth-state").textContent).toBe("false");
  });

  it("clears a corrupted session", () => {
    sessionStorage.setItem(SESSION_KEY, "{not-json");
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth-state").textContent).toBe("false");
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("redirects unauthenticated users to login and remembers the destination", () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: "/wallet", state: { from: { pathname: "/wallet" } } }]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/wallet" element={<div>wallet page</div>} />
            </Route>
            <Route path="/login" element={<div>login page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("renders the protected page for an authenticated user", () => {
    writeSession(authenticatedSession());
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/wallet"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/wallet" element={<div>wallet page</div>} />
            </Route>
            <Route path="/login" element={<div>login page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(screen.getByText("wallet page")).toBeInTheDocument();
  });

  it("redirects authenticated users without the required role", () => {
    writeSession(authenticatedSession(["individual"]));
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/merchant"]}>
          <Routes>
            <Route path="/" element={<div>home page</div>} />
            <Route element={<ProtectedRoute allowedRoles={["merchant"]} />}>
              <Route path="/merchant" element={<div>merchant page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(screen.getByText("home page")).toBeInTheDocument();
  });
});

describe("PublicOnlyRoute", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders public content for unauthenticated visitors", () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<div>login page</div>} />
            </Route>
            <Route path="/" element={<div>home page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("redirects authenticated users away from login", () => {
    writeSession(authenticatedSession());
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<div>login page</div>} />
            </Route>
            <Route path="/" element={<div>home page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
    expect(screen.getByText("home page")).toBeInTheDocument();
  });
});

describe("AuthProvider auth actions", () => {
  beforeEach(() => {
    sessionStorage.clear();
    fetchMock.mockReset();
  });

  it("clears the local session after signing out", async () => {
    writeSession(authenticatedSession());
    render(
      <AuthProvider>
        <SignOutProbe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("sign out"));

    await waitFor(() => expect(sessionStorage.getItem(SESSION_KEY)).toBeNull());
  });

  it("attaches the bearer token to authenticated API requests", async () => {
    writeSession(authenticatedSession());
    render(
      <AuthProvider>
        <AuthFetchProbe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("send"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toContain("/api/");
    expect(fetchMock.mock.calls[0][1].headers.get("Authorization")).toBe("Bearer access-token");
  });
});
