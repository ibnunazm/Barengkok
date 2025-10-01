"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

type Tank = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type TankMonitoringItem = {
  tank_id: number;
  turbidity: number;
  ph: number;
  volume: number;
  created_at: string;
  status: string;
};

export default function WaterMonitoringPage() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [monitoringData, setMonitoringData] = useState<TankMonitoringItem[]>(
    []
  );
  const [latestMonitoringByTank, setLatestMonitoringByTank] = useState<
    Record<number, TankMonitoringItem>
  >({});

  const baseURL = "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tankRes = await axios.get(`${baseURL}/api/tank`, {
          auth: { username: "cxianz", password: "E7r$wT!zKq@2" },
        });
        setTanks(tankRes.data);

        const monitoringRes = await axios.get(
          `${baseURL}/api/tank-monitoring`,
          {
            auth: { username: "cxianz", password: "E7r$wT!zKq@2" },
          }
        );

        const allMonitoring = monitoringRes.data as TankMonitoringItem[];
        setMonitoringData(allMonitoring);

        const latestByTank: Record<number, TankMonitoringItem> = {};
        allMonitoring.forEach((item) => {
          if (
            !latestByTank[item.tank_id] ||
            new Date(item.created_at) >
              new Date(latestByTank[item.tank_id].created_at)
          ) {
            latestByTank[item.tank_id] = item;
          }
        });

        setLatestMonitoringByTank(latestByTank);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const getTodayMonitoringByTankId = (
    tank_id: number
  ): TankMonitoringItem[] => {
    const today = new Date().toISOString().split("T")[0];
    return monitoringData.filter((item) => {
      return item.tank_id === tank_id && item.created_at.startsWith(today);
    });
  };

  return (
    <div className="bg-[#081220] text-white font-sans">
      <div className="flex flex-col md:flex-row sm:justify-between items-center py-2 mb-4 px-4 bg-gradient-to-r from-[#064A8A] to-[#0A253F]">
        <img
          src="/assets/logo.png"
          alt="Logos"
          className="h-[90px] w-[480px]"
        />
        <div className="flex flex-col md:flex-row items-center justify-center text-center gap-2 md:gap-4 text-gray-300 text-md">
          <Link href="/" className="cursor-pointer">
            Monitoring PJU
          </Link>
          <div className="font-bold">Monitoring Air</div>
        </div>
      </div>

      {tanks.map((tank, index) => {
        const latest = latestMonitoringByTank[tank.id];
        const history = getTodayMonitoringByTankId(tank.id);

        return (
          <div
            key={tank.id}
            className="bg-[#12335A] rounded-2xl p-4 md:p-6 mb-8 mx-4 md:mx-8 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold">
                {tank.name ?? `Tangki Air ${index + 1}`}
              </h2>
              <div className="flex flex-col items-end text-xs text-gray-400 text-right">
                <a
                  href={`https://www.google.com/maps?q=${tank.latitude},${tank.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Lokasi: ({tank.latitude}, {tank.longitude})
                </a>
                <span>
                  {latest?.created_at
                    ? new Date(latest.created_at).toLocaleString()
                    : "Belum ada data"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <PhIndicatorCard
                label="pH Air"
                icon="/assets/ph-bar.png"
                value={`${latest?.ph ?? 0}`}
                ph={latest?.ph ?? 0}
              />
              <TurbidityIndicatorCard
                label="Kejernihan"
                icon="/assets/ntu-bar-100.png"
                value={`${latest?.turbidity ?? 0} NTU`}
                turbidity={latest?.turbidity ?? 0}
              />

              <InfoCard
                label="Volume"
                icon={getVolumeIcon(latest?.volume)}
                value={`${latest?.volume ?? 0} L`}
              />
              <InfoCard
                label="Status"
                icon={getStatusIcon(latest?.status)}
                value=""
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 px-4">
              <TrendCard
                title="Trend pH Air"
                data={history.map((item) => ({
                  time: new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  value: item.ph,
                }))}
              />
              <TrendCard
                title="Trend Kejernihan"
                data={history.map((item) => ({
                  time: new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  value: item.turbidity,
                }))}
              />
              <TrendCard
                title="Trend Volume Penggunaan Air"
                data={history.map((item) => ({
                  time: new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  value: item.volume,
                }))}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoCard({
  label,
  icon,
  value,
}: {
  label: string;
  icon: string;
  value: string;
}) {
  return (
    <div className="bg-[#0B2946] p-4 rounded-xl text-center flex flex-col items-center justify-between h-full min-h-[220px]">
      <p className="text-lg mb-2 text-white">{label}</p>
      <div className="flex-grow flex items-center justify-center">
        <img
          src={icon}
          alt={label}
          className={`object-contain max-h-28 max-w-[90%]`}
        />
      </div>
      <p className="text-2xl font-bold mt-2 text-green-400">{value}</p>
    </div>
  );
}

const getPhStatus = (ph: number): { label: string; color: string } => {
  if (ph >= 6.5 && ph <= 8.5) {
    return { label: "BAIK", color: "text-green-500" };
  } else if ((ph >= 5.5 && ph < 6.5) || (ph > 8.5 && ph <= 9.5)) {
    return { label: "CUKUP BAIK", color: "text-yellow-500" };
  } else {
    return { label: "BURUK", color: "text-red-500" };
  }
};

function PhIndicatorCard({
  label,
  icon,
  value,
  ph,
}: {
  label: string;
  icon: string;
  value: string;
  ph: number;
}) {
  const { label: statusLabel, color: statusColor } = getPhStatus(ph);
  const clampedPh = Math.max(0, Math.min(ph, 14));
  const leftPercentage = (clampedPh / 14) * 100;

  return (
    <div className="bg-[#0B2946] p-4 rounded-xl text-center text-white flex flex-col justify-between h-full min-h-[220px]">
      <p className="text-lg mb-2">{label}</p>

      <div className="flex-grow flex flex-col items-center w-full max-w-[700px] mx-auto">
        <div className="relative w-full">
          <img src={icon} alt={label} className="w-full" />
          <div
            className="absolute w-0.5 bg-white"
            style={{
              top: "0",
              height: "60%",
              marginTop: "5%",
              left: `${leftPercentage}%`,
              transform: "translateX(-50%)",
            }}
          ></div>
        </div>
        <div className="mt-4 text-sm font-bold text-white text-center">
          {value}
        </div>
        {statusLabel && (
          <div className={`mt-2 text-2xl font-bold ${statusColor}`}>
            {statusLabel}
          </div>
        )}
      </div>
    </div>
  );
}

const getTurbidityStatus = (ntu: number): { label: string; color: string } => {
  if (ntu <= 5) {
    return { label: "SANGAT JERNIH", color: "text-green-500" };
  } else if (ntu <= 25) {
    return { label: "JERNIH", color: "text-yellow-500" };
  } else {
    return { label: "KERUH", color: "text-red-500" };
  }
};

function TurbidityIndicatorCard({
  label,
  icon,
  value,
  turbidity,
}: {
  label: string;
  icon: string;
  value: string;
  turbidity: number;
}) {
  const { label: statusLabel, color: statusColor } =
    getTurbidityStatus(turbidity);
  const clampedTurbidity = Math.max(0, Math.min(turbidity, 100));
  const leftPercentage = (clampedTurbidity / 100) * 100;

  return (
    <div className="bg-[#0B2946] p-4 rounded-xl text-center text-white flex flex-col justify-between h-full min-h-[220px]">
      <p className="text-lg mb-2">{label}</p>

      <div className="flex-grow flex flex-col items-center w-full max-w-[700px] mx-auto">
        <div className="relative w-full">
          <img src={icon} alt={label} className="w-full" />

          <div
            className="absolute w-0.5 bg-white"
            style={{
              top: "0",
              height: "60%",
              marginTop: "5%",
              left: `${leftPercentage}%`,
              transform: "translateX(-50%)",
            }}
          ></div>
        </div>

        <div className="mt-4 text-sm font-bold text-white text-center">
          {value}
        </div>

        {statusLabel && (
          <div className={`mt-2 text-2xl font-bold ${statusColor}`}>
            {statusLabel}
          </div>
        )}
      </div>
    </div>
  );
}

function getVolumeIcon(volume: number | undefined): string {
  if (volume === undefined || volume <= 0) return "/assets/wave-1.png";
  if (volume <= 50) return "/assets/wave-2.png";
  if (volume <= 100) return "/assets/wave-3.png";
  if (volume <= 150) return "/assets/wave-4.png";
  return "/assets/wave-5.png";
}

function getStatusIcon(status: string | undefined): string {
  if (!status || status.toLowerCase() === "off") {
    return "/assets/status-off.png";
  }
  return "/assets/status-on.png";
}

type DataPoint = {
  time: string;
  value: number;
};

function TrendCard({ title, data }: { title: string; data: DataPoint[] }) {
  const unit =
    title === "Trend pH Air"
      ? "pH"
      : title === "Trend Kejernihan"
      ? "NTU"
      : "Liter";
  return (
    <div className="bg-[#0B2946] p-4 rounded-xl">
      <p className="text-sm mb-2 text-white">{title}</p>
      <div className="h-36 bg-blue-900 rounded text-xs p-2">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c5282" />
              <XAxis dataKey="time" stroke="#cbd5e0" tick={{ fontSize: 10 }} />
              <YAxis
                stroke="#cbd5e0"
                tick={{ fontSize: 10 }}
                label={{
                  value: unit,
                  angle: -90,
                  position: "insideLeft",
                  fill: "#cbd5e0",
                  dy: 20,
                  fontSize: 12,
                }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#90cdf4"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            Tidak ada data hari ini
          </div>
        )}
      </div>
    </div>
  );
}
