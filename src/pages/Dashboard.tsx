import React from "react";

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-4 py-6">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="space-y-4">
          <a href="#" className="text-gray-700 hover:text-blue-500">
            Home
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-500">
            Analytics
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-500">
            Settings
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-500">
            Logout
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">Welcome Back 👋</h1>
          <p className="text-gray-600">Here’s a quick overview of your activity.</p>
        </header>

        {/* Content Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-lg font-medium">Users</h3>
            <p className="text-2xl font-bold mt-2">120</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-lg font-medium">Revenue</h3>
            <p className="text-2xl font-bold mt-2">$3,450</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-lg font-medium">New Signups</h3>
            <p className="text-2xl font-bold mt-2">24</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
