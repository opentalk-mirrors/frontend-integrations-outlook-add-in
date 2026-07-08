import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/testUtils";
import { FormSwitch } from "./FormSwitch";

describe("FormSwitch", () => {
  it("renders the label and reflects the flag state", () => {
    renderWithProviders(<FormSwitch label="Enable feature" flag={true} setFlag={vi.fn()} />);

    expect(screen.getByText("Enable feature")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("renders unchecked when flag is false", () => {
    renderWithProviders(<FormSwitch label="Enable feature" flag={false} setFlag={vi.fn()} />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("calls setFlag with the new value when toggled", async () => {
    const user = userEvent.setup();
    const setFlag = vi.fn();
    renderWithProviders(<FormSwitch label="Enable feature" flag={false} setFlag={setFlag} />);

    await user.click(screen.getByRole("checkbox"));

    expect(setFlag).toHaveBeenCalledTimes(1);
    expect(setFlag).toHaveBeenCalledWith(true);
  });

  it("toggles the flag when Enter is pressed", async () => {
    const user = userEvent.setup();
    const setFlag = vi.fn();
    renderWithProviders(<FormSwitch label="Enable feature" flag={true} setFlag={setFlag} />);

    const checkbox = screen.getByRole("checkbox");
    checkbox.focus();
    await user.keyboard("{Enter}");

    expect(setFlag).toHaveBeenCalledWith(false);
  });
});
