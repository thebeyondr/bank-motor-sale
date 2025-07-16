import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Upload, X } from "lucide-react";
import { Input } from "~/shadcn/ui/Input";
import { Label } from "~/shadcn/ui/Label";
import { Button } from "~/shadcn/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shadcn/ui/Select";

interface ImageFile {
  file: File;
  preview: string;
  isCover: boolean;
  rank?: number;
}

export default function NewListing() {
  const navigate = useNavigate();
  const { bankId } = useParams();
  const user = useQuery(api.auth.getCurrentUser);
  const vehicles = useQuery(api.vehicles.get);
  const createListing = useMutation(api.listings.createListing);
  const generateUploadUrl = useMutation(api.uploadHelpers.generateUploadUrl);

  // Form state
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [mileage, setMileage] = useState("");
  const [color, setColor] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authorization check
  if (user && user.bank !== bankId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          You don't have permission to create listings for this bank.
        </p>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        setImages(prev => [...prev, {
          file,
          preview,
          isCover: prev.length === 0, // First image is cover by default
          rank: prev.length + 1
        }]);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // If we removed the cover image, make the first remaining image the cover
      if (prev[index].isCover && newImages.length > 0) {
        newImages[0].isCover = true;
      }
      return newImages.map((img, i) => ({ ...img, rank: i + 1 }));
    });
  };

  const setCoverImage = (index: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isCover: i === index
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!selectedVehicleId) {
        throw new Error("Please select a vehicle");
      }
      if (images.length === 0) {
        throw new Error("Please upload at least one image");
      }

      // Upload images
      const uploadedImages = await Promise.all(
        images.map(async (imageData) => {
          const uploadUrl = await generateUploadUrl();
          const response = await fetch(uploadUrl, {
            method: "POST",
            body: imageData.file,
          });
          
          if (!response.ok) {
            throw new Error("Failed to upload image");
          }

          const { storageId } = await response.json();
          
          return {
            url: storageId, // Convex will resolve this to the actual URL
            isCover: imageData.isCover,
            rank: imageData.rank,
          };
        })
      );

      // Create listing
      await createListing({
        vehicleId: selectedVehicleId,
        mileage: mileage ? parseInt(mileage) : undefined,
        color: color || undefined,
        condition: condition as "Excellent" | "Good" | "Fair" | "Unknown" | undefined,
        price: price ? parseFloat(price) : null,
        images: uploadedImages,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating listing:", error);
      alert(error instanceof Error ? error.message : "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vehicles) {
    return (
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Add New Listing
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Create a new vehicle listing for your bank's inventory
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Selection */}
        <div>
          <Label htmlFor="vehicle">Vehicle *</Label>
          <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a vehicle from catalog" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle: any) => (
                <SelectItem key={vehicle._id} value={vehicle._id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mileage">Mileage</Label>
            <Input
              id="mileage"
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="e.g. 50000"
            />
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Black">Black</SelectItem>
                <SelectItem value="White">White</SelectItem>
                <SelectItem value="Red">Red</SelectItem>
                <SelectItem value="Blue">Blue</SelectItem>
                <SelectItem value="Green">Green</SelectItem>
                <SelectItem value="Yellow">Yellow</SelectItem>
                <SelectItem value="Orange">Orange</SelectItem>
                <SelectItem value="Purple">Purple</SelectItem>
                <SelectItem value="Gray">Gray</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price">Price (JMD)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Leave empty to not disclose"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <Label>Images *</Label>
          <div className="mt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  />
                  {image.isCover && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      Cover
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!image.isCover && (
                      <button
                        type="button"
                        onClick={() => setCoverImage(index)}
                        className="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600"
                      >
                        Set Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Label htmlFor="images" className="cursor-pointer">
                <span className="text-blue-500 hover:text-blue-600">
                  Click to upload images
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {" "}or drag and drop
                </span>
              </Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                PNG, JPG, WebP up to 5MB each
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}