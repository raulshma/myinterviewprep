import { redirect } from 'next/navigation';
import { getSettingsPageData } from '@/lib/actions/user';
import { UpgradePageContent } from '@/components/settings/upgrade-page-content';

export default async function UpgradePage() {
  const result = await getSettingsPageData();

  if (!result.success) {
    redirect('/sign-in');
  }

  return <UpgradePageContent profile={result.data.profile} />;
}
