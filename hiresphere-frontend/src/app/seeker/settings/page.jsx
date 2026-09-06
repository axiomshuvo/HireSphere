import SettingsView from "@/components/dashboard/SettingsView";

export default function SeekerSettingsPage() {
  return (
    <SettingsView
      profileHref="/seeker/profile"
      accessText="Your email and account type are managed securely through your profile."
    />
  );
}
