import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import EmailText from "@/components/ui/EmailText";
import { businessInfo } from "@/data/business";
import { navLinks } from "@/data/navigation";
import { getWeeklyOpeningHours } from "@/lib/opening-hours";

export default async function Footer() {
  const openingHours = await getWeeklyOpeningHours();

  return (
    <footer className="mt-20 rounded-t-[2.5rem] bg-footer text-footer-text">
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* Top Section */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Business */}
          <div>
            <h2 className="mb-4 text-2xl text-white">
              {businessInfo.name}
            </h2>

            <p className="leading-relaxed">
              Professional dog grooming services dedicated to keeping your
              furry friends happy, healthy and looking their best.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-lg text-white">
              Navigation
            </h3>

            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg text-white">
              Contact
            </h3>

            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone size={16} aria-hidden="true" className="shrink-0" />
                <a
                  href={`tel:${businessInfo.contact.phone.replace(/\s/g, "")}`}
                  className="hover:text-white"
                >
                  {businessInfo.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} aria-hidden="true" className="shrink-0" />
                <a
                  href={`mailto:${businessInfo.contact.email}`}
                  className="min-w-0 [overflow-wrap:anywhere] hover:text-white"
                >
                  <EmailText email={businessInfo.contact.email} />
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} aria-hidden="true" className="shrink-0" />
                {businessInfo.contact.address}
              </li>
              {businessInfo.social.facebook && (
                <li className="flex items-center gap-2">
                  <ExternalLink
                    size={16}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  <a
                    href={businessInfo.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Find us on Facebook
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}

          <div>
            <h3 className="mb-4 text-lg text-white">
              Opening Hours
            </h3>

            {openingHours.length === 0 ? (
              <p>Please get in touch for our opening hours.</p>
            ) : (
              <ul className="space-y-2">
                {openingHours.map((line) => (
                  <li key={line.label}>
                    {line.label}: {line.hours}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Bottom */}

        <div className="mt-12 border-t border-white/15 pt-6 text-center text-sm">
          © {new Date().getFullYear()} {businessInfo.name}. All rights
          reserved.
        </div>

      </div>
    </footer>
  );
}