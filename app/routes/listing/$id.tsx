import { Link } from "react-router";
import type { Route } from "./+types/$id";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useBankMappings } from "~/hooks/useBankMappings";

export async function listingWithStatsLoader({
  params,
}: Route.ClientLoaderArgs) {
  // We'll handle data loading in the component with Convex queries
  return { listingId: params.id };
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return <div>Loading listing data...</div>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-red-500 dark:text-red-400">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Listing Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          We couldn't find the listing you're looking for. It may have been
          removed or the link is incorrect.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Vehicles
        </Link>
      </div>
    </div>
  );
}

export default function ListingDetail({ loaderData }: Route.ComponentProps) {
  const { listingId } = loaderData || { listingId: undefined };

  const listingData = useQuery(api.listings.getListingById, {
    id: listingId as any,
  });
  const { bankNames } = useBankMappings();

  // Get market stats for this listing
  const marketStats = useQuery(
    api.marketStats.getMarketStats,
    listingData
      ? {
          vehicleSlug: listingData.vehicle.slug,
          countryId: listingData.country._id,
        }
      : "skip"
  );

  if (listingData === undefined || marketStats === undefined) {
    return <div>Loading listing data...</div>;
  }

  if (listingData === null) {
    throw new Response("Listing not found", { status: 404 });
  }

  // Calculate price delta and sample size
  const medianPrice = marketStats?.medianPrice || 0;
  const sampleSize = marketStats?.sampleSize || 0;
  const currentPrice = listingData.price || 0;

  let priceDelta: number | null = null;
  if (sampleSize >= 5 && currentPrice > 0 && medianPrice > 0) {
    priceDelta = ((currentPrice - medianPrice) / medianPrice) * 100;
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <Link to="/" className="text-gray-300 py-4">
        Back to vehicles
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {listingData.vehicle.year} {listingData.vehicle.make}{" "}
          {listingData.vehicle.model}
        </h1>

        {/* Price and Market Stats */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {listingData.price
                  ? Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: listingData.currency || "JMD",
                    }).format(listingData.price)
                  : "Price not available"}
              </p>
              {priceDelta !== null && (
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      priceDelta > 0
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {priceDelta > 0 ? "+" : ""}
                    {priceDelta.toFixed(1)}% vs similar listings
                  </span>
                </div>
              )}
            </div>

            {sampleSize > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Based on {sampleSize} similar vehicles
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Vehicle Details
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Make
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {listingData.vehicle.make}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Model
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {listingData.vehicle.model}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Year
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {listingData.vehicle.year}
                </dd>
              </div>
              {listingData.mileage && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Mileage
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {listingData.mileage.toLocaleString()} km
                  </dd>
                </div>
              )}
              {listingData.color && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Color
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {listingData.color}
                  </dd>
                </div>
              )}
              {listingData.condition && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Condition
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white capitalize">
                    {listingData.condition}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Bank Information
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Bank
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {listingData.bank.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Address
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {listingData.bank.contactInfo.address}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {listingData.bank.contactInfo.primaryPhone}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {listingData.bank.contactInfo.primaryEmail}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Images */}
        {listingData.imageUrls.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Images
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {listingData.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Vehicle image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Bank Instructions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Viewing Instructions
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {listingData.bank.viewInstructions}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sale Terms
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {listingData.bank.saleTerms}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Bidding Instructions
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {listingData.bank.bidInstructions}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
