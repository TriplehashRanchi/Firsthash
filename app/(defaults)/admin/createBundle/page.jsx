'use client';

import DeliverablesBundles from '@/components/deliverables/DeliverablesBundle';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
  const { company } = useAuth();
  return (
    <div>
      <DeliverablesBundles company={company} />
    </div>
  );
}