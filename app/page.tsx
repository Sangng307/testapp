"use client";

import React, { useState } from "react";

const Home: React.FC = () => {
  const [calendarData, setCalendarData] = useState<
    Record<string, Record<string, { service: string; color: string; duration: number }>>
  >({});
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [service, setService] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("bg-green-500");
  const [duration, setDuration] = useState<number>(15);
  const [error, setError] = useState<boolean>(false);
  const [draggingItem, setDraggingItem] = useState<{ employee: string; time: string } | null>(null);

  const employees = ["Brenda Massey", "Alena Geidt", "James Herwitz", "Amy Jones"];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const handleTimeClick = (employee: string, time: string) => {
    setSelectedEmployee(employee);
    setSelectedTime(time);
    setDialogOpen(true);
  };

  const handleSaveService = () => {
    if (!service.trim()) {
      setError(true);
      return;
    }
    if (selectedEmployee && selectedTime) {
      const updatedData = {
        service,
        color: selectedColor,
        duration,
      };
      setCalendarData((prev) => {
        const updatedCalendar = { ...prev };
        updatedCalendar[selectedEmployee] = {
          ...(updatedCalendar[selectedEmployee] || {}),
          [selectedTime]: updatedData,
        };
        return updatedCalendar;
      });
    }

    setService("");
    setSelectedColor("bg-green-500");
    setError(false);
    setDialogOpen(false);
  };

  const calculateRowSpan = (duration: number) => duration / 15;

  const handleDragStart = (employee: string, time: string) => {
    setDraggingItem({ employee, time });
  };

  const handleDrop = (employee: string, time: string) => {
    if (draggingItem) {
      const { employee: sourceEmployee, time: sourceTime } = draggingItem;
      const draggedData = calendarData[sourceEmployee]?.[sourceTime];

      if (draggedData) {
        setCalendarData((prev) => {
          const updatedData = { ...prev };

          // Xóa dữ liệu từ vị trí cũ
          delete updatedData[sourceEmployee][sourceTime];

          // Thêm dữ liệu vào vị trí mới
          if (!updatedData[employee]) updatedData[employee] = {};
          updatedData[employee][time] = draggedData;

          return updatedData;
        });

        setDraggingItem(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="calendar grid grid-cols-5">
        {/* Header Row */}
        <div className="font-bold border-b pb-2 text-black">Time</div>
        {employees.map((employee) => (
          <div key={employee} className="font-bold border-b pb-2 text-center text-black">
            {employee}
          </div>
        ))}

        {/* Time Rows */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            {/* Time Label */}
            <div className="font-medium border p-2 text-center bg-white text-black">{hour}</div>
            {/* Employee Slots */}
            {employees.map((employee) => (
              <div key={`${employee}-${hour}`} className="grid grid-rows-4 border h-24 relative">
                {Array.from({ length: 4 }, (_, idx) => {
                  const time = `${hour}:${idx * 15 === 0 ? "00" : idx * 15}`;
                  const slotData = calendarData[employee]?.[time];

                  return (
                    <div
                      key={time}
                      className={`relative border-b border-gray-300 ${slotData ? "bg-transparent" : "bg-white hover:bg-gray-200"
                        }`}
                      draggable={!!slotData}
                      onDragStart={() => slotData && handleDragStart(employee, time)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(employee, time)}
                    >
                      {slotData && (
                        <div
                          className={`absolute top-0 left-0 w-full h-full flex items-center justify-center text-white rounded z-1 ${slotData.color}`}
                          style={{ height: `${calculateRowSpan(slotData.duration) * 24}px` }}
                        >
                          {slotData.service}
                        </div>
                      )}
                      {!slotData && (
                        <button
                          onClick={() => handleTimeClick(employee, time)}
                          className="w-full h-full flex items-center justify-center"
                        ></button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Dialog for Selecting Service */}
      {dialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4 text-black">
              Assign service for {selectedEmployee} at {selectedTime}
            </h2>
            <input
              className={`border p-2 w-full mb-1 rounded text-black ${error ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Enter service name"
              value={service}
              onChange={(e) => {
                setService(e.target.value);
                if (error) setError(false);
              }}
            />
            {error && <p className="text-sm text-red-500">Please enter a service name!</p>}
            <div className="flex items-center space-x-4 mb-4">
              <label className="font-bold text-black">Duration:</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="border p-2 rounded text-black"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
            <div className="flex items-center space-x-4 mb-4 mt-2">
              <label className="font-bold text-black">Choose color:</label>
              <div className="flex space-x-2">
                {["bg-green-500", "bg-blue-500", "bg-red-500", "bg-yellow-500", "bg-purple-500"].map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full ${color} ${selectedColor === color ? "ring-2 ring-black" : ""
                      }`}
                    onClick={() => setSelectedColor(color)}
                  ></button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full"
                onClick={handleSaveService}
              >
                Save
              </button>
              <button
                className="border border-black text-black py-2 px-4 rounded-full hover:bg-gray-200"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
