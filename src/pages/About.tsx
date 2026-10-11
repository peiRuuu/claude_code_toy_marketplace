import * as Sentry from "@sentry/react";
import NavigationBar from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="px-[var(--page-padding)] py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-display font-medium text-foreground mb-4">
            About Marketplace
          </h1>
          <p className="text-body text-foreground mb-4">
            Marketplace is your trusted platform for buying and selling authentic pre-owned products.
          </p>
          <p className="text-body text-foreground">
            We connect sellers with buyers in a safe, secure environment where quality and authenticity are guaranteed.
          </p>

          {/* Sentry test: remove once error reporting is verified */}
          <div className="mt-8 flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                throw new Error("Sentry test error from About page");
              }}
            >
              Throw test error
            </Button>
            <Button
              variant="outline"
              onClick={() => Sentry.captureMessage("Sentry test message from About page")}
            >
              Send test message
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
