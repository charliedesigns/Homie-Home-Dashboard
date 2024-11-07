import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CpuIcon,
  HardDriveIcon,
} from "lucide-react";

interface WidgetProps {
  url: string;
}

const Widget: React.FC<WidgetProps> = ({ url }) => {
  const [dashboardData, setDashboardData] = useState({
    serverStatus: { status: "unknown", uptime: "0d 0h 0m" },
    networkSpeed: { download: 0, upload: 0 },
    storageUsage: 0,
    temperature: 0,
    systemAnalytics: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
    },
  });

  const fetchData = async () => {
    try {
      const cpuUrl = new URL("/load/cpu", url).toString();
      const ramUrl = new URL("/load/ram", url).toString();
      const storageUrl = new URL("/load/storage", url).toString();
      const networkUrl = new URL("/load/network", url).toString();
      const infoUrl = new URL("/info", url).toString();

      const [
        cpuResponse,
        ramResponse,
        storageResponse,
        networkResponse,
        infoResponse,
      ] = await Promise.all([
        fetch(cpuUrl),
        fetch(ramUrl),
        fetch(storageUrl),
        fetch(networkUrl),
        fetch(infoUrl),
      ]);

      if (
        !cpuResponse.ok ||
        !ramResponse.ok ||
        !storageResponse.ok ||
        !networkResponse.ok ||
        !infoResponse.ok
      ) {
        throw new Error("Failed to fetch data");
      }

      const cpuData = await cpuResponse.json();
      const ramData = await ramResponse.json();
      const storageData = await storageResponse.json();
      const networkData = await networkResponse.json();
      const infoData = await infoResponse.json();

      const cpuUsage =
        cpuData.reduce(
          (acc: number, core: { load: number }) => acc + core.load,
          0
        ) / cpuData.length;
      const memoryUsage = (ramData.load / infoData.ram.size) * 100;
      const diskUsage = (storageData[0] / infoData.storage[0].size) * 100;

      setDashboardData((prevData) => ({
        ...prevData,
        networkSpeed: {
          download: networkData.down.toFixed(2),
          upload: networkData.up.toFixed(2),
        },
        storageUsage: diskUsage,
        systemAnalytics: {
          cpuUsage,
          memoryUsage,
          diskUsage,
        },
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Fetch data every 3 seconds

    return () => clearInterval(interval);
  }, [url]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Speed</CardTitle>
          <Badge variant="outline" className="font-normal">
            Mbps
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <ArrowDownIcon className="mr-1 h-4 w-4 text-green-500" />
              <span>{dashboardData.networkSpeed.download}</span>
            </div>
            <div className="flex items-center">
              <ArrowUpIcon className="mr-1 h-4 w-4 text-blue-500" />
              <span>{dashboardData.networkSpeed.upload}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
          <Badge variant="outline" className="font-normal">
            {dashboardData.storageUsage.toFixed(2)}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${dashboardData.storageUsage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            System Analytics
          </CardTitle>
          <CpuIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">CPU Usage</span>
              <Badge variant="outline" className="font-normal">
                {dashboardData.systemAnalytics.cpuUsage.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Memory Usage</span>
              <Badge variant="outline" className="font-normal">
                {dashboardData.systemAnalytics.memoryUsage.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Disk Usage</span>
              <Badge variant="outline" className="font-normal">
                {dashboardData.systemAnalytics.diskUsage.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Widget;
