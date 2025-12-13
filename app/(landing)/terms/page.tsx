import type { Metadata } from "next";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Terms of Service | MyLearningPrep",
  description: "Terms of Service for MyLearningPrep.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6">
        <div className="max-w-3xl mx-auto py-14 md:py-20">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated: December 13, 2025
            </p>
          </header>

          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <p>
              These Terms of Service (the “Terms”) govern your access to and use
              of MyLearningPrep (the “Service”). By accessing or using the
              Service, you agree to these Terms.
            </p>

            <h2>Eligibility</h2>
            <p>
              You must be legally able to form a binding contract in your
              jurisdiction to use the Service.
            </p>

            <h2>Your account</h2>
            <ul>
              <li>
                You are responsible for maintaining the confidentiality of your
                account and for activities that occur under your account.
              </li>
              <li>
                You agree to provide accurate information and keep it up to
                date.
              </li>
            </ul>

            <h2>Subscriptions and billing</h2>
            <p>
              Paid features (if offered) may be provided on a subscription
              basis. Payments are handled by our payment processor. Subscriptions
              may renew automatically unless cancelled.
            </p>

            <h2>Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Violate any applicable law or regulation.</li>
              <li>Attempt to interfere with or disrupt the Service.</li>
              <li>
                Reverse engineer, scrape, or misuse the Service in ways that
                could harm our users or systems.
              </li>
              <li>
                Use the Service to submit content you do not have the right to
                use or share.
              </li>
            </ul>

            <h2>AI features</h2>
            <p>
              The Service may include AI-generated output. AI output may be
              inaccurate or incomplete and is provided for informational
              purposes only. You are responsible for verifying outputs before
              relying on them.
            </p>

            <h2>Content</h2>
            <p>
              You retain rights to the content you submit to the Service. You
              grant us a limited license to process your content solely to
              operate and improve the Service.
            </p>

            <h2>Termination</h2>
            <p>
              We may suspend or terminate access to the Service if you violate
              these Terms or if necessary to protect the Service or other users.
            </p>

            <h2>Disclaimers</h2>
            <p>
              The Service is provided on an “as is” and “as available” basis.
              To the maximum extent permitted by law, we disclaim all warranties
              of any kind.
            </p>

            <h2>Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, we will not be liable for
              indirect, incidental, special, consequential, or punitive damages,
              or any loss of profits or revenues.
            </p>

            <h2>Changes</h2>
            <p>
              We may update these Terms from time to time. The “Last updated”
              date reflects the most recent changes.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about these Terms can be sent to{" "}
              <a href="mailto:support@raulshma.xyz">support@raulshma.xyz</a>.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
