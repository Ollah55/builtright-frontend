import React from "react";
import EnergyCalculator from "../../components/EnergyCalculator/EnergyCalculator";
import "./energyCalculatorPage.css";

const inverterRanges = [
  {
    size: "1.5 kVA",
    use: "Essential appliances",
    price: "₦110,000 - ₦525,000",
  },
  {
    size: "3.5 kVA",
    use: "Small home or office",
    price: "₦320,000 - ₦550,000",
  },
  {
    size: "5 kVA",
    use: "Standard family home",
    price: "₦522,000 - ₦637,000",
  },
  {
    size: "7.5/10 kVA",
    use: "Large home or business",
    price: "₦735,000 - ₦1,200,000",
  },
  {
    size: "15 kVA+",
    use: "Commercial system",
    price: "₦1,300,000 - ₦3,486,000",
  },
];

const batteryRanges = [
  {
    size: "2.56 kWh lithium",
    use: "Compact backup storage",
    price: "₦320,000 - ₦580,000",
  },
  {
    size: "5 - 5.3 kWh lithium",
    use: "Small home or office storage",
    price: "₦865,200 - ₦1,497,200",
  },
  {
    size: "7.2 - 7.68 kWh lithium",
    use: "Medium home storage",
    price: "₦1,115,800 - ₦1,520,000",
  },
  {
    size: "10 - 10.24 kWh lithium",
    use: "Family home or office storage",
    price: "₦1,626,800 - ₦2,850,000",
  },
  {
    size: "14.4 - 16.07 kWh lithium",
    use: "Large home or business storage",
    price: "₦1,957,200 - ₦3,400,000",
  },
  {
    size: "24 kWh lithium",
    use: "High-capacity commercial storage",
    price: "From ₦5,415,000",
  },
];

function EnergyCalculatorPage() {
  return (
    <main className="energy-calculator-page">
      <section className="equipment-price-guide" aria-labelledby="price-guide-title">
        <div className="equipment-price-guide__intro">
          <span className="equipment-price-guide__eyebrow">October 2026 price guide</span>
          <h1 id="price-guide-title">Common Solar System Sizes and Equipment Prices</h1>
          <p>
            Compare common inverter and battery capacities before calculating your
            estimated energy requirement. Prices vary by brand, model, warranty,
            availability and supplier quotation.
          </p>
          <a href="#solar-energy-calculator" className="equipment-price-guide__jump">
            Calculate your requirement
          </a>
        </div>

        <div className="equipment-price-group">
          <div className="equipment-price-group__heading">
            <div>
              <span>Power conversion</span>
              <h2>Inverter price ranges</h2>
            </div>
            <p>Indicative inverter-only prices, depending on brand.</p>
          </div>

          <div className="equipment-price-grid">
            {inverterRanges.map((item) => (
              <article className="equipment-price-card" key={item.size}>
                <span className="equipment-price-card__type">Inverter</span>
                <h3>{item.size}</h3>
                <p>{item.use}</p>
                <strong>{item.price}</strong>
                <small>Depending on brand</small>
              </article>
            ))}
          </div>
        </div>

        <div className="equipment-price-group">
          <div className="equipment-price-group__heading">
            <div>
              <span>Energy storage</span>
              <h2>Lithium battery price ranges</h2>
            </div>
            <p>Compiled from the uploaded supplier catalogue.</p>
          </div>

          <div className="equipment-price-grid equipment-price-grid--batteries">
            {batteryRanges.map((item) => (
              <article className="equipment-price-card equipment-price-card--battery" key={item.size}>
                <span className="equipment-price-card__type">Battery</span>
                <h3>{item.size}</h3>
                <p>{item.use}</p>
                <strong>{item.price}</strong>
                <small>Depending on brand and model</small>
              </article>
            ))}
          </div>

          <div className="equipment-price-guide__secondary">
            <strong>Tubular, lead-acid and dry-cell batteries:</strong>
            <span> ₦265,000 - ₦372,000 per 12 V, 200 - 230 Ah battery.</span>
          </div>
        </div>

        <aside className="equipment-price-guide__notice">
          <strong>Please note:</strong> These are indicative equipment prices, not
          final project quotations. Installation materials, cable distances,
          mounting structure, protection accessories and additional electrical or
          civil work are confirmed only after load audit and site inspection.
          Availability, VAT and final supplier prices must also be confirmed.
        </aside>
      </section>

      <div id="solar-energy-calculator">
      <EnergyCalculator />
      </div>
    </main>
  );
}

export default EnergyCalculatorPage;
