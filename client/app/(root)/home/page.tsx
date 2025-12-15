import LeftHome from "@/components/root/home/left-home";
import Recommendations from "@/components/root/recommendations/recommendations";

export default function Page({
  searchParams,
}: {
  searchParams: { query: string };
}) {
  const { query } = searchParams;

  return (
    <div className="w-full h-full overflow-hidden flex justify-around">
      <LeftHome query={query} />
      <div className="w-[40%] 2xl:w-[30%] hidden lg:block h-full">
        <Recommendations />
      </div>
    </div>
  );
}
