import OtherProfiles from "@/components/root/profile/other-profile";
import OthersProfileView from "@/components/root/profile/others-profile-header";

export default async function Page( { params } : { params: Promise<{ username: string}>}) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  console.log("decoded username will be ", decoded);

  return (
    <div className="w-full flex-col gap-4">
      <OthersProfileView username={decoded}/>
      <OtherProfiles userId={decoded} />
    </div>
  );
}

