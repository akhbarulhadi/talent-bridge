'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import TopNavBar from "@/app/components/ui/TopNavBar";
import SideNavTalent from "@/app/components/ui/SideNavTalent";

interface TitleItem {
  id: string;
  name: string;
  created_at: string;
}

export default function SimulationTitlePage() {
  const router = useRouter();

  const [titles, setTitles] = useState<TitleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTitlesFromAPI = async () => {
      try {
        const res = await fetch('/api/titles');
        if (res.ok) {
          const data = await res.json();
          setTitles(data);
        } else {
          console.error("Failed to fetch data from titles API");
        }
      } catch (error) {
        console.error("Error fetching titles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTitlesFromAPI();
  }, []);

  return (
    <div className="bg-background text-on-surface font-[var(--font-body)] min-h-screen overflow-x-hidden">
      <TopNavBar variant="talent" />
      <SideNavTalent />

      <main className="lg:ml-72 mt-20 p-6 md:p-10 max-w-[1440px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Select Simulation Path & Title</h1>
          <p className="text-gray-400 text-sm">Select the operational field or title you want to test your skills in.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 bg-gray-900 animate-pulse rounded-xl border border-gray-800" />
            ))}
          </div>
        ) : titles.length === 0 ? (
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 text-center text-gray-400">
            No Title data available in the database yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {titles.map((item) => (
              <Link 
                key={item.id} 
                href={`/dashboard/talent/simulation/${item.id}`}
                className="group bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-green-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono text-green-400 mb-2 uppercase tracking-wider">
                    ID: {item.id.slice(0, 8)}...
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-xs font-mono">
                    Created: {new Date(item.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm font-medium text-gray-300 group-hover:text-green-400">
                  <span>View Simulation</span>
                  <span>➔</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}