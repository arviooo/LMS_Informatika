import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { api } from '@lms/shared';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { Download, Award, ArrowLeft } from 'lucide-react';
import { CertificateSkeleton } from '../../components/ui/PageSkeleton';

const StudentCertificatePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const certificateRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [scale, setScale] = useState(1);
    const [progressPercent, setProgressPercent] = useState<number | null>(null);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await api.get('/api/student/topics');
                const topics = response.data;
                let total_materials = 0;
                let completed_materials = 0;
                topics.forEach((topic: any) => {
                    topic.materials?.forEach((material: any) => {
                        total_materials++;
                        const isRead = material.student_progress && material.student_progress.length > 0 && material.student_progress[0].is_read;
                        if (isRead) {
                            completed_materials++;
                        }
                    });
                });
                const percentage = total_materials > 0 ? Math.round((completed_materials / total_materials) * 100) : 0;
                setProgressPercent(percentage);
            } catch (err) {
                console.error("Gagal memuat progress", err);
                setProgressPercent(0);
            } finally {
                setIsLoadingProgress(false);
            }
        };
        fetchProgress();
    }, []);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                // Get container width minus padding (16px * 2 = 32px)
                const containerWidth = containerRef.current.offsetWidth - 32;
                // Certificate width is 800. Scale down if container is smaller, max scale is 1.
                const newScale = Math.min(containerWidth / 800, 1);
                setScale(newScale);
            }
        };
        
        // Use timeout to allow layout to settle before first calculation
        const timer = setTimeout(updateScale, 100);
        window.addEventListener('resize', updateScale);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateScale);
        };
    }, []);

    const handleDownload = () => {
        if (progressPercent !== null && progressPercent < 100) {
            Swal.fire({
                title: 'Belum Tuntas!',
                text: 'Kamu harus menyelesaikan seluruh materi (Progress 100%) untuk dapat mengunduh e-Sertifikat.',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Oke'
            });
            return;
        }

        Swal.fire({
            title: 'Download Sertifikat?',
            text: 'Sertifikat ini akan disimpan ke galeri/HP kamu sebagai gambar (PNG).',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Download!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                if (!certificateRef.current) return;
                setIsGenerating(true);
                
                try {
                    // Temporarily remove transform scale so html2canvas doesn't calculate wrong text kerning
                    const parent = certificateRef.current.parentElement;
                    const originalTransform = parent ? parent.style.transform : '';
                    if (parent) {
                        parent.style.transform = 'scale(1)';
                    }
                    
                    const canvas = await html2canvas(certificateRef.current, {
                        scale: 3, // Higher resolution for sharper text
                        useCORS: true,
                        backgroundColor: '#ffffff'
                    });
                    
                    if (parent) {
                        parent.style.transform = originalTransform;
                    }
                    
                    const image = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = image;
                    link.download = `Sertifikat_${user?.name?.replace(/\s+/g, '_') || 'Siswa'}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    Swal.fire(
                        'Berhasil!',
                        'Sertifikat berhasil di-download.',
                        'success'
                    );
                } catch (error: any) {
                    console.error('html2canvas error:', error);
                    Swal.fire('Error', 'Gagal membuat sertifikat: ' + (error.message || error), 'error');
                } finally {
                    setIsGenerating(false);
                }
            }
        });
    };

    return (
        <div className="p-4 sm:p-6 pb-24 max-w-4xl mx-auto">
            {/* Header / Nav */}
            <div className="flex items-center gap-3 mb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200 text-[#374151] active:bg-gray-50 transition-colors shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-[#1f2937] flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-500" />
                    Sertifikat
                </h1>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-[#4b5563] text-sm sm:text-base">Selamat! Kamu berhak mendapatkan sertifikat pencapaian ini.</p>
                </div>
                
                <button 
                    onClick={handleDownload}
                    disabled={isGenerating || isLoadingProgress || (progressPercent !== null && progressPercent < 100)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-md transition-all ${
                        progressPercent !== null && progressPercent < 100 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 active:scale-95'
                    }`}
                >
                    <Download className="w-5 h-5" />
                    {isLoadingProgress ? 'Mengecek...' : isGenerating ? 'Memproses...' : progressPercent !== null && progressPercent < 100 ? 'Belum Tuntas 100%' : 'Download PNG'}
                </button>
            </div>

            {/* Responsive Preview Panel */}
            {isLoadingProgress ? (
              <CertificateSkeleton />
            ) : (
            <div 
                ref={containerRef}
                className="w-full bg-surface-container-lowest p-4 rounded-3xl shadow-sm border border-outline-variant/30 flex justify-center overflow-hidden mb-6"
                style={{ 
                    // Set height dynamically based on scale so the container doesn't have huge empty space
                    height: `${600 * scale + 32}px`, 
                    transition: 'height 0.2s'
                }}
            >
                {/* Scaling Wrapper */}
                <div 
                    style={{ 
                        transform: `scale(${scale})`, 
                        transformOrigin: 'top center',
                        width: '800px',
                        height: '600px',
                        flexShrink: 0
                    }}
                >
                    {/* Fixed size container for the actual certificate to ensure it renders correctly on html2canvas */}
                    <div 
                        ref={certificateRef} 
                        className="bg-[#ffffff] relative overflow-hidden shadow-2xl"
                        style={{ 
                            width: '800px', 
                            height: '600px',
                            border: '10px solid #1e3a8a', // Dark blue border
                            padding: '30px',
                            boxSizing: 'border-box'
                        }}
                    >
                    {/* Inner gold border */}
                    <div className="w-full h-full border-2 border-[#eab308] px-8 py-4 flex flex-col items-center relative">
                        
                        {/* Background Watermark/Pattern (Optional) */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                            <Award className="w-96 h-96 text-[#1e3a8a]" />
                        </div>

                        {/* Header Logos */}
                        <div className="flex justify-between items-center w-full mb-2 z-10">
                            <img src="/images/logo-grobogan.png" alt="Logo Grobogan" className="w-20 h-20 object-contain" />
                            <div className="text-center">
                                <h2 className="text-lg font-bold text-[#1f2937]">PEMERINTAH KABUPATEN GROBOGAN</h2>
                                <h2 className="text-lg font-bold text-[#1f2937]">DINAS PENDIDIKAN</h2>
                                <h1 className="text-xl font-black text-[#1e3a8a] mt-0.5">SMP NEGERI 3 GUBUG</h1>
                            </div>
                            <img src="/logo-spengu.png" alt="Logo SMP N 3 Gubug" className="w-20 h-20 object-contain" />
                        </div>

                        <hr className="w-full border-t-2 border-[#1f2937] mb-4 z-10" />

                        {/* Title */}
                        <div className="text-center z-10 mb-4">
                            <h1 className="text-4xl font-black text-[#ca8a04] uppercase" style={{ fontFamily: 'serif', letterSpacing: '0.15em' }}>
                                Sertifikat
                            </h1>
                            <p className="text-[#4b5563] mt-1 font-medium" style={{ letterSpacing: '0.1em' }}>PENGHARGAAN</p>
                        </div>

                        {/* Content */}
                        <div className="text-center z-10 w-full px-12">
                            <p className="text-lg text-[#374151] mb-1">Diberikan kepada:</p>
                            <h2 className="text-3xl font-bold text-[#111827] mb-4 italic border-b border-[#d1d5db] pb-2 inline-block px-8" style={{ fontFamily: 'serif' }}>
                                {user?.name || 'Nama Siswa'}
                            </h2>
                            
                            <p className="text-[#374151] leading-relaxed max-w-2xl mx-auto">
                                Atas kelulusan dan dedikasinya dalam menyelesaikan seluruh program pembelajaran Informatika dengan predikat <strong>SANGAT BAIK</strong> menggunakan Learning Management System berbasis Mobile First Design.
                            </p>
                        </div>

                        {/* Signatures */}
                        <div className="w-full mt-auto flex justify-end px-12 z-10 pb-2">
                            <div className="text-center flex flex-col items-center relative">
                                <p className="text-[#374151] mb-1">Gubug, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-[#1f2937] font-bold mb-12">Kepala Sekolah</p>
                                
                                {/* Signature Image - Positioned absolute relative to this wrapper so it doesn't break layout */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-32 flex items-center justify-center opacity-90 mix-blend-multiply pointer-events-none z-0">
                                    <img src="/images/ttd-kepsek.png" alt="Tanda Tangan" className="w-full h-full object-contain scale-125 -rotate-3 -translate-y-2" />
                                </div>
                                
                                <p className="text-[#111827] font-bold border-b border-[#111827] px-2 z-10 relative">F. Ribudiyanti, S. Pd.</p>
                                <p className="text-[#374151] mt-1 z-10 relative">NIP. 197511032005012005</p>
                            </div>
                        </div>

                    </div>
                </div>
                </div>
            </div>
            )}
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200">
                <p className="text-sm">
                    <strong>Catatan:</strong> Sertifikat ini didesain dalam ukuran lebar (Landscape). 
                    Saat di-download lewat HP, file gambar (PNG) yang dihasilkan akan beresolusi tinggi (HD) dan tajam saat di-zoom.
                </p>
            </div>
        </div>
    );
};

export default StudentCertificatePage;
