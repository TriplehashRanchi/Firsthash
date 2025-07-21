export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
      <p className="text-gray-600 max-w-md">
        You do not have permission to access this page. Please contact your administrator or try a different login.
      </p>
    </div>
  );
}
