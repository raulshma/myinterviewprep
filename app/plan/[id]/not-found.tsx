import Link from 'next/link';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

/**
 * Not Found page for public plans
 * Displayed when a plan doesn't exist or is not public
 */
export default function PublicPlanNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-border mb-6">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <h1 className="text-2xl font-mono text-foreground mb-3">
            Plan Not Found
          </h1>
          
          <p className="text-muted-foreground mb-8">
            This interview preparation plan doesn&apos;t exist or is no longer public. 
            It may have been removed by the owner.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button className="gap-2">
                Create Your Own Plan
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
