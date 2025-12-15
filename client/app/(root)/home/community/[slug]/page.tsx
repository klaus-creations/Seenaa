import Community from "@/components/root/community/community";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <Community slug={slug} />;
}
