import { Mail, MapPin, Phone } from "lucide-react";
import { businessInfo } from "@/data/business";

export default function ContactInfo() {
  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold text-gray-900">
        Contact Information
      </h2>

      <p className="mb-8 text-lg leading-relaxed text-gray-600">
        {businessInfo.description}
      </p>

      <div className="space-y-6">

        {/* Phone */}
        <div className="flex items-start gap-4">
          <Phone
            size={22}
            className="mt-1 shrink-0 text-gray-700"
          />

          <div>
            <h3 className="font-semibold text-gray-900">
              Phone
            </h3>

            <a
              href={`tel:${businessInfo.contact.phone}`}
              className="text-gray-600 transition-colors hover:text-black"
            >
              {businessInfo.contact.phone}
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <Mail
            size={22}
            className="mt-1 shrink-0 text-gray-700"
          />

          <div>
            <h3 className="font-semibold text-gray-900">
              Email
            </h3>

            <a
              href={`mailto:${businessInfo.contact.email}`}
              className="text-gray-600 transition-colors hover:text-black"
            >
              {businessInfo.contact.email}
            </a>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-4">
          <MapPin
            size={22}
            className="mt-1 shrink-0 text-gray-700"
          />

          <div>
            <h3 className="font-semibold text-gray-900">
              Location
            </h3>

            <p className="text-gray-600">
              {businessInfo.contact.address}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}