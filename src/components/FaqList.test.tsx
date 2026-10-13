import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FaqList } from "./FaqList";

afterEach(cleanup);

describe("FaqList", () => {
  it("keeps answers in the DOM before a question is expanded", () => {
    const { container } = render(<FaqList items={[{ question: "Is it free?", answer: "Three drafts per day." }]} />);
    const details = container.querySelector("details");
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("Three drafts per day.")).toBeInTheDocument();
    expect(container.querySelector("summary")).toHaveTextContent("Is it free?");
  });
});