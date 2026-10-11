import React, { useMemo, useState } from "react";
import "./energycalculator.css";

const applianceOptions = [
  { name: "LED Bulb", watts: 10, surge: 1 },
  { name: "Ceiling Fan", watts: 75, surge: 2 },
  { name: "Television", watts: 120, surge: 1.2 },
  { name: "Decoder", watts: 25, surge: 1 },
  { name: "Laptop", watts: 65, surge: 1.2 },
  { name: "Desktop Computer", watts: 200, surge: 1.5 },
  { name: "Refrigerator", watts: 150, surge: 3 },
  { name: "Deep Freezer", watts: 250, surge: 3 },
  { name: "Air Conditioner (1HP)", watts: 900, surge: 3 },
  { name: "Air Conditioner (1.5HP)", watts: 1200, surge: 3 },
  { name: "Microwave", watts: 1200, surge: 1.2 },
  { name: "Blender", watts: 300, surge: 2 },
  { name: "Washing Machine", watts: 500, surge: 2.5 },
  { name: "Water Pump", watts: 750, surge: 3 },
  { name: "Iron", watts: 1000, surge: 1 },
  { name: "Phone Charger", watts: 10, surge: 1 },
  { name: "Router", watts: 15, surge: 1 },
];

const sizingAssumptions = {
  powerFactor: 0.8,
  inverterHeadroom: 1.25,
  usableBatteryFraction: 0.8,
  inverterEfficiency: 0.9,
  peakSunHours: 5,
  solarSystemEfficiency: 0.75,
};

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

