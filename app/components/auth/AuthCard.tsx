"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AlertType = "success" | "error";

interface AlertItem {
  id: number;
  message: string;
  type: AlertType;
}

export default function AuthCard() {
  const router = useRouter();

  const [form, setForm] = useState<"login" | "signup">("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] =useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  function showAlert(
    message: string,
    type: AlertType = "success",
    duration = 4000
  ) {
    const id = Date.now();

    setAlerts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((x) => x.id !== id));
    }, duration);
  }

  function removeAlert(id: number) {
    setAlerts((prev) => prev.filter((x) => x.id !== id));
  }

  useEffect(() => {
    const t = setTimeout(() => {
      showAlert("Welcome to TransLingo! Please log in.");
    }, 300);

    return () => clearTimeout(t);
  }, []);

  function loginSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!loginEmail.trim()) {
      showAlert("Please enter your email.", "error");
      return;
    }

    showAlert(`Welcome back, ${loginEmail}! Redirecting...`);

    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 1200);
  }

  function signupSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !signupName.trim() ||
      !signupEmail.trim() ||
      signupPassword.length < 8
    ) {
      showAlert(
        "Please fill all fields correctly (password min 8 chars).",
        "error"
      );
      return;
    }

    showAlert(`Account created for ${signupName}! Redirecting...`);

    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 1200);
  }

  function googleAuth(action: "login" | "signup") {
    showAlert(`Google ${action} initiated.`);

    setTimeout(() => {
      showAlert(`Google ${action} successful! Redirecting...`);
    }, 800);

    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 1600);
  }

  return (
    <>
      {/* ALERT */}
      <div className="alert-container">

        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert ${alert.type}`}
          >
            <span
              className="alert-icon"
              style={{
                color:
                  alert.type === "success"
                    ? "var(--green)"
                    : "var(--red)",
              }}
            >
              <i
                className={`fas ${
                  alert.type === "success"
                    ? "fa-check-circle"
                    : "fa-times-circle"
                }`}
              />
            </span>

            <span>{alert.message}</span>

            <button
              className="alert-close"
              onClick={() => removeAlert(alert.id)}
            >
              <i className="fas fa-times" />
            </button>
          </div>
        ))}
      </div>

      {/* CARD */}
      <div className="auth-container">

        <div className="auth-brand">
          <div className="logo-icon">
            <i className="fas fa-language" />
          </div>

          <h1>TransLingo</h1>

          <p>Translation Platform · LLM Powered</p>
        </div>

        {/* Tabs */}

        <div className="auth-tabs">
          <button
            className={form === "login" ? "active" : ""}
            onClick={() => setForm("login")}
            type="button"
          >
            Login
          </button>

          <button
            className={form === "signup" ? "active" : ""}
            onClick={() => setForm("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* LOGIN */}

        {form === "login" && (
          <form
            className="auth-form active"
            onSubmit={loginSubmit}
          >
            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) =>
                  setLoginEmail(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type={
                    showLoginPassword
                      ? "text"
                      : "password"
                  }
                  className="form-control"
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(e.target.value)
                  }
                />

                <i
                  className={`fas ${
                    showLoginPassword
                      ? "fa-eye-slash"
                      : "fa-eye"
                  } toggle-password`}
                  onClick={() =>
                    setShowLoginPassword((v) => !v)
                  }
                />
              </div>
            </div>

            <div className="form-options">
              <label>
                <input
                  type="checkbox"
                  defaultChecked
                />{" "}
                Remember me
              </label>

              <a href="#">Forgot password?</a>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
            >
              <i className="fas fa-sign-in-alt" /> Log In
            </button>

            <div className="divider">
              or continue with
            </div>

            <button
              className="btn btn-google"
              type="button"
              onClick={() =>
                googleAuth("login")
              }
            >
              <i className="fab fa-google" /> Sign in
              with Google
            </button>
          </form>
        )}

        {/* SIGNUP */}

        {form === "signup" && (
          <form
            className="auth-form active"
            onSubmit={signupSubmit}
          >
            <div className="form-group">
              <label>Full Name</label>

              <input
                className="form-control"
                value={signupName}
                onChange={(e) =>
                  setSignupName(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                className="form-control"
                type="email"
                value={signupEmail}
                onChange={(e) =>
                  setSignupEmail(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  className="form-control"
                  type={
                    showSignupPassword
                      ? "text"
                      : "password"
                  }
                  value={signupPassword}
                  onChange={(e) =>
                    setSignupPassword(
                      e.target.value
                    )
                  }
                />

                <i
                  className={`fas ${
                    showSignupPassword
                      ? "fa-eye-slash"
                      : "fa-eye"
                  } toggle-password`}
                  onClick={() =>
                    setShowSignupPassword(
                      (v) => !v
                    )
                  }
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
            >
              <i className="fas fa-user-plus" /> Create
              Account
            </button>

            <div className="divider">
              or continue with
            </div>

            <button
              className="btn btn-google"
              type="button"
              onClick={() =>
                googleAuth("signup")
              }
            >
              <i className="fab fa-google" /> Sign up
              with Google
            </button>
          </form>
        )}

        <div className="auth-footer">
          {form === "login" ? (
            <>
              Don't have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setForm("signup");
                }}
              >
                Sign Up
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setForm("login");
                }}
              >
                Log In
              </a>
            </>
          )}
        </div>
      </div>
    </>
  );
}