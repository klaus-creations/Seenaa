export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-gray-300 border-t-black" />
    </div>
  );
}
