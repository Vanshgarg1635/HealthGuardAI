import React from "react";
import { X, AlertTriangle, TrendingUp, ArrowDown, Users } from "lucide-react";
import "../styles/ReportOverViewModal.css";

export default function ReportOverviewModal({ report, onClose }) {
  if (!report || !report.extracted_data) return null;

  const data = report.extracted_data;

  // ------------------ TRANSFORM BACKEND → UI FORMAT ------------------ //
  const risk_summary = { high: [], medium: [], normal: [] };

  if (Array.isArray(data.parameters)) {
    data.parameters.forEach((p) => {
      if (!p?.name) return;
      const label = `${p.name}: ${p.value}`;
      if (["High", "Critical"].includes(p.severity)) risk_summary.high.push(label);
      else if (["Abnormal", "Low"].includes(p.severity)) risk_summary.medium.push(label);
      else risk_summary.normal.push(label);
    });
  }

  // List of specialist titles
  const specialistTitles = [
    "Allergist / Immunologist",
    "Endocrinologist",
    "Gastroenterologist",
    "Hematologist",
    "Infectious Disease Specialist",
    "Nephrologist",
    "Pulmonologist",
    "Rheumatologist",
    "Cardiologist",
    "General Physician / Internist",
    "General Surgeon",
    "Cardiothoracic Surgeon",
    "Neurosurgeon",
    "Orthopedic Surgeon",
    "Plastic Surgeon",
    "Pediatric Surgeon",
    "Urologist",
    "Vascular Surgeon",
    "Colorectal Surgeon",
    "ENT Surgeon (Otolaryngologist)",
    "Gynecologist",
    "Obstetrician",
    "Reproductive Endocrinologist / Fertility Specialist",
    "Maternal-Fetal Medicine Specialist",
    "Pediatrician",
    "Pediatric Cardiologist",
    "Pediatric Neurologist",
    "Pediatric Surgeon",
    "Pediatric Endocrinologist",
    "Neurologist",
    "Psychiatrist",
    "Child & Adolescent Psychiatrist",
    "Geriatric Psychiatrist",
    "Neuropsychiatrist",
    "Dermatologist",
    "Mohs Surgeon",
    "Cosmetic Dermatologist",
    "Pediatric Dermatologist",
    "Ophthalmologist",
    "Retina Specialist",
    "Cornea Specialist",
    "Pediatric Ophthalmologist",
    "Glaucoma Specialist",
    "Otolaryngologist",
    "Head & Neck Surgeon",
    "Audiologist",
    "Orthopedic Surgeon",
    "Sports Medicine Specialist",
    "Physical Medicine & Rehabilitation Specialist",
    "Interventional Cardiologist",
    "Electrophysiologist",
    "Cardiac Surgeon",
    "Medical Oncologist",
    "Surgical Oncologist",
    "Radiation Oncologist",
    "Pediatric Oncologist",
    "Hemato-Oncologist",
    "Emergency Medicine Specialist",
    "Intensivist / Critical Care Specialist",
    "Trauma Surgeon",
    "Oral & Maxillofacial Surgeon",
    "Orthodontist",
    "Endodontist",
    "Periodontist",
    "Pediatric Dentist",
    "Dietitian / Nutritionist",
    "Integrative Medicine Specialist",
    "Anesthesiologist",
    "Pain Medicine Specialist",
    "Geriatrician",
    "Occupational Medicine Specialist",
    "Sleep Medicine Specialist",
    "Geneticist / Medical Geneticist",
    "Sports Medicine Physician",
    "Palliative Care Specialist",
    "Addiction Medicine Specialist"
  ];

  // Get the recommendedText from specialist recommendations
  const recommendedText = (data.specialist_recommendations || []).join(" ").toLowerCase();

  // Get the matched specialists based on the refined logic
  const matchedSpecialists = specialistTitles.filter((title) =>
    recommendedText.includes(title.toLowerCase())
  ).slice(0, 5);

  // ------------------ LIFESTYLE PLAN (Diet, Exercise, etc.) ------------------ //
  const lifestyle_recommendations = { diet: [], exercise: [], general: [] };
  if (data.diet_exercise_plan) {
    const lines = data.diet_exercise_plan.split("\n").map((x) => x.trim());
    lifestyle_recommendations.diet = lines.filter((l) => l.toLowerCase().includes("diet")).slice(0, 5);
    lifestyle_recommendations.exercise = lines.filter((l) => l.toLowerCase().includes("exercise")).slice(0, 5);
    lifestyle_recommendations.general = lines
      .filter((l) => !l.toLowerCase().includes("diet") && !l.toLowerCase().includes("exercise") && l !== "")
      .slice(0, 5);
  }

  // ------------------ UI RENDER ------------------ //
  return (
    <div className="overview-modal-overlay">
      <div className="overview-modal">

        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="overview-title">Medical Report Overview</h2>

        {/* ------------------ SEVERITY CARD SECTION ------------------ */}
        <div className="severity-section">

          <div className="severity-card high">
            <div className="severity-header"><AlertTriangle /> <h3>High Risk</h3></div>
            <p className="severity-count">{risk_summary.high.length}</p>
            <ul>{risk_summary.high.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>

          <div className="severity-card medium">
            <div className="severity-header"><TrendingUp /> <h3>Medium Risk</h3></div>
            <p className="severity-count">{risk_summary.medium.length}</p>
            <ul>{risk_summary.medium.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>

          <div className="severity-card normal">
            <div className="severity-header"><ArrowDown /> <h3>Normal</h3></div>
            <p className="severity-count">{risk_summary.normal.length}</p>
            <ul>{risk_summary.normal.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>

        </div>

        {/* ------------------ SPECIALISTS SECTION ------------------ */}
        <div className="specialist-section">
          <h3><Users /> Recommended Specialists</h3>
          <div className="specialists-list">
            {matchedSpecialists.length > 0 ? (
              matchedSpecialists.map((s, i) => <span key={i} className="specialist-pill">{s}</span>)
            ) : (
              <p>No specialists recommended.</p>
            )}
          </div>
        </div>

        {/* ------------------ LIFESTYLE SECTION ------------------ */}
        <div className="lifestyle-container">
          <h3>Lifestyle Recommendations</h3>
          <div className="lifestyle-grid">

            <div>
              <h4>Diet</h4>
              <ul>
                {lifestyle_recommendations.diet.length > 0 ? (
                  lifestyle_recommendations.diet.map((item, i) => <li key={i}>{item}</li>)
                ) : (
                  <li>No diet recommendations.</li>
                )}
              </ul>
            </div>

            <div>
              <h4>Exercise</h4>
              <ul>
                {lifestyle_recommendations.exercise.length > 0 ? (
                  lifestyle_recommendations.exercise.map((item, i) => <li key={i}>{item}</li>)
                ) : (
                  <li>No exercise recommendations.</li>
                )}
              </ul>
            </div>

            <div>
              <h4>Lifestyle</h4>
              <ul>
                {lifestyle_recommendations.general.length > 0 ? (
                  lifestyle_recommendations.general.map((item, i) => <li key={i}>{item}</li>)
                ) : (
                  <li>No general recommendations.</li>
                )}
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
