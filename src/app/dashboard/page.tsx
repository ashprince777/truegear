'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Heart,
  Bookmark,
  MessageSquare,
  User as UserIcon,
  Search,
  Trash2,
  ExternalLink,
  Send,
  Building,
  CheckCircle,
  Car,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CarCard } from '@/components/CarCard';
import { formatPrice } from '@/lib/utils';
import { DealRatingBadge } from '@/components/DealRatingBadge';

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'favorites';

  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'searches' | 'messages' | 'profile'>(
    initialTab as any
  );

  const [favorites, setFavorites] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Message reply state
  const [replyText, setReplyText] = useState('');
  const [replyToUserId, setReplyToUserId] = useState<string | null>(null);
  const [replyListingId, setReplyListingId] = useState<string | null>(null);
  const [replySending, setReplySending] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [favRes, searchRes, msgRes] = await Promise.all([
        fetch('/api/favorites'),
        fetch('/api/saved-searches'),
        fetch('/api/messages'),
      ]);

      if (favRes.ok) {
        const favData = await favRes.json();
        setFavorites(favData.favorites || []);
      }

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        setSavedSearches(searchData.savedSearches || []);
      }

      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData.messages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const removeSavedSearch = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyToUserId || !replyText.trim()) return;

    try {
      setReplySending(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: replyToUserId,
          listingId: replyListingId,
          body: replyText,
        }),
      });

      if (res.ok) {
        setReplyText('');
        loadData(); // reload messages
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplySending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-md">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-3">
          <UserIcon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Sign In to TrueGear</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Access your saved car favorites, custom search alerts, and direct seller messaging.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-primary/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{user.email}</span>
              <span>•</span>
              <span className="font-bold text-primary uppercase">{user.role}</span>
              {user.dealerName && <span>• {user.dealerName}</span>}
            </p>
          </div>
        </div>

        {user.role === 'DEALER' && (
          <Link
            href="/dealer"
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-xs hover:bg-primary-hover transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Building className="w-4 h-4" />
            <span>Go to Dealer Portal &rarr;</span>
          </Link>
        )}
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'favorites' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Cars ({favorites.length})</span>
          {activeTab === 'favorites' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('searches')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'searches' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Searches ({savedSearches.length})</span>
          {activeTab === 'searches' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'messages' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages & Inquiries ({messages.length})</span>
          {activeTab === 'messages' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Saved Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading favorites...</div>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
              <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">No saved cars yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Click the heart icon on any vehicle card to save it for easy price tracking.
              </p>
              <Link href="/cars" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg">
                Explore Cars
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  initialFavorited={true}
                  onFavoriteChange={(isFav) => {
                    if (!isFav) {
                      setFavorites((prev) => prev.filter((c) => c.id !== car.id));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Searches */}
      {activeTab === 'searches' && (
        <div className="space-y-4">
          {savedSearches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">No saved searches</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Save your custom filters while browsing to get 1-click access to new inventory.
              </p>
              <Link href="/cars" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg">
                Find Cars to Save
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedSearches.map((search) => {
                let filters: any = {};
                try {
                  filters = JSON.parse(search.filtersJson);
                } catch {}

                const queryParams = new URLSearchParams();
                Object.keys(filters).forEach((k) => {
                  if (filters[k]) queryParams.set(k, filters[k]);
                });

                return (
                  <div
                    key={search.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{search.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Saved on {new Date(search.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Object.entries(filters).map(([k, v]: any) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/cars?${queryParams.toString()}`}
                        className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search</span>
                      </Link>

                      <button
                        onClick={() => removeSavedSearch(search.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Messages & Inquiries */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">No messages yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                When you contact a dealer about a car, your communication thread will appear here.
              </p>
              <Link href="/cars" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg">
                Browse Cars
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {messages.map((msg) => {
                const isSentByMe = msg.fromUserId === user.id;
                const otherParty = isSentByMe ? msg.toUser : msg.fromUser;

                return (
                  <div
                    key={msg.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-primary font-bold text-xs flex items-center justify-center">
                            {otherParty?.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">
                              {otherParty?.dealerName || otherParty?.name || 'Seller'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {msg.listing && (
                          <Link
                            href={`/cars/${msg.listing.id}`}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <span>{msg.listing.year} {msg.listing.make} {msg.listing.model}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      <div className={`p-3 rounded-lg text-xs ${
                        isSentByMe ? 'bg-slate-50 text-slate-800' : 'bg-blue-50 text-slate-900'
                      }`}>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          {isSentByMe ? 'You wrote:' : `${otherParty?.name || 'Seller'} wrote:`}
                        </span>
                        {msg.body}
                      </div>
                    </div>

                    {/* Quick reply button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => {
                          setReplyToUserId(otherParty?.id);
                          setReplyListingId(msg.listingId);
                        }}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply in thread</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Reply Form Dialog if active */}
          {replyToUserId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                <button
                  onClick={() => setReplyToUserId(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
                >
                  &times;
                </button>
                <h3 className="text-base font-bold text-slate-900 mb-2">Send Reply</h3>
                <form onSubmit={handleSendReply} className="space-y-3">
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={replySending}
                    className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    {replySending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
