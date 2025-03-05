import type { Vehicle } from "~/types/vehicle";

export function Vehicles({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Vehicles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id}>
            <h2>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
