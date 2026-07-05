import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard, Users, CheckSquare, ShieldAlert, Car, FileText, AlertTriangle, CreditCard,
  TrendingUp, Bell, Settings, ClipboardList, Download, LogOut, Sun, Moon, Search, Menu, X,
  ExternalLink, ShieldCheck, AlertCircle, MapPin, Activity, Phone, User as UserIcon, Mail,
  Calendar, DollarSign, Map, Trash, Lock, Unlock, BadgeCheck, Check, Send, Sparkles, Filter, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from "recharts";

// Roles & Permissions Mapping
type AdminRole = "Super Admin" | "Verification Officer" | "Support Staff" | "Analytics Viewer";

const ROLE_PERMISSIONS: Record<AdminRole, {
  canApprove: boolean;
  canDelete: boolean;
  canEditSettings: boolean;
  canExport: boolean;
  canManageComplaints: boolean;
  canTriggerSOS: boolean;
}> = {
  "Super Admin": { canApprove: true, canDelete: true, canEditSettings: true, canExport: true, canManageComplaints: true, canTriggerSOS: true },
  "Verification Officer": { canApprove: true, canDelete: false, canEditSettings: false, canExport: false, canManageComplaints: false, canTriggerSOS: false },
  "Support Staff": { canApprove: false, canDelete: false, canEditSettings: false, canExport: true, canManageComplaints: true, canTriggerSOS: true },
  "Analytics Viewer": { canApprove: false, canDelete: false, canEditSettings: false, canExport: true, canManageComplaints: false, canTriggerSOS: false },
};

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const user = useAppStore.getState().user;
    if (user?.role !== "ADMIN") {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin Portal — Neighbourly" },
      { name: "description", content: "Platform administrator control center." }
    ]
  }),
  component: AdminPage,
});

// Dynamic Mock Database for Premium Features
const initialUsers = [
  { id: "u101", name: "Rohan Das", email: "rohan@gmail.com", phone: "+91 99887 76655", role: "Rider", status: "Active", date: "2026-02-15", trips: 42 },
  { id: "u102", name: "Sunita Reddy", email: "sunita.r@outlook.com", phone: "+91 91234 56789", role: "Driver", status: "Active", date: "2026-01-10", trips: 104 },
  { id: "u103", name: "Kabir Malhotra", email: "kabir.m@gmail.com", phone: "+91 98112 23344", role: "Rider", status: "Suspended", date: "2026-03-22", trips: 8 },
  { id: "u104", name: "Aditi Sen", email: "aditi.sen@gmail.com", phone: "+91 88776 65544", role: "Driver", status: "Active", date: "2026-04-01", trips: 59 },
  { id: "u105", name: "Preeti Singh", email: "preeti@yahoo.com", phone: "+91 77665 54433", role: "Rider", status: "Active", date: "2026-05-18", trips: 17 },
  { id: "u106", name: "Vijay Nair", email: "vijay.nair@gmail.com", phone: "+91 99009 90099", role: "Driver", status: "Pending", date: "2026-07-02", trips: 0 },
];

const initialVehicles = [
  { id: "v101", owner: "Sunita Reddy", number: "KA 03 MG 8812", model: "Maruti Swift", color: "Silver", capacity: 4, status: "Verified", expiry: "2029-08-12" },
  { id: "v102", owner: "Aditi Sen", number: "DL 01 AA 9090", model: "Honda Amaze", color: "Blue", capacity: 4, status: "Verified", expiry: "2027-11-20" },
  { id: "v103", owner: "Vijay Nair", number: "KA 51 EA 2341", model: "Tata Nexon EV", color: "White", capacity: 5, status: "Pending", expiry: "2028-05-01" },
  { id: "v104", owner: "Sanjay Rao", number: "KA 05 MJ 4421", model: "Toyota Innova", color: "Grey", capacity: 6, status: "Pending", expiry: "2027-02-14" },
];

const initialComplaints = [
  { id: "c201", reporter: "Preeti Singh", against: "Arjun Mehta", category: "Late Arrival", priority: "Medium", status: "Open", text: "Driver arrived 20 minutes late and did not pick up at the exact location." },
  { id: "c202", reporter: "Rohan Das", against: "Rahul Verma", category: "Driver Behavior", priority: "High", status: "Assigned", text: "Driver was extremely rude when discussing baggage space." },
  { id: "c203", reporter: "Neha Kapoor", against: "Vikram Singh", category: "Unsafe Driving", priority: "High", status: "Open", text: "Driver was speeding over 80 km/h in residential layout lanes." },
  { id: "c204", reporter: "Aditi Sen", against: "Kabir Malhotra", category: "Passenger Misconduct", priority: "Low", status: "Resolved", text: "Passenger slammed the car door violently upon exit." },
];

