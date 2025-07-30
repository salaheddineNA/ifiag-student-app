import { LoginForm } from "@/components/auth/login-form"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-900 mb-2">IFIAG</h1>
          <p className="text-orange-700">Institut de Formation en Informatique et Administration de Gestion</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
