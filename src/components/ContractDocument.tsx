import { forwardRef } from "react";
import { Contract, CompanySettings } from "@/types";
import { format } from "date-fns";
import { DonutIcon, Dot, DotIcon, LucideAArrowDown } from "lucide-react";

interface ContractDocumentProps {
  contract: Partial<Contract>;
  settings: CompanySettings;
}

export const ContractDocument = forwardRef<HTMLDivElement, ContractDocumentProps>(
  ({ contract, settings }, ref) => {
    const client = contract.client;
    const costs = contract.costs;
    const payment = contract.payment;
    const menu = contract.menu ?? [];
    const terms = contract.terms ?? [];
    const signatures = contract.signatures;

    const formatCurrency = (n: number = 0) =>
      n.toLocaleString("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).replace("KES", "Ksh");

    const eventDateFormatted = client?.eventDate
      ? (() => {
          try { return format(new Date(client.eventDate), "do MMMM yyyy"); }
          catch { return client.eventDate; }
        })()
      : "__________________";

    return (

<div
  ref={ref}
  className="contract-document"
  style={{
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "white",
    color: "#333",
    width: "210mm",
    minHeight: "297mm",
    padding: "10mm",
    paddingTop: "5mm",
    position: "relative",
    // boxSizing: "border-box",
    fontSize: "11pt",
    lineHeight: 1.5,
  }}
>


        {/* WATERMARK — position: fixed in @media print makes it appear on every page */}
{/* <div className="watermark" aria-hidden="true" >
          {settings.watermark ? (
            <img
              src={settings.watermark}
              alt="watermark"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span
              style={{
                fontSize: "72px",
                fontWeight: 900,
                color: "#c9a66b",
                textAlign: "center",
                letterSpacing: "-2px",
                whiteSpace: "nowrap",
              }}
            >
              {settings.companyName || "BENKIZ"}
            </span>
          )}
        </div> */}

        {/* All content above watermark */}
        <div style={{ position: "relative", zIndex: 1000 }}>
          {/* HEADER */}
          <header
            style={{
              borderBottom: "2px solid #c9a66b",
              paddingBottom: "15px",
              marginBottom: "20px",
              display: "grid",
              gridTemplateColumns: "80px 1fr",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.companyName}
                  style={{ width: "70px", height: "70px", objectFit: "contain" }}
                />
              ) : (
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    background: "#f3e5d8",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    color: "#8b5e3c",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  LOGO
                </div>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ margin: "0 0 4px", fontSize: "18pt", color: "#5a3e2b", fontWeight: 700 }}>
                CATERING SERVICES AGREEMENT
              </h1>
              <p style={{ margin: 0, fontSize: "9.5pt", color: "#8b5e3c" }}>
                {settings.companyName}
              </p>
              <p style={{ margin: 0, fontSize: "9pt", color: "#666" }}>
                {settings.address} &bull; {settings.phone} &bull; {settings.email}
              </p>
            </div>
          </header>

          {/* CLIENT DETAILS */}
          <section style={{ marginBottom: "20px" }}>
            <h2 style={{ color: "#8b5e3c", borderBottom: "1px solid #ddd", paddingBottom: "4px", fontSize: "12pt", marginBottom: "10px" }}>
              Client Details
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10.5pt" }}>
              <div><strong>Client Name:</strong> {client?.name || "__________________"}</div>
              <div><strong>Phone Number:</strong> {client?.phone || "__________________"}</div>
              <div><strong>Address:</strong> {client?.address || "__________________"}</div>
              {/* <div><strong>Quotation No:</strong> {contract.quotationNumber ?? "153"}</div> */}
              <div><strong>Quotation No:</strong> {"153"}</div>
              <div><strong>Event Date:</strong> {eventDateFormatted}</div>
              <div><strong>Event Type:</strong> {client?.eventType || "__________________"}</div>
              <div><strong>Venue:</strong> {client?.venue || "__________________"}</div>
              <div><strong>Guest Count:</strong> {client?.guestCount || "__"}</div>
            </div>
          </section>

          {/* MENU / SERVICES */}
          {menu.length > 0 && (
            <section style={{ marginBottom: "20px" }}>
              <h2 style={{ color: "#8b5e3c", borderBottom: "1px solid #ddd", paddingBottom: "4px", fontSize: "12pt", marginBottom: "10px" }}>
                Services Provided
              </h2>
              {menu.map((section, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <h3 style={{ color: "#5a3e2b", fontSize: "11pt", margin: "0 0 4px", fontWeight: 600 }}>
                    {section.title}
                  </h3>
                  <ul style={{ margin: "0 0 8px", paddingLeft: "20px", fontSize: "10pt" }}>
                    {section.items.map((item, j) => (
                       <li key={j}> {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* COST BREAKDOWN */}
          <section style={{ marginBottom: "20px" ,marginLeft:"20px"}}>
            <h2 style={{ color: "#8b5e3c", borderBottom: "1px solid #ddd", paddingBottom: "4px", fontSize: "12pt", marginBottom: "10px" }}>
              Cost Breakdown
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5pt" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "7px 10px", background: "#f3e5d8", textAlign: "left" }}>Description</th>
                  <th style={{ border: "1px solid #ddd", padding: "7px 10px", background: "#f3e5d8", textAlign: "right", width: "140px" }}>Amount (Ksh)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Shopping List Total", value: costs?.shoppingCost },
                  { label: "Transport", value: costs?.transportCost },
                  { label: "Labour Cost", value: costs?.labourCost },
                  { label: "Equipment Cost", value: costs?.equipmentCost },
                  { label: "Catering Fee", value: costs?.cateringFee },
                  { label: "Extra Costs", value: costs?.extraCost },
                ].map(({ label, value }) =>
                  (value ?? 0) > 0 ? (
                    <tr key={label}>
                      <td style={{ border: "1px solid #ddd", padding: "6px 10px" }}>{label}</td>
                      <td style={{ border: "1px solid #ddd", padding: "6px 10px", textAlign: "right" }}>{formatCurrency(value)}</td>
                    </tr>
                  ) : null
                )}
                <tr style={{ background: "#f3e5d8", fontWeight: 700, fontSize: "11.5pt" }}>
                  <td style={{ border: "1px solid #ddd", padding: "8px 10px" }}>TOTAL AMOUNT</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px 10px", textAlign: "right" }}>{formatCurrency(costs?.total)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* PAYMENT TERMS */}
          <section style={{ marginBottom: "20px" }}>
            <h2 style={{ color: "#8b5e3c", borderBottom: "1px solid #ddd", paddingBottom: "4px", fontSize: "12pt", marginBottom: "10px" }}>
              Payment Terms
            </h2>
            <p style={{ margin: "0 0 4px", fontSize: "10.5pt" }}>
              {payment?.depositPercent ?? 75}% deposit required to secure booking.
            </p>
            <p style={{ margin: "0 0 10px", fontSize: "10.5pt" }}>
              {payment?.balancePercent ?? 25}% balance due before or on event day.
            </p>
            <p style={{ margin: 0, fontSize: "10.5pt" }}>
              <strong>LIPA NA MPESA:</strong><br />
              Paybill: {payment?.mpesaPaybill || settings.mpesaPaybill}<br />
              Account: {payment?.mpesaAccount || settings.mpesaAccount}
            </p>
          </section>

          {/* TERMS & CONDITIONS */}
          {terms.length > 0 && (
            <section style={{ marginBottom: "20px" }}>
              <h2 style={{ color: "#8b5e3c", borderBottom: "1px solid #ddd", paddingBottom: "4px", fontSize: "12pt", marginBottom: "10px" }}>
                Terms & Conditions
              </h2>
              <ol style={{ paddingLeft: "20px", margin: 0, fontSize: "10pt" }}>
                {terms.map((term, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>{term}</li>
                ))}
              </ol>
            </section>
          )}

          {/* SIGNATURES */}
          <section style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            <div>
              <p style={{ marginBottom: "8px", fontSize: "10.5pt", fontWeight: 600 }}>Client Signature:</p>
              <div style={{ borderBottom: "1px solid #000", height: "35px", marginBottom: "8px" }}></div>
              <p style={{ fontSize: "10pt", color: "#666" }}>{signatures?.clientName || "Client Name & Date"}</p>
            </div>
            <div>
              <p style={{ marginBottom: "8px", fontSize: "10.5pt", fontWeight: 600 }}>Company Representative:</p>
              <div style={{ borderBottom: "1px solid #000", height: "35px", marginBottom: "8px" }}></div>
              <p style={{ fontSize: "10pt", color: "#666" }}>{signatures?.companyRepresentative || "Representative & Stamp"}</p>
            </div>
          </section>

          {/* FOOTER */}
          <footer
            style={{
              marginTop: "30px",
              borderTop: "2px solid #c9a66b",
              paddingTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "9.5pt",
              color: "#8b5e3c",
            }}
          >
            <span>Thank you for choosing {settings.companyName}</span>
            <div
              style={{
                width: "70px",
                height: "70px",
                border: "1.5px dashed #999",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8pt",
                color: "#999",
                borderRadius: "4px",
              }}
            >
              <img src='/qrcode.png' />
            </div>
          </footer>
        </div>
      </div>
    );
  }
);

ContractDocument.displayName = "ContractDocument";
