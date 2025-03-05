import type { Route } from "./+types/$id";
import type { Vehicle } from "~/types/vehicle";
import type { Bank } from "~/types/bank";
import { getVehicleById } from "~/utils/db";
import { Link } from "react-router";

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs): Promise<{ vehicle: Vehicle; bank: Bank }> {
  const result = await getVehicleById(params.id);
  if (!result) {
    throw new Response("Vehicle not found", { status: 404 });
  }
  return result;
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return <div>Loading vehicle data...</div>;
}

export default function VehicleDetail({ loaderData }: Route.ComponentProps) {
  const { vehicle, bank } = loaderData;

  return (
    <section className="container mx-auto px-4 py-8">
      <Link to="/" className="text-gray-300 mb-3">
        Back to vehicles
      </Link>
      <h1 className="text-2xl font-bold text-white">
        {vehicle.year} {vehicle.make} {vehicle.model}
      </h1>
      <p className="text-gray-300 mb-2">
        {vehicle.color === "Unknown" ? "Color undisclosed" : vehicle.color}
      </p>
      <h2 className="text-lg font-bold mb-2 text-white">
        Sold by: {bank.name}
      </h2>
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-white">Prices</h3>
        <table>
          <thead>
            <tr>
              <th className="py-2 px-4">Bank</th>
              <th className="py-2 px-4">Price</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(vehicle.pricesBySource).map(
              ([key, priceBySource]) => (
                <tr key={key} className="border border-gray-700">
                  <td className="py-2 px-4">{priceBySource.source}</td>
                  <td className="py-2 px-4">
                    {priceBySource.price
                      ? Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "JMD",
                        }).format(priceBySource.price)
                      : "N/A"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      <div>
        <h3>Instructions</h3>
        <p>
          <strong>Viewing:</strong> {bank.viewInstructions}
        </p>
        <p>
          <strong>Sale Terms:</strong> {bank.saleTerms}
        </p>
        <p>
          <strong>Bidding:</strong> {bank.bidInstructions}
        </p>
      </div>
      <div className="mt-8">
        <h3>Contact Information</h3>
        <p>Address: {bank.contactInfo.address}</p>
        <p>Phone: {bank.contactInfo.phones.join(", ")}</p>
        <p>Email: {bank.contactInfo.emails.join(", ")}</p>
        <p>
          Website:{" "}
          <a
            href={bank.contactInfo.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {bank.contactInfo.website}
          </a>
        </p>
      </div>
      <div>
        <h3>Operating Hours</h3>
        <p>Weekdays: {bank.operatingHours.weekdays}</p>
        <p>Weekends: {bank.operatingHours.weekends}</p>
      </div>
    </section>
  );
}
