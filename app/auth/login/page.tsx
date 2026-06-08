import AuthForm from "@/components/auth/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto mt-16 max-w-xl">
        <AuthForm redirectTo={params.redirectTo} />
      </div>
    </div>
  );
}
