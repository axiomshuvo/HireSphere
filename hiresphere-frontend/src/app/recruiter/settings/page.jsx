import SettingsView from "@/components/dashboard/SettingsView";

export default function RecruiterSettingsPage() {
  return (
    <SettingsView
      profileHref="/recruiter/profile"
      accessText="Your email and account type are managed securely through your profile."
    />
  );
}
