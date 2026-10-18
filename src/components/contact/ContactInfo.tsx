import { Mail, MapPin, Phone } from "lucide-react";
import { businessInfo } from "@/data/business";

export default function ContactInfo() {
  return (
    <div>
      <h2 className="mb-6 text-3xl text-ink">
        Contact Information
      </h2>

      <p className="mb-8 text-lg leading-relaxed text-muted">
        {businessInfo.description}
      </p>

      <div className="space-y-6">

        {/* Phone */}
        <div className="flex items-start gap-4">
          <Phone
            size={22}
            className="mt-1 shrink-0 text-brand"
          />

          <div>
            <h3 className="text-ink">
              Phone
            </h3>

            <a
              href={`tel:${businessInfo.contact.phone}`}
              className="text-muted transition-colors hover:text-brand"
            >
              {businessInfo.contact.phone}
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <Mail
            size={22}
            className="mt-1 shrink-0 text-brand"
          />

          <div>
            <h3 className="text-ink">
              Email
            </h3>

            <a
              href={`mailto:${businessInfo.contact.email}`}
              className="text-muted transition-colors hover:text-brand"
            >
              {businessInfo.contact.email}
            </a>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-4">
          <MapPin
            size={22}
            className="mt-1 shrink-0 text-brand"
          />

          <div>
            <h3 className="text-ink">
              Location
            </h3>

            <p className="text-muted">
              {businessInfo.contact.address}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}