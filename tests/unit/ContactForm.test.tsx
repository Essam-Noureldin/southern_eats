/**
 * WHAT: Unit tests for components/forms/ContactForm.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - renders Name / Email / Message / Send (a11y label assoc)
 *       - hidden honeypot input present (off-screen)
 *       - submits a JSON POST to /api/contact with the typed values
 *         plus renderedAt and the honeypot field name
 *       - shows a friendly success message on 200 ok response
 *       - shows a friendly error message on non-2xx
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "@/components/forms/ContactForm";
import { getHoneypotFieldName } from "@/lib/honeypot";

describe("ContactForm — structure", () => {
  it("renders fields for Name, Email, Message and a Send button", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^message$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("includes a hidden honeypot field with the policy field name", () => {
    const { container } = render(<ContactForm />);
    const hp = container.querySelector(
      `input[name="${getHoneypotFieldName()}"]`,
    );
    expect(hp).not.toBeNull();
    // tabIndex -1 keeps it out of the keyboard tab order
    expect(hp?.getAttribute("tabindex")).toBe("-1");
  });
});

describe("ContactForm — submission", () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("posts JSON to /api/contact and shows success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/^name$/i), "Karen H.");
    await user.type(screen.getByLabelText(/^email$/i), "karen@example.com");
    await user.type(
      screen.getByLabelText(/^message$/i),
      "Hello from Karen — thank you for the shrimp.",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect((init as RequestInit).method).toBe("POST");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.name).toBe("Karen H.");
    expect(body.email).toBe("karen@example.com");
    expect(body.message).toContain("Hello from Karen");
    expect(typeof body.renderedAt).toBe("number");
    expect(body[getHoneypotFieldName()]).toBe("");

    expect(
      await screen.findByText(/got it.*thanks/i),
    ).toBeInTheDocument();
  });

  it("shows an error message when the API responds non-ok", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ ok: false, error: "Too many requests" }),
    } as Response);
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/^name$/i), "Bill");
    await user.type(screen.getByLabelText(/^email$/i), "bill@x.com");
    await user.type(
      screen.getByLabelText(/^message$/i),
      "Just hello — short",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(
      await screen.findByText(/something went wrong|try again/i),
    ).toBeInTheDocument();
  });
});
