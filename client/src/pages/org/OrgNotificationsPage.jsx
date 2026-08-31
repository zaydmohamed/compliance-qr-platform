import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Phone,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const OrgNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const params = { page, limit: 15 };
      if (selectedType !== 'ALL') params.type = selectedType;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const res = await api.get('/organization/notifications', { params });
      if (res.data?.success) {
        setNotifications(res.data.data || []);
        setTotalPages(res.data.meta?.totalPages || 1);
        setTotalCount(res.data.meta?.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load notification history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, selectedType, selectedStatus]);

  const filteredList = notifications.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.message?.toLowerCase().includes(q) ||
      item.recipient?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status, errorMessage) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            SENT
          </span>
        );
      case 'FAILED':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
            title={errorMessage || 'Delivery failed'}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            PENDING
          </span>
        );
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'COMPLAINT':
      case 'CABASHO':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200 tracking-wide uppercase">
            COMPLAINT
          </span>
        );
      case 'SUGGESTION':
      case 'TALO':
      case 'FEEDBACK':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black bg-sky-100 text-sky-800 border border-sky-200 tracking-wide uppercase">
            SUGGESTION
          </span>
        );
      case 'ACCOUNT_CREATION':
      case 'REGISTRATION':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200 tracking-wide uppercase">
            ACCOUNT CREATION
          </span>
        );
      case 'CUSTOMER_THANK_YOU':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wide uppercase">
            CUSTOMER THANK YOU
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
            {type || 'NOTIFICATION'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Organization Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3.5">
          {user?.organization?.logo ? (
            <img
              src={user.organization.logo}
              alt={user.organization.name}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="w-12 h-12 rounded-2xl object-contain p-1 bg-slate-50 border border-slate-200 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-[#0086FF]/10 flex items-center justify-center text-[#0086FF]">
              <BellRing className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#2F2E2D]">Notification & SMS Center</h1>
              {user?.organization?.name && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {user.organization.displayTitle || user.organization.name}
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A5856] mt-0.5">
              Raad-raaca fariimaha SMS iyo ogaysiisyada xaruntaada ({totalCount} total)
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchNotifications(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#2F2E2D] transition-colors active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Dib u cusboonaysii
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Raadi fariin, number taleefan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF]"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-[#2F2E2D] focus:outline-none focus:ring-2 focus:ring-[#0086FF]/20"
          >
            <option value="ALL">Dhammaan Noocyada (All Types)</option>
            <option value="COMPLAINT">Cabasho (COMPLAINT)</option>
            <option value="SUGGESTION">Talo (SUGGESTION)</option>
            <option value="ACCOUNT_CREATION">Akoon Samayn (ACCOUNT CREATION)</option>
            <option value="CUSTOMER_THANK_YOU">Mahadcelin Macmiil (CUSTOMER THANK YOU)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-[#2F2E2D] focus:outline-none focus:ring-2 focus:ring-[#0086FF]/20"
          >
            <option value="ALL">Dhammaan Xaaladaha (All Status)</option>
            <option value="SENT">Guulaystay (SENT)</option>
            <option value="FAILED">Guuldarraystay (FAILED)</option>
            <option value="PENDING">Kusocda (PENDING)</option>
          </select>
        </div>
      </div>

      {/* Table / List View */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0086FF]" />
            Soo qaadaya fariimihii SMS...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">Wax fariimo ah lama helin</p>
            <p className="text-xs text-slate-400 mt-1">
              Fariin kasta oo SMS ah oo loo diro xaruntaada waxay ka soo muuqan doontaa halkan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] border-b border-slate-100 text-[11px] font-bold text-[#5A5856] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Taariikhda</th>
                  <th className="py-3.5 px-4">Nooca</th>
                  <th className="py-3.5 px-4">Fariinta (Message Content)</th>
                  <th className="py-3.5 px-4">Qofka Loo Diray</th>
                  <th className="py-3.5 px-4 text-right">Xaaladda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  const orgLogo = item.metadata?.organizationLogo || user?.organization?.logo;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {dateStr}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getTypeBadge(item.type)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="max-w-lg space-y-1.5">
                          {/* Display actual organization logo if available */}
                          {orgLogo && (
                            <div className="flex items-center gap-2 pb-1">
                              <img
                                src={orgLogo}
                                alt="Organization Logo"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                className="w-6 h-6 object-contain rounded-md bg-white border border-slate-200 p-0.5"
                              />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                {item.metadata?.organizationName || user?.organization?.name}
                              </span>
                            </div>
                          )}
                          <p className="font-medium text-[#2F2E2D] whitespace-pre-wrap text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                            {item.message}
                          </p>
                          {item.errorMessage && (
                            <p className="text-[10px] text-rose-600 flex items-center gap-1 font-medium">
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                              Cillad: {item.errorMessage}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono font-medium">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {item.recipient}
                        </div>
                        {item.recipientType && (
                          <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                            ({item.recipientType})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        {getStatusBadge(item.status, item.errorMessage)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Bogga {page} ee {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Hore
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Xiga
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgNotificationsPage;
