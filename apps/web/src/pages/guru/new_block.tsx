                {sub.student_note && (
                  <div className="bg-surface-container-highest p-3 rounded-xl mt-3 border-l-4 border-primary">
                    <p className="text-xs text-on-surface-variant font-bold mb-1">Catatan Siswa:</p>
                    <p className="text-sm text-on-surface">{sub.student_note}</p>
                  </div>
                )}
                
                {/* File Attachment & Preview Panel */}
                {sub.file_path && (
                  <div className="mt-3 p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center shrink-0">
                        <Icon name="description" className="text-[24px]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">Lampiran Jawaban</p>
                        <p className="text-xs text-on-surface-variant truncate">Siswa mengunggah file hasil pengerjaan</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={sub.file_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-secondary text-on-secondary rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-secondary/90 shadow-sm transition-all" title="Buka Preview di Tab Baru">
                        <Icon name="open_in_new" className="text-[18px]" />
                        Buka Preview
                      </a>
                    </div>
                  </div>
                )}
                
                {/* Nilai dan Grading */}
                <div className="mt-4 pt-3 border-t border-surface-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface-variant">Status Penilaian:</span>
                    {sub.score !== null ? (
                      <span className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <Icon name="check_circle" className="text-[14px]" /> Sudah Dinilai ({sub.score})
                      </span>
                    ) : (
                      <span className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-xs font-medium italic">Belum dinilai</span>
                    )}
                  </div>
                  
                  {sub.score !== null && !editingScoreIds.includes(sub.id) ? (
                    <button 
                      onClick={() => {
                        Swal.fire({
                          title: 'Ubah Nilai?',
                          text: "Yakin mau merubah nilai siswa ini?",
                          icon: 'question',
                          showCancelButton: true,
                          confirmButtonText: 'Ya, Ubah',
                          cancelButtonText: 'Batal'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            setEditingScoreIds(prev => [...prev, sub.id]);
                          }
                        });
                      }}
                      className="text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Icon name="edit" className="text-[16px]" /> Edit Nilai
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        id={`score-${sub.id}`}
                        defaultValue={sub.score !== null ? sub.score : ''}
                        placeholder={`0 - ${assignment?.max_points || 100}`}
                        className="w-24 border-2 border-outline-variant focus:border-primary focus:ring-0 rounded-xl px-3 py-2 text-sm bg-surface outline-none transition-all font-bold text-center"
                        min="0"
                        max={assignment?.max_points || 100}
                      />
                      <button 
                        onClick={async () => {
                          const input = document.getElementById(`score-${sub.id}`) as HTMLInputElement;
                          if (!input || !input.value) return;
                          try {
                            await api.post(`/api/teacher/assignments/${id}/submissions/${sub.id}/grade`, { score: parseInt(input.value) });
                            Swal.fire('Sukses', 'Nilai berhasil disimpan!', 'success');
                            setEditingScoreIds(prev => prev.filter(eid => eid !== sub.id));
                            setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, score: parseInt(input.value) } : s));
                          } catch (err) {
                            Swal.fire('Gagal', 'Gagal menyimpan nilai', 'error');
                          }
                        }}
                        className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
                      >
                        Simpan Nilai
                      </button>
                      {editingScoreIds.includes(sub.id) && (
                        <button 
                          onClick={() => setEditingScoreIds(prev => prev.filter(eid => eid !== sub.id))}
                          className="bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 px-3 py-2 rounded-xl text-sm font-bold transition-colors"
                        >
                          <Icon name="close" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
