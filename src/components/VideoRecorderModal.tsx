import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  X,
  Play,
  Square,
  Download,
  Film,
  Sparkles,
  Settings2,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  RotateCcw,
  Clock,
  HardDrive,
  MonitorPlay,
  Layers,
} from 'lucide-react';
import {
  CanvasVideoRecorder,
  VideoRecorderOptions,
  VideoRecorderState,
  VideoRecordingResult,
} from '../utils/canvasRecorder';

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  getCanvasElement: () => HTMLCanvasElement | null;
  currentProgress?: number;
  sourceShapeName?: string;
  targetShapeName?: string;
}

export const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({
  isOpen,
  onClose,
  getCanvasElement,
  sourceShapeName = '출발 형상',
  targetShapeName = '목표 형상',
}) => {
  const [durationPreset, setDurationPreset] = useState<number>(10); // 5, 10, 15, 30, or 0 (Manual)
  const [fpsPreset, setFpsPreset] = useState<30 | 60>(60);
  const [bitratePreset, setBitratePreset] = useState<number>(16_000_000); // 8M, 16M, 25M
  const [formatPref, setFormatPref] = useState<'webm' | 'mp4' | 'auto'>('auto');
  
  const [recorderState, setRecorderState] = useState<VideoRecorderState>({
    isRecording: false,
    isPaused: false,
    elapsedSeconds: 0,
    targetDuration: 10,
    currentBytes: 0,
    mimeType: '',
    error: null,
  });

  const [recordedResult, setRecordedResult] = useState<VideoRecordingResult | null>(null);
  const [supportedFormats, setSupportedFormats] = useState<{ mimeType: string; label: string; format: 'webm' | 'mp4' }[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const recorderRef = useRef<CanvasVideoRecorder>(new CanvasVideoRecorder());
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSupportedFormats(CanvasVideoRecorder.getSupportedMimeTypes());
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      // Cleanup preview URL when modal unmounts
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      if (recorderRef.current.isRecording()) {
        recorderRef.current.cancel();
      }
    };
  }, [videoPreviewUrl]);

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    const canvas = getCanvasElement();
    if (!canvas) {
      setRecorderState(prev => ({
        ...prev,
        error: 'WebGL 3D 캔버스 요소를 찾을 수 없습니다. 캔버스가 활성화되어 있는지 확인해주세요.',
      }));
      return;
    }

    setRecordedResult(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }

    const options: VideoRecorderOptions = {
      fps: fpsPreset,
      duration: durationPreset,
      format: formatPref,
      bitrate: bitratePreset,
    };

    await recorderRef.current.start(
      canvas,
      options,
      {
        onProgress: (state) => {
          setRecorderState(state);
        },
        onComplete: (result) => {
          setRecordedResult(result);
          setVideoPreviewUrl(result.url);
          setRecorderState(prev => ({
            ...prev,
            isRecording: false,
            isPaused: false,
            elapsedSeconds: result.duration,
          }));
        },
        onError: (err) => {
          setRecorderState(prev => ({
            ...prev,
            isRecording: false,
            error: err.message,
          }));
        },
      }
    );
  };

  const handleStopRecording = () => {
    recorderRef.current.stop();
  };

  const handleCancelRecording = () => {
    recorderRef.current.cancel();
    setRecorderState({
      isRecording: false,
      isPaused: false,
      elapsedSeconds: 0,
      targetDuration: 0,
      currentBytes: 0,
      mimeType: '',
      error: null,
    });
  };

  const handleDownload = () => {
    if (recordedResult) {
      CanvasVideoRecorder.downloadResult(recordedResult);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(1);
    return `${m < 10 ? '0' : ''}${m}:${parseFloat(s) < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F0F12] border border-[#00F0FF]/40 shadow-[0_0_50px_rgba(0,240,255,0.2)] text-[#E0E0E0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2A2A2E] bg-[#141418]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF]">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>3D 캔버스 실시간 비디오 녹화기</span>
                <span className="text-[10px] text-[#00F0FF] px-1.5 py-0.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                  MediaRecorder Engine
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                무손실 WebM / MP4 포맷으로 고주사율 60FPS 파티클 몰핑 애니메이션을 캡처 및 내보냅니다.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (recorderState.isRecording) {
                handleCancelRecording();
              }
              onClose();
            }}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#2A2A2E] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Error Message */}
          {recorderState.error && (
            <div className="p-3 bg-red-950/50 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">녹화 오류 발생</div>
                <div className="text-[11px] text-red-300">{recorderState.error}</div>
              </div>
            </div>
          )}

          {/* ACTIVE RECORDING STATE VIEW */}
          {recorderState.isRecording && (
            <div className="p-5 bg-[#141418] border border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.2)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-bold text-red-400 tracking-wider">
                    ● REC 실시간 캡처 진행 중
                  </span>
                </div>
                <span className="text-xs font-mono text-gray-300">
                  {formatTime(recorderState.elapsedSeconds)}
                  {recorderState.targetDuration > 0 ? ` / ${formatTime(recorderState.targetDuration)}` : ' (수동 정지 모드)'}
                </span>
              </div>

              {/* Progress Bar */}
              {recorderState.targetDuration > 0 && (
                <div className="w-full bg-[#2A2A2E] h-2 overflow-hidden border border-[#3A3A3E]">
                  <div
                    className="bg-gradient-to-r from-red-500 via-amber-400 to-[#00F0FF] h-full transition-all duration-100"
                    style={{
                      width: `${Math.min(100, (recorderState.elapsedSeconds / recorderState.targetDuration) * 100)}%`,
                    }}
                  />
                </div>
              )}

              {/* Telemetry during recording */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-[#0A0A0C] border border-[#2A2A2E]">
                  <div className="text-[9px] text-gray-400 uppercase">누적 용량</div>
                  <div className="text-xs font-bold text-[#00F0FF]">{formatFileSize(recorderState.currentBytes)}</div>
                </div>
                <div className="p-2 bg-[#0A0A0C] border border-[#2A2A2E]">
                  <div className="text-[9px] text-gray-400 uppercase">목표 FPS</div>
                  <div className="text-xs font-bold text-[#00FF66]">{fpsPreset} FPS</div>
                </div>
                <div className="p-2 bg-[#0A0A0C] border border-[#2A2A2E]">
                  <div className="text-[9px] text-gray-400 uppercase">인코딩 비트레이트</div>
                  <div className="text-xs font-bold text-amber-400">{(bitratePreset / 1_000_000).toFixed(0)} Mbps</div>
                </div>
              </div>

              {/* Action Buttons while recording */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleCancelRecording}
                  className="px-3 py-1.5 bg-[#1A1A1E] hover:bg-[#2A2A2E] text-gray-300 text-xs transition border border-[#2A2A2E] cursor-pointer"
                >
                  취소 (Cancel)
                </button>
                <button
                  onClick={handleStopRecording}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>녹화 완료 및 저장 (Stop & Save)</span>
                </button>
              </div>
            </div>
          )}

          {/* COMPLETED RECORDING RESULT PREVIEW */}
          {recordedResult && !recorderState.isRecording && (
            <div className="p-4 bg-[#141418] border border-[#00FF66]/50 shadow-[0_0_25px_rgba(0,255,102,0.15)] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#00FF66]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">비디오 인코딩 및 캡처 완료!</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {recordedResult.resolution.width}x{recordedResult.resolution.height} @ {recordedResult.fps}fps
                </span>
              </div>

              {/* Embedded Video Player */}
              {videoPreviewUrl && (
                <div className="relative aspect-video w-full bg-black border border-[#2A2A2E] overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoPreviewUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="p-2 bg-[#0A0A0C] border border-[#2A2A2E]">
                  <div className="text-gray-400">영상 길이</div>
                  <div className="font-bold text-white text-xs">{recordedResult.duration.toFixed(1)}초</div>
                </div>
                <div className="p-2 bg-[#0A0A0C] border border-[#2A2A2E]">
                  <div className="text-gray-400">파일 용량</div>
                  <div className="font-bold text-[#00F0FF] text-xs">{formatFileSize(recordedResult.fileSizeBytes)}</div>
                </div>
                <div className="p-2 bg-[#0A0A0C] border border-[#2A2A2E]">
                  <div className="text-gray-400">컨테이너/코덱</div>
                  <div className="font-bold text-amber-300 truncate text-xs" title={recordedResult.mimeType}>
                    {recordedResult.mimeType.split(';')[0]}
                  </div>
                </div>
                <div className="p-2 bg-[#0A0A0C] border border-[#2A2A2E]">
                  <div className="text-gray-400">총 프레임 추산</div>
                  <div className="font-bold text-[#00FF66] text-xs">
                    ~{Math.round(recordedResult.duration * recordedResult.fps)} Frames
                  </div>
                </div>
              </div>

              {/* Download & Rerecord Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setRecordedResult(null);
                    if (videoPreviewUrl) {
                      URL.revokeObjectURL(videoPreviewUrl);
                      setVideoPreviewUrl(null);
                    }
                  }}
                  className="px-3 py-2 bg-[#1A1A1E] hover:bg-[#2A2A2E] text-gray-300 text-xs flex items-center gap-1.5 border border-[#2A2A2E] transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>다시 설정하기</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2 bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.4)] transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>비디오 파일 즉시 다운로드 ({formatFileSize(recordedResult.fileSizeBytes)})</span>
                </button>
              </div>
            </div>
          )}

          {/* RECORDING SETTINGS & PRESETS (Shown when not recording) */}
          {!recorderState.isRecording && !recordedResult && (
            <div className="space-y-4">
              {/* 1. Duration Preset */}
              <div className="bg-[#141418] border border-[#2A2A2E] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>01. 녹화 시간 설정 (Duration)</span>
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {durationPreset === 0 ? '수동 정지 모드' : `${durationPreset}초 자동 캡처`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { sec: 5, label: '5초' },
                    { sec: 10, label: '10초 (추천)' },
                    { sec: 15, label: '15초' },
                    { sec: 30, label: '30초' },
                    { sec: 0, label: '무제한 수동' },
                  ].map((item) => (
                    <button
                      key={item.sec}
                      type="button"
                      onClick={() => setDurationPreset(item.sec)}
                      className={`py-2 px-1 text-center border text-[10px] transition cursor-pointer font-bold ${
                        durationPreset === item.sec
                          ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. FPS & Bitrate Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* FPS Selection */}
                <div className="bg-[#141418] border border-[#2A2A2E] p-3.5 space-y-2.5">
                  <label className="text-xs font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <MonitorPlay className="w-3.5 h-3.5" />
                    <span>02. 프레임 레이트 (FPS)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFpsPreset(60)}
                      className={`p-2 border text-left transition cursor-pointer ${
                        fpsPreset === 60
                          ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                          : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">60 FPS</div>
                      <div className="text-[9px] text-gray-400">초고주사율 부드러운 움직임</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFpsPreset(30)}
                      className={`p-2 border text-left transition cursor-pointer ${
                        fpsPreset === 30
                          ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                          : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">30 FPS</div>
                      <div className="text-[9px] text-gray-400">표준 용량 절약형</div>
                    </button>
                  </div>
                </div>

                {/* Bitrate Selection */}
                <div className="bg-[#141418] border border-[#2A2A2E] p-3.5 space-y-2.5">
                  <label className="text-xs font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>03. 인코딩 화질 (Bitrate)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: 8_000_000, label: '8 Mbps', desc: '표준' },
                      { val: 16_000_000, label: '16 Mbps', desc: '고화질' },
                      { val: 25_000_000, label: '25 Mbps', desc: 'Ultra 4K' },
                    ].map((b) => (
                      <button
                        key={b.val}
                        type="button"
                        onClick={() => setBitratePreset(b.val)}
                        className={`p-1.5 text-center border transition cursor-pointer ${
                          bitratePreset === b.val
                            ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                            : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="text-[10px] font-bold">{b.label}</div>
                        <div className="text-[8px] text-gray-400">{b.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Format & Codec Info */}
              <div className="bg-[#141418] border border-[#2A2A2E] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <FileVideo className="w-3.5 h-3.5" />
                    <span>04. 저장 비디오 포맷 (Format)</span>
                  </label>
                  <span className="text-[9px] text-[#00FF66] bg-[#00FF66]/10 px-1.5 py-0.5 border border-[#00FF66]/30">
                    최적 코덱 자동 매칭
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormatPref('auto')}
                    className={`p-2 border text-left transition cursor-pointer ${
                      formatPref === 'auto'
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                        : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">AUTO (권장)</div>
                    <div className="text-[8px] text-gray-400">브라우저 최상위 코덱 선택</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormatPref('webm')}
                    className={`p-2 border text-left transition cursor-pointer ${
                      formatPref === 'webm'
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                        : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">WEBM (VP9/VP8)</div>
                    <div className="text-[8px] text-gray-400">고압축 무손실 웹 표준</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormatPref('mp4')}
                    className={`p-2 border text-left transition cursor-pointer ${
                      formatPref === 'mp4'
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                        : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">MP4 (H.264)</div>
                    <div className="text-[8px] text-gray-400">범용 기기 재생 호환성</div>
                  </button>
                </div>

                {/* Supported Codecs List Chips */}
                <div className="pt-2 border-t border-[#222228] flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] text-gray-500 uppercase">지원 코덱:</span>
                  {supportedFormats.map((fmt) => (
                    <span
                      key={fmt.mimeType}
                      className="text-[8px] font-mono px-1.5 py-0.5 bg-[#0A0A0C] border border-[#2A2A2E] text-gray-300"
                    >
                      {fmt.label.split(' ')[0]} ({fmt.format.toUpperCase()})
                    </span>
                  ))}
                </div>
              </div>

              {/* Start Recording CTA Button */}
              <button
                type="button"
                onClick={handleStartRecording}
                className="w-full py-3 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {durationPreset === 0
                    ? '실시간 녹화 시작 (Manual REC Start)'
                    : `${durationPreset}초간 고화질 비디오 녹화 시작 (Start ${durationPreset}s REC)`}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#2A2A2E] bg-[#141418] text-[10px] text-gray-400">
          <span>SOURCE: {sourceShapeName} ➔ TARGET: {targetShapeName}</span>
          <span>HTML5 Canvas Stream Capture</span>
        </div>
      </div>
    </div>
  );
};
