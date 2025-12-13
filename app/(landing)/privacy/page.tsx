import type { Metadata } from "next";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy | MyLearningPrep",
  description: "Privacy Policy for MyLearningPrep.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6">
        <div className="max-w-3xl mx-auto py-14 md:py-20">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated: December 13, 2025
            </p>
          </header>

          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <p>
              This Privacy Policy explains how MyLearningPrep (the “Service”)
              collects, uses, and shares information when you visit our website
              or use our app.
            </p>

            <h2>Information we collect</h2>
            <ul>
              <li>
                <strong>Account information</strong>: When you sign up or sign
                in, we may collect identifiers such as your name, email address,
                profile image, and authentication-related metadata.
              </li>
              <li>
                <strong>Usage information</strong>: We may collect information
                about how you interact with the Service (for example, pages
                visited, features used, and basic device/browser signals).
              </li>
              <li>
                <strong>Content you provide</strong>: If you submit prompts,
                messages, or files for interview prep or AI assistance, we
                process that content to provide the requested functionality.
              </li>
              <li>
                <strong>Payment information</strong>: If you purchase a
                subscription, payments are processed by our payment processor.
                We do not store full payment card details on our servers.
              </li>
            </ul>

            <h2>How we use information</h2>
            <ul>
              <li>Provide, maintain, and improve the Service.</li>
              <li>Authenticate users and secure accounts.</li>
              <li>Process subscriptions and manage billing.</li>
              <li>
                Monitor performance, prevent abuse, and debug issues.
              </li>
              <li>
                Communicate with you about updates, security, and support.
              </li>
            </ul>

            <h2>How we share information</h2>
            <p>
              We share information only as needed to operate the Service. This
              may include:
            </p>
            <ul>
              <li>
                <strong>Authentication provider</strong> (for example, Clerk) to
                sign you in and manage sessions.
              </li>
              <li>
                <strong>AI providers</strong> (for example, OpenRouter or Google
                AI) to generate responses when you request AI features.
              </li>
              <li>
                <strong>Payment processors</strong> (for example, Stripe) to
                handle billing.
              </li>
              <li>
                <strong>Analytics/hosting</strong> providers to measure site
                performance and deliver the Service.
              </li>
            </ul>

            <h2>Cookies and similar technologies</h2>
            <p>
              We and our service providers may use cookies and similar
              technologies to keep you signed in, remember preferences, and
              understand usage patterns.
            </p>

            <h2>Data retention</h2>
            <p>
              We retain personal information for as long as necessary to provide
              the Service and for legitimate business purposes such as security,
              compliance, and dispute resolution.
            </p>

            <h2>Security</h2>
            <p>
              We take reasonable measures to protect information. However, no
              method of transmission or storage is 100% secure.
            </p>

            <h2>Your choices</h2>
            <ul>
              <li>
                You can update certain account information through your account
                settings.
              </li>
              <li>
                You may request deletion of your account and associated data by
                contacting us.
              </li>
            </ul>

            <h2>Contact</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at{" "}
              <a href="mailto:support@raulshma.xyz">support@raulshma.xyz</a>.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
