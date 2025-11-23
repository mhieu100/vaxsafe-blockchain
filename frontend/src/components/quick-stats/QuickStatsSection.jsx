const QuickStatsSection = () => {
  return (
    <section className="mt-6 py-6 bg-gray-300 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-2xl font-bold text-blue-600 block">100</span>
            <p className="text-gray-600">Users</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-green-600 block">
              50
            </span>
            <p className="text-gray-600">Vaccines</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-purple-600 block">
              30
            </span>
            <p className="text-gray-600">Centers</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-red-600 block">10</span>
            <p className="text-gray-600">Doctors</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickStatsSection;
