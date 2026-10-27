"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  fetchAvailableDates,
  fetchAvailableSlots,
  createBooking,
} from "@/app/booking/actions";
import { formatDateString } from "@/lib/format-date";
import { businessInfo } from "@/data/business";
import { priceDisclaimer } from "@/data/services";
import { CONSENT_VERSION } from "@/data/consent";
import ConsentStep, {
  consentProblems,
  describeProblems,
  emptyConsent,
  type ConsentFormValue,
} from "@/components/booking/ConsentStep";
import { dogSizeLabels, priceForDog } from "@/lib/dog-size";
import type { Dog, Service } from "@/generated/prisma/client";

interface BookingWizardProps {
  dogs: Dog[];
  services: Service[];
}

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export default function BookingWizard({ dogs, services }: BookingWizardProps) {
  const [dogId, setDogId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [consent, setConsent] = useState<ConsentFormValue>(emptyConsent);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const problems = consentProblems(consent);

  const selectedDog = dogs.find((dog) => dog.id === dogId);
  const needsAssessment = selectedDog
    ? !selectedDog.assessmentCompletedAt
    : false;

  const availableServices = selectedDog
    ? services.filter((service) => service.isAssessment === needsAssessment)
    : [];

  const selectedService = availableServices.find(
    (service) => service.id === serviceId
  );

  function handleSelectDog(newDogId: string) {
    setDogId(newDogId);
    setServiceId("");
    setDate("");
    setTime("");
    setDates([]);
    setSlots([]);
  }

  async function handleSelectService(newServiceId: string) {
    setServiceId(newServiceId);
    setDate("");
    setTime("");
    setDates([]);
    setSlots([]);

    setLoadingDates(true);
    const result = await fetchAvailableDates(newServiceId);
    setLoadingDates(false);
    setDates(result);
  }

  async function handleDateChange(newDate: string) {
    setDate(newDate);
    setTime("");
    setSlots([]);

    if (!newDate || !serviceId) {
      return;
    }

    setLoadingSlots(true);
    const result = await fetchAvailableSlots(newDate, serviceId);
    setLoadingSlots(false);
    setSlots(result);
  }

  async function handleConfirm() {
    if (!dogId || !serviceId || !date || !time || problems.length > 0) {
      return;
    }

    setSubmitting(true);
    setError(undefined);

    const result = await createBooking({
      dogId,
      serviceId,
      date,
      time,
      consent: {
        termsVersion: CONSENT_VERSION,
        agreedStatementIds: consent.agreedStatementIds,
        photoPermission: consent.photoPermission,
        signedName: consent.signedName,
      },
    });

    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-xl text-ink">
          1. Select a Dog
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dogs.map((dog) => (
            <button
              key={dog.id}
              type="button"
              aria-pressed={dogId === dog.id}
              onClick={() => handleSelectDog(dog.id)}
              className={`rounded-2xl border-2 bg-surface p-4 text-left transition ${
                dogId === dog.id
                  ? "border-brand ring-2 ring-brand/25"
                  : "border-line-input hover:border-brand"
              }`}
            >
              <p className="font-semibold text-ink">{dog.name}</p>
              <p className="text-sm text-muted">
                {dog.breed} &middot; {dogSizeLabels[dog.size]}
              </p>
              <p className="mt-1 text-xs text-muted">
                {dog.assessmentCompletedAt
                  ? "Approved for Grooming"
                  : "Assessment Required"}
              </p>
            </button>
          ))}
        </div>
      </section>

      {selectedDog && (
        <section>
          <h2 className="mb-4 text-xl text-ink">
            2. Select a Service
          </h2>

          {needsAssessment && (
            <p className="mb-4 text-sm text-muted">
              {selectedDog.name} hasn&apos;t completed an assessment visit
              yet, so only the assessment service is available for now.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {availableServices.map((service) => (
              <button
                key={service.id}
                type="button"
                aria-pressed={serviceId === service.id}
                onClick={() => handleSelectService(service.id)}
                className={`rounded-2xl border-2 bg-surface p-4 text-left transition ${
                  serviceId === service.id
                    ? "border-brand ring-2 ring-brand/25"
                    : "border-line-input hover:border-brand"
                }`}
              >
                <p className="font-semibold text-ink">{service.name}</p>
                <p className="text-sm text-muted">{service.description}</p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {priceForDog(service, selectedDog).isFrom && "From "}
                  {formatPrice(priceForDog(service, selectedDog).pence)}
                  {businessInfo.payment.depositsEnabled &&
                    ` (${formatPrice(service.deposit)} deposit)`}
                </p>
                {service.priceNote && !selectedDog.hasLongDoubleCoat && (
                  <p className="mt-1 text-xs text-muted">{service.priceNote}</p>
                )}
              </button>
            ))}
          </div>

          {!needsAssessment && (
            <p className="mt-4 text-sm text-muted">{priceDisclaimer}</p>
          )}
        </section>
      )}

      {selectedService && (
        <section>
          <h2 className="mb-4 text-xl text-ink">
            3. Select a Date &amp; Time
          </h2>

          {loadingDates ? (
            <p role="status" className="text-sm text-muted">
              Checking available dates...
            </p>
          ) : dates.length === 0 ? (
            <p role="status" className="text-sm text-muted">
              There are no appointments available to book right now. New
              times are added regularly, so please check back soon, or{" "}
              <Link
                href="/contact"
                className="font-bold text-brand hover:underline"
              >
                get in touch
              </Link>
              .
            </p>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium text-ink">Date</p>

              <div className="flex flex-wrap gap-2">
                {dates.map((availableDate) => (
                  <button
                    key={availableDate}
                    type="button"
                    aria-pressed={date === availableDate}
                    onClick={() => handleDateChange(availableDate)}
                    className={`rounded-full border-2 px-5 py-2 text-sm font-semibold transition ${
                      date === availableDate
                        ? "border-brand bg-brand text-on-brand"
                        : "border-line-input text-ink hover:border-brand"
                    }`}
                  >
                    {formatDateString(availableDate, "short")}
                  </button>
                ))}
              </div>
            </>
          )}

          {date && (
            <div className="mt-4">
              {loadingSlots ? (
                <p role="status" className="text-sm text-muted">
                  Checking available times...
                </p>
              ) : slots.length === 0 ? (
                <p role="status" className="text-sm text-muted">
                  No times left on this date. Please choose another day.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={time === slot}
                      onClick={() => setTime(slot)}
                      className={`rounded-full border-2 px-5 py-2 text-sm font-semibold transition ${
                        time === slot
                          ? "border-brand bg-brand text-on-brand"
                          : "border-line-input text-ink hover:border-brand"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {time && selectedDog && selectedService && (
        <section>
          <h2 className="mb-4 text-xl text-ink">
            4. Terms &amp; Consent
          </h2>

          <ConsentStep value={consent} onChange={setConsent} />
        </section>
      )}

      {time && selectedDog && selectedService && (
        <section className="rounded-3xl bg-surface-alt p-6">
          <h2 className="mb-4 text-xl text-ink">
            5. Confirm Booking
          </h2>

          <dl className="mb-6 space-y-2 text-sm text-muted">
            <div className="flex justify-between">
              <dt>Dog</dt>
              <dd>{selectedDog.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Service</dt>
              <dd>{selectedService.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Date</dt>
              <dd>{formatDateString(date)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Time</dt>
              <dd>{time}</dd>
            </div>
            <div className="flex justify-between font-medium text-ink">
              {businessInfo.payment.depositsEnabled ? (
                <>
                  <dt>Deposit due</dt>
                  <dd>{formatPrice(selectedService.deposit)}</dd>
                </>
              ) : (
                <>
                  <dt>Price</dt>
                  <dd>
                    {priceForDog(selectedService, selectedDog).isFrom &&
                      "From "}
                    {formatPrice(
                      priceForDog(selectedService, selectedDog).pence
                    )}
                  </dd>
                </>
              )}
            </div>
          </dl>

          {!businessInfo.payment.depositsEnabled && (
            <p className="mb-6 text-sm text-muted">
              Payment is taken in cash at your appointment.
            </p>
          )}

          {error && (
            <p role="alert" className="mb-4 text-sm text-danger">
              {error}
            </p>
          )}

          {problems.length > 0 && (
            <p role="status" className="mb-4 text-sm text-muted">
              Before you can confirm, please {describeProblems(problems)}.
            </p>
          )}

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || problems.length > 0}
            className="w-full sm:w-auto"
          >
            {submitting ? "Booking..." : "Confirm Booking"}
          </Button>
        </section>
      )}
    </div>
  );
}
