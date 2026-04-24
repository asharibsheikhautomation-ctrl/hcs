"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AdminField, AdminInput } from "@/components/admin/form-primitives";

interface AdminImageUploadFieldProps {
  label: string;
  previewAlt: string;
  uploadName: string;
  urlName: string;
  defaultUrl?: string;
  error?: string;
  hint?: string;
}

export function AdminImageUploadField({
  label,
  previewAlt,
  uploadName,
  urlName,
  defaultUrl = "",
  error,
  hint,
}: AdminImageUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState(defaultUrl);
  const previewLabel = useMemo(
    () => (previewUrl ? "Image preview" : "No image selected"),
    [previewUrl],
  );

  useEffect(() => {
    setPreviewUrl(defaultUrl);
  }, [defaultUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <AdminField
      label={label}
      error={error}
      hint={hint ?? "Upload an image or paste an existing URL."}
    >
      <div className="grid gap-4 md:grid-cols-[8rem_1fr]">
        <div className="relative overflow-hidden rounded-[1.4rem] border border-black/8 bg-surface-muted aspect-square">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={previewAlt}
              fill
              unoptimized
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-700/45">
              {previewLabel}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <AdminInput
            type="file"
            name={uploadName}
            accept="image/*"
            className="cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-cheese-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-950"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];

              setPreviewUrl((currentValue) => {
                if (currentValue.startsWith("blob:")) {
                  URL.revokeObjectURL(currentValue);
                }

                return file ? URL.createObjectURL(file) : defaultUrl;
              });
            }}
          />

          <AdminInput
            name={urlName}
            defaultValue={defaultUrl}
            placeholder="https://..."
            onChange={(event) => {
              const nextValue = event.currentTarget.value.trim();

              setPreviewUrl((currentValue) => {
                if (currentValue.startsWith("blob:")) {
                  URL.revokeObjectURL(currentValue);
                }

                return nextValue || defaultUrl;
              });
            }}
          />
        </div>
      </div>
    </AdminField>
  );
}