function getApplianceSurge(name) {
  const found = applianceOptions.find((item) => item.name === name);
  return found ? found.surge : 1;
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
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
          // Keep a cleared field empty while the customer is editing it.
          [field]: value,
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
      const watts = toNumber(row.watts);
      const quantity = toNumber(row.quantity);
      const hours = toNumber(row.hours);
      const dailyWh = watts * quantity * hours;
      const runningWatts = watts * quantity;
      const surgeWatts = runningWatts * getApplianceSurge(row.appliance);

      return {
        ...row,
        watts,
        quantity,
        hours,
        dailyWh,
        runningWatts,
        surgeWatts,
      };
    });

    const totalDailyWh = breakdown.reduce((sum, item) => sum + item.dailyWh, 0);
    const totalDailyKWh = totalDailyWh / 1000;
    const peakRunningWatts = breakdown.reduce(
      (sum, item) => sum + item.runningWatts,
      0
    );

    const largestStartupAddition = breakdown.reduce(
      (largest, item) =>
        Math.max(largest, Math.max(0, item.surgeWatts - item.runningWatts)),
      0
    );
    const estimatedStartupWatts = peakRunningWatts + largestStartupAddition;
    const inverterSizingWatts = Math.max(
      peakRunningWatts * sizingAssumptions.inverterHeadroom,
      estimatedStartupWatts
    );
    const recommendedInverterKVA =
      roundUp(
        inverterSizingWatts / sizingAssumptions.powerFactor,
        500
      ) / 1000;

    const requestedBackupHours = Math.min(
      Math.max(toNumber(batteryBackupHours), 0),
      24
    );
    const backupEnergyWh = breakdown.reduce(
      (sum, item) =>
        sum + item.runningWatts * Math.min(item.hours, requestedBackupHours),
      0
    );
    const nominalBatteryKWh =
      backupEnergyWh /
      1000 /
      sizingAssumptions.usableBatteryFraction /
      sizingAssumptions.inverterEfficiency;
    const recommendedBatteryKWh = roundUp(nominalBatteryKWh, 0.5);

    const solarRequiredKWp =
      totalDailyKWh /
      sizingAssumptions.peakSunHours /
      sizingAssumptions.solarSystemEfficiency;
    const recommendedSolarKWp = roundUp(solarRequiredKWp, 0.1);

    return {
      breakdown,
      totalDailyWh,
      totalDailyKWh,
      peakRunningWatts,
      estimatedStartupWatts,
      recommendedInverterKVA,
      recommendedBatteryKWh,
      recommendedSolarKWp,
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
    `Total Daily Consumption: ${results.totalDailyKWh.toFixed(2)} kWh/day`,
    `Recommended Inverter: ${results.recommendedInverterKVA.toFixed(1)} kVA`,
    `Suggested Battery Storage: ${results.recommendedBatteryKWh.toFixed(1)} kWh`,
    `Suggested Solar Array: ${results.recommendedSolarKWp.toFixed(1)} kWp`,
    "",
    "Appliance Breakdown:",
    ...results.breakdown.map(
      (item) =>
        `- ${item.appliance}: ${item.quantity} x ${item.watts}W for ${item.hours} hrs/day = ${(item.dailyWh / 1000).toFixed(2)} kWh/day`
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
                  <th>Daily Use (kWh)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td data-label="Appliance">
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

                    <td data-label="Watts">
                      <input
                        type="number"
                        min="1"
                        value={row.watts}
                        inputMode="decimal"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          updateRow(index, "watts", e.target.value)
                        }
                      />
                    </td>

                    <td data-label="Quantity">
                      <input
                        type="number"
                        min="0"
                        value={row.quantity}
                        inputMode="numeric"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          updateRow(index, "quantity", e.target.value)
                        }
                      />
                    </td>

                    <td data-label="Hours / Day">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={row.hours}
                        inputMode="decimal"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          updateRow(index, "hours", e.target.value)
                        }
                      />
                    </td>

                    <td data-label="Daily Use">
                      {(
                        (toNumber(row.watts) *
                          toNumber(row.quantity) *
                          toNumber(row.hours)) /
                        1000
                      ).toFixed(2)}{" "}
                      kWh
                    </td>

                    <td data-label="Action">
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
                max="24"
                value={batteryBackupHours}
                inputMode="decimal"
                onFocus={(e) => e.target.select()}
                onChange={(e) => setBatteryBackupHours(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="calculator-results">
          <div className="result-card highlight">
            <h3>Total Daily Consumption</h3>
            <p className="result-value">
              {results.totalDailyKWh.toFixed(2)} kWh/day
            </p>
            <span>{results.totalDailyWh.toLocaleString()} Wh/day</span>
          </div>

          <div className="result-card">
            <h3>Recommended Inverter</h3>
            <p className="result-value">
              {results.recommendedInverterKVA.toFixed(1)} kVA
            </p>
            <span>
              Running load {(results.peakRunningWatts / 1000).toFixed(2)} kW;
              estimated startup load{" "}
              {(results.estimatedStartupWatts / 1000).toFixed(2)} kW
            </span>
          </div>

          <div className="result-card">
            <h3>Suggested Battery Storage</h3>
            <p className="result-value">
              {results.recommendedBatteryKWh.toFixed(1)} kWh
            </p>
            <span>
              Estimated for about {toNumber(batteryBackupHours)} hours backup
            </span>
          </div>

          <div className="result-card">
            <h3>Suggested Solar Array</h3>
            <p className="result-value">
              {results.recommendedSolarKWp.toFixed(1)} kWp
            </p>
            <span>
              Estimated using {sizingAssumptions.peakSunHours} peak sun hours
              and a 25% system-loss allowance
            </span>
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
              <span>{(item.dailyWh / 1000).toFixed(2)} kWh/day</span>
            </div>
          ))}
        </div>
      </div>

      <div className="calculator-note">
        <strong>Planning assumptions</strong>
        <ul>
          <li>Inverter sizing includes headroom, power factor, and startup surge.</li>
          <li>
            Battery sizing uses each appliance&apos;s stated hours within the
            selected backup window, 80% usable capacity, and 90% inverter
            efficiency.
          </li>
          <li>
            Solar sizing uses 5 peak sun hours and a 25% allowance for system
            losses.
          </li>
        </ul>
        <p>
          These figures are preliminary planning estimates. BuiltRight will
          confirm the final design after inspection and a professional load
          audit.
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
