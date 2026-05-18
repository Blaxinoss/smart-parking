import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  History,
  Loader2,
  ReceiptText,
  Search,
  SearchX,
  TrendingUp,
  WalletCards,
  XCircle
} from 'lucide-react-native';
import { useState } from 'react'; // useMemo removed for React Compiler
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import InputFieldNaked from '@/components/ui/inputNaked';
import { StyledText } from '@/components/ui/styledText';
import Colors from '@/constants/Colors';
import { ParkingSessionStatus, TransactionStatus } from '@/constants/types';
import { usePaymentHistory } from '@/hooks/usePayments';
import { useUserSessionsHistory } from '@/hooks/useSessions';

type ViewMode = 'sessions' | 'payments';

// ─── Status helpers ───────────────────────────────────────────────────────────

const sessionStatusMeta = (status: ParkingSessionStatus) => {
  switch (status) {
    case ParkingSessionStatus.COMPLETED:
      return { color: Colors.main[700], Icon: CheckCircle2, label: 'Completed' };
    case ParkingSessionStatus.CANCELLED:
      return { color: Colors.danger[900], Icon: XCircle, label: 'Cancelled' };
    case ParkingSessionStatus.EXITING:
      return { color: Colors.main[500], Icon: ArrowUpRight, label: 'Exiting' };
    default:
      return { color: Colors.main[900], Icon: Loader2, label: status };
  }
};

const paymentStatusMeta = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.COMPLETED:
      return { color: Colors.main[700], Icon: CheckCircle2 };
    case TransactionStatus.FAILED:
    case TransactionStatus.CANCELLED:
      return { color: Colors.danger[900], Icon: XCircle };
    default:
      return { color: Colors.main[500], Icon: Loader2 };
  }
};

// ─── Duration helper ──────────────────────────────────────────────────────────

function formatDuration(entryTime: string, exitTime?: string | null) {
  if (!exitTime) return null;
  const diffMs = new Date(exitTime).getTime() - new Date(entryTime).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  Icon,
  label,
  value,
  accent = Colors.main[900],
}: {
  Icon: any;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <View className="flex-1 rounded-2xl border border-garage-700 bg-garage-900 p-3 gap-1">
      <View className="flex-row items-center gap-1.5">
        <Icon size={13} color={accent} />
        <StyledText className="text-garage-500 text-[10px] uppercase">{label}</StyledText>
      </View>
      <StyledText className="text-garage-50 text-xl font-titillium-bold">{value}</StyledText>
    </View>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: any }) {
  const meta = sessionStatusMeta(session.status);
  const duration = formatDuration(session.entryTime, session.exitTime);

  return (
    <View className="bg-garage-900 border border-garage-700 rounded-2xl overflow-hidden">
      {/* left accent bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: meta.color,
          borderTopLeftRadius: 999,
          borderBottomLeftRadius: 999,
        }}
      />

      <View className="pl-5 pr-4 py-4">
        {/* top row */}
        <View className="flex-row items-start justify-between mb-3">
          <View>
            <StyledText className="text-garage-500 text-[10px] uppercase">Slot</StyledText>
            <StyledText className="text-garage-50 text-2xl font-titillium-bold tracking-wider">
              {session.slotId}
            </StyledText>
          </View>

          <View className="items-end gap-1">
            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full border"
              style={{
                borderColor: `${meta.color}60`,
                backgroundColor: `${meta.color}18`,
              }}
            >
              <meta.Icon size={11} color={meta.color} />
              <StyledText className="text-[11px] font-titillium-bold" style={{ color: meta.color }}>
                {meta.label}
              </StyledText>
            </View>
            {duration && (
              <StyledText className="text-garage-500 text-[10px]">{duration}</StyledText>
            )}
          </View>
        </View>

        {/* time block */}
        <View className="bg-garage-950 rounded-xl px-3 py-2.5 border border-garage-800 gap-1.5">
          <View className="flex-row items-center gap-2">
            <ArrowDownLeft size={12} color={Colors.main[700]} />
            <StyledText className="text-garage-300 text-xs">
              {new Date(session.entryTime).toLocaleString()}
            </StyledText>
          </View>
          {session.exitTime && (
            <View className="flex-row items-center gap-2">
              <ArrowUpRight size={12} color={Colors.garage[500]} />
              <StyledText className="text-garage-500 text-xs">
                {new Date(session.exitTime).toLocaleString()}
              </StyledText>
            </View>
          )}
        </View>

        {/* footer */}
        <View className="flex-row justify-between mt-3 pt-2.5 border-t border-garage-800">
          <StyledText className="text-garage-600 text-[10px]">Vehicle #{session.vehicleId}</StyledText>
          <StyledText className="text-garage-600 text-[10px]">#{session.id}</StyledText>
        </View>
      </View>
    </View>
  );
}

