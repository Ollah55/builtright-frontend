import React, { useMemo, useState } from "react";
import "./energycalculator.css";

const applianceOptions = [
  { name: "LED Bulb", watts: 10 },
  { name: "Ceiling Fan", watts: 75 },
  { name: "Television", watts: 120 },
  { name: "Decoder", watts: 25 },
  { name: "Laptop", watts: 65 },
  { name: "Desktop Computer", watts: 200 },
  { name: "Refrigerator", watts: 150 },
  { name: "Deep Freezer", watts: 250 },
  { name: "Air Conditioner (1HP)", watts: 900 },
  { name: "Air Conditioner (1.5HP)", watts: 1200 },
  { name: "Microwave", watts: 1200 },
  { name: "Blender", watts: 300 },
  { name: "Washing Machine", watts: 500 },
  { name: "Water Pump", watts: 750 },
  { name: "Iron", watts: 1000 },
  { name: "Phone Charger", watts: 10 },
  { name: "Router", watts: 15 },
];

const defaultRows = [
  { appliance: "LED Bulb", watts: 10, quantity: 6, hours: 6 },
  { appliance: "Ceiling Fan", watts: 75, quantity: 2, hours: 8 },
  { appliance: "Television", watts: 120, quantity: 1, hours: 6 },
];

function roundUp(value, step) {
  return Math.ceil(value / step) * step;
}

function getApplianceWatts(name) {
  const found = applianceOptions.find((item) => item.name === name);
  return found ? found.watts : 0;
}

