import { VehicleCardDemo } from "~/vehicles/components/VehicleCard";

export function meta() {
  return [
    { title: "Vehicle Card Demo" },
    {
      name: "description",
      content: "Demo of the skeumorphic vehicle card component",
    },
  ];
}

export default function VehicleCardDemoRoute() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Vehicle Card Component
          </h1>
          <p className="text-muted-foreground text-lg">
            Skeumorphic design with blur effects and interactive states
          </p>
        </div>

        <VehicleCardDemo />

        <div className="mt-12 text-center">
          <div className="inline-block bg-card/50 backdrop-blur-sm border border-border/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Features
            </h3>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>• Backdrop blur effects</li>
              <li>• Interactive saved/unsaved states</li>
              <li>• Responsive design</li>
              <li>• Smooth hover animations</li>
              <li>• Price comparison indicators</li>
              <li>• TypeScript interfaces</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
