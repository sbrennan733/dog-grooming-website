"use client";

import Link from "next/link";
import {
  consentSections,
  photoConsentOptions,
  requiredStatementIds,
  termsPoints,
  type PhotoConsent,
} from "@/data/consent";
import { businessInfo } from "@/data/business";
import { inputClassName, labelClassName } from "@/components/ui/form-styles";

export interface ConsentFormValue {
  agreedStatementIds: string[];
  photoPermission: PhotoConsent | "";
  signedName: string;
}

export const emptyConsent: ConsentFormValue = {
  agreedStatementIds: [],
  photoPermission: "",
  signedName: "",
};

// What still needs doing before the booking can be confirmed.
// Joins the to-do list into a sentence: "a, b and c".
export function describeProblems(problems: string[]): string {
  if (problems.length <= 1) {
    return problems.join("");
  }
  return `${problems.slice(0, -1).join(", ")} and ${problems[problems.length - 1]}`;
}

export function consentProblems(value: ConsentFormValue): string[] {
  const problems: string[] = [];

  const missing = requiredStatementIds.filter(
    (id) => !value.agreedStatementIds.includes(id)
  ).length;
  if (missing > 0) {
    problems.push(
      missing === 1 ? "tick the remaining box" : `tick the remaining ${missing} boxes`
    );
  }
  if (!value.photoPermission) {
    problems.push("choose a photo option");
  }
  if (value.signedName.trim().length < 2) {
    problems.push("type your name to sign");
  }

  return problems;
}

interface ConsentStepProps {
  value: ConsentFormValue;
  onChange: (value: ConsentFormValue) => void;
}

export default function ConsentStep({ value, onChange }: ConsentStepProps) {
  function toggleStatement(id: string, checked: boolean) {
    onChange({
      ...value,
      agreedStatementIds: checked
        ? [...value.agreedStatementIds, id]
        : value.agreedStatementIds.filter((existing) => existing !== id),
    });
  }

  const checkboxLabel =
    "flex cursor-pointer items-start gap-3 rounded-xl p-2 text-sm text-ink hover:bg-surface-alt";

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        Please read the terms and tick every box. Your answers are saved with
        your booking, and {businessInfo.name} keeps a signed copy for the
        visit.{" "}
        <Link
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-brand hover:underline"
        >
          Open the terms in a new tab
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </p>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-3 text-lg text-ink">Terms and conditions</h3>

        <dl className="space-y-3 text-sm">
          {termsPoints.map((point) => (
            <div key={point.heading}>
              <dt className="font-semibold text-ink">{point.heading}</dt>
              <dd className="text-muted">{point.text}</dd>
            </div>
          ))}
        </dl>
      </div>

      {consentSections.map((section) => (
        <fieldset key={section.heading}>
          <legend className="mb-2 text-lg text-ink">{section.heading}</legend>

          <div className="space-y-1">
            {section.statements.map((statement) => (
              <label key={statement.id} className={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={value.agreedStatementIds.includes(statement.id)}
                  onChange={(event) =>
                    toggleStatement(statement.id, event.target.checked)
                  }
                  className="mt-1 shrink-0"
                />
                <span>{statement.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset>
        <legend className="mb-1 text-lg text-ink">
          Photography and social media
        </legend>
        <p className="mb-2 text-sm text-muted">Please choose one.</p>

        <div className="space-y-1">
          {(Object.keys(photoConsentOptions) as PhotoConsent[]).map((option) => (
            <label key={option} className={checkboxLabel}>
              <input
                type="radio"
                name="photo-permission"
                value={option}
                checked={value.photoPermission === option}
                onChange={() => onChange({ ...value, photoPermission: option })}
                className="mt-1 shrink-0"
              />
              <span>{photoConsentOptions[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="consent-signature" className={labelClassName}>
          Signature
        </label>

        <input
          id="consent-signature"
          type="text"
          autoComplete="name"
          maxLength={100}
          value={value.signedName}
          onChange={(event) =>
            onChange({ ...value, signedName: event.target.value })
          }
          aria-describedby="consent-signature-help"
          className={inputClassName}
        />

        <p id="consent-signature-help" className="mt-1 text-sm text-muted">
          Type your full name. By typing it you are signing this form
          electronically.
        </p>
      </div>
    </div>
  );
}
