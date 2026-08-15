"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import SideNavHR from "@/app/components/ui/SideNavHR";
import MaterialIcon from "@/app/components/ui/MaterialIcon";

interface Job {
  id: string;
  job_title: string;
  location: string;
  minimum_skor: number;
  applicant: number; // Tambahan properti applicant
  status: string;
  created_at: string;
}

export default function HRJobsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // State Modal Form (Tambah / Edit) - Disertakan minimum_skor dan applicant
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    job_title: "",
    location: "",
    minimum_skor: 0,
    applicant: 0,
    status: "visible",
  });

  // State Dialog Konfirmasi Aksi
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // State Notifikasi Kustom (Sukses / Gagal)
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const showNotification = (type: "success" | "error", title: string, message: string) => {
    setNotification({ isOpen: true, type, title, message });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isOpen: false }));
    }, 4000);
  };

  // Cek Auth User & Ambil Data Jobs
  useEffect(() => {
    const initData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);

      fetchJobs();
    };

    initData();
  }, [router, supabase]);

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (Array.isArray(data)) setJobs(data);
    } catch (err) {
      console.error("Gagal memuat data jobs", err);
    } finally {
      setJobsLoading(false);
    }
  };

  // Buka modal untuk Tambah
  const handleOpenAddModal = () => {
    setModalMode("add");
    setFormData({ job_title: "", location: "", minimum_skor: 70, applicant: 0, status: "visible" });
    setIsModalOpen(true);
  };

  // Buka modal untuk Edit
  const handleOpenEditModal = (job: Job) => {
    setModalMode("edit");
    setSelectedJob(job);
    setFormData({
      job_title: job.job_title,
      location: job.location,
      minimum_skor: job.minimum_skor || 0,
      applicant: job.applicant || 0,
      status: job.status,
    });
    setIsModalOpen(true);
  };

  // Eksekusi Submit Form (dengan konfirmasi pop-up)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);

    const isEdit = modalMode === "edit";
    setConfirmDialog({
      isOpen: true,
      title: isEdit ? "Konfirmasi Perubahan Job" : "Konfirmasi Tambah Job",
      message: isEdit
        ? `Apakah Anda yakin ingin menyimpan perubahan pada lowongan "${formData.job_title}"?`
        : `Apakah Anda yakin ingin menambahkan lowongan "${formData.job_title}"?`,
      onConfirm: async () => {
        try {
          const url = "/api/jobs";
          const method = isEdit ? "PUT" : "POST";
          const body = isEdit ? { id: selectedJob?.id, ...formData } : formData;

          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            fetchJobs();
            showNotification(
              "success",
              isEdit ? "Successfully Updated Job" : "Successfully Added Job",
              isEdit ? `Vacancy "${formData.job_title}" has been updated.` : `Vacancy "${formData.job_title}" has been successfully added.`
            );
          } else {
            showNotification("error", "Failed to Process Data", "An error occurred on the server while saving the vacancy.");
          }
        } catch (error) {
          showNotification("error", "An Error Occurred", "Failed to connect to the server.");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Konfirmasi Hapus Job
  const confirmDelete = (job: Job) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Delete Job",
      message: `Are you sure you want to delete the job vacancy "${job.job_title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/jobs?id=${job.id}`, { method: "DELETE" });
          if (res.ok) {
            fetchJobs();
            showNotification("success", "Successfully Deleted Job", `Vacancy "${job.job_title}" has been deleted.`);
          } else {
            showNotification("error", "Failed to Delete", "An error occurred while deleting data from the database.");
          }
        } catch (error) {
          showNotification("error", "An Error Occurred", "Failed to connect to the server.");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Konfirmasi Ganti Status (Visible / Not Visible)
  const confirmToggleStatus = (job: Job) => {
    const nextStatus = job.status === "visible" ? "not visible" : "visible";
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Change Status",
      message: `Change vacancy status "${job.job_title}" to "${nextStatus}"?`,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/jobs", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: job.id, status: nextStatus }),
          });
          if (res.ok) {
            fetchJobs();
            showNotification("success", "Status Successfully Changed", `Vacancy "${job.job_title}" is now "${nextStatus}".`);
          } else {
            showNotification("error", "Failed to Change Status", "An error occurred while updating the vacancy status.");
          }
        } catch (error) {
          showNotification("error", "An Error Occurred", "Failed to connect to the server.");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-on-surface-variant">
            Loading HR Jobs page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-[var(--font-body)] min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      {/* SideNavBar (Desktop) */}
      <SideNavHR user={user} />

      {/* Mobile TopNavBar */}
      <nav className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-gutter py-4 h-20 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <h1 className="font-[var(--font-display)] text-[32px] leading-[1.2] font-bold text-primary tracking-tighter">
          Talent Bridge
        </h1>
        <button className="text-primary active:scale-95 transition-transform duration-200">
          <MaterialIcon name="menu" className="text-3xl" />
        </button>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-72 p-4 md:p-10 pt-24 md:pt-10 min-h-screen">
        {/* Header & Button Add */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-[var(--font-display)] text-primary">Job Management</h1>
            <p className="text-sm text-on-surface-variant font-[var(--font-mono)] mt-1">
              Manage job vacancies, locations, minimum score, number of applicants, and visibility status.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
          >
            <MaterialIcon name="add" />
            <span>Add Job</span>
          </button>
        </div>

        {/* List / Table Jobs */}
        <div className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-xl">
          {jobsLoading ? (
            <div className="p-8 text-center text-on-surface-variant font-[var(--font-mono)]">Loading jobs data...</div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant font-[var(--font-mono)]">No job vacancy data available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 font-[var(--font-mono)] text-xs text-on-surface-variant uppercase tracking-wider">
                    <th className="p-4">Job Title</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Min. Score</th>
                    <th className="p-4">Applicant</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-semibold text-on-surface">{job.job_title}</td>
                      <td className="p-4 text-on-surface-variant">{job.location}</td>
                      <td className="p-4 font-mono font-bold text-primary">{job.minimum_skor ?? 0}</td>
                      <td className="p-4 font-mono font-semibold text-on-surface">{job.applicant ?? 0} people</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            job.status === "visible"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant font-[var(--font-mono)]">
                        {new Date(job.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => confirmToggleStatus(job)}
                            title="Change Status"
                            className="p-2 bg-surface-container hover:bg-white/10 text-on-surface rounded-md transition-colors"
                          >
                            <MaterialIcon name="visibility" className="text-base" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(job)}
                            title="Edit Job"
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors"
                          >
                            <MaterialIcon name="edit" className="text-base" />
                          </button>
                          <button
                            onClick={() => confirmDelete(job)}
                            title="Delete Job"
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md transition-colors"
                          >
                            <MaterialIcon name="delete" className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL FORM TAMBAH / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold font-[var(--font-display)] text-primary mb-4">
              {modalMode === "add" ? "Add New Vacancy" : "Edit Job Vacancy"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-[var(--font-mono)] uppercase text-on-surface-variant mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="Example: Frontend Developer"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-[var(--font-mono)] uppercase text-on-surface-variant mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Example: Batam / Remote"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-[var(--font-mono)] uppercase text-on-surface-variant mb-1">
                    Minimum Score
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={formData.minimum_skor}
                    onChange={(e) => setFormData({ ...formData, minimum_skor: Number(e.target.value) })}
                    placeholder="Example: 75"
                    className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-mono)] uppercase text-on-surface-variant mb-1">
                    Applicant
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.applicant}
                    onChange={(e) => setFormData({ ...formData, applicant: Number(e.target.value) })}
                    placeholder="Example: 12"
                    className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-[var(--font-mono)] uppercase text-on-surface-variant mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary text-sm"
                >
                  <option value="visible">Visible</option>
                  <option value="not visible">Not Visible</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-white/10 text-on-surface-variant text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold shadow hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP DIALOG KONFIRMASI */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
              <MaterialIcon name="help" className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold font-[var(--font-display)] text-on-surface mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-on-surface-variant font-[var(--font-mono)] mb-6">
              {confirmDialog.message}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 px-4 py-2 rounded-lg bg-surface-container hover:bg-white/10 text-on-surface-variant text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold shadow hover:opacity-90 transition-opacity"
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP NOTIFIKASI KUSTOM */}
      {notification.isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${
              notification.type === "success"
                ? "bg-green-950/90 border-green-500/40 text-green-200"
                : "bg-red-950/90 border-red-500/40 text-red-200"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                notification.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <MaterialIcon name={notification.type === "success" ? "check" : "error"} className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white font-[var(--font-display)]">{notification.title}</h4>
              <p className="text-xs opacity-90 font-[var(--font-mono)]">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
              className="ml-4 opacity-70 hover:opacity-100 text-white"
            >
              <MaterialIcon name="close" className="text-base" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}