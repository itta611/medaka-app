"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [selectedFrequency, setSelectedFrequency] = useState("4000");
  const [selectedMusic, setSelectedMusic] = useState("tiktok");
  const [isPlaying, setIsPlaying] = useState(false);
  const [forcePlaying, setForcePlaying] = useState(false);
  const [mode, setMode] = useState("normal");
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startSound = () => {
    if (mode === "special") {
      // スペシャルモードの場合は音楽を再生
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(`/${selectedMusic}.mp3`);
      audio.loop = true;
      audio.play();
      audioRef.current = audio;
    } else {
      // 通常モードの場合は周波数を再生
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          // @ts-expect-error webkitAudioContext
          (window as Window).webkitAudioContext)();
      }

      const oscillator = audioContextRef.current.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        parseInt(selectedFrequency),
        audioContextRef.current.currentTime
      );

      oscillator.connect(audioContextRef.current.destination);
      oscillator.start();

      oscillatorRef.current = oscillator;
    }
  };

  const stopSound = () => {
    if (isPlaying) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  const checkAndPlay = () => {
    const now = new Date();
    const hours = now.getHours();

    if (forcePlaying) return;

    if (isPlaying) {
      stopSound();
    }

    // 午前8時から午後4時の間（8:00 - 16:00）
    if (hours >= 8 && hours <= 14) {
      setIsPlaying(true);
      startSound();
    } else {
      setIsPlaying(false);
      stopSound();
    }
  };

  useEffect(() => {
    // 初回チェック
    checkAndPlay();

    // 1分ごとにチェック
    const interval = setInterval(checkAndPlay, 60000);

    return () => {
      clearInterval(interval);
      stopSound();
    };
  }, [selectedFrequency, mode, selectedMusic]);

  return (
    <div className="max-w-[400px] m-auto py-4 px-2 relative h-screen">
      <h1 className="text-center font-bold text-4xl mt-6">メダカ大虐殺装置</h1>
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>こんにちは</AlertDialogTitle>
            <AlertDialogDescription>
              ボタンを押すと開始します
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => checkAndPlay()}>
              よろしく！
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {mode === "normal" ? (
        <div className="flex flex-col items-center h-[200px] justify-center gap-4">
          <Label htmlFor="frequency" className="text-lg">
            周波数 (Hz)
          </Label>
          <Input
            id="frequency"
            type="number"
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            className="w-32 text-center"
            min="20"
            max="20000"
          />
        </div>
      ) : (
        <Tabs
          defaultValue="tiktok"
          className="items-center h-[200px] justify-center"
          onValueChange={setSelectedMusic}
          value={selectedMusic}
        >
          <TabsList>
            <TabsTrigger value="tiktok">Tik ToK</TabsTrigger>
            <TabsTrigger value="heihei">健全なロリコンの一日</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {isPlaying ? (
        <div className="text-4xl text-center font-bold py-6 border-2 rounded-md text-blue-500 bg-blue-50 border-blue-300">
          再生中
        </div>
      ) : (
        <div className="text-4xl text-center font-bold py-6 border-2 rounded-md text-yellow-500 bg-yellow-50 border-yellow-300">
          停止中
        </div>
      )}
      <span className="text-sm text-gray-400 mt-0.5">8:00 AM - 4:00 PM</span>
      <Button
        className="absolute bottom-4 max-w-[400px] left-2 right-2 mx-auto"
        variant="outline"
        size="lg"
        onClick={() => {
          if (mode === "normal") {
            setMode("special");
          } else {
            setMode("normal");
          }
        }}
      >
        スペシャルモード{mode === "special" && ": ON"}
      </Button>
      <Button
        className="absolute bottom-16 max-w-[400px] left-2 right-2 mx-auto"
        variant="outline"
        size="lg"
        onClick={() => {
          if (isPlaying) {
            stopSound();
            setForcePlaying(false);
          } else {
            startSound();
            setIsPlaying(true);
            setForcePlaying(true);
          }
        }}
      >
        強制{isPlaying ? "再生中" : "再生"}
      </Button>
    </div>
  );
}
