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

type Lamp = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type MonitoringItem = {
  lamp_id: number;
  battery_capacity: number;
  input_current: number;
  battery_usage: number;
  light_intensity: number;
  created_at: string;
};

export default function PJUMonitoringPage() {
  const [lamps, setLamps] = useState<Lamp[]>([]);
  const [monitoringData, setMonitoringData] = useState<MonitoringItem[]>([]);
  const [latestMonitoringByLamp, setLatestMonitoringByLamp] = useState<
    Record<number, MonitoringItem>
  >({});

  const baseURL = "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lampRes = await axios.get(`${baseURL}/api/lamp`, {
          auth: { username: "cxianz", password: "E7r$wT!zKq@2" },
        });
        setLamps(lampRes.data);

        const monitoringRes = await axios.get(
          `${baseURL}/api/lamp-monitoring`,
          {
            auth: { username: "cxianz", password: "E7r$wT!zKq@2" },
          }
        );

        const allMonitoring = monitoringRes.data as MonitoringItem[];
        setMonitoringData(allMonitoring);

        const latestByLamp: Record<number, MonitoringItem> = {};
        allMonitoring.forEach((item) => {
          if (
            !latestByLamp[item.lamp_id] ||
            new Date(item.created_at) >
              new Date(latestByLamp[item.lamp_id].created_at)
          ) {
            latestByLamp[item.lamp_id] = item;
          }
        });

        setLatestMonitoringByLamp(latestByLamp);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const getTodayMonitoringByLampId = (lamp_id: number): MonitoringItem[] => {
    const today = new Date().toISOString().split("T")[0];
    return monitoringData.filter((item) => {
      return item.lamp_id === lamp_id && item.created_at.startsWith(today);
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
          <div className="font-bold">Monitoring PJU</div>
          <Link href="/water-monitoring" className="cursor-pointer">
            Monitoring Air
          </Link>
        </div>
      </div>

      {lamps.map((lampu, index) => {
        const latest = latestMonitoringByLamp[lampu.id];
        const history = getTodayMonitoringByLampId(lampu.id);

        return (
          <div
            key={lampu.id}
            className="bg-[#12335A] rounded-2xl p-4 md:p-6 mb-8 mx-4 md:mx-8 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold">
                {lampu.name ?? `Penerangan Jalan Umum ${index + 1}`}
              </h2>

              <div className="flex flex-col items-end text-xs text-gray-400 text-right">
                <a
                  href={`https://www.google.com/maps?q=${lampu.latitude},${lampu.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Lokasi: ({lampu.latitude}, {lampu.longitude})
                </a>
                <span>
                  {latest?.created_at
                    ? new Date(latest.created_at).toLocaleString()
                    : "Belum ada data"}
                </span>
              </div>
            </div>  

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <InfoCard
                label="Baterai"
                icon={getBatteryIcon(latest?.battery_capacity)}
                value={`${latest?.battery_capacity ?? 0}%`}
              />

              <InfoCard
                label="Arus Panel Surya"
                icon="/assets/solar-panel.png"
                value={`${latest?.input_current ?? 0} A`}
              />
              <InfoCard
                label="Penggunaan Baterai"
                icon="/assets/lightning.png"
                value={`${latest?.battery_usage ?? 0} A`}
              />
              <InfoCard
                label="Intensitas Cahaya"
                icon={getWeatherIcon(latest?.light_intensity)}
                value={`${latest?.light_intensity ?? 0}%`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 px-4">
              <TrendCard
                title="Trend Daya Baterai"
                data={history.map((item) => ({
                  time: new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  value: item.battery_capacity,
                }))}
              />
              <TrendCard
                title="Trend Arus Panel Surya"
                data={history.map((item) => ({
                  time: new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  value: item.input_current,
                }))}
              />
              <TrendCard
                title="Trend Penggunaan Baterai"
                data={history.map((item) => ({
                  time: new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  value: item.battery_usage,
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
    <div className="bg-[#0B2946] p-4 rounded-xl text-center">
      <p className="text-lg mb-1">{label}</p>
      <img
        src={icon}
        alt={label}
        className={`mx-auto ${label === "Baterai" ? "h-8 py-1 my-3" : "h-10"}`}
      />
      <p className="text-2xl font-bold mt-2 text-green-400">{value}</p>
    </div>
  );
}

function getBatteryIcon(capacity: number | undefined): string {
  if (capacity === undefined || capacity <= 0) return "/assets/battery-0.png";
  if (capacity <= 25) return "/assets/battery-25.png";
  if (capacity <= 50) return "/assets/battery-50.png";
  if (capacity <= 75) return "/assets/battery-75.png";
  return "/assets/battery-100.png";
}

function getWeatherIcon(intensity: number): string {
  if (intensity > 75) return "/assets/weather-100.png";
  if (intensity > 50) return "/assets/weather-75.png";
  if (intensity > 5) return "/assets/weather-50.png";
  return "/assets/weather-5.png";
}

type DataPoint = {
  time: string;
  value: number;
};

function TrendCard({
  title,
  data,
}: {
  title: string;
  data: DataPoint[];
}) {
  const unit = title === "Trend Daya Baterai" ? "Persen (%)" : "Ampere";
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
