import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";

const Home = () => {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--text-color");
    const textColorSecondary = documentStyle.getPropertyValue(
      "--text-color-secondary"
    );
    const surfaceBorder = documentStyle.getPropertyValue("--surface-border");
    const data = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "Stored",
          backgroundColor: documentStyle.getPropertyValue("--green-500"),
          borderColor: documentStyle.getPropertyValue("--green-500"),
          data: [0, 0, 0, 20, 0, 0, 0],
        },
        {
          label: "Borrowed",
          backgroundColor: documentStyle.getPropertyValue("--orange-500"),
          borderColor: documentStyle.getPropertyValue("--orange-500"),
          data: [0, 0, 0, 13, 0, 0, 0],
        },
      ],
    };
    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            fontColor: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500,
            },
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Total Items
                </span>
                <div className="text-900 font-medium text-xl">0</div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-blue-100 border-round"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-shopping-cart text-blue-500 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Total Borrowed items
                </span>
                <div className="text-900 font-medium text-xl">0</div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-orange-100 border-round"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-map-marker text-orange-500 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Total Stored
                </span>
                <div className="text-900 font-medium text-xl">0</div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-cyan-100 border-round"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-inbox text-cyan-500 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Total Requests
                </span>
                <div className="text-900 font-medium text-xl">0</div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-purple-100 border-round"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-comment text-purple-500 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-0 p-4 shadow-2 border-round">
        <div className="text-3xl font-medium text-900 mb-3">Items</div>
        <div className="font-medium text-500 mb-3">
          This shows the total number of items borrowed and in stored.
        </div>
        <Chart type="bar" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Home;
