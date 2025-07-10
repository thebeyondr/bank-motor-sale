import { useEffect, useState } from "react";
import { X, Car } from "lucide-react";

interface RealTimeNotificationProps {
  isVisible: boolean;
  onDismiss: () => void;
  message: string;
}

export function RealTimeNotification({
  isVisible,
  onDismiss,
  message,
}: RealTimeNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onDismiss();
      }, 5000); // Auto dismiss after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-80">
        <Car className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">New Vehicle Added</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsAnimating(false);
            onDismiss();
          }}
          className="text-white hover:text-green-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