const initialRides = [
  { id: "r101", driver: "Priya Sharma", passengers: ["Rohan Das", "Preeti Singh"], pickup: "Green Park Colony", drop: "Cyber Hub, Sector 24", status: "Started", location: "Sector 18 Flyover" },
  { id: "r102", driver: "Arjun Mehta", passengers: ["Amit Shah"], pickup: "Sunrise Apartments", drop: "Tech Park East", status: "Matched", location: "Sunrise Gate 2" },
  { id: "r103", driver: "Ananya Iyer", passengers: ["Sunita R."], pickup: "Rosewood Society", drop: "Downtown Metro", status: "Completed", location: "Metro Station Gate A" },
  { id: "r104", driver: "Vijay Nair", passengers: [], pickup: "Lakeview Enclave", drop: "Business Bay", status: "Searching", location: "Lakeview Exit" },
];

const initialSOS = [
  { id: "sos911", driver: "Vikram Singh", passengers: ["Rohan Das", "Priya Sharma"], rideId: "r101", location: "Outer Ring Road (Near Silk Board)", time: "09:44 AM", status: "Active" }
];

const initialAuditLogs = [
  { admin: "Alex Morgan", action: "Approved driver profile Sanjay Rao", time: "2026-07-04 09:30", ip: "192.168.1.104", resource: "Driver: Sanjay Rao" },
  { admin: "Alex Morgan", action: "Updated cancellation policy fee to ₹50", time: "2026-07-04 08:15", ip: "192.168.1.104", resource: "Settings" },
  { admin: "System Auto", action: "Flagged ride r101: Emergency SOS triggered", time: "2026-07-04 07:44", ip: "10.0.0.1", resource: "SOS: r101" },
  { admin: "Alex Morgan", action: "Resolved complaint c204", time: "2026-07-03 18:20", ip: "192.168.1.104", resource: "Complaint: c204" },
];

// Recharts Chart Mock Data
const regData = [
  { date: "Mon", Riders: 14, Drivers: 3 },
  { date: "Tue", Riders: 22, Drivers: 5 },
  { date: "Wed", Riders: 30, Drivers: 8 },
  { date: "Thu", Riders: 25, Drivers: 4 },
  { date: "Fri", Riders: 45, Drivers: 12 },
  { date: "Sat", Riders: 60, Drivers: 15 },
  { date: "Sun", Riders: 40, Drivers: 6 },
];

const rideData = [
  { date: "Mon", Rides: 120 },
  { date: "Tue", Rides: 145 },
  { date: "Wed", Rides: 160 },
  { date: "Thu", Rides: 155 },
  { date: "Fri", Rides: 210 },
  { date: "Sat", Rides: 180 },
  { date: "Sun", Rides: 130 },
];

const revenueData = [
  { date: "Mon", Revenue: 9600 },
  { date: "Tue", Revenue: 11600 },
  { date: "Wed", Revenue: 12800 },
  { date: "Thu", Revenue: 12400 },
  { date: "Fri", Revenue: 16800 },
  { date: "Sat", Revenue: 14400 },
  { date: "Sun", Revenue: 10400 },
];