// ─── Payment Card ─────────────────────────────────────────────────────────────

function PaymentCard({ payment }: { payment: any }) {
  const meta = paymentStatusMeta(payment.transactionStatus);

  return (
    <View className="bg-garage-900 border border-garage-700 rounded-2xl overflow-hidden">
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: meta.color,
          borderTopLeftRadius: 999,
          borderBottomLeftRadius: 999,
        }}
      />

      <View className="pl-5 pr-4 py-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View
              className="h-10 w-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${Colors.main[900]}18` }}
            >
              <CircleDollarSign size={18} color={Colors.main[900]} />
            </View>
            <View>
              <StyledText className="text-garage-500 text-[10px] uppercase">Amount</StyledText>
              <StyledText className="text-garage-50 text-xl font-titillium-bold">
                {Number(payment.amount / 100 || 0).toFixed(2)}{' '}
                <StyledText className="text-garage-400 text-sm">EGP</StyledText>
              </StyledText>
            </View>
          </View>

          <View
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-full border"
            style={{
              borderColor: `${meta.color}60`,
              backgroundColor: `${meta.color}18`,
            }}
          >
            <meta.Icon size={11} color={meta.color} />
            <StyledText className="text-[11px] font-titillium-bold" style={{ color: meta.color }}>
              {payment.transactionStatus || 'UNSPECIFIED'}
            </StyledText>
          </View>
        </View>

        <View className="flex-row items-center gap-2 bg-garage-950 rounded-xl px-3 py-2.5 border border-garage-800 mb-3">
          <WalletCards size={14} color={Colors.garage[500]} />
          <StyledText className="text-garage-300 text-sm">
            {payment.paymentMethod || 'UNSPECIFIED'}
          </StyledText>
        </View>

        <View className="flex-row justify-between pt-2.5 border-t border-garage-800">
          <StyledText className="text-garage-600 text-[10px]">#{payment.id}</StyledText>
          <StyledText className="text-garage-600 text-[10px]">
            {new Date(payment.createdAt).toLocaleString()}
          </StyledText>
        </View>
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <View className="bg-garage-900 border border-garage-700 rounded-2xl p-8 items-center gap-2">
      <View
        className="h-14 w-14 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: `${Colors.garage[700]}30` }}
      >
        <SearchX size={22} color={Colors.garage[500]} />
      </View>
      <StyledText className="text-garage-300 font-titillium-bold">{message}</StyledText>
      <StyledText className="text-garage-600 text-xs text-center">
        Try a different search term
      </StyledText>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const [mode, setMode] = useState<ViewMode>('sessions');
  const [search, setSearch] = useState('');

  // 1. Destructure React Query hooks
  const {
    data: sessionsData = [],
    isLoading: isSessionsLoading,
    isRefetching: isSessionsRefetching,
    refetch: refetchSessions
  } = useUserSessionsHistory();

  const {
    data: paymentsData = [],
    isLoading: isPaymentsLoading,
    isRefetching: isPaymentsRefetching,
    refetch: refetchPayments
  } = usePaymentHistory();

  const isBusy = isSessionsLoading || isPaymentsLoading;
  const isRefreshing = isSessionsRefetching || isPaymentsRefetching;

  // 2. React Compiler replaces useMemo - we just write derived state directly
  const searchQuery = search.trim().toLowerCase();

  const sortedSessions = [...sessionsData]
    .filter((s) =>
      !searchQuery ||
      (s.slotId || '').toLowerCase().includes(searchQuery) ||
      String(s.id).includes(searchQuery) ||
      String(s.vehicleId).includes(searchQuery) ||
      (s.status || '').toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => +new Date(b.entryTime) - +new Date(a.entryTime));

  const sortedPayments = [...paymentsData]
    .filter((p) =>
      !searchQuery ||
      String(p.id).includes(searchQuery) ||
      (p.paymentMethod || '').toLowerCase().includes(searchQuery) ||
      (p.transactionStatus || '').toLowerCase().includes(searchQuery) // Protected against null
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const sessionsCompleted = sessionsData.filter(
    (s) => s.status === ParkingSessionStatus.COMPLETED
  ).length;

  const totalSpent = paymentsData.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  if (isBusy) {
    return (
      <View className="flex-1 bg-garage-950 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.main[900]} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-garage-950"
      contentContainerStyle={{
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 130,
        marginTop: 25,
        gap: 12,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            refetchSessions();
            refetchPayments();
          }}
          tintColor={Colors.main[900]}
        />
      }
    >
      {/* ── Header ── */}
      <View className="bg-garage-900 border border-garage-700 rounded-3xl overflow-hidden">
        <View className="h-2 bg-main-900" />
        <View className="px-5 py-5 flex-row items-center gap-3">
          <View
            className="h-11 w-11 rounded-2xl items-center justify-center"
            style={{ backgroundColor: `${Colors.main[900]}20` }}
          >
            <History size={20} color={Colors.main[900]} />
          </View>
          <View>
            <StyledText className="text-garage-50 text-xl font-titillium-bold">Timeline</StyledText>
            <StyledText className="text-garage-400 text-xs">Sessions & payments in one place</StyledText>
          </View>
        </View>
      </View>

      {/* ── Stats ── */}
      <View className="flex-row gap-2">
        <StatCard
          Icon={CalendarDays}
          label="Completed"
          value={sessionsCompleted}
        />
        <StatCard
          Icon={TrendingUp}
          label="Total Spent"
          value={`${(totalSpent / 100).toFixed(0)} EGP`}
          accent={Colors.main[700]}
        />
        <StatCard
          Icon={ReceiptText}
          label="Payments"
          value={paymentsData.length}
          accent={Colors.garage[400]}
        />
      </View>

      {/* ── Search ── */}
      <InputFieldNaked
        headerLabel="search"
        label="Filter"
        value={search}
        onChangeText={setSearch}
        Icon={Search}
        IconDi="left"
        placeholder={
          mode === 'sessions'
            ? 'Slot, status, ID…'
            : 'Method, status, ID…'
        }
      />

      {/* ── Mode Toggle ── */}
      <View className="bg-garage-900 border border-garage-700 rounded-2xl p-1.5 flex-row gap-1.5">
        {(['sessions', 'payments'] as ViewMode[]).map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            className="flex-1 py-2.5 rounded-xl items-center"
            style={{
              backgroundColor: mode === m ? Colors.main[900] : 'transparent',
            }}
            activeOpacity={0.8}
          >
            <StyledText
              className="font-titillium-bold text-sm capitalize"
              style={{
                color: mode === m ? '#000' : Colors.garage[400],
              }}
            >
              {m}
            </StyledText>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {mode === 'sessions' ? (
        <View className="gap-3">
          {sortedSessions.length === 0 ? (
            <EmptyState message="No matching sessions" />
          ) : (
            sortedSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </View>
      ) : (
        <View className="gap-3">
          {sortedPayments.length === 0 ? (
            <EmptyState message="No matching payments" />
          ) : (
            sortedPayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}