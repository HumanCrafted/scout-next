import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-8 items-center text-center">
        <h1 className="text-4xl font-bold">Scout v2</h1>
        <p className="text-muted-foreground max-w-md">
          Industrial sensor mapping application with team collaboration, 
          real-time updates, and advanced state management.
        </p>
        <div className="flex gap-4">
          <Link href="/map">
            <Button>View Map</Button>
          </Link>
          <Button variant="outline">Learn More</Button>
        </div>
      </main>
    </div>
  );
}
