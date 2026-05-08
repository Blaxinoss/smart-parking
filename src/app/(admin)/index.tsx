import Colors from "@/constants/Colors";
import {
    BellRing,
    CalendarClock,
    Cpu,
    CreditCard,
    DoorOpen,
    LayoutDashboard,
    ParkingSquare,
    Plus,
    Settings,
    ShieldCheck,
    Timer,
    UserPlus,
    Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlertsSection from "./AlertsSection";
import DevicesSection from "./DevicesSection";
import GatesSection from "./GatesSection";
import ReservationsSection from "./ReservationsSection";
import SessionsSection from "./SessionsSection";
import SlotsSection from "./SlotsSection";
import TransactionsSection from "./TransactionsSection";
import {
    useAdminAlerts,
    useAdminDevices,
    useAdminGates,
    useAdminReservations,
    useAdminSessions,
    useAdminSlots,
    useAdminTransactions,
    useAdminUsers,
} from "./useAdminApi";
import UsersSection from "./UsersSection";

// ─── Types ──────────────────────────────────────────────────────────────────

type SectionKey =
    | "users"
    | "slots"
    | "sessions"
    | "reservations"
    | "transactions"
    | "alerts"
    | "devices"
    | "gates";

type TabKey = "dashboard" | "reservations" | "finance" | "settings";

const SECTION_TITLES: Record<SectionKey, string> = {
    users: "Users",
    slots: "Parking Slots",
    sessions: "Sessions",
    reservations: "Reservations",
    transactions: "Transactions",
    alerts: "Alerts",
    devices: "Devices",
    gates: "Gates",
};

// ─── Dark design tokens ──────────────────────────────────────────────────────
// bg: #0a0a0a  surface: #111111  border: #1e1e1e  muted: #2a2a2a
// text-primary: #e8e8e8  text-secondary: #888888  text-hint: #444444
// accent orange: #E7872E  accent red: #F97C7C  accent blue: #64a0ff  accent green: #50c882

export default function AdminDashboard() {
    const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

    const { data: users } = useAdminUsers();
    const { data: slots } = useAdminSlots();
    const { data: sessions } = useAdminSessions();
    const { data: reservations } = useAdminReservations();
    const { data: transactions } = useAdminTransactions();
    const { data: alerts } = useAdminAlerts();
    const { data: devices } = useAdminDevices();
    const { data: gates } = useAdminGates();

    const unresolvedAlerts = alerts?.filter((a) => a.status !== "resolved").length || 0;
    const totalManaged =
        (users?.length ?? 0) +
        (slots?.length ?? 0) +
        (sessions?.length ?? 0) +
        (reservations?.length ?? 0);

    const renderSection = () => {
        switch (activeSection) {
            case "users": return <UsersSection />;
            case "slots": return <SlotsSection />;
            case "sessions": return <SessionsSection />;
            case "reservations": return <ReservationsSection />;
            case "transactions": return <TransactionsSection />;
            case "alerts": return <AlertsSection />;
            case "devices": return <DevicesSection />;
            case "gates": return <GatesSection />;
            default: return null;
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "dashboard": return <DashboardTab />;
            case "reservations": return <ReservationsTab />;
            case "finance": return <FinanceTab />;
            case "settings": return <SettingsTab />;
        }
    };

    // ─── Dashboard Tab ───────────────────────────────────────────────────────
    const DashboardTab = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 }}
        >
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{
                        width: 36, height: 36, borderRadius: 11,
                        backgroundColor: "#E7872E",
                        alignItems: "center", justifyContent: "center",
                    }}>
                        <ShieldCheck size={18} color="#0a0a0a" />
                    </View>
                    <View>
                        <Text style={{ color: "#e8e8e8", fontSize: 20 }}>Admin</Text>
                        <Text style={{ color: "#555", fontSize: 15 }}>Control panel · live data</Text>
                    </View>
                </View>
                <Pressable
                    onPress={() => setActiveSection("alerts")}
                    style={{
                        width: 36, height: 36, borderRadius: 11,
                        backgroundColor: "#111",
                        borderWidth: 0.5, borderColor: "#1e1e1e",
                        alignItems: "center", justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <BellRing size={16} color={unresolvedAlerts > 0 ? "#F97C7C" : "#888"} />
                    {unresolvedAlerts > 0 && (
                        <View style={{
                            position: "absolute", top: 6, right: 6,
                            width: 7, height: 7, borderRadius: 4,
                            backgroundColor: "#F97C7C",
                            borderWidth: 1.5, borderColor: "#0a0a0a",
                        }} />
                    )}
                </Pressable>
            </View>

            {/* Metric cards */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                <MetricCard label="Total managed" value={totalManaged} hint="entities" />
                <MetricCard label="Active alerts" value={unresolvedAlerts} hint="unresolved" danger={unresolvedAlerts > 0} />
                <MetricCard label="Parking slots" value={slots?.length ?? 0} hint="configured" />
                <MetricCard label="Registered users" value={users?.length ?? 0} hint="accounts" />
            </View>

            {/* Quick actions */}
            <Text style={{ color: "#fc9433", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
                Quick actions
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
                <QuickAction icon={<Plus size={16} color="#E7872E" />} label="New slot" tint="#E7872E" onPress={() => setActiveSection("slots")} />
                <QuickAction icon={<UserPlus size={16} color="#64a0ff" />} label="Add user" tint="#64a0ff" onPress={() => setActiveSection("users")} />
                <QuickAction icon={<BellRing size={16} color="#F97C7C" />} label="Alerts" tint="#F97C7C" onPress={() => setActiveSection("alerts")} badge={unresolvedAlerts > 0 ? unresolvedAlerts : undefined} />
                <QuickAction icon={<DoorOpen size={16} color="#50c882" />} label="Gates" tint="#50c882" onPress={() => setActiveSection("gates")} />
            </View>

            {/* Management list */}
            <Text style={{ color: "#E7872E", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
                Management
            </Text>

            <DarkSectionRow
                icon={<Users size={17} color="#E7872E" />}
                tint="#E7872E"
                title="Users"
                subtitle="Accounts and roles"
                count={users?.length}
                onPress={() => setActiveSection("users")}
            />
            <DarkSectionRow
                icon={<ParkingSquare size={17} color="#64a0ff" />}
                tint="#64a0ff"
                title="Parking slots"
                subtitle="Status and config"
                count={slots?.length}
                onPress={() => setActiveSection("slots")}
            />
            <DarkSectionRow
                icon={<Timer size={17} color="#50c882" />}
                tint="#50c882"
                title="Sessions"
                subtitle="Live and completed"
                count={sessions?.length}
                onPress={() => setActiveSection("sessions")}
            />
            <DarkSectionRow
                icon={<Cpu size={17} color="#a78bfa" />}
                tint="#a78bfa"
                title="Devices"
                subtitle="Sensors and cameras"
                count={devices?.length}
                onPress={() => setActiveSection("devices")}
            />
            <DarkSectionRow
                icon={<DoorOpen size={17} color="#50c882" />}
                tint="#50c882"
                title="Gates"
                subtitle="Entry and exit control"
                count={gates?.length}
                onPress={() => setActiveSection("gates")}
            />
        </ScrollView>
    );

    const ReservationsTab = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 }}
        >
            <TabHeader title="Reservations" subtitle="Bookings and schedules" />
            <DarkSectionRow
                icon={<CalendarClock size={17} color="#E7872E" />}
                tint="#E7872E"
                title="All reservations"
                subtitle="Manage booking records"
                count={reservations?.length}
                onPress={() => setActiveSection("reservations")}
            />
            <DarkSectionRow
                icon={<Timer size={17} color="#50c882" />}
                tint="#50c882"
                title="Sessions"
                subtitle="Active and past sessions"
                count={sessions?.length}
                onPress={() => setActiveSection("sessions")}
            />
        </ScrollView>
    );

    const FinanceTab = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 }}
        >
            <TabHeader title="Finance" subtitle="Payments and transactions" />
            <DarkSectionRow
                icon={<CreditCard size={17} color="#50c882" />}
                tint="#50c882"
                title="Transactions"
                subtitle="Payments, refunds and debts"
                count={transactions?.length}
                onPress={() => setActiveSection("transactions")}
            />
        </ScrollView>
    );

    const SettingsTab = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 }}
        >
            <TabHeader title="Settings" subtitle="System configuration" />
            <DarkSectionRow
                icon={<BellRing size={17} color="#F97C7C" />}
                tint="#F97C7C"
                title="Alerts"
                subtitle="Incidents and warnings"
                count={alerts?.length}
                badge={unresolvedAlerts > 0 ? `${unresolvedAlerts} open` : undefined}
                onPress={() => setActiveSection("alerts")}
            />
            <DarkSectionRow
                icon={<Cpu size={17} color="#a78bfa" />}
                tint="#a78bfa"
                title="Devices"
                subtitle="Hardware management"
                count={devices?.length}
                onPress={() => setActiveSection("devices")}
            />
            <DarkSectionRow
                icon={<DoorOpen size={17} color="#50c882" />}
                tint="#50c882"
                title="Gates"
                subtitle="Entry and exit control"
                count={gates?.length}
                onPress={() => setActiveSection("gates")}
            />
        </ScrollView>
    );

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.garage[950] }}>
            {/* Tab content */}
            <View style={{ flex: 1 }}>
                {renderTabContent()}
            </View>

            {/* Bottom nav */}
            <View style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                backgroundColor: "#0d0d0d",
                borderTopWidth: 0.5, borderTopColor: "#1e1e1e",
                paddingBottom: 28, paddingTop: 10,
                flexDirection: "row",
            }}>
                <NavItem icon={<LayoutDashboard size={20} color={activeTab === "dashboard" ? "#E7872E" : "#444"} />} label="Dashboard" active={activeTab === "dashboard"} onPress={() => setActiveTab("dashboard")} />
                <NavItem icon={<CalendarClock size={20} color={activeTab === "reservations" ? "#E7872E" : "#444"} />} label="Reservations" active={activeTab === "reservations"} onPress={() => setActiveTab("reservations")} />
                <NavItem icon={<CreditCard size={20} color={activeTab === "finance" ? "#E7872E" : "#444"} />} label="Finance" active={activeTab === "finance"} onPress={() => setActiveTab("finance")} />
                <NavItem icon={<Settings size={20} color={activeTab === "settings" ? "#E7872E" : "#444"} />} label="Settings" active={activeTab === "settings"} onPress={() => setActiveTab("settings")} />
            </View>

            {/* Section modal */}
            <Modal
                visible={!!activeSection}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setActiveSection(null)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
                    {/* Modal header */}
                    <View style={{
                        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                        paddingHorizontal: 16, paddingVertical: 14,
                        borderBottomWidth: 0.5, borderBottomColor: "#1e1e1e",
                        backgroundColor: "#0d0d0d",
                    }}>
                        <View>
                            <Text style={{ color: "#e8e8e8", fontSize: 18 }}>
                                {activeSection ? SECTION_TITLES[activeSection] : ""}
                            </Text>
                            <Text style={{ color: "#555", fontSize: 11, marginTop: 1 }}>
                                Operations · live data
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => setActiveSection(null)}
                            style={{
                                width: 34, height: 34, borderRadius: 10,
                                backgroundColor: "#161616",
                                borderWidth: 0.5, borderColor: "#2a2a2a",
                                alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <Text style={{ color: "#888", fontSize: 16, lineHeight: 18 }}>✕</Text>
                        </Pressable>
                    </View>

                    {renderSection()}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({ label, value, hint, danger }: { label: string; value: number; hint: string; danger?: boolean }) {
    return (
        <View style={{
            width: "48.5%",
            backgroundColor: Colors.garage[900],
            borderWidth: 0.5, borderColor: "#1e1e1e",
            borderRadius: 16, padding: 14,
        }}>
            <Text style={{ color: "#e8e8e8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                {label}
            </Text>
            <Text style={{ color: danger ? "#F97C7C" : "#e8e8e8", fontSize: 30, marginTop: 4 }}>
                {value}
            </Text>
            <Text style={{ color: "#7a7a7a", fontSize: 10, marginTop: 2 }}>
                {hint}
            </Text>
        </View>
    );
}

function QuickAction({ icon, label, tint, onPress, badge }: {
    icon: React.ReactNode; label: string; tint: string; onPress: () => void; badge?: number;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? "#161616" : "#111",
                borderWidth: 0.5, borderColor: "#1e1e1e",
                borderRadius: 14, paddingVertical: 10, paddingHorizontal: 6,
                alignItems: "center", gap: 6,
                position: "relative",
            })}
        >
            <View style={{
                width: 48, height: 48, borderRadius: 10,
                backgroundColor: `${tint}1A`,
                alignItems: "center", justifyContent: "center",
            }}>
                {icon}
            </View>
            <Text style={{ color: "white", fontSize: 15 }}>{label}</Text>
            {badge !== undefined && (
                <View style={{
                    position: "absolute", top: 6, right: 6,
                    backgroundColor: "#F97C7C",
                    borderRadius: 6, minWidth: 14, paddingHorizontal: 3, height: 14,
                    alignItems: "center", justifyContent: "center",
                }}>
                    <Text style={{ color: "#0a0a0a", fontSize: 8 }}>{badge}</Text>
                </View>
            )}
        </Pressable>
    );
}

function DarkSectionRow({ icon, tint, title, subtitle, count, onPress, badge }: {
    icon: React.ReactNode; tint: string; title: string; subtitle: string;
    count?: number; onPress: () => void; badge?: string;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                flexDirection: "row", alignItems: "center",
                backgroundColor: pressed ? "#161616" : "#111",
                borderWidth: 0.5, borderColor: "#1e1e1e",
                borderRadius: 18, paddingHorizontal: 14, paddingVertical: 13,
                marginBottom: 6, gap: 12,
            })}
        >
            <View style={{
                width: 38, height: 38, borderRadius: 12,
                backgroundColor: `${tint}18`,
                alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}>
                {icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: "#d0d0d0", fontSize: 16 }}>{title}</Text>
                <Text style={{ color: "#555", fontSize: 11, marginTop: 1 }}>{subtitle}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {badge ? (
                    <View style={{
                        backgroundColor: "rgba(249,124,124,0.12)",
                        borderWidth: 0.5, borderColor: "rgba(249,124,124,0.3)",
                        borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                        <Text style={{ color: "#F97C7C", fontSize: 10 }}>{badge}</Text>
                    </View>
                ) : count !== undefined ? (
                    <Text style={{ color: "#333", fontSize: 12 }}>{count}</Text>
                ) : null}
                <Text style={{ color: "#2a2a2a", fontSize: 16 }}>›</Text>
            </View>
        </Pressable>
    );
}

function NavItem({ icon, label, active, onPress }: { icon: React.ReactNode; label: string; active: boolean; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={{ flex: 1, alignItems: "center", gap: 3 }}>
            {icon}
            <Text style={{ color: active ? "#E7872E" : "#444", fontSize: 9 }}>{label}</Text>
        </Pressable>
    );
}

function TabHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#e8e8e8", fontSize: 22 }}>{title}</Text>
            <Text style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
        </View>
    );
}