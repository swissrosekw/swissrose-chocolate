import { Check, Package, Truck, MapPin } from 'lucide-react';

interface TrackingTimelineProps {
  status: string;
  deliveredAt?: string | null;
}

const TrackingTimeline = ({ status, deliveredAt }: TrackingTimelineProps) => {
  const steps = [
    { id: 'pending', label: 'Order Placed', icon: Package },
    { id: 'preparing', label: 'Preparing', icon: Package },
    { id: 'on_delivery', label: 'Out for Delivery', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  const getStepIndex = (s: string) => {
    const statusMap: Record<string, number> = {
      pending: 0,
      accepted: 1,
      preparing: 1,
      on_delivery: 2,
      delivered: 3,
    };
    return statusMap[s] ?? 0;
  };

  const currentStepIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div 
                    className={`flex-1 h-1 ${
                      index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isCurrent
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`flex-1 h-1 ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
              <span 
                className={`mt-2 text-xs text-center ${
                  isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {step.id === 'delivered' && deliveredAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(deliveredAt).toLocaleString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingTimeline;