function EnergyCalculator() {
  const [rows, setRows] = useState(defaultRows);
  const [batteryBackupHours, setBatteryBackupHours] = useState(8);
  const [userDetails, setUserDetails] = useState({
  name: "",
  phone: "",
  location: "",
});

  const updateRow = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        if (field === "appliance") {
          const watts = getApplianceWatts(value);
          return { ...row, appliance: value, watts };
        }

        return {
          ...row,
          [field]: Number(value) || 0,
        };
      })
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { appliance: "LED Bulb", watts: 10, quantity: 1, hours: 1 },
    ]);
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const results = useMemo(() => {
    const breakdown = rows.map((row) => {
      const dailyWh = row.watts * row.quantity * row.hours;
      const runningWatts = row.watts * row.quantity;

      return {
        ...row,
        dailyWh,
        runningWatts,
      };
    });

    const totalDailyWh = breakdown.reduce((sum, item) => sum + item.dailyWh, 0);
    const totalDailyKWh = totalDailyWh / 1000;
    const peakRunningWatts = breakdown.reduce(
      (sum, item) => sum + item.runningWatts,
      0
    );

    const recommendedInverterWatts = roundUp(peakRunningWatts * 1.25, 500);

    const avgHourlyLoad = totalDailyWh / 24;
    const requiredBatteryWh = avgHourlyLoad * batteryBackupHours;
    const adjustedBatteryWh = requiredBatteryWh / 0.8;
    const batteryAh48V = adjustedBatteryWh / 48;

    const sunlightHours = 5;
    const solarRequiredWatts = (totalDailyWh / sunlightHours) / 0.75;
    const recommendedSolarWatts = roundUp(solarRequiredWatts, 100);

    return {
      breakdown,
      totalDailyWh,
      totalDailyKWh,
      peakRunningWatts,
      recommendedInverterWatts,
      batteryAh48V,
      recommendedSolarWatts,
    };
  }, [rows, batteryBackupHours]);

  const whatsappSummary = encodeURIComponent(
  [
    "Hello, I used the BuiltRight Energy Calculator and I would like a recommendation.",
    "",
    "Customer Details:",
    `Name: ${userDetails.name || "Not provided"}`,
    `Phone: ${userDetails.phone || "Not provided"}`,
    `Location: ${userDetails.location || "Not provided"}`,
    "",
    "Estimated Load Summary:",
    `Total Daily Consumption: ${results.totalDailyWh.toLocaleString()} Wh/day (${results.totalDailyKWh.toFixed(2)} kWh/day)`,
    `Recommended Inverter: ${results.recommendedInverterWatts.toLocaleString()} W`,
    `Suggested Battery Bank: ${Math.ceil(results.batteryAh48V)} Ah @ 48V`,
    `Suggested Solar Panels: ${results.recommendedSolarWatts.toLocaleString()} W`,
    "",
    "Appliance Breakdown:",
    ...results.breakdown.map(
      (item) =>
        `- ${item.appliance}: ${item.quantity} x ${item.watts}W for ${item.hours} hrs/day = ${item.dailyWh.toLocaleString()} Wh/day`
    ),
  ].join("\n")
);

  const whatsappLink = `https://wa.me/2349134991239?text=${whatsappSummary}`;

  return (
    <section className="energy-calculator">
      <div className="energy-calculator-head">
        <p className="section-label">Energy Calculator</p>
        <div className="about-hero-line"></div>
        <h2>Estimate the Right Solar Setup for Your Home</h2>
        <p>
          Select your appliances, quantity, and average daily usage to estimate
          your power consumption, inverter size, battery requirement, and solar
          panel recommendation.
        </p>
      </div>

      <div className="energy-calculator-layout">
        <div className="calculator-form">
          <div className="calculator-table-wrap">
            <table className="calculator-table">
              <thead>
                <tr>
                  <th>Appliance</th>
                  <th>Watts</th>
                  <th>Qty</th>
                  <th>Hours/Day</th>
                  <th>Daily Use (Wh)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={row.appliance}
                        onChange={(e) =>
                          updateRow(index, "appliance", e.target.value)
                        }
                      >
                        {applianceOptions.map((item) => (
                          <option key={item.name} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        value={row.watts}
                        onChange={(e) =>
                          updateRow(index, "watts", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        value={row.quantity}
                        onChange={(e) =>
                          updateRow(index, "quantity", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={row.hours}
                        onChange={(e) =>
                          updateRow(index, "hours", e.target.value)
                        }
                      />
                    </td>

                    <td>{row.watts * row.quantity * row.hours} Wh</td>

                    <td>
                      <button
                        type="button"
                        className="remove-row-btn"
                        onClick={() => removeRow(index)}
                        disabled={rows.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="calculator-actions">
            <div className="user-details">
  <input
    type="text"
    placeholder="Your Name"
    value={userDetails.name}
    onChange={(e) =>
      setUserDetails({ ...userDetails, name: e.target.value })
    }
  />

  <input
    type="text"
    placeholder="Phone Number"
    value={userDetails.phone}
    onChange={(e) =>
      setUserDetails({ ...userDetails, phone: e.target.value })
    }
  />

  <input
    type="text"
    placeholder="Location"
    value={userDetails.location}
    onChange={(e) =>
      setUserDetails({ ...userDetails, location: e.target.value })
    }
  />
</div>
            <button type="button" className="add-row-btn" onClick={addRow}>
              Add Appliance
            </button>

            <div className="backup-hours-field">
              <label htmlFor="backupHours">
                Preferred battery backup (hours)
              </label>
              <input
                id="backupHours"
                type="number"
                min="1"
                value={batteryBackupHours}
                onChange={(e) =>
                  setBatteryBackupHours(Number(e.target.value) || 1)
                }
              />
            </div>
          </div>
        </div>

        <div className="calculator-results">
          <div className="result-card highlight">
            <h3>Total Daily Consumption</h3>
            <p className="result-value">
              {results.totalDailyWh.toLocaleString()} Wh/day
            </p>
            <span>{results.totalDailyKWh.toFixed(2)} kWh/day</span>
          </div>

          <div className="result-card">
            <h3>Recommended Inverter</h3>
            <p className="result-value">
              {results.recommendedInverterWatts.toLocaleString()} W
            </p>
            <span>
              Based on estimated running load of{" "}
              {results.peakRunningWatts.toLocaleString()} W
            </span>
          </div>

          <div className="result-card">
            <h3>Suggested Battery Bank</h3>
            <p className="result-value">
              {Math.ceil(results.batteryAh48V)} Ah @ 48V
            </p>
            <span>Estimated for about {batteryBackupHours} hours backup</span>
          </div>

          <div className="result-card">
            <h3>Suggested Solar Panels</h3>
            <p className="result-value">
              {results.recommendedSolarWatts.toLocaleString()} W
            </p>
            <span>Estimated using 5 peak sun hours and system losses</span>
          </div>
        </div>
      </div>

      <div className="consumption-breakdown">
        <h3>Appliance Power Consumption Breakdown</h3>
        <div className="breakdown-list">
          {results.breakdown.map((item, index) => (
            <div className="breakdown-item" key={`${item.appliance}-${index}`}>
              <div>
                <strong>{item.appliance}</strong>
                <p>
                  {item.quantity} × {item.watts}W for {item.hours} hrs/day
                </p>
              </div>
              <span>{item.dailyWh.toLocaleString()} Wh/day</span>
            </div>
          ))}
        </div>
      </div>

      <div className="calculator-note">
        <p>
          These figures are estimates for planning purposes. Final system sizing
          may vary depending on surge loads, battery chemistry, location,
          appliance efficiency, and installation conditions.
        </p>
      </div>

      <div className="calculator-whatsapp">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="calculator-whatsapp-btn"
        >
          Send Result to WhatsApp
        </a>
      </div>
    </section>
  );
}

export default EnergyCalculator;