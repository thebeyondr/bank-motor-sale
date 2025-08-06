import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Car, TrendingUp } from "lucide-react";

export default function DashboardIndex() {
  const user = useQuery(api.auth.getCurrentUser);
  const userListings = useQuery(
    api.listings.getListingsByBank,
    user?.bank ? { bankId: user.bank } : "skip"
  );

  if (!user) {
    return (
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
    );
  }

  const totalListings = userListings?.length || 0;
  const activeListings =
    userListings?.filter((listing) => listing.price !== null)?.length || 0;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Car className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Listings
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {totalListings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Active Listings
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activeListings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Plus className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Quick Action
              </p>
              <Link
                to={`/dashboard/${user.bank}/listings/new`}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Listing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Listings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Recent Listings
            </h3>
            <Link
              to={`/dashboard/${user.bank}/listings/new`}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Listing
            </Link>
          </div>
        </div>

        <div className="p-6">
          {userListings && userListings.length > 0 ? (
            <div className="space-y-4">
              {userListings.slice(0, 5).map((listing) => (
                <div
                  key={listing._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {listing.coverImageUrl && (
                      <img
                        src={listing.coverImageUrl}
                        alt={`${listing.vehicle.year} ${listing.vehicle.make} ${listing.vehicle.model}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {listing.vehicle.year} {listing.vehicle.make}{" "}
                        {listing.vehicle.model}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {listing.color && `${listing.color} • `}
                        {listing.mileage &&
                          `${listing.mileage.toLocaleString()} miles • `}
                        {listing.condition || "Condition not specified"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Listed{" "}
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {listing.price
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "JMD",
                            maximumFractionDigits: 0,
                          }).format(listing.price)
                        : "Price not disclosed"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No listings yet
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Get started by adding your first vehicle listing
              </p>
              <Link
                to={`/dashboard/${user.bank}/listings/new`}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
