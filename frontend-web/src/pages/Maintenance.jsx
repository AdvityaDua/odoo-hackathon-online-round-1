import React from 'react';

const Maintenance = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Maintenance</h2>
      <p className="text-gray-600 mb-6">Schedule and track maintenance tasks.</p>
      {/* Placeholder for maintenance schedule */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Task ID</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Description</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Due Date</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Assigned To</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b text-sm text-gray-800">MT-001</td>
              <td className="py-2 px-4 border-b text-sm text-gray-800">Engine inspection for EQ-001</td>
              <td className="py-2 px-4 border-b text-sm text-gray-800">2025-12-31</td>
              <td className="py-2 px-4 border-b text-sm text-gray-800">Team Alpha</td>
              <td className="py-2 px-4 border-b text-sm text-gray-800"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Overdue</span></td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b text-sm text-gray-800">MT-002</td>
              <td className="py-2 px-4 border-b text-sm text-gray-800">Oil change for Dump Truck B</td>
              <td className="py-2 px-4 border-b text-sm text-gray-800">2026-01-15</td>
              <td className="py-2 px-4 border-b text-sm text-gray-800">Team Beta</td>
              <td className="py-2 px-4 border-b text-sm text-gray-800"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Scheduled</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Maintenance;
