import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImageUploadField } from "./ImageUploadField";

const mocks = vi.hoisted(() => ({
  errorToast: vi.fn(),
  successToast: vi.fn(),
  post: vi.fn()
}));

vi.mock("sonner", () => ({
  toast: { error: mocks.errorToast, success: mocks.successToast }
}));

vi.mock("../../lib/api", () => ({
  api: { post: mocks.post },
  apiErrorMessage: (_error: unknown, fallback: string) => fallback
}));

describe("ImageUploadField", () => {
  it("rejects unsupported file types before uploading", () => {
    const { container } = render(
      <ImageUploadField label="Profile image" value={[]} onChange={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(["content"], "profile.gif", { type: "image/gif" })] }
    });
    expect(mocks.errorToast).toHaveBeenCalledWith(
      "profile.gif: only JPEG, PNG and WebP images are allowed."
    );
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it("removes an uploaded preview", () => {
    const onChange = vi.fn();
    render(
      <ImageUploadField
        label="Campaign image"
        value={["https://example.com/image.jpg"]}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove image 1" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