function AdminPage() {
  const user = useAppStore((s) => s.user);
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const currentRole = "Admin";
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Mock State Managers
  const [drivers, setDrivers] = useState<any[]>([]);
  const [usersList, setUsersList] = useState(initialUsers);
  const [vehiclesList, setVehiclesList] = useState(initialVehicles);
  const [complaintsList, setComplaintsList] = useState(initialComplaints);
  const [ridesList, setRidesList] = useState(initialRides);
  const [sosList, setSosList] = useState(initialSOS);
  const [auditLogsList, setAuditLogsList] = useState(initialAuditLogs);

  // Search, Filters & Dialog Modals
  const [globalSearch, setGlobalSearch] = useState("");
  const [rejecting, setRejecting] = useState<any | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  // Settings Mock State
  const [settings, setSettings] = useState({
    limitKm: 50,
    maxPassengers: 4,
    autoVerifySelfie: true,
    cancelFee: 30,
    baseFare: 15,
    perKmFare: 8,
  });

  // Notification Builder
  const [notifTarget, setNotifTarget] = useState("all");
  const [notifChannel, setNotifChannel] = useState("push");
  const [notifMessage, setNotifMessage] = useState("");

  const permissions = ROLE_PERMISSIONS["Super Admin"];

  // Fetch Verification Submissions (API-backed fallback or mock fallback)
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/drivers");
      setDrivers(data);
    } catch (e: any) {
      // Load mock verification submissions
      setDrivers([
        {
          driver_id: "d101",
          user_name: "Sanjay Rao",
          user_avatar: "https://i.pravatar.cc/120?img=52",
          user_phone: "+91 98765 43210",
          user_email: "sanjay@example.com",
          date_of_birth: "1990-05-14",
          license_number: "DL-1420110098234",
          government_id_number: "8899-7711-2233",
          verification_status: "PENDING",
          vehicles: [{ vehicle_type: "Car", model: "Toyota Innova", license_plate: "KA 05 MJ 4421", capacity: 6 }],
          documents: [
            { document_id: "doc1", document_type: "Driving License", url: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500&auto=format&fit=crop&q=60" },
            { document_id: "doc2", document_type: "Government ID", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=60" },
            { document_id: "doc3", document_type: "Vehicle RC", url: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=500&auto=format&fit=crop&q=60" }
          ]
        },
        {
          driver_id: "d102",
          user_name: "Meera Krishnan",
          user_avatar: "https://i.pravatar.cc/120?img=49",
          user_phone: "+91 99445 56677",
          user_email: "meera.k@example.com",
          date_of_birth: "1995-10-22",
          license_number: "KL-07201677890",
          government_id_number: "2233-4455-6677",
          verification_status: "PENDING",
          vehicles: [{ vehicle_type: "Car", model: "Hyundai i20", license_plate: "KL 07 CA 9876", capacity: 4 }],
          documents: [
            { document_id: "doc4", document_type: "Driving License", url: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500&auto=format&fit=crop&q=60" },
            { document_id: "doc5", document_type: "Selfie", url: "https://i.pravatar.cc/120?img=49" }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleApproveDriver = async (id: string, name: string) => {
    if (!permissions.canApprove) {
      toast.error("Permission Denied: Current role cannot approve driver credentials.");
      return;
    }
    try {
      await apiFetch(`/admin/drivers/${id}/approve`, { method: "PUT" });
      toast.success(`Driver ${name} approved successfully`);
      fetchDrivers();
    } catch (e: any) {
      // Fallback local mock update
      setDrivers(prev => prev.map(d => d.driver_id === id ? { ...d, verification_status: "VERIFIED" } : d));
      setAuditLogsList(prev => [
        { admin: user?.name || "Admin", action: `Approved driver profile ${name}`, time: new Date().toISOString().replace('T', ' ').substring(0, 16), ip: "192.168.1.104", resource: `Driver: ${name}` },
        ...prev
      ]);
      toast.success(`Driver ${name} approved (Simulated Local System)`);
    }
  };

  const handleRejectDriver = async () => {
    if (!rejecting) return;
    if (!permissions.canApprove) {
      toast.error("Permission Denied: Current role cannot reject submissions.");
      return;
    }
    const name = rejecting.user_name;
    try {
      await apiFetch(`/admin/drivers/${rejecting.driver_id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ feedback: feedback || "Documents unclear. Please resubmit." })
      });
      toast.success(`Driver ${name} rejected`);
      setRejecting(null);
      setFeedback("");
      fetchDrivers();
    } catch (e: any) {
      // Mock fallback update
      setDrivers(prev => prev.map(d => d.driver_id === rejecting.driver_id ? { ...d, verification_status: "REJECTED" } : d));
      setAuditLogsList(prev => [
        { admin: user?.name || "Admin", action: `Rejected driver profile ${name} - Reason: ${feedback || "Blurs"}`, time: new Date().toISOString().replace('T', ' ').substring(0, 16), ip: "192.168.1.104", resource: `Driver: ${name}` },
        ...prev
      ]);
      toast.success(`Driver ${name} rejected (Simulated Local System)`);
      setRejecting(null);
      setFeedback("");
    }
  };

  // User Suspension
  const toggleUserStatus = (userId: string, currentStatus: string, name: string) => {
    if (!permissions.canDelete && currentStatus === "Active") {
      toast.error("Permission Denied: Current role cannot suspend users.");
      return;
    }
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    setAuditLogsList(prev => [
      { admin: user?.name || "Admin", action: `${nextStatus === "Suspended" ? "Suspended" : "Activated"} user ${name}`, time: new Date().toISOString().replace('T', ' ').substring(0, 16), ip: "192.168.1.104", resource: `User: ${name}` },
      ...prev
    ]);
    toast.success(`User ${name} has been ${nextStatus === "Suspended" ? "suspended" : "reactivated"}.`);
  };

  // Complaint Handling
  const handleResolveComplaint = (id: string) => {
    if (!permissions.canManageComplaints) {
      toast.error("Permission Denied: Current role cannot manage complaints.");
      return;
    }
    setComplaintsList(prev => prev.map(c => c.id === id ? { ...c, status: "Resolved" } : c));
    toast.success(`Complaint Ticket #${id} marked as resolved.`);
  };

  const handleEscalateComplaint = (id: string) => {
    if (!permissions.canManageComplaints) {
      toast.error("Permission Denied: Current role cannot escalate complaints.");
      return;
    }
    setComplaintsList(prev => prev.map(c => c.id === id ? { ...c, priority: "High", status: "Assigned" } : c));
    toast.warning(`Complaint Ticket #${id} escalated to High priority Support.`);
  };

  // SOS Emergency Alert Dispatch
  const handleResolveSOS = (id: string, driverName: string) => {
    if (!permissions.canTriggerSOS) {
      toast.error("Permission Denied: Role cannot resolve emergency protocols.");
      return;
    }
    setSosList(prev => prev.filter(sos => sos.id !== id));
    toast.success(`Emergency alert for Driver ${driverName} resolved and marked safe.`);
  };

  // Send System Notification
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifMessage.trim()) {
      toast.error("Please compose a message.");
      return;
    }
    toast.success(`Campaign launched! Transmitting ${notifChannel.toUpperCase()} to ${notifTarget.toUpperCase()}`);
    setAuditLogsList(prev => [
      { admin: user?.name || "Admin", action: `Sent broadcast notification to ${notifTarget}`, time: new Date().toISOString().replace('T', ' ').substring(0, 16), ip: "192.168.1.104", resource: `Notification: ${notifMessage.substring(0, 20)}...` },
      ...prev
    ]);
    setNotifMessage("");
  };

  // Export Data Trigger
  const handleExportData = (format: "CSV" | "Excel" | "PDF") => {
    if (!permissions.canExport) {
      toast.error("Permission Denied: Cannot export data reports.");
      return;
    }
    toast.success(`Generating report... Downloaded Admin_Report_${activeTab}_${new Date().toISOString().slice(0,10)}.${format.toLowerCase()}`);
  };

  // Settings Save
  const handleSaveSettings = () => {
    if (!permissions.canEditSettings) {
      toast.error("Permission Denied: Cannot edit global platform configurations.");
      return;
    }
    toast.success("Platform settings successfully synchronized.");
  };

  // Quick stats computed
  const totalRiders = usersList.filter(u => u.role === "Rider").length + 154; // Mock additions
  const activeCarppols = ridesList.filter(r => r.status === "Started" || r.status === "Matched").length;
  const verifiedDriversCount = usersList.filter(u => u.role === "Driver" && u.status === "Active").length + 22;

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-slate-950 text-slate-50" : "bg-slate-50/50 text-slate-900"} font-sans antialiased`}>
      {/* Sidebar Navigation */}
      <aside className={`sticky top-0 z-30 flex h-screen flex-col border-r border-slate-200 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white"} transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}>
        {/* Sidebar Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white font-bold">N</span>
            {isSidebarOpen && <span className="font-bold text-lg tracking-tight text-blue-600">Neighbourly</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
            { id: "verification", label: "Driver Verification", Icon: CheckSquare, badge: drivers.filter(d => d.verification_status === "PENDING").length },
            { id: "users", label: "User Management", Icon: Users },
            { id: "vehicles", label: "Vehicle Verification", Icon: Car },
            { id: "complaints", label: "Complaints", Icon: AlertTriangle, badge: complaintsList.filter(c => c.status === "Open").length },
            { id: "sos", label: "SOS Alerts", Icon: ShieldAlert, badge: sosList.length, badgeColor: "bg-red-600" },
            { id: "payments", label: "Payments", Icon: CreditCard },
            { id: "audit", label: "Audit Logs", Icon: ClipboardList },
            { id: "settings", label: "System Settings", Icon: Settings },
          ].map((item) => {
            const Icon = item.Icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {isSidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
                {isSidebarOpen && item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto grid h-5 min-w-5 place-items-center rounded-full text-2xs font-bold text-white px-1 ${item.badgeColor ?? "bg-blue-600"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-2xs text-slate-400">
            Logged in as Admin · v1.4.0
          </div>
        )}
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur">
          {/* Global Search */}
          <div className="relative flex max-w-xs items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search users, drivers, trips..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          {/* Action Tools & User Menu */}
          <div className="flex items-center gap-4">
            {/* SOS Overlay indicator */}
            {sosList.length > 0 && (
              <button onClick={() => setActiveTab("sos")} className="animate-pulse flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 rounded-full px-3 py-1 text-xs font-semibold">
                <ShieldAlert className="h-3.5 w-3.5" />
                {sosList.length} Active SOS
              </button>
            )}

            {/* Dark Mode Switcher */}
            <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Admin Profile dropdown */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 dark:border-slate-800">
              <Avatar className="h-8 w-8">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback>
                  {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col text-left sm:flex">
                <span className="text-xs font-semibold">{user?.name || "Admin"}</span>
                <span className="text-3xs text-slate-400">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Pages Render */}
        <main className="flex-1 p-6 space-y-6">

          {/* EMERGENCY ALERT FLASH BANNER */}
          {sosList.length > 0 && (
            <div className="border border-red-200 bg-red-50 p-4 rounded-xl dark:border-red-900 dark:bg-red-950/30 flex items-center justify-between animate-bounce">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-red-600 text-white animate-ping">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-red-800 dark:text-red-400">CRITICAL SAFETY ALERT (SOS)</h4>
                  <p className="text-xs text-red-700 dark:text-red-300">Ride #{sosList[0].rideId} (Driver: {sosList[0].driver}) triggered emergency distress beacon at {sosList[0].time}.</p>
                </div>
              </div>
              <Button size="sm" variant="destructive" onClick={() => setActiveTab("sos")}>Open SOS Center</Button>
            </div>
          )}

          {/* VIEW: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Welcome back, Admin</h1>
                  <p className="text-sm text-slate-500">Here's your platforms status report for today.</p>
                </div>
              </div>

              {/* KPI cards layout */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Total Registered Users", value: totalRiders + 48, desc: "+12% vs last month", Icon: Users },
                  { title: "Verified Active Drivers", value: verifiedDriversCount, desc: "+4 pending verification", Icon: BadgeCheck },
                  { title: "Active Live Rides", value: activeCarppols, desc: "Moving across Bengaluru", Icon: Activity },
                  { title: "Total Today's Revenue", value: "₹48,250", desc: "+18% vs yesterday", Icon: DollarSign },
                ].map((card, i) => {
                  const Icon = card.Icon;
                  return (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-slate-500">{card.title}</CardTitle>
                        <Icon className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Graphs Layout using Recharts */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">User Registrations (Daily)</CardTitle>
                    <CardDescription>Riders and drivers onboarding trends</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={regData}>
                        <defs>
                          <linearGradient id="colorRiders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Riders" stroke="#2563eb" fillOpacity={1} fill="url(#colorRiders)" />
                        <Area type="monotone" dataKey="Drivers" stroke="#10b981" fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Total Revenue Trend (INR)</CardTitle>
                    <CardDescription>Daily gross transaction bookings volume</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Live Rides Map & Recent logs */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Simulated Google Map */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Live Ride Tracking Map</CardTitle>
                    <CardDescription>Visualizing 4 active carpools across local hubs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-64 w-full rounded-lg bg-blue-50 border border-blue-100 overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                      {/* Grid representation of road system */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:30px_30px] opacity-40 dark:bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)]" />
                      {/* Central Hubs */}
                      <div className="absolute top-10 left-20 text-3xs font-semibold text-slate-400">Green Park Colony</div>
                      <div className="absolute bottom-16 right-24 text-3xs font-semibold text-slate-400">Cyber Hub, Sector 24</div>
                      {/* Moving Dots */}
                      <div className="absolute top-1/3 left-1/2 flex h-3 w-3 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                        <span className="absolute -top-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-3xs rounded px-1 shadow font-medium">KA 03 MG</span>
                      </div>
                      <div className="absolute top-1/4 left-1/4 flex h-3 w-3 items-center justify-center">
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
                        <span className="absolute -top-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-3xs rounded px-1 shadow font-medium">Tata Nexon EV</span>
                      </div>
                      {/* Emergency Flash */}
                      {sosList.length > 0 && (
                        <div className="absolute top-2/3 right-1/3 flex h-4 w-4 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
                          <span className="absolute -top-6 bg-red-600 text-white text-3xs rounded px-1 shadow font-bold">SOS ACTIVE</span>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-slate-900/80 rounded px-2 py-1 text-2xs border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600" /> Active Ride
                        <div className="h-2 w-2 rounded-full bg-red-600" /> Distress (SOS)
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent platform activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Recent Activities</CardTitle>
                    <CardDescription>Live telemetry stream</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { action: "Driver verification pending", name: "Meera Krishnan", time: "5 min ago", color: "bg-warning" },
                      { action: "Distress Alert Cleared", name: "Ride #r102 marked safe", time: "18 min ago", color: "bg-emerald-500" },
                      { action: "Complaint Submitted", name: "Rohan Das against Rahul V.", time: "1 hr ago", color: "bg-red-500" },
                      { action: "New Carpool Created", name: "Priya Sharma (Honda City)", time: "2 hrs ago", color: "bg-blue-500" },
                    ].map((act, i) => (
                      <div key={i} className="flex gap-3 text-xs items-start">
                        <span className={`h-2 w-2 rounded-full mt-1.5 ${act.color}`} />
                        <div className="flex-1">
                          <p className="font-semibold">{act.action}</p>
                          <p className="text-slate-400 text-3xs">{act.name} · {act.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* VIEW: DRIVER VERIFICATION QUEUE */}
          {activeTab === "verification" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Driver Verification Queue</h1>
                <p className="text-sm text-slate-500">Cross-reference government documents and selfie photos to enable driver publishing privileges.</p>
              </div>

              {/* Tabs list for Verification filtering */}
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-80 grid-cols-3">
                  <TabsTrigger value="pending">Pending ({drivers.filter(d => d.verification_status === "PENDING").length})</TabsTrigger>
                  <TabsTrigger value="verified">Approved ({drivers.filter(d => d.verification_status === "VERIFIED").length})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({drivers.filter(d => d.verification_status === "REJECTED").length})</TabsTrigger>
                </TabsList>

                {["pending", "verified", "rejected"].map((bucket) => (
                  <TabsContent key={bucket} value={bucket} className="mt-4 space-y-4">
                    {drivers.filter(d => d.verification_status.toLowerCase() === bucket).length === 0 ? (
                      <Card className="p-8 text-center text-slate-400">
                        No submissions located in this category.
                      </Card>
                    ) : (
                      drivers.filter(d => d.verification_status.toLowerCase() === bucket).map((d) => (
                        <Card key={d.driver_id} className="overflow-hidden border border-slate-200 dark:border-slate-800">
                          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-start justify-between">
                            <div className="flex gap-4 items-center">
                              <Avatar className="h-14 w-14">
                                <AvatarImage src={d.user_avatar} />
                                <AvatarFallback>{d.user_name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                  {d.user_name}
                                  <StatusBadge status={d.verification_status.toLowerCase()} />
                                </h3>
                                <p className="text-xs text-slate-500">{d.user_email} · {d.user_phone}</p>
                              </div>
                            </div>

                            {/* Verification action checklist */}
                            {d.verification_status === "PENDING" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setRejecting(d)} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/40">Reject</Button>
                                <Button size="sm" onClick={() => handleApproveDriver(d.driver_id, d.user_name)} className="bg-blue-600 hover:bg-blue-700">Approve Driver</Button>
                              </div>
                            )}
                          </div>

                          <div className="p-6 grid gap-6 md:grid-cols-3">
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Details Profile</h4>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-slate-400">Date of Birth:</span> <span>{d.date_of_birth}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">License Number:</span> <span className="font-semibold">{d.license_number}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Govt ID Number:</span> <span>{d.government_id_number}</span></div>
                                {d.vehicles?.[0] && (
                                  <div className="border-t pt-2 mt-2 dark:border-slate-800">
                                    <span className="font-semibold text-blue-500 block mb-1">Registered Vehicle</span>
                                    <div>{d.vehicles[0].vehicle_type} · {d.vehicles[0].model}</div>
                                    <div className="font-semibold">{d.vehicles[0].license_plate} ({d.vehicles[0].capacity} Seats)</div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="md:col-span-2 space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Uploaded Verification Files</h4>
                              <div className="flex gap-4 overflow-x-auto pb-2">
                                {d.documents?.map((doc: any, i: number) => (
                                  <div key={i} className="shrink-0 w-48 space-y-1.5">
                                    <span className="text-2xs font-semibold text-slate-500 block">{doc.document_type}</span>
                                    <div
                                      onClick={() => setExpandedImage(doc.url)}
                                      className="relative h-28 w-full border rounded-lg bg-slate-100 overflow-hidden cursor-zoom-in group dark:border-slate-800"
                                    >
                                      <img src={doc.url} alt={doc.document_type} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-3xs font-semibold">Zoom Image</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {/* VIEW: USER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                  <p className="text-sm text-slate-500">Monitor rider accounts, activity metrics, and block disruptive accounts.</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleExportData("Excel")}><Download className="h-4 w-4" />Export Excel</Button>
              </div>

              {/* User search card */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 text-2xs uppercase font-bold text-slate-500 border-b dark:bg-slate-900/50 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4">User Details</th>
                          <th className="px-6 py-4">Platform Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Completed Trips</th>
                          <th className="px-6 py-4">Registration Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {usersList.filter(u => u.name.toLowerCase().includes(globalSearch.toLowerCase())).map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-slate-950 dark:text-slate-100">{u.name}</p>
                                  <p className="text-3xs text-slate-400">{u.email} · {u.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-3xs font-semibold ${u.role === "Driver" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-3xs font-semibold ${u.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                <span className={`h-1 w-1 rounded-full ${u.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                                {u.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold">{u.trips} trips</td>
                            <td className="px-6 py-4 text-xs text-slate-400">{u.date}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => toggleUserStatus(u.id, u.status, u.name)}>
                                  {u.status === "Active" ? <Lock className="h-3 w-3 text-amber-600" /> : <Unlock className="h-3 w-3 text-emerald-600" />}
                                  <span className="ml-1">{u.status === "Active" ? "Suspend" : "Activate"}</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* VIEW: VEHICLE VERIFICATION */}
          {activeTab === "vehicles" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Vehicle Management</h1>
                <p className="text-sm text-slate-500">Track and approve vehicle fitness certificates, emission reports, and registration cards (RC).</p>
              </div>

              <div className="grid gap-4">
                {vehiclesList.map((v) => (
                  <Card key={v.id} className="p-5 flex items-center justify-between border border-slate-200 dark:border-slate-800 hover:shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-slate-900 grid place-items-center text-blue-600">
                        <Car className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{v.model} ({v.color})</h4>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-3xs font-semibold ${v.status === "Verified" ? "bg-emerald-50 text-emerald-700" : "bg-warning-soft text-warning-foreground"}`}>{v.status}</span>
                        </div>
                        <p className="text-xs text-slate-400">Owner: {v.owner} · Plate: <span className="font-mono text-xs font-bold">{v.number}</span> · Capacity: {v.capacity} Seats</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setExpandedImage("https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=500")}><FileText className="h-3.5 w-3.5" />View RC</Button>
                      {v.status === "Pending" && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                          setVehiclesList(prev => prev.map(item => item.id === v.id ? { ...item, status: "Verified" } : item));
                          toast.success(`Vehicle ${v.number} approved.`);
                        }}>Approve Fit</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}



          {/* VIEW: COMPLAINTS */}
          {activeTab === "complaints" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Complaints & Dispute Resolution</h1>
                <p className="text-sm text-slate-500">Examine rider complaints regarding behavior, punctuality, fees, or vehicle standards.</p>
              </div>

              <div className="space-y-4">
                {complaintsList.map((c) => (
                  <Card key={c.id} className="p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-semibold">TICKET ID: #{c.id}</span>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-3xs font-semibold ${c.priority === "High" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"}`}>{c.priority} Priority</span>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-3xs font-semibold ${c.status === "Open" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>{c.status}</span>
                        </div>
                        <h4 className="font-bold text-sm mt-1">{c.reporter} filed against {c.against}</h4>
                        <p className="text-xs font-semibold text-blue-500">Category: {c.category}</p>
                      </div>

                      {c.status !== "Resolved" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEscalateComplaint(c.id)}>Escalate</Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleResolveComplaint(c.id)}>Resolve Ticket</Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">{c.text}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: SOS EMERGENCY CENTER */}
          {activeTab === "sos" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-red-600 text-white rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ShieldAlert className="h-6 w-6 animate-bounce" /> Emergency SOS Operations Center</h1>
                  <p className="text-sm text-red-100">Live active panic alarms triggered by community members. Handle instantly.</p>
                </div>
                <div className="text-xs font-mono bg-red-700 px-3 py-1.5 rounded-full border border-red-500">DISTRESS HOTLINE ACTIVE</div>
              </div>

              {sosList.length === 0 ? (
                <Card className="p-12 text-center text-slate-400 bg-emerald-50/20 border-emerald-100 text-emerald-800">
                  <Check className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                  All active rides are safe. No distress signals active at this time.
                </Card>
              ) : (
                <div className="space-y-4">
                  {sosList.map((sos) => (
                    <Card key={sos.id} className="p-6 border-2 border-red-500 bg-red-50/20 dark:bg-red-950/20">
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-3">
                          <span className="text-red-600 font-bold uppercase tracking-wider text-xs block">Active Incident Info</span>
                          <div className="space-y-2 text-xs">
                            <div><span className="text-slate-400">Driver Name:</span> <span className="font-bold">{sos.driver}</span></div>
                            <div><span className="text-slate-400">Active Passengers:</span> <span>{sos.passengers.join(", ")}</span></div>
                            <div><span className="text-slate-400">Distress Time:</span> <span className="font-mono text-red-600">{sos.time}</span></div>
                            <div><span className="text-slate-400">GPS Coordinates:</span> <span className="underline cursor-pointer">{sos.location}</span></div>
                          </div>
                        </div>

                        <div className="space-y-2 flex flex-col justify-center">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-xs block mb-1">Incident Actions</span>
                          <Button size="sm" variant="destructive" className="w-full gap-1.5" onClick={() => toast.info("Dialing Police Dispatch... (108)")}><Phone className="h-4 w-4" /> Notify Police (108)</Button>
                          <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => toast.info("Calling Driver...")}><Phone className="h-4 w-4" /> Call Driver</Button>
                          <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => toast.info("Calling Emergency Contacts...")}><Phone className="h-4 w-4" /> Notify Emergency Contacts</Button>
                        </div>

                        <div className="flex flex-col justify-between items-end border-l pl-6 dark:border-slate-800">
                          <div className="text-right">
                            <span className="inline-flex rounded-full bg-red-600 text-white px-2.5 py-0.5 text-2xs font-bold animate-pulse">ACTIVE ALARM</span>
                          </div>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto" onClick={() => handleResolveSOS(sos.id, sos.driver)}>Mark Safe & Resolve</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: PAYMENTS & REVENUE */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Payments & Revenue</h1>
                <p className="text-sm text-slate-500">Monitor driver commission splits, credit cards transactions, and user refund requests.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4">
                  <span className="text-xs text-slate-500">Gross Platform Volume</span>
                  <h3 className="text-2xl font-bold mt-1">₹3,42,800</h3>
                  <p className="text-3xs text-emerald-500 mt-1">+14% vs last week</p>
                </Card>
                <Card className="p-4">
                  <span className="text-xs text-slate-500">Commission Earned (10%)</span>
                  <h3 className="text-2xl font-bold mt-1">₹34,280</h3>
                  <p className="text-3xs text-slate-400 mt-1">Direct platform splits</p>
                </Card>
                <Card className="p-4">
                  <span className="text-xs text-slate-500">Pending Driver Cashouts</span>
                  <h3 className="text-2xl font-bold mt-1">₹12,450</h3>
                  <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">Disburse Payouts</Button>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "tx_99812", user: "Rohan Das", amount: "₹80", type: "Carpool Fee", status: "Settled" },
                        { id: "tx_99813", user: "Amit Shah", amount: "₹120", type: "Carpool Fee", status: "Settled" },
                        { id: "tx_99814", user: "Sunita R.", amount: "₹90", type: "Refund Request", status: "Pending Approval" },
                      ].map((tx) => (
                        <tr key={tx.id} className="border-t dark:border-slate-800">
                          <td className="p-4 font-mono text-blue-500">{tx.id}</td>
                          <td className="p-4">{tx.user}</td>
                          <td className="p-4 font-semibold">{tx.amount}</td>
                          <td className="p-4">{tx.type}</td>
                          <td className="p-4">
                            <span className={`inline-flex rounded px-2 py-0.5 text-2xs font-semibold ${tx.status === "Settled" ? "bg-emerald-50 text-emerald-700" : "bg-warning-soft text-warning-foreground"}`}>{tx.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}



          {/* VIEW: AUDIT LOGS */}
          {activeTab === "audit" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
                  <p className="text-sm text-slate-500">Complete traceability record of administrative actions on the platform.</p>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800">
                        <tr>
                          <th className="p-4 font-bold text-slate-500 uppercase">Administrator</th>
                          <th className="p-4 font-bold text-slate-500 uppercase">Executed Action</th>
                          <th className="p-4 font-bold text-slate-500 uppercase">Affected Resource</th>
                          <th className="p-4 font-bold text-slate-500 uppercase">IP Address</th>
                          <th className="p-4 font-bold text-slate-500 uppercase">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {auditLogsList.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-4 font-semibold">{log.admin}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">{log.action}</td>
                            <td className="p-4 font-mono text-slate-400">{log.resource}</td>
                            <td className="p-4 text-slate-400">{log.ip}</td>
                            <td className="p-4 text-slate-400">{log.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
                <p className="text-sm text-slate-500">Configure global parameters, ride distance limits, and cancellation policies.</p>
              </div>

              <Card className="max-w-2xl">
                <CardHeader><CardTitle className="text-sm font-semibold">Global System Constants</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Maximum Carpool Distance (Km)</label>
                      <input
                        type="number"
                        value={settings.limitKm}
                        onChange={(e) => setSettings({ ...settings, limitKm: parseInt(e.target.value) || 0 })}
                        className="h-10 w-full rounded border bg-white px-3 py-1 text-sm dark:border-slate-800 dark:bg-slate-950"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Max Passenger Cap per Ride</label>
                      <input
                        type="number"
                        value={settings.maxPassengers}
                        onChange={(e) => setSettings({ ...settings, maxPassengers: parseInt(e.target.value) || 0 })}
                        className="h-10 w-full rounded border bg-white px-3 py-1 text-sm dark:border-slate-800 dark:bg-slate-950"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Cancellation Fee (INR)</label>
                      <input
                        type="number"
                        value={settings.cancelFee}
                        onChange={(e) => setSettings({ ...settings, cancelFee: parseInt(e.target.value) || 0 })}
                        className="h-10 w-full rounded border bg-white px-3 py-1 text-sm dark:border-slate-800 dark:bg-slate-950"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Base Operating Fare (INR)</label>
                      <input
                        type="number"
                        value={settings.baseFare}
                        onChange={(e) => setSettings({ ...settings, baseFare: parseInt(e.target.value) || 0 })}
                        className="h-10 w-full rounded border bg-white px-3 py-1 text-sm dark:border-slate-800 dark:bg-slate-950"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="autoVerify"
                      checked={settings.autoVerifySelfie}
                      onChange={(e) => setSettings({ ...settings, autoVerifySelfie: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoVerify" className="text-xs font-semibold select-none cursor-pointer">Require selfie facial match validation for driver onboarding</label>
                  </div>

                  <Button className="bg-blue-600 hover:bg-blue-700 mt-4" onClick={handleSaveSettings}>Save Platform Rules</Button>
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </div>

      {/* Verification: Driver rejection dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>Input constructive feedback to help the user resolve verification blockers.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. License photo blurry. Please re-upload with correct lighting."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectDriver}>Send Rejection Notice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expandable files photo dialog */}
      <Dialog open={!!expandedImage} onOpenChange={(o) => !o && setExpandedImage(null)}>
        <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none">
          {expandedImage && (
            <img src={expandedImage} alt="Expanded Doc" className="w-full h-auto max-h-[85vh] object-contain rounded-md" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
