import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import { Clock, MapPin, Star, Users } from "lucide-react";
import type { Ride } from "@/lib/mock-data";

export function RideCard({ ride, onBook }: { ride: Ride; onBook?: (r: Ride) => void }) {
  return (
    <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]">
      <CardContent className="p-5">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarImage src={ride.driverAvatar} alt={ride.driverName} />
                <AvatarFallback>{ride.driverName[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold">{ride.driverName}</p>
                  {ride.verified && <StatusBadge status="verified" label="Verified" />}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" /> {ride.rating.toFixed(1)}</span>
                  <span className="truncate">{ride.vehicle}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="truncate font-medium">{ride.pickup}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="truncate font-medium">{ride.destination}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{ride.time}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{ride.date}</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{ride.seats} seats</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-center">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">per seat</p>
              <p className="text-2xl font-bold text-foreground">₹{ride.price}</p>
            </div>
            {onBook && (
              <Button onClick={() => onBook(ride)} className="shrink-0">Book ride</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
