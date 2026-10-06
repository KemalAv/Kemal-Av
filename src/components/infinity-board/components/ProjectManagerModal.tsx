/**
 * Infinity Board - Project Manager Modal
 * Handles creating, switching, duplicating, and deleting multiple boards
 * With in-UI confirmation modals (avoiding blocked window.confirm).
 */

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Folder, 
  Search, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Pencil, 
  Check, 
  Clock, 
  Shapes,
  AlertTriangle
} from 'lucide-react';
import { ProjectMetadata } from '../types';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectMetadata[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateNewProject: (title?: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newTitle: string) => void;
  onExportProjectById: (id: string) => void;
  onImportProjectClick: () => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
  onRenameProject,
  onExportProjectById,
  onImportProjectClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectMetadata | null>(null);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateNewProject(newProjectName.trim() || undefined);
    setNewProjectName('');
    setIsCreating(false);
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setTitleDraft(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (titleDraft.trim()) {
      onRenameProject(id, titleDraft.trim());
    }
    setEditingId(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Folder size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daftar Proyek Infinity Board
              </h2>
              <p className="text-xs text-slate-500">
                Kelola, buka, atau buat papan sketsa baru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search & Create New Button */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama proyek..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onImportProjectClick}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title="Impor file proyek (.infboard)"
            >
              <Upload size={14} />
              <span>Impor File</span>
            </button>

            <button
              onClick={() => setIsCreating(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
            >
              <Plus size={14} />
              <span>Proyek Baru</span>
            </button>
          </div>
        </div>

        {/* Create new inline dialog */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/50 flex items-center gap-2">
            <input
              type="text"
              placeholder="Nama papan sketsa baru (misal: Arsitektur UI, Mind Map)"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              autoFocus
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buat
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Batal
            </button>
          </form>
        )}

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Folder size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs">Tidak ada proyek yang sesuai pencarian.</p>
            </div>
          ) : (
            filteredProjects.map(proj => {
              const isActive = proj.id === activeProjectId;
              const isEditing = editingId === proj.id;

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectProject(proj.id);
                      onClose();
                    }
                  }}
                  className={`group relative flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/70 border-blue-400 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border"
                      style={{
                        backgroundColor: proj.backgroundColor || '#ffffff',
                        borderColor: '#e2e8f0',
                      }}
                    >
                      <Shapes size={18} className="text-blue-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={titleDraft}
                            onChange={e => setTitleDraft(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveRename(proj.id, e);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="px-2 py-0.5 text-xs font-semibold rounded border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none w-48"
                          />
                          <button
                            onClick={e => handleSaveRename(proj.id, e)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {proj.title}
                          </h3>
                          {isActive && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/60 dark:text-blue-300 px-1.5 py-0.5 rounded">
                              Aktif
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Shapes size={11} />
                          {proj.elementCount} elemen
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(proj.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this project card */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!isEditing && (
                      <button
                        onClick={e => handleStartRename(proj.id, proj.title, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Ubah Nama"
                      >
                        <Pencil size={13} />
                      </button>
                    )}

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDuplicateProject(proj.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Duplikat Proyek"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onExportProjectById(proj.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Unduh File Proyek (.infboard)"
                    >
                      <Download size={13} />
                    </button>

                    {/* Delete button (accessible for all projects) */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setProjectToDelete(proj);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Hapus Proyek"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between text-xs text-slate-500">
          <span>Total {projects.length} proyek tersimpan di browser</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

        {/* IN-UI CONFIRMATION MODAL FOR DELETING PROJECT (FIXED AT SCREEN LEVEL) */}
        {projectToDelete && (
          <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Hapus Proyek?
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                Papan <span className="font-bold text-slate-900 dark:text-white">"{projectToDelete.title}"</span> beserta seluruh elemen ({projectToDelete.elementCount} item) akan dihapus secara permanen.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idToDelete = projectToDelete.id;
                    setProjectToDelete(null);
                    onDeleteProject(idToDelete);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/25 transition-colors"
                >
                  Ya, Hapus Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
