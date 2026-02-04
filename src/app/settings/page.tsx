'use client';

import { withAuth } from '@/client/components/auth/with-auth';
import { SettingsPageContent } from '@/client/components/settings/settings-page-content';
import { AuthenticatedLayout } from '@/client/components/layout/authenticated-layout';

function SettingsPage() {
  return (
    <AuthenticatedLayout>
      <SettingsPageContent />
    </AuthenticatedLayout>
  );
}

export default withAuth(SettingsPage);
