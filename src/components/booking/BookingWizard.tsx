"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { fetchAvailableSlots, createBooking } from "@/app/booking/actions";
import { getTodayInBusinessZone } from "@/lib/timezone";
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
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

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

  const todayStr = getTodayInBusinessZone();

  function handleSelectDog(newDogId: string) {
    setDogId(newDogId);
    setServiceId("");
    setDate("");
    setTime("");
    setSlots([]);
  }

  function handleSelectService(newServiceId: string) {
    setServiceId(newServiceId);
    setDate("");
    setTime("");
    setSlots([]);
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
    if (!dogId || !serviceId || !date || !time) {
      return;
    }

    setSubmitting(true);
    setError(undefined);

    const result = await createBooking({ dogId, serviceId, date, time });

    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          1. Select a Dog
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dogs.map((dog) => (
            <button
              key={dog.id}
              type="button"
              aria-pressed={dogId === dog.id}
              onClick={() => handleSelectDog(dog.id)}
              className={`rounded-xl border p-4 text-left transition ${
                dogId === dog.id
                  ? "border-black ring-1 ring-black"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <p className="font-semibold text-gray-900">{dog.name}</p>
              <p className="text-sm text-gray-600">{dog.breed}</p>
              <p className="mt-1 text-xs text-gray-500">
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
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            2. Select a Service
          </h2>

          {needsAssessment && (
            <p className="mb-4 text-sm text-gray-600">
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
                className={`rounded-xl border p-4 text-left transition ${
                  serviceId === service.id
                    ? "border-black ring-1 ring-black"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <p className="font-semibold text-gray-900">{service.name}</p>
                <p className="text-sm text-gray-600">{service.description}</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {formatPrice(service.price)} ({formatPrice(service.deposit)}{" "}
                  deposit)
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedService && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            3. Select a Date &amp; Time
          </h2>

          <label
            htmlFor="booking-date"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Date
          </label>

          <input
            id="booking-date"
            type="date"
            min={todayStr}
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />

          {date && (
            <div className="mt-4">
              {loadingSlots ? (
                <p role="status" className="text-sm text-gray-600">
                  Checking available times...
                </p>
              ) : slots.length === 0 ? (
                <p role="status" className="text-sm text-gray-600">
                  No available times on this date. Please try another day.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={time === slot}
                      onClick={() => setTime(slot)}
                      className={`rounded-lg border px-4 py-2 text-sm transition ${
                        time === slot
                          ? "border-black bg-black text-white"
                          : "border-gray-300 text-gray-900 hover:border-gray-400"
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
        <section className="rounded-2xl border bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            4. Confirm Booking
          </h2>

          <dl className="mb-6 space-y-2 text-sm text-gray-700">
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
              <dd>{date}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Time</dt>
              <dd>{time}</dd>
            </div>
            <div className="flex justify-between font-medium text-gray-900">
              <dt>Deposit due</dt>
              <dd>{formatPrice(selectedService.deposit)}</dd>
            </div>
          </dl>

          {error && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? "Booking..." : "Confirm Booking"}
          </Button>
        </section>
      )}
    </div>
  );
}
