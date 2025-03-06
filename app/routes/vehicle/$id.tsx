import { Link } from "react-router";
import type { Bank } from "~/types/bank";
import type { Price, Vehicle } from "~/types/vehicle";
import { getVehicleById, getBankById } from "~/utils/db";
import type { Route } from "./+types/$id";

// Bank ID to name mapping
const BANK_NAMES: Record<string, string> = {
  "8fc8081e-32cf-4f27-90ec-8e440ea6dcd4": "JMMB",
  "cf984f5d-4bf8-405d-93f4-c518e258f7fe": "NCB",
  "33ff7536-112c-4a40-9b16-a60666ac7d4f": "CIBC",
};

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs): Promise<{
  vehicle: Vehicle;
  prices: (Price & { bank: Bank })[];
  bank: Bank;
}> {
  const result = await getVehicleById(params.id);
  if (!result) {
    throw new Response("Vehicle not found", { status: 404 });
  }

  // Fetch bank data for each price
  const pricesWithBanks = await Promise.all(
    result.prices.map(async (price) => {
      const bank = await getBankById(price.bankId);
      if (!bank) {
        throw new Error(`Bank not found for price ${price.id}`);
      }
      return { ...price, bank };
    })
  );

  return { ...result, prices: pricesWithBanks };
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return <div>Loading vehicle data...</div>;
}

export default function VehicleDetail({ loaderData }: Route.ComponentProps) {
  const { vehicle, prices, bank } = loaderData;

  return (
    <section className="container mx-auto px-4 py-8">
      <Link to="/" className="text-gray-300 py-4">
        Back to vehicles
      </Link>
      <h1 className="text-2xl font-bold text-white">
        {vehicle.year} {vehicle.make} {vehicle.model}
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
                  {BANK_NAMES[price.bankId]}
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
                {BANK_NAMES[price.bankId]}
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
        <h3 className="text-lg font-bold mb-2 text-white">Operating Hours</h3>
        <div className="space-y-2 text-gray-300">
          <p>Weekdays: {bank.operatingHours.weekdays}</p>
          <p>Weekends: {bank.operatingHours.weekends}</p>
        </div>
      </div>
    </section>
  );
}
