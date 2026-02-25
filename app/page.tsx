export default function Home() {
    return (
        <main className="min-h-screen bg-linear-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Welkom bij AutoGarage Pro</h1>
            <p className="text-gray-600 text-center mb-6">Beheer uw garage efficiënt en eenvoudig</p>
            <a href="/login" className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors">
                Log in om te beginnen
            </a>
        </main>
    );
}