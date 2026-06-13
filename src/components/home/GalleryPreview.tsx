import Image from "next/image";
import Link from "next/link";

const previewImages = [
    "/images/gallery/dog2.jpg",
    "/images/gallery/dog3.jpg",
    "/images/gallery/dog4.jpg",
];

export default function GalleryPreview() {
    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-6">
            
                <div className="mb-12 flex items-center justify-between">
                    <h2 className="text-4xl font-bold">
                        Gallery
                    </h2>
                    
                    <Link 
                    href="/gallery"
                    className="font-medium hover:underline"
                    >
                        View Full Gallery
                    </Link>
                </div>


                <div className="grid gap-6 md:grid-cols-3">
                    {previewImages.map((image) => (
                        <div
                        key={image}
                        className="overflow-hidden rounded-2xl"
                        >
                            <Image
                                src={image}
                                alt="Dog Grooming"
                                width={500}
                                height={500}
                                className="h-80 w-full object-cover transition duration-300 hover:scale-105"
                            />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}