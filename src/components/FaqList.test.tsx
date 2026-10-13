import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FaqList } from "./FaqList";

describe("FaqList", () => {
  it("keeps answers in the DOM before a question is expanded", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(<FaqList items={[{ question: "Is it free?", answer: "Three drafts per day." }]} />);
    const details = container.querySelector("details");
    expect(details).not.toHaveAttribute("open");
    expect(container.querySelector("p")).toHaveTextContent("Three drafts per day.");
    expect(container.querySelector("summary")).toHaveTextContent("Is it free?");
  });
});