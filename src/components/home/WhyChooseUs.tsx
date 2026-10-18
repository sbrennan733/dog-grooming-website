import { CalendarCheck, Heart, Smile } from "lucide-react";

const reasons = [
  {
    icon: Heart,
    title: "Experienced care",
    text: "Gentle and professional grooming for every breed.",
  },
  {
    icon: CalendarCheck,
    title: "Flexible booking",
    text: "Convenient appointments that fit your schedule.",
  },
  {
    icon: Smile,
    title: "Happy pets",
    text: "Creating a stress-free experience for your furry friend.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-14 text-center text-4xl text-ink md:text-5xl">
          Why choose us?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {reasons.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl bg-surface p-8 text-center shadow-soft"
            >
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent-ink">
                <Icon size={26} aria-hidden="true" />
              </div>

              <h3 className="mb-2 text-xl text-ink">{title}</h3>

              <p className="text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
