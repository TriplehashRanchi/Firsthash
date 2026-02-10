import React from 'react';

export const metadata = {
  title: 'Privacy Policy',
};

const PrivacyPolicyPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-widest text-slate-500">
            IPCStudios
          </p>
          <h1 className="mt-2 text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-600">
            Effective date: January 31, 2026
          </p>

          <p className="mt-6 text-slate-700">
            This Privacy Policy explains how IPCStudios ("we", "us", "our")
            collects, uses, and shares information when you use our website,
            products, and services (collectively, the "Service").
          </p>

          <h2 className="mt-8 text-xl font-semibold">Information We Collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>
              Account information such as name, email address, and authentication
              details.
            </li>
            <li>
              Usage data such as pages visited, actions taken, and diagnostic
              logs.
            </li>
            <li>
              Integrations data you authorize (for example, Facebook Pages or
              lead data) when you connect third-party services.
            </li>
            <li>
              Device and browser data such as IP address, device type, and
              operating system.
            </li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">How We Use Information</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>Provide, operate, and improve the Service.</li>
            <li>Authenticate users and secure accounts.</li>
            <li>Communicate with you about updates and support.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">Sharing of Information</h2>
          <p className="mt-3 text-slate-700">
            We do not sell your personal information. We may share information
            with service providers who help us operate the Service, or when
            required by law. If you connect third-party services, those services
            may receive information as described in their own privacy policies.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Cookies and Tracking</h2>
          <p className="mt-3 text-slate-700">
            We use cookies and similar technologies to keep you signed in,
            understand usage, and improve the Service. You can control cookies
            through your browser settings.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Data Retention</h2>
          <p className="mt-3 text-slate-700">
            We retain information as long as necessary to provide the Service or
            as required by law. You can request deletion of your account data at
            any time.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Security</h2>
          <p className="mt-3 text-slate-700">
            We use reasonable administrative, technical, and physical safeguards
            to protect information. No method of transmission or storage is 100%
            secure.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Your Rights</h2>
          <p className="mt-3 text-slate-700">
            Depending on your location, you may have rights to access, correct,
            or delete your personal information. Contact us to exercise these
            rights.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Changes</h2>
          <p className="mt-3 text-slate-700">
            We may update this Privacy Policy from time to time. The updated
            version will be posted on this page with a new effective date.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Contact Us</h2>
          <p className="mt-3 text-slate-700">
            If you have questions about this Privacy Policy, contact us at
            support@IPCStudios.com.
          </p>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicyPage;
