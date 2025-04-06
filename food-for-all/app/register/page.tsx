import RegisterForm from "@/components/RegisterForm";


export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-green-300 to-gray-900">
        <RegisterForm />
      </div>
    </main>
  );
  
}
