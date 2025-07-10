import { Link } from "react-router";
import type { Route } from "./+types/$id";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useBankMappings } from "~/hooks/useBankMappings";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // We'll handle data loading in the component with Convex queries
  return { vehicleId: params.id };
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return <div>Loading vehicle data...</div>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-red-500 dark:text-red-400">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Vehicle Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          We couldn't find the vehicle you're looking for. It may have been
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

export default function VehicleDetail({ loaderData }: Route.ComponentProps) {
  const { vehicleId } = loaderData;

  const vehicleData = useQuery(api.vehicles.getVehicleById, { id: vehicleId });
  const { bankNames } = useBankMappings();

  if (vehicleData === undefined) {
    return <div>Loading vehicle data...</div>;
  }

  if (vehicleData === null) {
    throw new Response("Vehicle not found", { status: 404 });
  }

  // The vehicleData contains the vehicle info and listings with bank data
  const vehicleInfo = {
    id: vehicleData.id,
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
  };

  const prices = vehicleData.listings;
  const bank = prices[0]?.bank; // Use the first bank for contact info

  return (
    <section className="container mx-auto px-4 py-8">
      <Link to="/" className="text-gray-300 py-4">
        Back to vehicles
      </Link>
      <h1 className="text-2xl font-bold text-white">
        {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
      </h1>
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-white">Details</h3>
        <table className="w-max">
          <thead>
            <tr className="text-left">
              <th className="py-2 px-4 text-gray-300">Bank</th>
              <th className="py-2 px-4 text-gray-300">Color</th>
              <th className="py-2 px-4 text-gray-300">Price</th>
              <th className="py-2 px-4 text-gray-300">Available</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((price) => (
              <tr key={price.id} className="border border-gray-700">
                <td className="py-2 px-4 text-gray-300">
                  {bankNames[price.bankId]}
                </td>
                <td className="py-2 px-4 text-gray-300">
                  <div className="flex items-center">
                    <span
                      className={`h-4 w-4 mr-2 inline-block rounded-full border border-slate-300 ${
                        {
                          Unknown: "bg-gray-700",
                          Black: "bg-black",
                          White: "bg-white",
                          Red: "bg-red-500",
                          Blue: "bg-blue-500",
                          Green: "bg-green-500",
                          Yellow: "bg-yellow-500",
                          Orange: "bg-orange-500",
                          Purple: "bg-purple-500",
                          Gray: "bg-gray-500",
                        }[price.color || "Unknown"] || "bg-slate-300"
                      }`}
                    ></span>
                    {price.color === "Unknown" || price.color === null
                      ? "Color undiscosed"
                      : price.color}
                  </div>
                </td>
                <td className="py-2 px-4 text-gray-300">
                  {price.price
                    ? Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "JMD",
                      }).format(price.price)
                    : "N/A"}
                </td>
                <td className="py-2 px-4 text-gray-300">{price.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-white">
          Instructions by Bank
        </h3>
        <div className="space-y-6">
          {prices.map((price) => (
            <div key={price.id} className="border border-gray-700 p-4 rounded">
              <h4 className="text-md font-bold text-white mb-2">
                {bankNames[price.bankId]}
              </h4>
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>Viewing:</strong> {price.bank.viewInstructions}
                </p>
                <p>
                  <strong>Sale Terms:</strong> {price.bank.saleTerms}
                </p>
                <p>
                  <strong>Bidding:</strong> {price.bank.bidInstructions}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {bank && (
        <>
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2 text-white">
              Contact Information
            </h3>
            <div className="space-y-2 text-gray-300">
              <p>Address: {bank.contactInfo.address}</p>
              <p>Phone: {bank.contactInfo.phones.join(", ")}</p>
              <p>Email: {bank.contactInfo.emails.join(", ")}</p>
              <p>
                Website:{" "}
                <a
                  href={bank.contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {bank.contactInfo.website}
                </a>
              </p>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2 text-white">
              Operating Hours
            </h3>
            <div className="space-y-2 text-gray-300">
              <p>Weekdays: {bank.operatingHours.weekdays}</p>
              <p>Weekends: {bank.operatingHours.weekends}</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
