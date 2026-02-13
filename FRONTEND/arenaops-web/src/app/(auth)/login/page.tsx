
export default function LoginPage() {
    return (
        <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
                Or <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">create a new account</a>
            </p>
            {/* Login Form Component will go here */}
        </div>
    );
}
