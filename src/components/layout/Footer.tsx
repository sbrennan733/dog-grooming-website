import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* Top Section */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Business */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-white">
              Paws & Pamper
            </h2>

            <p className="leading-relaxed">
              Professional dog grooming services dedicated to keeping your
              furry friends happy, healthy and looking their best.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Navigation
            </h3>

            <ul className="space-y-2">

              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/gallery" className="hover:text-white">
                  Gallery
                </Link>
              </li>

              <li>
                <Link href="/booking" className="hover:text-white">
                  Book Appointment
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact */}

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Contact
            </h3>

            <ul className="space-y-2">
              <li>📞 07XXX XXXXXX</li>
              <li>✉️ info@pawspamper.co.uk</li>
              <li>Belfast, Northern Ireland</li>
            </ul>
          </div>

          {/* Hours */}

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Opening Hours
            </h3>

            <ul className="space-y-2">
              <li>Mon - Fri: 09:00 - 17:00</li>
              <li>Saturday: 09:00 - 13:00</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>

        </div>

        {/* Bottom */}

        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm">
          © {new Date().getFullYear()} Paws & Pamper. All rights reserved.
        </div>

      </div>
    </footer>
  );
}