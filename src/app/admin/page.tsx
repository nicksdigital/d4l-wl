"use client";

import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <div className="relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-20"></div>
      
      {/* Glassmorphism Background Blobs */}
      <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-blue-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-purple-500/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 -z-10"></div>
      <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-cyan-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      
      {/* AdminDashboard Component */}
      <AdminDashboard />
    </div>
  );
}