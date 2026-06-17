import React, { useMemo, useState } from "react";
import { Child, GrowthRecord } from "../types";

interface KmsChartProps {
  child: Child;
  records: GrowthRecord[];
}

export default function KmsChart({ child, records }: KmsChartProps) {
  const [chartType, setChartType] = useState<"weight" | "height">("weight");

  const isMale = child.gender === "Laki-laki";

  // Standard WHO curves data point approximations (0-24 months)
  const whoReferenceData = useMemo(() => {
    const points = [];
    for (let m = 0; m <= 24; m += 2) {
      if (chartType === "weight") {
        if (isMale) {
          // Boys weight-for-age SD approximations
          points.push({
            month: m,
            sdMinus3: 2.1 + m * 0.35 + (m > 12 ? (m - 12) * -0.05 : 0),
            sdMinus2: 2.5 + m * 0.42 + (m > 12 ? (m - 12) * -0.06 : 0),
            sd0: 3.3 + m * 0.55 + (m > 12 ? (m - 12) * -0.1 : 0),
            sdPlus2: 4.3 + m * 0.68 + (m > 12 ? (m - 12) * -0.14 : 0),
            sdPlus3: 5.0 + m * 0.75 + (m > 12 ? (m - 12) * -0.16 : 0),
          });
        } else {
          // Girls weight-for-age SD approximations
          points.push({
            month: m,
            sdMinus3: 2.0 + m * 0.32 + (m > 12 ? (m - 12) * -0.04 : 0),
            sdMinus2: 2.4 + m * 0.38 + (m > 12 ? (m - 12) * -0.05 : 0),
            sd0: 3.2 + m * 0.50 + (m > 12 ? (m - 12) * -0.09 : 0),
            sdPlus2: 4.2 + m * 0.63 + (m > 12 ? (m - 12) * -0.11 : 0),
            sdPlus3: 4.8 + m * 0.70 + (m > 12 ? (m - 12) * -0.13 : 0),
          });
        }
      } else {
        // Height curves (cm)
        if (isMale) {
          points.push({
            month: m,
            sdMinus3: 46 + m * 1.8 + (m > 12 ? (m - 12) * -0.5 : 0),
            sdMinus2: 48 + m * 1.95 + (m > 12 ? (m - 12) * -0.5 : 0),
            sd0: 50.5 + m * 2.2 + (m > 12 ? (m - 12) * -0.55 : 0),
            sdPlus2: 53 + m * 2.45 + (m > 12 ? (m - 12) * -0.6 : 0),
            sdPlus3: 55 + m * 2.6 + (m > 12 ? (m - 12) * -0.65 : 0),
          });
        } else {
          points.push({
            month: m,
            sdMinus3: 45 + m * 1.75 + (m > 12 ? (m - 12) * -0.5 : 0),
            sdMinus2: 47 + m * 1.9 + (m > 12 ? (m - 12) * -0.5 : 0),
            sd0: 49.5 + m * 2.15 + (m > 12 ? (m - 12) * -0.55 : 0),
            sdPlus2: 52 + m * 2.4 + (m > 12 ? (m - 12) * -0.6 : 0),
            sdPlus3: 54 + m * 2.55 + (m > 12 ? (m - 12) * -0.65 : 0),
          });
        }
      }
    }
    return points;
  }, [chartType, isMale]);

  // Width/Height logic for SVG Drawing
  const width = 600;
  const height = 360;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Domain scaling
  const maxAge = 24;
  const minY = chartType === "weight" ? 1.5 : 40;
  const maxY = chartType === "weight" ? 17 : 105;

  const getX = (month: number) => {
    return paddingLeft + (month / maxAge) * chartWidth;
  };

  const getY = (val: number) => {
    // scale from bottom up
    return paddingTop + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
  };

  // Generate SVG Path for ref SD curves
  const makePath = (key: "sdMinus3" | "sdMinus2" | "sd0" | "sdPlus2" | "sdPlus3") => {
    return whoReferenceData
      .map((p, idx) => {
        const x = getX(p.month);
        const y = getY(p[key]);
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  // Shaded area paths for standard WHO Zones
  // Zone Normal: sdMinus2 up to sdPlus2
  const normalZonePath = useMemo(() => {
    const pts = whoReferenceData;
    let forward = "";
    let backward = "";
    for (let i = 0; i < pts.length; i++) {
      forward += `${i === 0 ? "M" : "L"} ${getX(pts[i].month)} ${getY(pts[i].sdPlus2)}`;
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      backward += ` L ${getX(pts[i].month)} ${getY(pts[i].sdMinus2)}`;
    }
    return forward + backward + " Z";
  }, [whoReferenceData]);

  // Zone Underweight Risk: sdMinus3 to sdMinus2
  const warningLowerZonePath = useMemo(() => {
    const pts = whoReferenceData;
    let forward = "";
    let backward = "";
    for (let i = 0; i < pts.length; i++) {
      forward += `${i === 0 ? "M" : "L"} ${getX(pts[i].month)} ${getY(pts[i].sdMinus2)}`;
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      backward += ` L ${getX(pts[i].month)} ${getY(pts[i].sdMinus3)}`;
    }
    return forward + backward + " Z";
  }, [whoReferenceData]);

  // Child's plotted measurements
  const plottedPoints = useMemo(() => {
    return records
      .filter((r) => r.ageMonths <= 24)
      .map((r) => ({
        x: getX(r.ageMonths),
        y: getY(chartType === "weight" ? r.weightKg : r.heightCm),
        age: r.ageMonths,
        val: chartType === "weight" ? r.weightKg : r.heightCm,
        date: r.date,
        original: r,
      }));
  }, [records, chartType]);

  const childLinePath = useMemo(() => {
    if (plottedPoints.length < 2) return "";
    return plottedPoints
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }, [plottedPoints]);

  // Grid lines
  const gridX = Array.from({ length: 13 }, (_, i) => i * 2); // 0, 2, ..., 24
  const gridY = useMemo(() => {
    const arr = [];
    const step = chartType === "weight" ? 2 : 10;
    for (let y = minY; y <= maxY; y += step) {
      arr.push(y);
    }
    return arr;
  }, [chartType, minY, maxY]);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100" id="kms-chart-card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Grafik Kartu Menuju Sehat (KMS) Digital
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Mencocokkan Tinggi/Berat Badan dengan Standar Deviasi WHO Anak {child.gender}
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg self-end sm:self-center">
          <button
            onClick={() => setChartType("weight")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              chartType === "weight"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-800"
            }`}
            id="btn-chart-weight"
          >
            Berat Badan (BB/U)
          </button>
          <button
            onClick={() => setChartType("height")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              chartType === "height"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-800"
            }`}
            id="btn-chart-height"
          >
            Panjang Badan (TB/U)
          </button>
        </div>
      </div>

      {/* SVG rendering */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[600px] select-none mx-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Background grids */}
            {gridY.map((yVal) => (
              <line
                key={yVal}
                x1={paddingLeft}
                y1={getY(yVal)}
                x2={width - paddingRight}
                y2={getY(yVal)}
                stroke="#f1f5f9"
                strokeWidth={1.5}
              />
            ))}

            {gridX.map((xVal) => (
              <line
                key={xVal}
                x1={getX(xVal)}
                y1={paddingTop}
                x2={getX(xVal)}
                y2={height - paddingBottom}
                stroke="#f1f5f9"
                strokeWidth={1.5}
              />
            ))}

            {/* WHO Standard Deviation Bands */}
            {/* Warning Underweight Zone - Yellow */}
            <path d={warningLowerZonePath} fill="#fef08a" opacity="0.45" />

            {/* Normal Green Zone */}
            <path d={normalZonePath} fill="#bbf7d0" opacity="0.5" />

            {/* WHO Reference Lines */}
            <path d={makePath("sdPlus3")} fill="none" stroke="#f87171" strokeWidth={1} strokeDasharray="3 3" />
            <path d={makePath("sdPlus2")} fill="none" stroke="#22c55e" strokeWidth={1} strokeDasharray="3 2" />
            <path d={makePath("sd0")} fill="none" stroke="#15803d" strokeWidth={1.8} />
            <path d={makePath("sdMinus2")} fill="none" stroke="#eab308" strokeWidth={1} strokeDasharray="3 2" />
            <path d={makePath("sdMinus3")} fill="none" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" />

            {/* Axis labels */}
            {/* X-Axis Month Marks */}
            {gridX.map((xVal) => (
              <g key={xVal}>
                <text
                  x={getX(xVal)}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  className="font-mono text-[10px] fill-slate-500 font-medium"
                >
                  {xVal} bln
                </text>
                <line
                  x1={getX(xVal)}
                  y1={height - paddingBottom}
                  x2={getX(xVal)}
                  y2={height - paddingBottom + 4}
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                />
              </g>
            ))}

            {/* Y-Axis Value Labels */}
            {gridY.map((yVal) => (
              <g key={yVal}>
                <text
                  x={paddingLeft - 10}
                  y={getY(yVal) + 3}
                  textAnchor="end"
                  className="font-mono text-[10px] fill-slate-500 font-semibold"
                >
                  {yVal}
                </text>
                <line
                  x1={paddingLeft - 4}
                  y1={getY(yVal)}
                  x2={paddingLeft}
                  y2={getY(yVal)}
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                />
              </g>
            ))}

            {/* Axis Titles */}
            <text
              x={width / 2}
              y={height - 5}
              textAnchor="middle"
              className="text-xs font-semibold fill-slate-600"
            >
              Usia Perkembangan (Bulan)
            </text>
            <text
              transform={`rotate(-90 ${15} ${height / 2})`}
              x={15}
              y={height / 2}
              textAnchor="middle"
              className="text-xs font-semibold fill-slate-600"
            >
              {chartType === "weight" ? "Berat Badan (kg)" : "Tinggi / Panjang (cm)"}
            </text>

            {/* Plot User Records */}
            {plottedPoints.length > 0 && (
              <>
                {childLinePath && (
                  <path
                    d={childLinePath}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    className="animate-pulse"
                  />
                )}
                {plottedPoints.map((pt, index) => (
                  <g key={index} className="group cursor-pointer">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={5.5}
                      fill="#0284c7"
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="transition-all duration-200 hover:scale-130"
                    />
                    <title>{`Bulan ${pt.age}: ${pt.val} ${
                      chartType === "weight" ? "kg" : "cm"
                    } (${pt.date})`}</title>
                  </g>
                ))}
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Map Legend */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-5 h-3 bg-emerald-200 border border-emerald-400 opacity-60 rounded"></span>
          <span>Sesuai Standar (Normal)</span>
        </div>
        <div className="flex items-center gap-2 col-span-1">
          <span className="w-5 h-3 bg-yellow-100 border border-yellow-300 opacity-70 rounded"></span>
          <span>Risiko Kurang / Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-0.5 border-t-2 border-emerald-700 block"></span>
          <span>Median WHO (Ideal)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 bg-sky-600 border border-white rounded-full inline-block"></span>
          <span>Pertumbuhan Balita Anda</span>
        </div>
      </div>
    </div>
  );
}
