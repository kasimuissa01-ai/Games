import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getGames, createGame, updateGame, deleteGame, getPurchases, updatePurchaseStatus, uploadImage } from '../services/gameService';
import { Game, Platform, Purchase } from '../types';
import { Plus, Trash2, Edit2, X, Save, AlertCircle, Image as ImageIcon, ChevronLeft, CreditCard, Check, ShieldAlert, Upload } from 'lucide-react';

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [games, setGames] = useState<Game[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'games' | 'payments'>('games');
  const [isEditing, setIsEditing] = useState(false);
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
    if (activeTab === 'payments') {
      loadPurchases();
    }
  }, [activeTab]);

  const loadGames = async () => {
    setLoading(true);
    const fetched = await getGames('ALL');
    setGames(fetched);
    setLoading(false);
  };

  const loadPurchases = async () => {
    setLoading(true);
    const fetched = await getPurchases();
    setPurchases(fetched);
    setLoading(false);
  };

  const handleCreateNew = () => {
    setEditingGame({
      title: '',
      description: '',
      shortDescription: '',
      price: 0,
      imageUrl: '',
      videoUrl: '',
      downloadUrl: '',
      platform: Platform.Mobile,
      category: '',
      ram: '6GB'
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(true);
  };

  const handleConfirmPayment = async (purchaseId: string) => {
    if (window.confirm("Confirm this payment? The user will get the download link.")) {
      await updatePurchaseStatus(purchaseId, 'confirmed');
      loadPurchases();
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setImagePreview(game.imageUrl);
    setImageFile(null);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      await deleteGame(id);
      loadGames();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear URL if manually uploading
      setEditingGame(prev => prev ? ({ ...prev, imageUrl: '' }) : null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;

    setUploading(true);
    try {
      let finalImageUrl = editingGame.imageUrl || '';

      // If there is a new image file, upload it first
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const gameData = { ...editingGame, imageUrl: finalImageUrl };

      if ('id' in gameData && gameData.id) {
        await updateGame(gameData.id, gameData as Partial<Game>);
      } else {
        await createGame(gameData as Omit<Game, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setIsEditing(false);
      setEditingGame(null);
      setImageFile(null);
      setImagePreview(null);
      loadGames();
    } catch (error) {
      console.error("Save error", error);
      alert("Failed to save game. Make sure the 'game-assets' bucket exists in Supabase and is public.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
           <button 
             onClick={onBack}
             className="w-10 h-10 rounded-full glass border-white/5 flex items-center justify-center hover:text-blue-500 transition-colors"
           >
             <ChevronLeft size={20} />
           </button>
           <div>
             <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Admin <span className="text-blue-500">Node</span></h1>
             <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase mt-1">NexusCore Asset Management</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('games')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'games' ? 'bg-blue-600 text-white shadow-neon-blue' : 'text-slate-500 hover:text-white'}`}
          >
            Assests
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'payments' ? 'bg-blue-600 text-white shadow-neon-blue' : 'text-slate-500 hover:text-white'}`}
          >
            Payment Requests
          </button>
        </div>

        {activeTab === 'games' && (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateNew}
            className="flex items-center gap-3 bg-white text-black px-10 py-5 rounded-[2rem] text-xs font-black tracking-[0.2em] transition-all shadow-2xl hover:shadow-neon-blue uppercase"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Plus size={20} />
            </div>
            Add New Game
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
        ) : activeTab === 'games' ? (
          games.map(game => (
            <motion.div 
              key={game.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-5 rounded-2xl flex items-center justify-between border-white/5 hover:border-blue-500/20 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                  <img src={game.imageUrl} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight uppercase group-hover:text-blue-400 transition-colors">{game.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{game.platform}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {game.price === 0 ? 'FREE' : `Tsh ${game.price.toLocaleString()}`}
                    </span>
                    {game.ram && <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">RAM: {game.ram}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(game)}
                  className="p-3 bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(game.id)}
                  className="p-3 bg-white/5 hover:bg-red-600/20 hover:text-red-400 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          purchases.length === 0 ? (
            <div className="py-20 text-center">
              <CreditCard className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-500 font-black uppercase tracking-widest">No payment requests found</p>
            </div>
          ) : (
            purchases.map(pb => (
              <motion.div 
                key={pb.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl flex items-center justify-between border-white/5"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-black text-white text-lg uppercase">{pb.gameTitle}</h3>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${pb.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {pb.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User: <span className="text-white">{pb.userEmail}</span></p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount: <span className="text-blue-500 font-black">Tsh {pb.amount.toLocaleString()}</span></p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date: {pb.purchasedAt ? new Date(pb.purchasedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>

                {pb.status === 'pending' && (
                  <button 
                    onClick={() => handleConfirmPayment(pb.id)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-900/20"
                  >
                    <Check size={16} />
                    Confirm Payment
                  </button>
                )}
              </motion.div>
            ))
          )
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-black/20">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                  {editingGame?.id ? 'Edit' : 'Initialize'} <span className="text-blue-500">Asset</span>
                </h2>
                <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Title</label>
                    <input 
                      required
                      type="text" 
                      value={editingGame?.title || ''}
                      onChange={e => setEditingGame({ ...editingGame, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold uppercase tracking-widest text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700" 
                      placeholder="Enter game title..."
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Category</label>
                    <input 
                      required
                      type="text" 
                      value={editingGame?.category || ''}
                      onChange={e => setEditingGame({ ...editingGame, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold uppercase tracking-widest text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700" 
                      placeholder="Action, RPG, etc."
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Price (Tsh)</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={editingGame?.price || 0}
                      onChange={e => setEditingGame({ ...editingGame, price: parseFloat(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all" 
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Platform</label>
                    <select 
                      value={editingGame?.platform}
                      onChange={e => setEditingGame({ ...editingGame, platform: e.target.value as Platform })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none uppercase"
                    >
                      {Object.values(Platform).map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">RAM Requirement</label>
                    <input 
                      type="text" 
                      value={editingGame?.ram || ''}
                      onChange={e => setEditingGame({ ...editingGame, ram: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold uppercase tracking-widest text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700" 
                      placeholder="e.g., 6GB"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Cover Image</label>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="w-full sm:w-48 h-48 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <ImageIcon className="text-slate-700" size={40} />
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                          <Upload className="text-white" size={24} />
                        </label>
                      </div>
                      <div className="flex-1 space-y-4">
                        <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                          Upload a high-quality JPEG or PNG. This will be the main visual for the asset.
                        </p>
                        <div className="space-y-2">
                           <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">OR USE EXTERNAL URL</span>
                           <input 
                             type="text" 
                             value={editingGame?.imageUrl || ''}
                             onChange={e => {
                               setEditingGame({ ...editingGame, imageUrl: e.target.value });
                               setImagePreview(e.target.value);
                               setImageFile(null);
                             }}
                             className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white focus:border-blue-500/50 outline-none transition-all" 
                             placeholder="https://images.unsplash.com/..."
                           />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Video Demo URL</label>
                    <input 
                      type="text" 
                      value={editingGame?.videoUrl || ''}
                      onChange={e => setEditingGame({ ...editingGame, videoUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all" 
                      placeholder="https://..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Short Description</label>
                    <input 
                      required
                      type="text" 
                      value={editingGame?.shortDescription || ''}
                      onChange={e => setEditingGame({ ...editingGame, shortDescription: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold uppercase tracking-widest text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700" 
                      placeholder="Summary..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Full Description</label>
                    <textarea 
                      required
                      rows={4}
                      value={editingGame?.description || ''}
                      onChange={e => setEditingGame({ ...editingGame, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold uppercase tracking-widest text-white focus:border-blue-500/50 outline-none transition-all resize-none placeholder:text-slate-700" 
                      placeholder="Detailed description..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Download Link</label>
                    <input 
                      required
                      type="text" 
                      value={editingGame?.downloadUrl || ''}
                      onChange={e => setEditingGame({ ...editingGame, downloadUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all" 
                      placeholder="Direct download URL"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6">
                   <button 
                     type="button"
                     onClick={() => setIsEditing(false)}
                     className="flex-1 py-4 glass border-white/10 text-slate-400 font-black rounded-lg hover:text-white transition-all uppercase tracking-widest text-[10px]"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     disabled={uploading}
                     className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-lg transition-all shadow-neon-blue flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                   >
                     {uploading ? (
                       <>
                         <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                         Processing...
                       </>
                     ) : (
                       <>
                         <Save size={16} />
                         Save Game Data
                       </>
                     )}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
