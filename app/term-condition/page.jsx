import React from 'react';

export const metadata = {
  title: 'Terms & Conditions',
};

const TermsConditionPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-widest text-slate-500">
            IPCStudios
          </p>
          <h1 className="mt-2 text-3xl font-bold">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-slate-600">
            Effective date: January 31, 2026
          </p>

          <p className="mt-6 text-slate-700">
            These Terms &amp; Conditions ("Terms") govern your access to and use
            of the IPCStudios website, products, and services (collectively, the
            "Service"). By accessing or using the Service, you agree to be bound
            by these Terms.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Use of the Service</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>You must be authorized to use the Service.</li>
            <li>You are responsible for maintaining account security.</li>
            <li>You agree not to misuse, disrupt, or attempt to access data
              without permission.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">Accounts</h2>
          <p className="mt-3 text-slate-700">
            You are responsible for all activity that occurs under your account.
            Notify us immediately if you suspect unauthorized use.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Third-Party Services</h2>
          <p className="mt-3 text-slate-700">
            If you connect third-party services (for example, Facebook), your use
            of those services is governed by their own terms and policies.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Intellectual Property</h2>
          <p className="mt-3 text-slate-700">
            The Service and its content are owned by IPCStudios or its licensors
            and are protected by applicable laws. You may not copy, modify, or
            distribute any part of the Service without permission.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Termination</h2>
          <p className="mt-3 text-slate-700">
            We may suspend or terminate access to the Service if you violate
            these Terms or for other lawful reasons.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Disclaimers</h2>
          <p className="mt-3 text-slate-700">
            The Service is provided "as is" and "as available" without
            warranties of any kind, to the extent permitted by law.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Limitation of Liability</h2>
          <p className="mt-3 text-slate-700">
            To the maximum extent permitted by law, IPCStudios will not be liable
            for any indirect, incidental, or consequential damages arising from
            your use of the Service.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Changes to Terms</h2>
          <p className="mt-3 text-slate-700">
            We may update these Terms from time to time. The updated version will
            be posted on this page with a new effective date.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Contact Us</h2>
          <p className="mt-3 text-slate-700">
            If you have questions about these Terms, contact us at
            support@IPCStudios.com.
          </p>
        </div>
      </section>
    </main>
  );
};

export default TermsConditionPage;
